// 模拟后端动态生成路由
import { MockMethod } from "vite-plugin-mock";
import { system, permission, frame, tabs } from "@/router/enums";

/**
 * roles：页面级别权限，这里模拟二种 "admin"、"common"
 * admin：管理员角色
 * common：普通角色
 */

const systemRouter = {
  path: "/system",
  code: "systemManage",
  meta: {
    code: "systemManage",
    icon: "setting",
    title: "menus.hssysManagement",
    rank: system
  },
  children: [
    {
      path: "/system/user/index",
      code: "userManage",
      name: "User",
      meta: {
        code: "userManage",
        icon: "flUser",
        title: "menus.hsUser",
        roles: ["admin"]
      }
    },
    {
      path: "/system/role/index",
      code: "roleManage",
      name: "Role",
      meta: {
        code: "roleManage",
        icon: "role",
        title: "menus.hsRole",
        roles: ["admin"]
      }
    },
    {
      path: "/system/dept/index",
      code: "deptManage",
      name: "Dept",
      meta: {
        code: "deptManage",
        icon: "dept",
        title: "menus.hsDept",
        roles: ["admin"]
      }
    },
    {
      path: "/system/menu/index",
      code: "menuManage",
      name: "Menu",
      meta: {
        code: "menuManage",
        icon: "menu",
        title: "menus.hsMenu",
        roles: ["admin"]
      }
    }
  ]
};

const permissionRouter = {
  path: "/permission",
  code: "permissionManage",
  meta: {
    code: "permissionManage",
    title: "menus.permission",
    icon: "lollipop",
    rank: permission
  },
  children: [
    {
      path: "/permission/page/index",
      code: "pagePermission",
      name: "PermissionPage",
      meta: {
        code: "pagePermission",
        title: "menus.permissionPage",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/permission/button/index",
      code: "buttonPermission",
      name: "PermissionButton",
      meta: {
        code: "buttonPermission",
        title: "menus.permissionButton",
        roles: ["admin", "common"],
        auths: ["btn_add", "btn_edit", "btn_delete"]
      }
    }
  ]
};

const frameRouter = {
  path: "/iframe",
  code: "thirdPages",
  meta: {
    code: "thirdPages",
    icon: "monitor",
    title: "menus.hsExternalPage",
    rank: frame
  },
  children: [
    {
      path: "/iframe/pure",
      name: "FramePure",
      meta: {
        title: "menus.hsPureDocument",
        frameSrc: "https://yiming_chang.gitee.io/pure-admin-doc",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/external",
      name: "https://yiming_chang.gitee.io/pure-admin-doc",
      meta: {
        title: "menus.externalLink",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/iframe/ep",
      name: "FrameEp",
      meta: {
        title: "menus.hsEpDocument",
        frameSrc: "https://element-plus.org/zh-CN/",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/iframe/vue3",
      name: "FrameVue",
      meta: {
        title: "menus.hsVueDocument",
        frameSrc: "https://cn.vuejs.org/",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/iframe/vite",
      name: "FrameVite",
      meta: {
        title: "menus.hsViteDocument",
        frameSrc: "https://cn.vitejs.dev/",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/iframe/pinia",
      name: "FramePinia",
      meta: {
        title: "menus.hsPiniaDocument",
        frameSrc: "https://pinia.vuejs.org/zh/index.html",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/iframe/vue-router",
      name: "FrameRouter",
      meta: {
        title: "menus.hsRouterDocument",
        frameSrc: "https://router.vuejs.org/zh/",
        roles: ["admin", "common"]
      }
    },
    {
      path: "/iframe/tailwindcss",
      name: "FrameTailwindcss",
      meta: {
        title: "menus.hsTailwindcssDocument",
        frameSrc: "https://tailwindcss.com/docs/installation",
        roles: ["admin", "common"]
      }
    }
  ]
};

const tabsRouter = {
  path: "/tabs",
  code: "tabsParent",
  meta: {
    code: "tabsParent",
    icon: "IF-pure-iconfont-tabs",
    title: "menus.hstabs",
    rank: tabs
  },
  children: [
    {
      path: "/tabs/index",
      name: "Tabs",
      meta: {
        title: "menus.hstabs",
        roles: ["admin", "common"]
      }
    },
    // query 传参模式
    {
      path: "/tabs/query-detail",
      name: "TabQueryDetail",
      meta: {
        // 不在menu菜单中显示
        showLink: false,
        activePath: "/tabs/index",
        roles: ["admin", "common"]
      }
    },
    // params 传参模式
    {
      path: "/tabs/params-detail/:id",
      component: "params-detail",
      name: "TabParamsDetail",
      meta: {
        // 不在menu菜单中显示
        showLink: false,
        activePath: "/tabs/index",
        roles: ["admin", "common"]
      }
    }
  ]
};

export default [
  {
    url: "/getAsyncRoutes",
    method: "get",
    response: () => {
      return {
        success: true,
        data: [systemRouter, permissionRouter, frameRouter, tabsRouter]
      };
    }
  }
] as MockMethod[];
