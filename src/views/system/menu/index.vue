<script setup lang="ts">
import { ref } from "vue";
import { useMenu } from "./utils/hook";
import { PureTableBar } from "@/components/RePureTableBar";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { transformI18n } from "@/plugins/i18n";

import Delete from "@iconify-icons/ep/delete";
import EditPen from "@iconify-icons/ep/edit-pen";
import Search from "@iconify-icons/ep/search";
import Refresh from "@iconify-icons/ep/refresh";
// import Operation from "@iconify-icons/ep/operation";
import AddFill from "@iconify-icons/ri/add-circle-line";

defineOptions({
  // eslint-disable-next-line vue/no-reserved-component-names
  name: "Menu"
});

const formRef = ref();
const tableRef = ref();
const {
  form,
  loading,
  columns,
  dataList,
  menuTypes,
  displayHeaderFilter,
  onSearch,
  resetForm,
  openDialog,
  buttonsDialog,
  handleDelete,
  handleSelectionChange
} = useMenu();
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="form"
      class="search-form bg-bg_color w-[99/100] pl-8 pt-[12px]"
    >
      <el-form-item label="名称：" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入菜单名称"
          clearable
          class="!w-[200px]"
        />
      </el-form-item>
      <el-form-item label="状态：" prop="status">
        <el-select
          v-model="form.status"
          placeholder="请选择状态"
          clearable
          class="!w-[180px]"
        >
          <el-option label="启用" :value="50" />
          <el-option label="停用" :value="100" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon(Search)"
          :loading="loading"
          @click="onSearch"
        >
          搜索
        </el-button>
        <el-button :icon="useRenderIcon(Refresh)" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>
    <PureTableBar
      title=""
      :columns="columns"
      :tableRef="tableRef?.getTableRef()"
      @refresh="onSearch"
      @displayHeaderFilter="displayHeaderFilter"
      use-column-filter
    >
      <template #buttons>
        <el-button
          type="primary"
          :icon="useRenderIcon(AddFill)"
          @click="openDialog()"
        >
          {{
            transformI18n("buttons.hsadd") + transformI18n("menus.hsMenuBase")
          }}
        </el-button>
      </template>
      <template v-slot="{ size, dynamicColumns }">
        <pure-table
          ref="tableRef"
          adaptive
          :adaptiveConfig="{ offsetBottom: 32 }"
          align-whole="center"
          row-key="id"
          :size="size"
          showOverflowTooltip
          tooltip-effect="dark"
          table-layout="auto"
          default-expand-all
          :loading="loading"
          :data="dataList"
          :columns="dynamicColumns"
          :header-cell-style="{
            background: 'var(--el-fill-color-light)',
            color: 'var(--el-text-color-primary)'
          }"
          @selection-change="handleSelectionChange"
        >
          <template #operation="{ row }">
            <el-row>
              <el-col :span="8">
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :icon="useRenderIcon(EditPen)"
                  @click="openDialog('编辑', JSON.parse(JSON.stringify(row)))"
                >
                  {{ transformI18n("buttons.hsedit") }}
                </el-button>
              </el-col>
              <el-col :span="8">
                <el-popconfirm
                  :title="`是否确认删除部门名称为${row.name}的这条数据`"
                  @confirm="handleDelete(row)"
                >
                  <template #reference>
                    <el-button
                      class="reset-margin"
                      link
                      type="danger"
                      :icon="useRenderIcon(Delete)"
                    >
                      {{ transformI18n("buttons.hsdelete") }}
                    </el-button>
                  </template>
                </el-popconfirm>
              </el-col>
              <el-col :span="8" v-show="row.type === menuTypes.page.value">
                <el-button
                  class="reset-margin"
                  link
                  type="primary"
                  :icon="useRenderIcon('fa:hand-pointer-o')"
                  @click="buttonsDialog(JSON.parse(JSON.stringify(row)))"
                >
                  {{ transformI18n("buttons.hsbutton") }}
                </el-button>
              </el-col>
            </el-row>
          </template>
        </pure-table>
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
