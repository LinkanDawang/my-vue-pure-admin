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

const tableRef = ref();
const headerFilter = ref(false);

const props = ref({
  showSelection: true,
  showIndex: true
});

function displayHeaderFilter() {
  headerFilter.value = !headerFilter.value;
}

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const standTables = ["RePureTable", "PureTable", "ElTable"];
const showTables = ref(["RePureTable", "PureTable", "ElTable"]);

const { searchParams, loading, columns, dataList, onSearch } = useTable();
</script>

<template>
  <div class="main">
    <PureTableBar
      title=""
      :columns="columns"
      @refresh="onSearch"
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
            table-layout="auto"
            :pagination="pagination"
            :paginationSmall="true"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
            :headerFilter="headerFilter"
            @showHeaderFilter="displayHeaderFilter"
            :searchParams="searchParams"
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
            table-layout="auto"
            :pagination="pagination"
            :paginationSmall="true"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
          />
        </el-col>
        <el-col v-show="showTables.includes(standTables[2])">
          <el-divider>{{ standTables[2] }}</el-divider>
          <el-table
            ref="tableRef"
            :data="dataList"
            :size="size"
            v-loading="loading"
            style="width: 100%"
          >
            <el-table-column
              label=""
              type="selection"
              v-if="props.showSelection"
            />
            <el-table-column label="序号" type="index" v-if="props.showIndex" />
            <el-table-column
              v-for="(column, index) in dynamicColumns.filter(item => {
                return !item.hide || item.hide == false;
              })"
              :key="index"
              :label="column.label"
              :type="column.type"
              :prop="column.prop"
              :align="column.align ?? 'center'"
            >
              <template #header>
                <el-col @click="headerFilter = !headerFilter">
                  {{ column.label }}
                </el-col>
                <el-col
                  v-if="column.meta?.filterType ?? false"
                  v-show="headerFilter"
                >
                  <el-date-picker
                    v-if="column.meta.filterType == 'date'"
                    v-model="searchParams[column.prop]"
                    type="date"
                    width="100%"
                    placeholder="Pick a day"
                  />
                  <el-select
                    v-else-if="column.meta.filterType == 'select'"
                    v-model="searchParams[column.prop]"
                    clearable
                    multiple
                    collapse-tags
                    collapse-tags-tooltip
                    placeholder="请选择"
                    style="width: 240px"
                  >
                    <el-option
                      v-for="item in column.meta.selectOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-input v-else v-model="searchParams[column.prop]" />
                </el-col>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </template>
    </PureTableBar>
  </div>
</template>
