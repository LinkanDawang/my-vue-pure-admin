// import dayjs from "dayjs";
import editForm from "../form.vue";
import permForm from "../permForm.vue";
import { message } from "@/utils/message";
import {
  getRoleList,
  createRole,
  updateRole,
  setRolePermission,
  treeMenu,
  getRolePermission
} from "@/api/system";
import { ElMessageBox } from "element-plus";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import { type FormItemProps, PermDialogItemProps } from "../utils/types";
import { type PaginationProps } from "@pureadmin/table";
import { reactive, ref, onMounted, h, toRaw } from "vue";

export function useRole() {
  const form = reactive({
    name: "",
    code: "",
    status: ""
  });
  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
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
      label: "ID",
      prop: "id",
      minWidth: 100
    },
    {
      label: "角色名称",
      prop: "name",
      minWidth: 120
    },
    {
      label: "角色编号",
      prop: "code",
      minWidth: 150
    },
    {
      label: "状态",
      minWidth: 130,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          active-value={50}
          inactive-value={100}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() => onChange(scope as any)}
        />
      )
    },
    {
      label: "成员",
      slot: "member",
      minWidth: 130
    },
    {
      label: "备注",
      prop: "remark",
      minWidth: 150
    },
    {
      label: "创建时间",
      minWidth: 180,
      prop: "created_at"
      // formatter: ({ createTime }) =>
      //   dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "修改时间",
      minWidth: 180,
      prop: "updated_at"
    },
    {
      label: "操作",
      fixed: "right",
      width: 240,
      slot: "operation"
    }
  ];
  // const buttonClass = computed(() => {
  //   return [
  //     "!h-[20px]",
  //     "reset-margin",
  //     "!text-gray-500",
  //     "dark:!text-white",
  //     "dark:hover:!text-primary"
  //   ];
  // });

  function onChange({ row, index }) {
    ElMessageBox.confirm(
      `确认要<strong>${
        row.status === 100 ? "停用" : "启用"
      }</strong><strong style='color:var(--el-color-primary)'>${
        row.name
      }</strong>吗?`,
      "系统提示",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
        dangerouslyUseHTMLString: true,
        draggable: true
      }
    )
      .then(() => {
        updateRole(row.id, { status: row.status }).then(res => {
          if (res.ret == 200 || res.ret == 201) {
            message(`已${row.status === 0 ? "停用" : "启用"}${row.name}`, {
              type: "success"
            });
          } else {
            message(JSON.stringify(res.data), { type: "error" });
          }
        });
        return;
        // switchLoadMap.value[index] = Object.assign(
        //   {},
        //   switchLoadMap.value[index],
        //   {
        //     loading: true
        //   }
        // );
        // setTimeout(() => {
        //   switchLoadMap.value[index] = Object.assign(
        //     {},
        //     switchLoadMap.value[index],
        //     {
        //       loading: false
        //     }
        //   );
        //   message(`已${row.status === 0 ? "停用" : "启用"}${row.name}`, {
        //     type: "success"
        //   });
        // }, 300);
      })
      .catch(() => {
        row.status === 100 ? (row.status = 50) : (row.status = 100);
      });
  }

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

  async function onSearch() {
    loading.value = true;
    const { data } = await getRoleList(toRaw(form));
    dataList.value = data.list;
    pagination.total = data.total;
    pagination.pageSize = data.pageSize;
    pagination.currentPage = data.currentPage;

    // setTimeout(() => {
    //   loading.value = false;
    // }, 500);
    loading.value = false;
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
          remark: row?.remark ?? ""
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

  /** 获取全部菜单树 */
  async function getMenuTree() {
    const { data } = await treeMenu();
    return data;
  }

  async function getRolePerms(roleId) {
    const { data } = await getRolePermission(roleId);
    return data;
  }

  async function setPermissionDialog(row: FormItemProps) {
    const menuTree = await getMenuTree();
    const rolePermis = await getRolePerms(row.id);
    addDialog({
      title: "权限设置",
      props: {
        formInline: {
          id: row?.id ?? null,
          menuTree: menuTree,
          permissions: rolePermis
        }
      },
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

  /** 菜单权限 */
  function handleMenu() {
    message("等菜单管理页面开发后完善");
  }

  /** 数据权限 可自行开发 */
  // function handleDatabase() {}

  onMounted(() => {
    onSearch();
  });

  return {
    form,
    loading,
    columns,
    dataList,
    pagination,
    // buttonClass,
    onSearch,
    resetForm,
    openDialog,
    setPermissionDialog,
    handleMenu,
    handleDelete,
    // handleDatabase,
    handleSizeChange,
    handleCurrentChange,
    handleSelectionChange
  };
}
