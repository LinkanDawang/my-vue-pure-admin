import { onMounted, ref, h } from "vue";
import {
  createRole,
  getRoleList,
  setRoleMember,
  setRolePermission,
  updateRole
} from "@/api/system";
import { useUserStoreHook } from "@/store/modules/user";
import { onStatusChange, usePublicHooks } from "@/utils/common";
import {
  FormItemProps,
  MemberDialogItemProps,
  PermDialogItemProps
} from "@/views/system/role/utils/types";
import { addDialog } from "@/components/ReDialog/index";
import editForm from "@/views/system/role/form.vue";
import { message } from "@/utils/message";
import permForm from "@/views/system/role/permForm.vue";
import memberFoem from "@/views/system/role/memberForm.vue";

export function useTable() {
  const formRef = ref();
  const searchParams = ref({});
  const dataList = ref([]);
  const loading = ref(false);
  const headerFilter = ref(false);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();

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

  function pad(num) {
    return num.toString().padStart(2, "0");
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars,no-unused-vars
  function formatDateTime(date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();
    return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:${pad(
      second
    )}`;
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getRoleList(searchParams.value);
    dataList.value = data.list;
    loading.value = false;
    // const now = new Date();
    // const nowStr = formatDateTime(now);
    // dataList.value = [
    //   {
    //     id: 1,
    //     date: "2023-10-13",
    //     date2: "2023-10-13",
    //     name: `Tom`,
    //     address: "No. 211, Grove St, Los Angeles",
    //     sex: 1,
    //     created_at: nowStr,
    //     updated_at: nowStr
    //   },
    //   {
    //     id: 2,
    //     date: "2023-10-12",
    //     date2: "2023-10-13",
    //     name: `Jenny`,
    //     address: "No. 189, Grove St, Los Angeles",
    //     sex: 2,
    //     created_at: nowStr,
    //     updated_at: nowStr
    //   },
    //   {
    //     id: 3,
    //     date: "2023-10-11",
    //     date2: "2023-10-13",
    //     name: `Penny`,
    //     address: "No. 432, Grove St, Los Angeles",
    //     sex: 2,
    //     created_at: nowStr,
    //     updated_at: nowStr
    //   },
    //   {
    //     id: 4,
    //     date: "2023-10-09",
    //     date2: "2023-10-13",
    //     name: `Jack`,
    //     address: "No. 888, Grove St, Los Angeles",
    //     sex: 1,
    //     created_at: nowStr,
    //     updated_at: nowStr
    //   }
    // ];
    // setTimeout(() => {
    //   loading.value = false;
    // }, 1000);
  }

  function onReFresh() {
    searchParams.value = {};
    onSearch();
  }

  function displayHeaderFilter() {
    headerFilter.value = !headerFilter.value;
  }

  onMounted(() => {
    onSearch();
  });

  return {
    searchParams,
    loading,
    columns,
    dataList,
    headerFilter,
    onSearch,
    onReFresh,
    displayHeaderFilter,
    openDialog,
    setPermissionDialog,
    setMemberDialog
  };
}
