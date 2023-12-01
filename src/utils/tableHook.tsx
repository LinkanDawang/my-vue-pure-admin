import { onMounted, ref } from "vue";

export function useTableBase(
  listApi?: Function,
  tableColumns?: TableColumnList
) {
  const dataList = ref([]);
  const tableLoading = ref(false);

  async function onSearch(params?: object | undefined) {
    tableLoading.value = true;
    try {
      const { data } = await listApi(params);
      if (data instanceof Array) {
        dataList.value = data;
      } else if (data instanceof Object) {
        dataList.value = data.list;
      }
    } finally {
      tableLoading.value = false;
    }
  }

  onMounted(() => {
    onSearch();
  });

  return {
    tableLoading,
    tableColumns,
    dataList,
    onSearch
  };
}
