<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { usePublicHooks } from "../../hooks";
import { transformI18n, localesConfigs } from "@/plugins/i18n";
import VueJsonPretty from "vue-json-pretty";
import IconSelect from "@/components/ReIcon/src/Select.vue";
// import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import "vue-json-pretty/lib/styles.css";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    higherMenuOptions: [],
    id: null,
    parentId: 0,
    name: "",
    component: "",
    code: "",
    path: "",
    redirect: "",
    order: 0,
    status: 1,
    meta: { title: "", icon: "", rank: null, code: "" },
    type: 1,
    menuTransName: ""
  })
});

const ruleFormRef = ref();
function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });

const { switchStyle } = usePublicHooks();
const newFormInline = ref(props.formInline);

const jsonPreview = reactive({
  val: JSON.stringify(newFormInline.value.meta),
  data: newFormInline.value.meta,
  showLine: true,
  showLineNumber: true,
  showDoubleQuotes: true,
  showLength: true,
  editable: true,
  showIcon: true,
  editableTrigger: "click",
  deep: 3
});

watch(
  () => jsonPreview.val,
  newVal => {
    try {
      jsonPreview.data = JSON.parse(newVal);
    } catch (err) {
      // console.log('JSON ERROR');
    }
  }
);

watch(
  () => jsonPreview.data,
  newVal => {
    try {
      jsonPreview.val = JSON.stringify(newVal);
    } catch (err) {
      // console.log('JSON ERROR');
    }
  }
);

const selApiMethod = ref("");
const apiMethods = ["GET", "POST", "PUT", "PATCH", "OPTIONS", "DELETE"];

const menuType = ref(newFormInline.value.type);
const menuTypeMap = {
  "1": "menus",
  "2": "menus",
  "3": "buttons"
};

// 菜单
const menuList = ref([]);

function getMenuList() {
  const menuKey = menuTypeMap[menuType.value];
  const menuMap = localesConfigs.zh[menuKey];
  menuList.value.length = 0;
  for (const key in menuMap) {
    const _menuKey = `${menuKey}.${key}`;
    menuList.value.push({ key: _menuKey, label: transformI18n(_menuKey) });
  }
}
getMenuList();

function setMetaRank(
  currentValue: number | undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
  oldValue: number | undefined
) {
  newFormInline.value.meta.rank = currentValue;
}

function setMetaCode(value: string) {
  newFormInline.value.meta.code = value;
}

function setMetaFrameSrc(value: string) {
  newFormInline.value.meta.frameSrc = value;
}

function switchMenuType(value: number) {
  menuType.value = value;
  getMenuList();
}
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col>
        <el-form-item label="上级菜单">
          <el-cascader
            class="w-full"
            v-model="newFormInline.parentId"
            :options="newFormInline.higherMenuOptions"
            :props="{
              value: 'id',
              label: 'menuTransName',
              emitPath: false,
              checkStrictly: true
            }"
            clearable
            filterable
            placeholder="请选择上级菜单"
          >
            <template #default="{ node, data }">
              <span>{{ transformI18n(data.menuTransName) }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="菜单类型" prop="type">
          <el-radio-group v-model="newFormInline.type" @change="switchMenuType">
            <el-radio-button label="1">菜单</el-radio-button>
            <el-radio-button label="2">页面</el-radio-button>
            <!--<el-radio-button label="3">按钮</el-radio-button>-->
          </el-radio-group>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单名称" prop="meta">
          <el-select
            v-model="newFormInline.meta.title"
            allow-create
            placeholder="请选择"
            clearable
            filterable
          >
            <el-option
              v-for="item in menuList"
              :key="item.key"
              :label="item.label"
              :value="item.key"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="菜单图标">
          <IconSelect v-model="newFormInline.meta.icon" />
        </el-form-item>
      </re-col>
      <re-col
        :value="12"
        :xs="24"
        :sm="24"
        v-if="newFormInline.type == 1 || newFormInline.type == 2"
      >
        <el-form-item
          label="组件名称"
          :prop="newFormInline.type == 2 ? 'name' : ''"
        >
          <el-input
            v-model="newFormInline.name"
            clearable
            placeholder="请输入名称"
          />
        </el-form-item>
      </re-col>
      <re-col
        :value="12"
        :xs="24"
        :sm="24"
        v-if="newFormInline.type == 1 || newFormInline.type == 2"
      >
        <el-form-item label="编码" prop="code">
          <el-input
            v-model="newFormInline.code"
            clearable
            placeholder="请输入编码"
            @input="setMetaCode"
          />
        </el-form-item>
      </re-col>
      <re-col v-else>
        <el-form-item label="编码">
          <el-input
            v-model="newFormInline.code"
            clearable
            placeholder="请输入编码"
          />
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.type == 1 || newFormInline.type == 2">
        <el-form-item label="组件路径" prop="component">
          <el-input
            v-model="newFormInline.component"
            clearable
            placeholder="请输入组件路径"
          />
        </el-form-item>
      </re-col>
      <re-col
        :value="12"
        :xs="24"
        :sm="24"
        v-if="newFormInline.type == 1 || newFormInline.type == 2"
      >
        <el-form-item label="路由地址" prop="path">
          <el-input
            v-model="newFormInline.path"
            clearable
            placeholder="请输入路由地址"
          />
        </el-form-item>
      </re-col>
      <re-col
        :value="12"
        :xs="24"
        :sm="24"
        v-if="newFormInline.type == 1 || newFormInline.type == 2"
      >
        <el-form-item label="重定向" prop="redirect">
          <el-input
            v-model="newFormInline.redirect"
            clearable
            placeholder="请输入重定向地址"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24" v-if="newFormInline.type == 2">
        <el-form-item label="API接口">
          <el-input placeholder="请输入接口地址" />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24" v-if="newFormInline.type == 2">
        <el-form-item label="API方法">
          <el-select v-model="selApiMethod" placeholder="请选择" clearable>
            <el-option
              v-for="item in apiMethods"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </re-col>
      <re-col v-if="newFormInline.type == 2">
        <el-form-item label="外部链接">
          <el-input
            v-model="newFormInline.meta.frameSrc"
            clearable
            placeholder=""
            @input="setMetaFrameSrc"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="排序">
          <el-input-number
            v-model="newFormInline.order"
            :min="0"
            :max="9999"
            controls-position="right"
            @change="setMetaRank"
          />
        </el-form-item>
      </re-col>
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="状态">
          <el-switch
            v-model="newFormInline.status"
            inline-prompt
            :active-value="50"
            :inactive-value="100"
            active-text="启用"
            inactive-text="停用"
            :style="switchStyle"
          />
        </el-form-item>
      </re-col>
      <re-col>
        <el-form-item label="Meta">
          <vue-json-pretty
            v-model:data="newFormInline.meta"
            :deep="3"
            :show-double-quotes="jsonPreview.showDoubleQuotes"
            :show-line="jsonPreview.showLine"
            :show-length="jsonPreview.showLength"
            :show-icon="jsonPreview.showIcon"
            :show-line-number="jsonPreview.showLineNumber"
            :editable="false"
            :editable-trigger="(jsonPreview.editableTrigger as any)"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
<!--          <el-input-->
<!--            v-model="newFormInline.meta"-->
<!--            placeholder="请输入备注信息"-->
<!--            type="textarea"-->
<!--          />-->
