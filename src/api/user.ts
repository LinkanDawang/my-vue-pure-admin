import { http } from "@/utils/http";
import { apiUrl } from "@/api/utils";

export type BaseResult = {
  success: boolean;
  ret: number;
  data?: any;
};

export type UserResult = {
  success: boolean;
  ret?: number;
  data: {
    /** 用户名 */
    username: string;
    /** 当前登陆用户的角色 */
    roles: Array<string>;
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type RefreshTokenResult = {
  success: boolean;
  data: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
  };
};

export type OauthTokenResult = {
  success: boolean;
  ret: number;
  msg: string;
  data?: {
    /** `token` */
    accessToken: string;
    /** 用于调用刷新`accessToken`的接口时所需的`token` */
    refreshToken: string;
    /** `accessToken`的过期时间（格式'xxxx/xx/xx xx:xx:xx'） */
    expires: Date;
    expiresIn: number;
    tokenType?: string;
    scope?: string;
    user: any;
  };
};

export type UserInfoResult = {
  success: boolean;
  ret: number;
  msg: string;
  data?: {
    id: number;
    name: string;
    username: string;
    email: string;
    is_superuser: boolean;
    is_active: boolean;
    date_joined: Date;
    roles: Array<object>;
    permissions: Array<any>;
  };
};

/** 登录 */
export const getLogin = (data?: object) => {
  return http.request<UserResult>("post", "/login", { data });
};

/** 刷新token */
export const refreshTokenApi = (data?: object) => {
  return http.request<RefreshTokenResult>("post", "/refreshToken", { data });
};

/** 刷新oauth2 token */
export const oauth2TokenApi = (
  data: object,
  grantType: "refresh_token" | "password"
) => {
  const { VITE_OAUTH2_APP_ID, VITE_OAUTH2_APP_SECRET } = import.meta.env;
  const axiosConfig = {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  };
  if (grantType == "refresh_token") {
    data["refresh_token"] = data["refreshToken"];
    data["client_id"] = VITE_OAUTH2_APP_ID;
    data["client_secret"] = VITE_OAUTH2_APP_SECRET;
  } else {
    axiosConfig["auth"] = {
      username: VITE_OAUTH2_APP_ID,
      password: VITE_OAUTH2_APP_SECRET
    };
  }
  data["grant_type"] = grantType;

  return http.request<OauthTokenResult>(
    "post",
    apiUrl("users/oauth"),
    { data },
    { ...axiosConfig }
  );
};

/** 注销oauth2 token */
export const oauth2RevokeTokenApi = (data: object) => {
  const { VITE_OAUTH2_APP_ID, VITE_OAUTH2_APP_SECRET } = import.meta.env;
  const axiosConfig = {
    headers: { "Content-Type": "application/x-www-form-urlencoded" }
  };
  data["client_id"] = VITE_OAUTH2_APP_ID;
  data["client_secret"] = VITE_OAUTH2_APP_SECRET;
  return http.request<any>(
    "post",
    apiUrl("o/revoke_token"),
    { data },
    { ...axiosConfig }
  );
};

export const userLogout = () => {
  return http.request<BaseResult>("get", apiUrl("users/logout"));
};

export const userInfoApi = () => {
  return http.request<UserInfoResult>("get", apiUrl("users/me"));
};

export const dingTalkLogin = data => {
  return http.request<OauthTokenResult>(
    "post",
    apiUrl("/social-auth/dingtalk/"),
    {
      data
    }
  );
};

export const getUserColumns = () => {
  // return http.request<ResultTable>("post", "/role", { data });
  return http.request<BaseResult>("options", apiUrl("users"));
};
