import { onMounted, ref } from "vue";

export function useTable() {
  const searchParams = ref({});
  const dataList = ref([]);
  const loading = ref(false);
  const headerFilter = ref(false);

  const columns: TableColumnList = [
    {
      label: "日期",
      prop: "date",
      meta: { filterType: "date" }
    },
    {
      label: "日期2",
      prop: "date2",
      meta: { filterType: "dateRange" }
    },
    {
      label: "姓名",
      prop: "name",
      meta: { filterType: "input" }
    },
    {
      label: "性别",
      prop: "sex",
      meta: {
        filterType: "selectMultiple",
        selectOptions: [
          { value: 1, label: "男" },
          { value: 2, label: "女" }
        ]
      },
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.sex === 1 ? "danger" : ""}
          effect="plain"
        >
          {row.sex === 1 ? "男" : "女"}
        </el-tag>
      )
    },
    {
      label: "地址",
      prop: "address",
      meta: { filterType: "input" }
    },
    {
      label: "创建时间",
      prop: "created_at",
      meta: { filterType: "dateTimeRange" }
    },
    {
      label: "更新时间",
      prop: "updated_at",
      meta: { filterType: "dateTimeRange" }
    }
  ];

  function pad(num) {
    return num.toString().padStart(2, "0");
  }

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
    const now = new Date();
    const nowStr = formatDateTime(now);
    dataList.value = [
      {
        date: "2023-10-13",
        date2: "2023-10-13",
        name: `Tom`,
        address: "No. 211, Grove St, Los Angeles",
        sex: 1,
        created_at: nowStr,
        updated_at: nowStr
      },
      {
        date: "2023-10-12",
        date2: "2023-10-13",
        name: `Jenny`,
        address: "No. 189, Grove St, Los Angeles",
        sex: 2,
        created_at: nowStr,
        updated_at: nowStr
      },
      {
        date: "2023-10-11",
        date2: "2023-10-13",
        name: `Penny`,
        address: "No. 432, Grove St, Los Angeles",
        sex: 2,
        created_at: nowStr,
        updated_at: nowStr
      },
      {
        date: "2023-10-09",
        date2: "2023-10-13",
        name: `Jack`,
        address: "No. 888, Grove St, Los Angeles",
        sex: 1,
        created_at: nowStr,
        updated_at: nowStr
      }
    ];
    setTimeout(() => {
      loading.value = false;
    }, 1000);
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
