import { http } from "@/utils/http";
import { apiUrl } from "./utils";

type Result = {
  success: boolean;
  data?: Array<any>;
};

type ResultTable = {
  success?: boolean;
  ret?: number;
  data?: {
    /** 列表数据 */
    list: Array<any>;
    /** 总条目数 */
    total?: number;
    /** 每页显示条目个数 */
    pageSize?: number;
    /** 当前页数 */
    currentPage?: number;
  };
};

type postResult = {
  ret: number;
  msg: string;
  success?: boolean;
  data?: any;
};

type postArrayResult = {
  ret: number;
  msg: string;
  success?: boolean;
  data?: Array<any>;
};

/** 获取用户管理列表 */
export const getUserList = (params?: object) => {
  // return http.request<ResultTable>("post", "/user", { data });
  return http.request<ResultTable>("get", apiUrl("/users"), { params });
};

/** 用户管理-获取所有角色列表 */
export const getAllRoleList = () => {
  return http.request<Result>("get", "/list-all-role");
};

/** 用户管理-根据userId，获取对应角色id列表（userId：用户id） */
export const getRoleIds = (data?: object) => {
  return http.request<Result>("post", "/list-role-ids", { data });
};

/** 获取角色管理列表 */
export const getRoleList = (params?: object) => {
  // return http.request<ResultTable>("post", "/role", { data });
  return http.request<ResultTable>("get", apiUrl("rbac/roles/"), { params });
};

export const getRoleColumns = () => {
  // return http.request<ResultTable>("post", "/role", { data });
  return http.request<postArrayResult>("options", apiUrl("rbac/roles/"), {});
};

/** 新增角色 */
export const createRole = (data?: object) => {
  // return http.request<Result>("get", apiUrl("rbac/menus/"));
  return http.request<postResult>("post", apiUrl("rbac/roles/"), { data });
};

/** 修改角色 */
export const updateRole = (id: number, data?: object) => {
  // return http.request<Result>("get", apiUrl("rbac/menus/"));
  return http.request<postResult>("patch", apiUrl(`rbac/roles/${id}/`), {
    data
  });
};

export const setRolePermission = (id: number, data?: Array<number>) => {
  // return http.request<Result>("get", apiUrl("rbac/menus/"));
  return http.request<postResult>(
    "post",
    apiUrl(`rbac/roles/${id}/set-permissions/`),
    {
      data
    }
  );
};

export const getRolePermission = (id: number) => {
  return http.request<postResult>(
    "get",
    apiUrl(`rbac/roles/${id}/get-permissions/`),
    {}
  );
};

export const setRoleMember = (id: number, data?: Array<number>) => {
  return http.request<postResult>(
    "post",
    apiUrl(`rbac/roles/${id}/set-member/`),
    {
      data
    }
  );
};

export const getRoleMember = (id: number) => {
  return http.request<postResult>(
    "get",
    apiUrl(`rbac/roles/${id}/get-member/`),
    {}
  );
};

/** 获取部门管理列表 */
export const getDeptList = (data?: object) => {
  return http.request<Result>("post", "/dept", { data });
};

/** 获取菜单管理列表 */
export const getMenuList = () => {
  // return http.request<Result>("get", apiUrl("rbac/menus/"));
  return http.request<Result>("get", apiUrl("rbac/menus/"), {});
};

/** 新增菜单 */
export const createMenu = (data?: object) => {
  // return http.request<Result>("get", apiUrl("rbac/menus/"));
  return http.request<postResult>("post", apiUrl("rbac/menus/"), { data });
};

/** 修改菜单 */
export const updateMenu = (id: number, data?: object) => {
  // return http.request<Result>("get", apiUrl("rbac/menus/"));
  return http.request<postResult>("patch", apiUrl(`rbac/menus/${id}/`), {
    data
  });
};

/** 菜单树状数据 */
export const treeMenu = () => {
  // return http.request<Result>("get", apiUrl("rbac/menus/"));
  return http.request<postArrayResult>("get", apiUrl("rbac/menus/tree/"), {});
};

/** 菜单按钮 */
export const getMenuButtons = (id: number) => {
  return http.request<postResult>(
    "get",
    apiUrl(`rbac/menus/${id}/buttons/`),
    {}
  );
};

/** 修改菜单按钮 */
export const setMenuButtons = (id: number, data?: Array<object>) => {
  return http.request<postResult>(
    "put",
    apiUrl(`rbac/menus/${id}/set-buttons/`),
    {
      data
    }
  );
};
