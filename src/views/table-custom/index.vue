<script setup lang="ts">
import { reactive, ref } from "vue";
// import { TableColumns } from "@/components/CusTable/types";
import { RePureTable } from "@/components/RePureTable";
import { PureTableBar } from "@/components/RePureTableBar";
import { CusTable } from "@/components/CusTable";
import { PaginationProps } from "@pureadmin/table";

defineOptions({
  name: "TableCustom"
});

const tableRef = ref();

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
    }
  },
  {
    label: "地址",
    prop: "address",
    meta: { filterType: "input" }
  }
];

const cusData = ref([]);
const headerFilter = ref(false);
const params = ref({
  date: "",
  name: "",
  address: "",
  sex: []
});

const props = ref({
  showSelection: true,
  showIndex: true
});

const loading = ref(false);

function onSearch() {
  loading.value = true;
  const qr1 = Math.floor(Math.random() * 10 + 1);
  // const qr2 = Math.floor(Math.random() * 10 + 1);
  cusData.value = [
    {
      date: "2023-05-03",
      name: `Tom${qr1}`,
      address: "No. 189, Grove St, Los Angeles",
      sex: 1
    }
    // {
    //   date: "2023-05-02",
    //   name: `Jenny${qr2}`,
    //   address: "No. 189, Grove St, Los Angeles",
    //   sex: 2
    // }
  ];
  setTimeout(() => {
    loading.value = false;
  }, 1500);
}

function displayHeaderFilter() {
  headerFilter.value = !headerFilter.value;
}

onSearch();

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});
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
      <template v-slot="{ size, dynamicColumns }">
        <el-divider>CusTable</el-divider>
        <CusTable
          :columns="dynamicColumns"
          :data="cusData"
          :size="size"
          :loading="loading"
          :headerFilter="headerFilter"
          :showSelection="false"
          table-layout="auto"
          @showHeaderFilter="displayHeaderFilter"
        >
          <template #append>
            <el-col>hahaha</el-col>
          </template>
        </CusTable>
        <el-divider>PureTableLocal</el-divider>
        <RePureTable
          :columns="dynamicColumns"
          :data="cusData"
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
        <el-divider>PureTable</el-divider>
        <pure-table
          :columns="dynamicColumns"
          :data="cusData"
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
        <el-divider />
        <el-divider>ElTable</el-divider>
        <el-table
          ref="tableRef"
          :data="cusData"
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
                  v-model="params[column.prop]"
                  type="date"
                  width="100%"
                  placeholder="Pick a day"
                />
                <el-select
                  v-else-if="column.meta.filterType == 'select'"
                  v-model="params[column.prop]"
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
                <el-input v-else v-model="params[column.prop]" />
              </el-col>
            </template>
          </el-table-column>
          <template #append>
            <el-col>hahaha</el-col>
          </template>
        </el-table>
      </template>
    </PureTableBar>
  </div>
</template>
