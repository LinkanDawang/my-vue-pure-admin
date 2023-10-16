<script setup lang="ts">
import { ref } from "vue";
// import { TableColumns } from "@/components/CusTable/types";
import { PureTableBar } from "@/components/RePureTableBar";

defineOptions({
  name: "TableCustom"
});

const tableRef = ref();

const columns = [
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

const cusData = [
  {
    date: "2023-05-03",
    name: "Tom",
    address: "No. 189, Grove St, Los Angeles",
    sex: 1
  },
  {
    date: "2023-05-02",
    name: "Jenny",
    address: "No. 189, Grove St, Los Angeles",
    sex: 2
  }
];
const headerFilter = ref(false);
const params = ref({
  date: "",
  name: "",
  address: "",
  sex: []
});
</script>

<template>
  <div class="main">
    <PureTableBar title="" :columns="columns">
      <template v-slot="{ size, dynamicColumns }">
        <el-table
          ref="tableRef"
          :data="cusData"
          :size="size"
          style="width: 100%"
        >
          <el-table-column
            v-for="(column, index) in dynamicColumns"
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
        </el-table>
      </template>
    </PureTableBar>
  </div>
</template>
