<script setup lang="ts">
import CusTable from "@/components/CusTable";

const columns: TableColumnList = [
  {
    label: "",
    type: "selection"
  },
  {
    label: "No",
    type: "index"
  },
  {
    label: "日期",
    prop: "date"
  },
  {
    label: "姓名",
    prop: "name"
  },
  {
    label: "地址",
    prop: "address"
  }
];

const cusData = [
  {
    date: "2023-05-03",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles"
  },
  {
    date: "2023-05-02",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles"
  }
];
</script>

<template>
  <CusTable :data="cusData" :columns="columns" headerFilter />
</template>
