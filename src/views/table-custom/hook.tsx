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
      label: "姓名",
      prop: "name",
      meta: { filterType: "input" }
    },
    {
      label: "性别",
      prop: "sex",
      meta: {
        filterType: "select",
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
    }
  ];

  async function onSearch() {
    loading.value = true;
    dataList.value = [
      {
        date: "2023-10-13",
        name: `Tom`,
        address: "No. 211, Grove St, Los Angeles",
        sex: 1
      },
      {
        date: "2023-10-12",
        name: `Jenny`,
        address: "No. 189, Grove St, Los Angeles",
        sex: 2
      },
      {
        date: "2023-10-11",
        name: `Penny`,
        address: "No. 432, Grove St, Los Angeles",
        sex: 2
      },
      {
        date: "2023-10-09",
        name: `Jack`,
        address: "No. 888, Grove St, Los Angeles",
        sex: 1
      }
    ];
    dataList.value = dataList.value.filter(item => {
      if (searchParams.value.name) {
        if (
          !item.name
            .toUpperCase()
            .includes(searchParams.value.name.toUpperCase())
        ) {
          return false;
        }
      }
      if (searchParams.value.date) {
        if (!item.date == searchParams.value.date) {
          return false;
        }
      }
      if (searchParams.value.sex && searchParams.value.sex.length > 0) {
        if (!searchParams.value.sex.includes(item.sex)) {
          return false;
        }
      }
      if (searchParams.value.address) {
        if (
          !item.address
            .toUpperCase()
            .includes(searchParams.value.address.toUpperCase())
        ) {
          return false;
        }
      }
      return true;
    });
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
