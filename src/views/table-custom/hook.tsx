import { onMounted, ref } from "vue";
import { getRoleList, updateRole } from "@/api/system";
import { useUserStoreHook } from "@/store/modules/user";
import { onStatusChange, usePublicHooks } from "@/utils/common";

export function useTable() {
  const searchParams = ref({});
  const dataList = ref([]);
  const loading = ref(false);
  const headerFilter = ref(false);
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();

  const columns: TableColumnList = [
    {
      label: "ID",
      prop: "id"
    },
    {
      label: "角色名称",
      prop: "name",
      meta: { filterType: "input" }
    },
    {
      label: "角色编号",
      prop: "code",
      meta: { filterType: "input" }
    },
    {
      label: "状态",
      meta: {
        filterType: "selectMultiple",
        selectOptions: [
          { value: 50, label: "启用" },
          { value: 100, label: "停用" }
        ]
      },
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
      slot: "member"
    },
    {
      label: "备注",
      prop: "remark",
      meta: { filterType: "input" }
    },
    {
      label: "创建时间",
      prop: "created_at",
      meta: { filterType: "dateTimeRange" }
      // formatter: ({ createTime }) =>
      //   dayjs(createTime).format("YYYY-MM-DD HH:mm:ss")
    },
    {
      label: "修改时间",
      prop: "updated_at",
      meta: { filterType: "dateTimeRange" }
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation"
    }
  ];

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
    const { data } = await getRoleList();
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
    displayHeaderFilter
  };
}
