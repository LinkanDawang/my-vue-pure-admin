<script setup lang="ts">
import { ref } from "vue";
import tree from "./tree.vue";
import { useUser } from "./utils/hook";
import { RePureTable } from "@/components/RePureTable";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

import Upload from "@iconify-icons/ri/upload-line";
import Role from "@iconify-icons/ri/admin-line";
import Password from "@iconify-icons/ri/lock-password-line";
import More from "@iconify-icons/ep/more-filled";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
// import Search from "@iconify-icons/ep/search";
// import Refresh from "@iconify-icons/ep/refresh";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { getUserColumns } from "@/api/user";

defineOptions({
  name: "User"
});

const treeRef = ref();
const tableRef = ref();

const {
  tableLoading,
  tableColumns,
  dataList,
  treeData,
  treeLoading,
  selectedNum,
  pagination,
  buttonClass,
  extraSearchParams,
  onSearch,
  onbatchDel,
  openDialog,
  onDeptSelect,
  handleUpdate,
  handleDelete,
  handleUpload,
  handleReset,
  handleRole,
  handleSizeChange,
  onSelectionCancel,
  handleCurrentChange,
  handleSelectionChange
} = useUser(tableRef, treeRef);
</script>

<template>
  <div class="flex justify-between">
    <tree
      ref="treeRef"
      class="min-w-[200px] mr-2"
      :treeData="treeData"
      :treeLoading="treeLoading"
      @tree-select="onDeptSelect"
    />
    <div class="w-[calc(100%-200px)]">
      <Suspense>
        <PureTableBar
          title=""
          :columnsApi="getUserColumns"
          :columns="tableColumns"
          useColumnFilter
        >
          <template #buttons>
            <el-button
              type="primary"
              :icon="useRenderIcon(AddFill)"
              @click="openDialog()"
            >
              新增用户
            </el-button>
          </template>
          <template v-slot="{ size, dynamicColumns, tableConf }">
            <div
              v-if="selectedNum > 0"
              v-motion-fade
              class="bg-[var(--el-fill-color-light)] w-full h-[46px] mb-2 pl-4 flex items-center"
            >
              <div class="flex-auto">
                <span
                  style="font-size: var(--el-font-size-base)"
                  class="text-[rgba(42,46,54,0.5)] dark:text-[rgba(220,220,242,0.5)]"
                >
                  已选 {{ selectedNum }} 项
                </span>
                <el-button type="primary" text @click="onSelectionCancel">
                  取消选择
                </el-button>
              </div>
              <el-popconfirm title="是否确认删除?" @confirm="onbatchDel">
                <template #reference>
                  <el-button type="danger" text class="mr-1">
                    批量删除
                  </el-button>
                </template>
              </el-popconfirm>
            </div>
            <RePureTable
              v-bind="tableConf"
              row-key="id"
              ref="tableRef"
              adaptive
              :loading="tableLoading"
              :size="size"
              :data="dataList"
              :columns="dynamicColumns"
              :pagination="pagination"
              highlight-current-row
              :paginationSmall="size === 'small' ? true : false"
              :header-cell-style="{
                background: 'var(--el-fill-color-light)',
                color: 'var(--el-text-color-primary)'
              }"
              :extraSearchParams="extraSearchParams"
              @selection-change="handleSelectionChange"
              @page-size-change="handleSizeChange"
              @page-current-change="handleCurrentChange"
              @onSearch="onSearch"
            >
              <template #operation="{ row }">
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :size="size"
                  :icon="useRenderIcon(EditPen)"
                  @click="openDialog('编辑', row)"
                >
                  修改
                </el-button>
                <el-popconfirm
                  :title="`是否确认删除用户编号为${row.id}的这条数据`"
                  @confirm="handleDelete(row)"
                >
                  <template #reference>
                    <el-button
                      class="reset-margin"
                      link
                      type="primary"
                      :size="size"
                      :icon="useRenderIcon(Delete)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-popconfirm>
                <el-dropdown>
                  <el-button
                    class="ml-3 mt-[2px]"
                    link
                    type="primary"
                    :size="size"
                    :icon="useRenderIcon(More)"
                    @click="handleUpdate(row)"
                  />
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item>
                        <el-button
                          :class="buttonClass"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon(Upload)"
                          @click="handleUpload(row)"
                        >
                          上传头像
                        </el-button>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <el-button
                          :class="buttonClass"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon(Password)"
                          @click="handleReset(row)"
                        >
                          重置密码
                        </el-button>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <el-button
                          :class="buttonClass"
                          link
                          type="primary"
                          :size="size"
                          :icon="useRenderIcon(Role)"
                          @click="handleRole(row)"
                        >
                          分配角色
                        </el-button>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </template>
            </RePureTable>
          </template>
        </PureTableBar>
      </Suspense>
    </div>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

:deep(.el-button:focus-visible) {
  outline: none;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
