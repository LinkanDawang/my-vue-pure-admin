// import dayjs from "dayjs";
import editForm from "../forms/form.vue";
import permForm from "../forms/permForm.vue";
import memberFoem from "../forms/memberForm.vue";
import { message } from "@/utils/message";
import {
  getRoleList,
  getRoleColumns,
  createRole,
  updateRole,
  setRolePermission,
  setRoleMember
} from "@/api/system";
// import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import {
  type FormItemProps,
  PermDialogItemProps,
  MemberDialogItemProps
} from "../utils/types";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, h } from "vue";
import { usePublicHooks, onStatusChange } from "@/utils/common";
import { useUserStoreHook } from "@/store/modules/user";
import { useTableBase } from "@/utils/tableHook";

export function useRole() {
  const form = reactive({
    name: "",
    code: "",
    status: ""
  });
  const formRef = ref();
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const pagination = reactive<PaginationProps>({
    total: 0,
    pageSize: 10,
    currentPage: 1,
    background: true
  });
  const columns: TableColumnList = [
    {
      label: "状态",
      prop: "status",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          disabled={
            scope.row.is_super_role ||
            !useUserStoreHook().hasPermission("sys:role:edit")
          }
          active-value={50}
          inactive-value={100}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() =>
            onStatusChange(scope as any, updateRole, switchLoadMap)
          }
        />
      )
    },
    {
      label: "成员",
      prop: "member",
      slot: "member"
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation"
    }
  ];

  const { tableLoading, tableColumns, dataList, onSearch } = useTableBase(
    getRoleList,
    columns
  );

  function handleDelete(row) {
    message(`您删除了角色名称为${row.name}的这条数据`, { type: "success" });
    onSearch();
  }

  function handleSizeChange(val: number) {
    console.log(`${val} items per page`);
  }

  function handleCurrentChange(val: number) {
    console.log(`current page: ${val}`);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  const resetForm = formEl => {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  };

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}角色`,
      props: {
        formInline: {
          name: row?.name ?? "",
          code: row?.code ?? "",
          remark: row?.remark ?? "",
          is_super_role: row?.is_super_role ?? false
        }
      },
      width: "40%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          message(`您${title}了角色名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              createRole(curData).then(res => {
                if (res.ret == 200 || res.ret == 201) {
                  chores();
                } else {
                  message(JSON.stringify(res.data), { type: "error" });
                }
              });
            } else {
              // 实际开发先调用编辑接口，再进行下面操作
              updateRole(row.id, curData).then(res => {
                if (res.ret == 200 || res.ret == 201) {
                  chores();
                } else {
                  message(JSON.stringify(res.data), { type: "error" });
                }
              });
            }
          }
        });
      }
    });
  }

  async function setPermissionDialog(row: FormItemProps) {
    // const menuTree = await getMenuTree();
    // const rolePermis: any = await getRolePerms(row.id);
    addDialog({
      title: "权限设置",
      props: {
        formInline: {
          id: row?.id ?? null,
          permissions: []
        }
      },
      hideFooter: row.is_super_role,
      width: "40%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(permForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as PermDialogItemProps;
        function chores() {
          message("权限设置成功", {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            setRolePermission(row.id, curData.permissions).then(res => {
              if (res.ret == 200 || res.ret == 201) {
                chores();
              } else {
                message(JSON.stringify(res.data), { type: "error" });
              }
            });
          }
        });
      }
    });
  }

  async function setMemberDialog(row: FormItemProps) {
    addDialog({
      title: "成员设置",
      props: {
        formInline: {
          id: row?.id ?? null,
          member: []
        }
      },
      width: "40%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(memberFoem, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as MemberDialogItemProps;
        function chores() {
          message("成员设置成功", {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            setRoleMember(row.id, curData.member).then(res => {
              if (res.ret == 200 || res.ret == 201) {
                chores();
              } else {
                message(JSON.stringify(res.data), { type: "error" });
              }
            });
          }
        });
      }
    });
  }

  /** 菜单权限 */
  function handleMenu() {
    message("等菜单管理页面开发后完善");
  }

  /** 数据权限 可自行开发 */
  // function handleDatabase() {}

  return {
    form,
    tableLoading,
    tableColumns,
    dataList,
    pagination,
    // buttonClass,
    getRoleColumns,
    onSearch,
    resetForm,
    openDialog,
    setPermissionDialog,
    setMemberDialog,
    handleMenu,
    handleDelete,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
