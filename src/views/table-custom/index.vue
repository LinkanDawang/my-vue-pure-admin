<script setup lang="ts">
import { reactive, ref } from "vue";
// import { TableColumns } from "@/components/CusTable/types";
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

const standTables = ["RePureTable", "PureTable", "ElTable"];
const showTables = ref(["RePureTable", "PureTable", "ElTable"]);

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
      <template #buttons>
        <div>
          <el-checkbox-group v-model="showTables">
            <el-checkbox-button
              v-for="table in standTables"
              :key="table"
              :label="table"
            >
              {{ table }}
            </el-checkbox-button>
          </el-checkbox-group>
        </div>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <el-col v-show="showTables.includes(standTables[0])">
          <el-divider>{{ standTables[0] }}</el-divider>
          <RePureTable
            :columns="dynamicColumns"
            :data="dataList"
            :size="size"
            :loading="loading"
            align-whole="center"
            table-layout="fixed"
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
        </el-col>
        <el-col v-show="showTables.includes(standTables[1])">
          <el-divider>{{ standTables[1] }}</el-divider>
          <pure-table
            :columns="dynamicColumns"
            :data="dataList"
            :size="size"
            :loading="loading"
            align-whole="center"
            table-layout="fixed"
            :pagination="pagination"
            :paginationSmall="true"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
          />
        </el-col>
      </template>
    </PureTableBar>
  </div>
</template>
