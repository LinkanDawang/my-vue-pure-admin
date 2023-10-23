<script setup lang="ts">
import { reactive } from "vue";
import { RePureTable } from "@/components/RePureTable";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import { useTable } from "./hook";

defineOptions({
  name: "TableCustom"
});

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const {
  searchParams,
  loading,
  columns,
  dataList,
  headerFilter,
  onSearch,
  onReFresh,
  displayHeaderFilter
} = useTable();
</script>

<template>
  <div class="main">
    <PureTableBar
      title=""
      :columns="columns"
      @refresh="onReFresh"
      useColumnFilter
      @displayHeaderFilter="displayHeaderFilter"
    >
      <!--<template #buttons></template>-->
      <template v-slot="{ size, dynamicColumns, tableConf }">
        <RePureTable
          v-bind="tableConf"
          adaptive
          :columns="dynamicColumns"
          highlight-current-row
          :data="dataList"
          :size="size"
          :loading="loading"
          :pagination="pagination"
          :paginationSmall="true"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          :headerFilter="headerFilter"
          @showHeaderFilter="displayHeaderFilter"
          :searchParams="searchParams"
          @onSearch="onSearch"
        />
      </template>
    </PureTableBar>
  </div>
</template>
