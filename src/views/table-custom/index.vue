<script setup lang="ts">
import { reactive } from "vue";
import { RePureTable } from "@/components/RePureTable";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import { useTable } from "./hook";
import { getRoleColumns } from "@/api/system";

defineOptions({
  name: "TableCustom"
});

const pagination = reactive<PaginationProps>({
  total: 0,
  pageSize: 10,
  currentPage: 1,
  background: true
});

const { tableLoading, tableColumns, dataList, onSearch } = useTable();
</script>

<template>
  <div class="main">
    <Suspense>
      <PureTableBar
        title=""
        message="haha"
        :columnsApi="getRoleColumns"
        :columns="tableColumns"
        useColumnFilter
      >
        <template v-slot="{ size, dynamicColumns, tableConf }">
          <RePureTable
            v-bind="tableConf"
            adaptive
            :columns="dynamicColumns"
            highlight-current-row
            :data="dataList"
            :size="size"
            :loading="tableLoading"
            :pagination="pagination"
            :paginationSmall="true"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
            @onSearch="onSearch"
          >
            <template #member="{ row }">
              <el-tag v-for="user in row.member" :key="user.id">{{
                user.username
              }}</el-tag>
            </template>
          </RePureTable>
        </template>
      </PureTableBar>
    </Suspense>
  </div>
</template>
