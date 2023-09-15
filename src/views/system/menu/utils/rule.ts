import { reactive } from "vue";
import type { FormRules } from "element-plus";
import {array} from "vue-types";
// import { isPhone, isEmail } from "@pureadmin/utils";

/** 自定义表单规则校验 */
export const formRules = reactive(<FormRules>{
  meta: [
    {
      validator: (rule, value, callback) => {
        if (!value.title) {
          callback(new Error("菜单名称为必填项"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  name: [{ required: true, message: "名称为必填项", trigger: "blur" }],
  path: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
        } else if (!value.startsWith("/")) {
          callback(new Error("路由地址必须以'/'为开头"));
        } else {
          callback();
        }
      },
      trigger: "blur"
      // trigger: "click" // 如果想在点击确定按钮时触发这个校验，trigger 设置成 click 即可
    }
  ],
  redirect: [
    {
      validator: (rule, value, callback) => {
        if (!value) {
          callback();
        } else if (!value.startsWith("/")) {
          callback(new Error("重定向地址必须以'/'为开头"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

export const formButtonRules = reactive(<FormRules>{
  code: [{ required: true, message: "code为必填项", trigger: "blur" }],
  name: [{ required: true, message: "Name为必填项", trigger: "blur" }]
});
