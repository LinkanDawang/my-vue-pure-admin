<script setup lang="ts">
import { reactive } from "vue";
import { RePureTable } from "@/components/RePureTable";
import { PureTableBar } from "@/components/RePureTableBar";
import { PaginationProps } from "@pureadmin/table";
import { useTable } from "./hook";
import { getRoleColumns } from "@/api/system";
import { useUserStoreHook } from "@/store/modules/user";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import EditPen from "@iconify-icons/ep/edit-pen";
import Menu from "@iconify-icons/ep/menu";
import Group from "@iconify-icons/ri/group-fill";
import Delete from "@iconify-icons/ep/delete";
import { transformI18n } from "@/plugins/i18n";

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
  displayHeaderFilter,
  openDialog,
  setPermissionDialog,
  setMemberDialog
} = useTable();
</script>

<template>
  <div class="main">
    <Suspense>
      <PureTableBar
        title=""
        message="haha"
        :columnsApi="getRoleColumns"
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
          >
            <template #member="{ row }">
              <el-tag v-for="user in row.member" :key="user.id">{{
                user.username
              }}</el-tag>
            </template>
            <template #operation="{ row }">
              <el-space wrap>
                <el-button
                  v-if="useUserStoreHook().hasPermission('sys:role:edit')"
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(EditPen)"
                  @click="openDialog('编辑', row)"
                >
                  {{ transformI18n("buttons.hsedit") }}
                </el-button>
                <el-button
                  v-if="
                    useUserStoreHook().hasPermission('sys:role:permDispatch')
                  "
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Menu)"
                  @click="setPermissionDialog(row)"
                >
                  {{ transformI18n("buttons.hsPermission") }}
                </el-button>
                <el-button
                  v-if="useUserStoreHook().hasPermission('sys:role:setMember')"
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(Group)"
                  @click="setMemberDialog(row)"
                >
                  {{ transformI18n("buttons.hsSetMember") }}
                </el-button>
                <el-popconfirm
                  v-if="useUserStoreHook().hasPermission('sys:role:delete')"
                  :title="`是否确认删除角色名称为${row.name}的这条数据`"
                  @confirm="handleDelete(row)"
                >
                  <template #reference>
                    <el-button
                      class="reset-margin"
                      link
                      type="danger"
                      :disabled="row.is_super_role"
                      :size="size"
                      :icon="useRenderIcon(Delete)"
                    >
                      {{ transformI18n("buttons.hsdelete") }}
                    </el-button>
                  </template>
                </el-popconfirm>
              </el-space>
            </template>
          </RePureTable>
        </template>
      </PureTableBar>
    </Suspense>
  </div>
</template>
