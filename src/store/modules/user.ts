import { defineStore } from "pinia";
import { store } from "@/store";
import { userType } from "./types";
// import { message } from "@/utils/message";
import { routerArrays } from "@/layout/types";
import { router, resetRouter } from "@/router";
import {
  // storageSession,
  storageLocal,
  cloneDeep
} from "@pureadmin/utils";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// import { getLogin, refreshTokenApi, UserResult, RefreshTokenResult } from "@/api/user";
import {
  oauth2TokenApi,
  oauth2RevokeTokenApi,
  userInfoApi,
  dingTalkLogin,
  userLogout,
  type OauthTokenResult,
  UserInfoResult
} from "@/api/user";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import {
  type DataInfo,
  setToken,
  setPermissions,
  removeToken,
  sessionKey,
  permissionKey
} from "@/utils/auth";

const LoginType = {
  oauth: 1,
  sysOrThird: 2
};

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    // 用户名
    username:
      storageLocal().getItem<DataInfo<number>>(sessionKey)?.user.username ?? "",
    // 页面级别权限
    roles:
      storageLocal().getItem<DataInfo<number>>(sessionKey)?.user.roles ?? [],
    // 前端生成的验证码（按实际需求替换）
    verifyCode: "",
    // 判断登录页面显示哪个组件（0：登录（默认）、1：手机登录、2：二维码登录、3：注册、4：忘记密码）
    currentPage: 0,
    permissions: storageLocal().getItem<Array<string>>(permissionKey) ?? []
  }),
  actions: {
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username;
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles;
    },
    /** 存储前端生成的验证码 */
    SET_VERIFYCODE(verifyCode: string) {
      this.verifyCode = verifyCode;
    },
    /** 存储登录页面显示哪个组件 */
    SET_CURRENTPAGE(value: number) {
      this.currentPage = value;
    },
    SET_PERMISSIONS(permission: Array<string>) {
      this.permissions = permission;
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<OauthTokenResult>((resolve, reject) => {
        // getLogin(data)
        oauth2TokenApi(data, "password")
          .then(res => {
            if (res) {
              const resData = cloneDeep(res.data);
              resData["loginType"] = LoginType.oauth;
              setToken(resData);
              resolve(res);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 第三方登入-钉钉 */
    async loginByDinTalk(data) {
      return new Promise<OauthTokenResult>((resolve, reject) => {
        dingTalkLogin(data)
          .then(res => {
            if (res) {
              const resData = cloneDeep(res.data);
              resData["loginType"] = LoginType.sysOrThird;
              setToken(resData);
              resolve(res);
            }
          })
          .catch(error => {
            console.error(error);
            // message(`${error.data.ret}: ${error.data.msg}`, {
            //   type: "error"
            // });
            reject(error);
          });
      });
    },
    /** 前端登出（不调用接口） */
    logOut() {
      const tokenData = storageLocal().getItem<DataInfo<any>>(sessionKey);
      if (tokenData.loginType === LoginType.oauth) {
        const tokenObj = { token: tokenData.accessToken };
        oauth2RevokeTokenApi(tokenObj).then();
      } else {
        userLogout().then();
      }
      this.username = "";
      this.roles = [];
      removeToken();
      storageLocal().removeItem(permissionKey);
      storageLocal().removeItem(sessionKey);
      useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
      resetRouter();
      router.push("/login");
    },
    /** 刷新`token` */
    async handRefreshToken(data) {
      return new Promise<OauthTokenResult>((resolve, reject) => {
        // refreshTokenApi(data)
        oauth2TokenApi(data, "refresh_token")
          .then(res => {
            if (res) {
              const resData = cloneDeep(res.data);
              resData["loginType"] = LoginType.oauth;
              setToken(resData);
              resolve(res);
            }
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 获取登入账号信息 */
    async getUserInfo() {
      return new Promise<UserInfoResult>((resolve, reject) => {
        userInfoApi()
          .then(res => {
            const permCodes = [];
            res.data.permissions.forEach(perm => {
              permCodes.push(perm.perm_code);
            });
            setPermissions(permCodes);
            resolve(res);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 登入账号权限判断 */
    hasPermission(code: string) {
      return (
        !code ||
        this.permissions.includes(code) ||
        this.permissions.includes("*:*:*")
      );
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
