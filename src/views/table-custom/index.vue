<script setup lang="ts">
import { reactive, ref } from "vue";
// import { TableColumns } from "@/components/CusTable/types";
import { RePureTable } from "@/components/RePureTable";
import { PureTableBar } from "@/components/RePureTableBar";
import { ReSelect } from "@/components/ReSelect";
import { PaginationProps } from "@pureadmin/table";
import { useTable } from "./hook";
import { getMenuList } from "@/api/system";

defineOptions({
  name: "TableCustom"
});

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const standTables = ["RePureTable", "PureTable"];
const showTables = ref(["RePureTable", "PureTable"]);

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

const demoOption = ref([]);
const demoOptions = [
  { value: 1, label: "男" },
  { value: 2, label: "女" }
];
const demoOptions2 = [
  { id: 1, name: "男" },
  { id: 2, name: "女" }
];

const popperOptions = {
  label: "name",
  value: "id"
};
</script>

<template>
  <div class="main">
    <ReSelect
      v-model="demoOption"
      clearable
      filterable
      :stand-options="demoOptions"
      :options-api="getMenuList"
      :pop-keys="{ label: 'name', value: 'id' }"
    />
    <el-select clearable v-model="demoOption" :popper-options="popperOptions">
      <el-option
        v-for="option in demoOptions2"
        :key="option.id"
        :value="option.id"
        :label="option.name"
      />
    </el-select>
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
            border
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
