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
// import { usePublicHooks } from "../../hooks";
import { addDialog } from "@/components/ReDialog";
import { reactive, ref, h, watch } from "vue";
import { type FormItemProps } from "../utils/types";
import { cloneDeep, isAllEmpty } from "@pureadmin/utils";
import { transformI18n } from "@/plugins/i18n";
import { IconifyIconOnline } from "@/components/ReIcon";
import { onStatusChange, usePublicHooks } from "@/utils/common";
import { useUserStoreHook } from "@/store/modules/user";
import { useTableBase } from "@/utils/tableHook";

export function useMenu() {
  const form = reactive({
    code: "",
    name: "",
    status: null
  });

  const formRef = ref();
  const cusDataList = ref([]);
  const menuDialogLoading = ref(false);
  const menuButtons = ref([]);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();
  const menuTypes = {
    menu: { value: 1, name: "菜单" },
    page: { value: 2, name: "页面" }
  };

  const columns: TableColumnList = [
    {
      label: "ID",
      prop: "id",
      // minWidth: 100,
      fixed: true
    },
    {
      label: "排序",
      prop: "order"
      // minWidth: 40
    },
    {
      label: "菜单名称",
      prop: "meta.title",
      // width: 180,
      // formatter: ({ meta }) => transformI18n(meta.title),
      cellRenderer: scope => (
        <el-link type="primary" onClick={() => openViewDialog(scope.row)}>
          {transformI18n(scope.row.meta.title)}
        </el-link>
      )
    },
    {
      label: "编码",
      prop: "code"
      // minWidth: 150
      // headerRenderer: scope => (
      //   <>
      //     <el-input
      //       v-model={form.code}
      //       v-show={showHeaderFilter.value}
      //       size="small"
      //       clearable
      //       placeholder=""
      //       onChange={onSearch}
      //     />
      //     <el-row
      //       v-show={!showHeaderFilter.value}
      //       onClick={() => {
      //         showHeaderFilter.value = !showHeaderFilter.value;
      //       }}
      //     >
      //       {scope.column.label}
      //     </el-row>
      //   </>
      // )
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
      label: "图标",
      prop: "meta.icon",
      cellRenderer: ({ row }) => (
        <el-icon>
          <IconifyIconOnline icon={row.meta.icon} />
        </el-icon>
      )
    },
    {
      label: "状态",
      prop: "status",
      // minWidth: 100,
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          disabled={!useUserStoreHook().hasPermission("sys:menu:edit")}
          active-value={50}
          inactive-value={100}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() =>
            onStatusChange(scope as any, updateMenu, switchLoadMap)
          }
        />
      )
    },
    {
      label: "组件名称",
      prop: "name"
      // width: 180
    },
    {
      label: "组件路径",
      prop: "component"
      // width: 180,
    },
    {
      label: "路由地址",
      prop: "path"
      // width: 180,
    },
    {
      label: "重定向",
      prop: "redirect"
      // width: 180,
    },
    // {
    //   label: "按钮",
    //   prop: "buttons",
    //   width: 180
    // },
    {
      label: "Meta",
      prop: "meta",
      // width: 180,
      hide: true,
      formatter: ({ meta }) => JSON.stringify(meta)
    },
    {
      label: "创建时间",
      // minWidth: 200,
      prop: "created_at"
      // formatter: ({ createTime }) => dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "更新时间",
      // minWidth: 200,
      prop: "updated_at"
      // formatter: ({ createTime }) => dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation",
      align: "left"
    }
  ];

  const { tableLoading, tableColumns, dataList, onSearch } = useTableBase(
    getMenuList,
    columns
  );

  function openViewDialog(menuObj: FormItemProps) {
    openDialog("查看", menuObj);
  }

  function handleSelectionChange(val) {
    console.log("handleSelectionChange", val);
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
      // 翻译菜单名称
      treeList[i].menuTransName = transformI18n(treeList[i].meta.title);
      newTreeList.push(treeList[i]);
    }
    return newTreeList;
  }

  function openDialog(
    title: "新增" | "编辑" | "查看" = "查看",
    row?: FormItemProps
  ) {
    const formStyle = { "pointer-events": "auto" };
    if (title == "查看") formStyle["pointer-events"] = "none";
    addDialog({
      title: `${title}菜单`,
      props: {
        formInline: {
          higherMenuOptions: formatHigherMenuOptions(
            cloneDeep(cusDataList.value),
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
            rank: row?.order ?? null,
            code: row?.code ?? "",
            showLink: true
          },
          type: row?.type ?? 1,
          menuTransName: transformI18n(row?.meta?.title) ?? ""
        }
      },
      width: "40%",
      top: "0vh",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () => h(editForm, { ref: formRef, style: formStyle }),
      beforeSure: (done, { options }, setButtonLoading) => {
        if (title === "查看") {
          done();
          return;
        }
        const FormRef = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        function chores() {
          setButtonLoading(false);
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
            setButtonLoading(true);
            // postData.meta = JSON.parse(postData.meta);
            let requestFunction: Function = null;
            let funcParams: Array<any> = null;
            if (title === "新增") {
              requestFunction = createMenu;
              funcParams = [postData];
              // 实际开发先调用新增接口，再进行下面操作
            } else {
              requestFunction = updateMenu;
              funcParams = [curData.id, postData];
              // 实际开发先调用编辑接口，再进行下面操作
            }
            requestFunction(...funcParams)
              .then(() => {
                chores();
              })
              .catch(() => {
                setButtonLoading(false);
              });
          }
        });
      }
    });
  }

  const getButtons = (menuId: number) => {
    menuDialogLoading.value = true;
    getMenuButtons(menuId).then(res => {
      menuButtons.value = res.data ?? [];
      menuDialogLoading.value = false;
    });
  };

  function buttonsDialog(rowId: number) {
    addDialog({
      title: "按钮设置",
      props: {
        loading: menuDialogLoading,
        formInline: {
          parentId: rowId,
          buttons: menuButtons
        }
      },
      width: "60%",
      draggable: true,
      fullscreenIcon: true,
      closeOnClickModal: false,
      contentRenderer: () =>
        h(buttonForm, { ref: formRef, onGetButtons: getButtons }),
      beforeSure: (done, { options }, setButtonLoading) => {
        const FormRefs = formRef.value.getRef();
        const curData = options.props.formInline as FormItemProps;
        const postData = JSON.parse(JSON.stringify(curData));
        function chores() {
          setButtonLoading(false);
          message("OK", {
            type: "success"
          });
          done(); // 关闭弹框
          onSearch(); // 刷新表格数据
        }
        FormRefs.validate(valid => {
          if (valid && postData.buttons.length > 0) {
            setButtonLoading(true);
            setMenuButtons(postData.parentId, postData.buttons)
              .then(() => {
                chores();
              })
              .catch(() => {
                setButtonLoading(false);
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

  function handleListData(data: Array<any>) {
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
    cusDataList.value = handleTree(newData); // 处理成树结构
  }

  watch(dataList, () => {
    handleListData(dataList.value);
  });

  return {
    form,
    tableLoading,
    tableColumns,
    cusDataList,
    menuTypes,
    /** 搜索 */
    onSearch,
    /** 新增、编辑部门 */
    openDialog,
    buttonsDialog,
    /** 删除部门 */
    handleDelete,
    handleSelectionChange
  };
}
