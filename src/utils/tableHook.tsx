import { onMounted, ref } from "vue";

export function useTableBase(
  listApi?: Function,
  tableColumns?: TableColumnList
) {
  const dataList = ref([]);
  const tableLoading = ref(false);

  async function onSearch(params?: object | undefined) {
    tableLoading.value = true;
    const { data } = await listApi(params);
    dataList.value = data.list;
    tableLoading.value = false;
  }

  function onReFresh() {
    onSearch();
  }

  onMounted(() => {
    onSearch();
  });

  return {
    tableLoading,
    tableColumns,
    dataList,
    onSearch,
    onReFresh
  };
}
