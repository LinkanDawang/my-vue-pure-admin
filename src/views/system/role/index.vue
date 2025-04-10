<script setup lang="ts">
import { ref } from "vue";
import { useRole } from "./utils/hook";
import { RePureTable } from "@/components/RePureTable";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

// import Database from "@iconify-icons/ri/database-2-line";
// import More from "@iconify-icons/ep/more-filled";
import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
import Menu from "@iconify-icons/ep/menu";
import Group from "@iconify-icons/ri/group-fill";
import AddFill from "@iconify-icons/ri/add-circle-line";
import { transformI18n } from "@/plugins/i18n";
import { useUserStoreHook } from "@/store/modules/user";

defineOptions({
  name: "Role"
});

const formRef = ref();
const {
  form,
  tableLoading,
  tableColumns,
  dataList,
  pagination,
  getRoleColumns,
  // buttonClass,
  onSearch,
  resetForm,
  openDialog,
  setPermissionDialog,
  setMemberDialog,
  handleDelete,
  // handleDatabase,
  handleSizeChange,
  handleCurrentChange,
  handleSelectionChange
} = useRole();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="角色名称：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入角色名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="角色标识：" prop="code">
        <el-input
          v-model="form.code"
          placeholder="请输入角色标识"
          clearable
          class="!w-[180px]"
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option label="已启用" value="1" />
          <el-option label="已停用" value="0" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="tableLoading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <Suspense>
      <PureTableBar
        title="角色列表（仅演示，操作后不生效）"
        :columnsApi="getRoleColumns"
        :columns="tableColumns"
        useColumnFilter
      >
        <template #buttons>
          <el-button
            v-if="useUserStoreHook().hasPermission('sys:role:add')"
            type="primary"
            :icon="useRenderIcon(AddFill)"
            @click="openDialog()"
          >
            新增角色
          </el-button>
        </template>
        <template v-slot="{ size, dynamicColumns, tableConf }">
          <RePureTable
            v-bind="tableConf"
            showOverflowTooltip
            :loading="tableLoading"
            :size="size"
            adaptive
            :data="dataList"
            :columns="dynamicColumns"
            :pagination="pagination"
            :paginationSmall="size === 'small' ? true : false"
            :header-cell-style="{
              background: 'var(--el-fill-color-light)',
              color: 'var(--el-text-color-primary)'
            }"
            @selection-change="handleSelectionChange"
            @page-size-change="handleSizeChange"
            @page-current-change="handleCurrentChange"
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
              <!-- <el-dropdown>
								<el-button
									class="ml-3 mt-[2px]"
									link
									type="primary"
									:size="size"
									:icon="useRenderIcon(More)"
								/>
								<template #dropdown>
									<el-dropdown-menu>
										<el-dropdown-item>
											<el-button
												:class="buttonClass"
												link
												type="primary"
												:size="size"
												:icon="useRenderIcon(Menu)"
												@click="handleMenu"
											>
												菜单权限
											</el-button>
										</el-dropdown-item>
										<el-dropdown-item>
											<el-button
												:class="buttonClass"
												link
												type="primary"
												:size="size"
												:icon="useRenderIcon(Database)"
												@click="handleDatabase"
											>
												数据权限
											</el-button>
										</el-dropdown-item>
									</el-dropdown-menu>
								</template>
							</el-dropdown> -->
            </template>
          </RePureTable>
        </template>
      </PureTableBar>
    </Suspense>
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 12px;
  }
}
</style>
