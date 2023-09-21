// import dayjs from "dayjs";
import editForm from "../forms/menu.vue";
import buttonForm from "../forms/button.vue";
import { handleTree } from "@/utils/tree";
import { message } from "@/utils/message";
import {
  getMenuList,
  createMenu,
  updateMenu,
  setMenuButtons,
  getMenuButtons
} from "@/api/system";
import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, onMounted, h } from "vue";
import { type FormItemProps } from "../utils/types";
import { cloneDeep, isAllEmpty } from "@pureadmin/utils";
import { transformI18n } from "@/plugins/i18n";

export function useMenu() {
  const form = reactive({
    name: "",
    status: null
  });

  const formRef = ref();
  const dataList = ref([]);
  const loading = ref(true);
  const { tagStyle } = usePublicHooks();
  const menuTypes = {
    menu: { value: 1, name: "菜单" },
    page: { value: 2, name: "页面" }
  };

  const columns: TableColumnList = [
    {
      label: "ID",
      prop: "id",
      minWidth: 100,
      fixed: true
    },
    {
      label: "排序",
      prop: "order",
      align: "left"
    },
    {
      label: "类型",
      prop: "type",
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.type === menuTypes.menu.value ? "" : "success"}
          disable-transitions
        >
          {row.type === menuTypes.menu.value
            ? menuTypes.menu.name
            : menuTypes.page.name}
        </el-tag>
      )
    },
    {
      label: "编码",
      prop: "code",
      align: "left",
      minWidth: 120
    },
    {
      label: "菜单名称",
      prop: "meta.title",
      width: 180,
      formatter: ({ meta }) => transformI18n(meta.title)
    },
    {
      label: "状态",
      prop: "status",
      minWidth: 100,
      cellRenderer: ({ row, props }) => (
        <el-tag size={props.size} style={tagStyle.value(row.status)}>
          {row.status === 50 ? "启用" : "停用"}
        </el-tag>
      )
    },
    {
      label: "组件名称",
      prop: "name",
      width: 180
    },
    {
      label: "组件路径",
      prop: "component",
      width: 180,
      align: "left"
    },
    {
      label: "路由地址",
      prop: "path",
      width: 180,
      align: "left"
    },
    {
      label: "重定向",
      prop: "redirect",
      width: 180,
      align: "left"
    },
    // {
    //   label: "按钮",
    //   prop: "buttons",
    //   width: 180
    // },
    {
      label: "Meta",
      prop: "meta",
      width: 180,
      hide: true,
      formatter: ({ meta }) => JSON.stringify(meta)
    },
    {
      label: "创建时间",
      minWidth: 200,
      prop: "created_at"
      // formatter: ({ createTime }) => dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "更新时间",
      minWidth: 200,
      prop: "updated_at"
      // formatter: ({ createTime }) => dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      width: 200,
      slot: "operation"
    }
  ];

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
  }

  function resetForm(formEl) {
    if (!formEl) return;
    formEl.resetFields();
    onSearch();
  }

  async function onSearch() {
    loading.value = true;
    const { data } = await getMenuList(); // 这里是返回一维数组结构，前端自行处理成树结构，返回格式要求：唯一id加父节点parentId，parentId取父节点id
    let newData = data;
    if (!isAllEmpty(form.name)) {
      // 前端搜索菜单名称
      newData = newData.filter(item =>
        transformI18n(item.meta.title).includes(form.name)
      );
    }
    if (!isAllEmpty(form.status)) {
      // 前端搜索状态
      newData = newData.filter(item => item.status === form.status);
    }
    dataList.value = handleTree(newData); // 处理成树结构
    setTimeout(() => {
      loading.value = false;
    }, 500);
  }

  function formatHigherMenuOptions(
    treeList,
    choicedId?: number,
    setDisable?: boolean
  ) {
    // 根据返回数据的status字段值判断追加是否禁用disabled字段，
    // 返回处理后的树结构，用于上级部门级联选择器的展示（实际开发中也是如此，不可能前端需要的每个字段后端都会返回，
    // 这时需要前端自行根据后端返回的某些字段做逻辑处理）
    if (!treeList || !treeList.length) return;
    const newTreeList = [];
    for (let i = 0; i < treeList.length; i++) {
      let disabled = false;
      if (setDisable) {
        disabled = true;
      } else {
        disabled = treeList[i].status === 100 || choicedId === treeList[i].id;
      }
      treeList[i].disabled = disabled;
      if (disabled && choicedId === treeList[i].id) {
        formatHigherMenuOptions(treeList[i].children, choicedId, true);
      } else {
        formatHigherMenuOptions(treeList[i].children, choicedId);
      }
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(title = "新增", row?: FormItemProps) {
    addDialog({
      title: `${title}菜单`,
      props: {
        formInline: {
          higherMenuOptions: formatHigherMenuOptions(
            cloneDeep(dataList.value),
            row?.id ?? null
          ),
          id: row?.id ?? null,
          parentId: row?.parentId ?? 0,
          name: row?.name ?? "",
          component: row?.component ?? "",
          code: row?.code ?? "",
          path: row?.path ?? "",
          redirect: row?.redirect ?? "",
          order: row?.order ?? null,
          status: row?.status ?? 50,
          meta: row?.meta ?? {
            title: "",
            icon: "ep:expand",
            rank: row?.order ?? null
          },
          type: row?.type ?? 1
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
          message(`您${title}了名称为${curData.name}的这条数据`, {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRef.validate(valid => {
          if (valid) {
            // 表单规则校验通过
            const postData = JSON.parse(JSON.stringify(curData));
            postData.meta.rank = postData.order;
            delete postData.higherMenuOptions;
            // postData.meta = JSON.parse(postData.meta);
            if (title === "新增") {
              // 实际开发先调用新增接口，再进行下面操作
              createMenu(postData).then(res => {
                if (res.ret == 200) {
                  chores();
                } else {
                  message(res.msg, { type: "error" });
                }
              });
            } else {
              // 实际开发先调用编辑接口，再进行下面操作
              updateMenu(curData.id, postData).then(res => {
                if (res.ret == 200) {
                  chores();
                } else {
                  message(res.msg, { type: "error" });
                }
              });
            }
          }
        });
      }
    });
  }
  async function buttonsDialog(row: FormItemProps) {
    const newButtons = await getButtons(row);
    addDialog({
      title: "按钮设置",
      props: {
        formInline: {
          parentId: row.id,
          buttons: cloneDeep(newButtons)
        }
      },
      width: "60%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(buttonForm, { ref: formRef }),
      beforeSure: (done, { options }) => {
        const FormRefs = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        const postData = JSON.parse(JSON.stringify(curData));
        function chores() {
          message("OK", {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRefs.validate(valid => {
          if (valid && postData.buttons.length > 0) {
            setMenuButtons(postData.parentId, postData.buttons).then(res => {
              if (res.ret == 200) {
                chores();
              } else {
                message(res.msg, { type: "error" });
              }
            });
          }
        });
      }
    });
  }

  function handleDelete(row) {
    message(`您删除了部门名称为${row.name}的这条数据`, { type: "success" });
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  async function getButtons(row) {
    const { data } = await getMenuButtons(row.id);
    const newData = data;
    return newData;
  }

  return {
    form,
    loading,
    columns,
    dataList,
    menuTypes,
    /** 搜索 */
    onSearch,
    /** 重置 */
    resetForm,
    /** 新增、编辑部门 */
    openDialog,
    buttonsDialog,
    /** 删除部门 */
    handleDelete,
    handleSelectionChange
  };
}
