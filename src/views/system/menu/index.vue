<script setup lang="ts">
import { ref } from "vue";
import { useMenu } from "./utils/hook";
import { RePureTable } from "@/components/RePureTable";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { transformI18n } from "@/plugins/i18n";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: "Menu"
});

const tableRef = ref();
const {
  tableLoading,
  tableColumns,
  cusDataList,
  menuTypes,
  onSearch,
  openDialog,
  buttonsDialog,
  handleDelete,
  handleSelectionChange
} = useMenu();

const permissionMap = {
  add: useUserStoreHook().hasPermission("sys:menu:add"),
  edit: useUserStoreHook().hasPermission("sys:menu:edit"),
  delete: useUserStoreHook().hasPermission("sys:menu:delete"),
  buttons: useUserStoreHook().hasPermission("sys:menu:buttons")
};
</script>

<template>
  <div class="main">
    <PureTableBar
      title=""
      :columns="tableColumns"
      :tableRef="tableRef?.getTableRef()"
    >
      <template #buttons>
        <el-button
          v-if="permissionMap.add"
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog('新增')"
        >
          {{
            transformI18n("buttons.hsadd") + transformI18n("menus.hsMenuBase")
          }}
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns, tableConf }">
        <RePureTable
          ref="tableRef"
          v-bind="tableConf"
          adaptive
          :adaptiveConfig="{ offsetBottom: 32 }"
          row-key="id"
          :size="size"
          showOverflowTooltip
          tooltip-effect="dark"
          default-expand-all
          :loading="tableLoading"
          :data="cusDataList"
          :columns="dynamicColumns"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
          @onSearch="onSearch"
        >
          <template #operation="{ row }">
            <el-space wrap>
              <el-button
                v-if="permissionMap.edit"
                class="reset-margin"
                link
                type="primary"
                :icon="useRenderIcon(EditPen)"
                @click="openDialog('编辑', JSON.parse(JSON.stringify(row)))"
              >
                {{ transformI18n("buttons.hsedit") }}
              </el-button>
              <el-popconfirm
                :title="`是否确认删除部门名称为${row.name}的这条数据`"
                @confirm="handleDelete(row)"
              >
                <template #reference>
                  <el-button
                    v-if="permissionMap.delete"
                    class="reset-margin"
                    link
                    type="danger"
                    :icon="useRenderIcon(Delete)"
                  >
                    {{ transformI18n("buttons.hsdelete") }}
                  </el-button>
                </template>
              </el-popconfirm>
              <el-button
                v-if="permissionMap.buttons"
                v-show="row.type === menuTypes.page.value"
                class="reset-margin"
                link
                type="primary"
                :icon="useRenderIcon('fa:hand-pointer-o')"
                @click="buttonsDialog(row.id)"
              >
                {{ transformI18n("buttons.hsbutton") }}
              </el-button>
            </el-space>
          </template>
        </RePureTable>
      </template>
    </PureTableBar>
  </div>
</template>

<style lang="scss" scoped>
.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
