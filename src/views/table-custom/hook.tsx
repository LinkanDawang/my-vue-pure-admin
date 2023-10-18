import { onMounted, reactive, ref } from "vue";

export function useTable() {
  const searchParams = reactive({
    date: "",
    name: "",
    sex: []
  });
  const dataList = ref([]);
  const loading = ref(false);

  const columns = [
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
          {row.sex === 1 ? "女" : "男"}
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
    const qr1 = Math.floor(Math.random() * 10 + 1);
    const qr2 = Math.floor(Math.random() * 10 + 1);
    dataList.value = [
      {
        date: "2023-05-03",
        name: `Tom${qr1}`,
        address: "No. 189, Grove St, Los Angeles",
        sex: 1
      },
      {
        date: "2023-05-02",
        name: `Jenny${qr2}`,
        address: "No. 189, Grove St, Los Angeles",
        sex: 2
      }
    ];
    setTimeout(() => {
      loading.value = false;
    }, 1500);
  }

  onMounted(() => {
    onSearch();
  });

  return {
    searchParams,
    loading,
    columns,
    dataList,
    onSearch
  };
}
