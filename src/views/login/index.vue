<script setup lang="ts">
import {
  ref,
  toRaw,
  reactive,
  watch,
  computed,
  onMounted,
  onBeforeUnmount
} from "vue";
import { useI18n } from "vue-i18n";
import Motion from "./utils/motion";
import { useRouter } from "vue-router";
import { message } from "@/utils/message";
import { loginRules } from "./utils/rule";
import phone from "./components/phone.vue";
import TypeIt from "@/components/ReTypeit";
import qrCode from "./components/qrCode.vue";
import regist from "./components/regist.vue";
import update from "./components/update.vue";
import { useNav } from "@/layout/hooks/useNav";
import type { FormInstance } from "element-plus";
import { $t, transformI18n } from "@/plugins/i18n";
import { operates, thirdParty } from "./utils/enums";
import { useLayout } from "@/layout/hooks/useLayout";
import { useUserStoreHook } from "@/store/modules/user";
import { initRouter, getTopMenu } from "@/router/utils";
import { bg, avatar, illustration } from "./utils/static";
import { ReImageVerify } from "@/components/ReImageVerify";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";

import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import globalization from "@/assets/svg/globalization.svg?component";
import Lock from "@iconify-icons/ri/lock-fill";
import Check from "@iconify-icons/ep/check";
import User from "@iconify-icons/ri/user-3-fill";
import { subBefore } from "@pureadmin/utils";
import { dingTalkLogin, githubLogin } from "@/api/user";

defineOptions({
  name: "Login"
});

const imgCode = ref("");
const imgVerifyCodeComp = ref(null);
const router = useRouter();
const loading = ref(false);
const oauthLoading = ref(false);
const checked = ref(false);
const ruleFormRef = ref<FormInstance>();
const currentPage = computed(() => {
  return useUserStoreHook().currentPage;
});

const { t } = useI18n();
const { initStorage } = useLayout();
initStorage();
const { dataTheme, dataThemeChange } = useDataThemeChange();
dataThemeChange();
const { title, getDropdownItemStyle, getDropdownItemClass } = useNav();
const { locale, translationCh, translationEn } = useTranslationLang();

const ruleForm = reactive({
  username: "",
  password: "",
  verifyCode: ""
});

const onLogin = async (formEl: FormInstance | undefined) => {
  loading.value = true;
  if (!formEl) return;
  await formEl.validate((valid, fields) => {
    if (valid) {
      useUserStoreHook()
        .loginByUsername({
          username: ruleForm.username,
          password: ruleForm.password
        })
        .then(res => {
          if (res.ret == 200) {
            // 获取后端路由
            initRouter().then(() => {
              router.push(getTopMenu(true).path);
              message("登录成功", { type: "success" });
            });
          } else {
            loading.value = false;
          }
        })
        .catch(() => {
          loading.value = false;
          clearVerifyCode();
        });
    } else {
      loading.value = false;
      return fields;
    }
  });
};

/** 重置图片验证码 */
function clearVerifyCode() {
  ruleForm.verifyCode = "";
  imgVerifyCodeComp.value.getImgCode();
}

/** 使用公共函数，避免`removeEventListener`失效 */
function onkeypress({ code }: KeyboardEvent) {
  if (code === "Enter") {
    onLogin(ruleFormRef.value);
  }
}

function dingTalkOauthRedirect() {
  const redirectUrl = encodeURIComponent(
    `${location.origin}/?platform=dingTalk`
  );
  const clientId = import.meta.env.VITE_DING_TALK_APPID;
  const state = "12345";

  window.location.href =
    "https://login.dingtalk.com/oauth2/auth?" +
    `redirect_uri=${redirectUrl}` +
    "&response_type=code" +
    `&client_id=${clientId}` +
    "&scope=openid+corpid" +
    `&state=${state}` +
    "&prompt=consent";
}

function githubOauthRedirect() {
  const redirectUrl = encodeURIComponent(
    `${location.origin}/backend/accounts/github/login/callback/?platform=github`
  );
  window.location.href =
    "https://github.com/login/oauth/authorize" +
    "?client_id=Ov23liay7YwZjTfl83ye" +
    `&redirect_uri=${redirectUrl}` +
    "&scope=read%3Aorg+user+repo&response_type=code&state=fIzUJqAMnj8ViN6I";
}

function unLinkage(platForm: string) {
  if (platForm == "dingding") {
    dingTalkOauthRedirect();
  } else if (platForm == "github") {
    githubOauthRedirect();
  } else {
    message("抱歉，暂未接入该平台", { type: "warning" });
  }
}

function thirdPlatformOauth(platform: string, postData: object) {
  let logApi = null;
  if (platform == "dingTalk") {
    logApi = dingTalkLogin;
  } else if (platform == "github") {
    logApi = githubLogin;
  }
  useUserStoreHook()
    .loginByThird(logApi, postData)
    .then(res => {
      if (res.ret == 200) {
        // 获取后端路由
        initRouter().then(() => {
          // router.push(getTopMenu(true).path);
          message("登录成功", { type: "success" });
          const newUrl = `${location.origin}${location.pathname}${subBefore(
            location.hash,
            "?"
          )}`;
          window.location.replace(newUrl);
        });
      }
    })
    .catch(() => {
      oauthLoading.value = false;
    });
}

function checkOauth2Login() {
  if (!location.search) return;
  const qsString = location.search.split("?")[1];
  const qs = qsString.split("&");
  const params = {
    platform: "",
    code: "",
    state: ""
  };
  for (let i = 0; i < qs.length; i++) {
    const [k, v] = qs[i].split("=");
    if (k == "authCode") {
      params.code = v;
    } else {
      params[k] = v;
    }
  }
  const platform = params.platform;
  delete params["platform"];
  if (!platform) return;
  oauthLoading.value = true;
  thirdPlatformOauth(platform, params);
}

onMounted(() => {
  checkOauth2Login();
  // oauthLoading.value = false;
  window.document.addEventListener("keypress", onkeypress);
});

onBeforeUnmount(() => {
  window.document.removeEventListener("keypress", onkeypress);
});

watch(imgCode, value => {
  useUserStoreHook().SET_VERIFYCODE(value);
});
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <!-- 主题 -->
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />
      <!-- 国际化 -->
      <el-dropdown trigger="click">
        <globalization
          class="hover:text-primary hover:!bg-[transparent] w-[20px] h-[20px] ml-1.5 cursor-pointer outline-none duration-300"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <IconifyIconOffline
                class="check-zh"
                v-show="locale === 'zh'"
                :icon="Check"
              />
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span class="check-en" v-show="locale === 'en'">
                <IconifyIconOffline :icon="Check" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <div class="login-container">
      <div class="img">
        <component :is="toRaw(illustration)" />
      </div>
      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-none">
              <TypeIt :values="[title]" :cursor="false" :speed="150" />
            </h2>
          </Motion>

          <div v-loading="oauthLoading" element-loading-text="Loading...">
            <el-form
              v-if="currentPage === 0"
              ref="ruleFormRef"
              :model="ruleForm"
              :rules="loginRules"
              size="large"
            >
              <Motion :delay="100">
                <el-form-item
                  :rules="[
                    {
                      required: true,
                      message: transformI18n($t('login.usernameReg')),
                      trigger: 'blur'
                    }
                  ]"
                  prop="username"
                >
                  <el-input
                    clearable
                    v-model="ruleForm.username"
                    :placeholder="t('login.username')"
                    :prefix-icon="useRenderIcon(User)"
                  />
                </el-form-item>
              </Motion>

              <Motion :delay="150">
                <el-form-item prop="password">
                  <el-input
                    clearable
                    show-password
                    v-model="ruleForm.password"
                    :placeholder="t('login.password')"
                    :prefix-icon="useRenderIcon(Lock)"
                  />
                </el-form-item>
              </Motion>

              <Motion :delay="200">
                <el-form-item prop="verifyCode">
                  <el-input
                    clearable
                    v-model="ruleForm.verifyCode"
                    :placeholder="t('login.verifyCode')"
                    :prefix-icon="useRenderIcon('ri:shield-keyhole-line')"
                  >
                    <template v-slot:append>
                      <ReImageVerify
                        ref="imgVerifyCodeComp"
                        v-model:code="imgCode"
                      />
                    </template>
                  </el-input>
                </el-form-item>
              </Motion>

              <Motion :delay="250">
                <el-form-item>
                  <div
                    class="w-full h-[20px] flex justify-between items-center"
                  >
                    <el-checkbox v-model="checked">
                      {{ t("login.remember") }}
                    </el-checkbox>
                    <el-button
                      link
                      type="primary"
                      @click="useUserStoreHook().SET_CURRENTPAGE(4)"
                    >
                      {{ t("login.forget") }}
                    </el-button>
                  </div>
                  <el-button
                    class="w-full mt-4"
                    size="default"
                    type="primary"
                    :loading="loading"
                    @click="onLogin(ruleFormRef)"
                  >
                    {{ t("login.login") }}
                  </el-button>
                </el-form-item>
              </Motion>

              <Motion :delay="300">
                <el-form-item>
                  <div
                    class="w-full h-[20px] flex justify-between items-center"
                  >
                    <el-button
                      v-for="(item, index) in operates"
                      :key="index"
                      class="w-full mt-4"
                      size="default"
                      @click="useUserStoreHook().SET_CURRENTPAGE(index + 1)"
                    >
                      {{ t(item.title) }}
                    </el-button>
                  </div>
                </el-form-item>
              </Motion>
            </el-form>

            <Motion v-if="currentPage === 0" :delay="350">
              <el-form-item>
                <el-divider>
                  <p class="text-gray-500 text-xs">
                    {{ t("login.thirdLogin") }}
                  </p>
                </el-divider>
                <div class="w-full flex justify-evenly">
                  <span
                    v-for="(item, index) in thirdParty"
                    :key="index"
                    :title="t(item.title)"
                  >
                    <IconifyIconOnline
                      :icon="`ri:${item.icon}-fill`"
                      @click="unLinkage(item.icon)"
                      width="20"
                      class="cursor-pointer text-gray-500 hover:text-blue-400"
                    />
                  </span>
                </div>
              </el-form-item>
            </Motion>
            <!-- 手机号登录 -->
            <phone v-if="currentPage === 1" />
            <!-- 二维码登录 -->
            <qrCode v-if="currentPage === 2" />
            <!-- 注册 -->
            <regist v-if="currentPage === 3" />
            <!-- 忘记密码 -->
            <update v-if="currentPage === 4" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import url("@/style/login.css");
</style>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}
</style>
