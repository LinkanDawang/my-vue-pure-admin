<script setup lang="ts">
import { ref } from "vue";
import { PermDialogProps } from "./utils/types";
import { transformI18n } from "@/plugins/i18n";
import ElTreeLine from "@/components/ReTreeLine";
import { getRolePermission, treeMenu } from "@/api/system";
import { message } from "@/utils/message";

const loading = ref(true);

const props = withDefaults(defineProps<PermDialogProps>(), {
  formInline: () => ({
    id: null,
    permissions: []
  })
});
const newFormInline = ref(props.formInline);

// 获取菜单树状数据
const menuTree = ref([]);
function getMenuTree() {
  treeMenu()
    .then(res => {
      menuTree.value = res.data;
    })
    .catch(error => {
      message(`${error.data.ret}: ${error.data.msg}\n菜单数据获取失败`, {
        type: "error"
      });
    });
  loading.value = false;
}

// 获取角色拥有的菜单权限
getRolePermission(newFormInline.value.id)
  .then(res => {
    newFormInline.value.permissions = res.data.permissions;
    getMenuTree();
  })
  .catch(error => {
    message(`${error.data.ret}: ${error.data.msg}\n角色权限获取失败`, {
      type: "error"
    });
  });

const ruleFormRef = ref();
function getRef() {
  return ruleFormRef.value;
}
defineExpose({ getRef });

const dataProps = {
  value: "id",
  children: "children",
  disabled: "disabled"
};

const treeRef = ref();
const swCheckAll = ref(false);
const swExpandTree = ref(true);
// const swLinkage = ref(false);

function removePermission(permId) {
  const delIndex = newFormInline.value.permissions.indexOf(permId);
  if (delIndex >= 0) {
    newFormInline.value.permissions.splice(delIndex, 1);
  }
}

function setPermission(permId) {
  if (!newFormInline.value.permissions.includes(permId)) {
    newFormInline.value.permissions.push(permId);
  }
}

/*菜单权限树节点选中变化时*/
function menuCheckChange(obj, isChecked) {
  const permId = obj.id;

  // 菜单上下级之间联动时半选中的父节点视为选择
  // const halfCheckedMenuIds = treeRef.value.getHalfCheckedKeys();
  // if (!isChecked && halfCheckedMenuIds.includes(permId)) {
  //   isChecked = true;
  // }
  if (isChecked) {
    setPermission(permId);
    if (obj.parentId) {
      const parentNode = treeRef.value.store.nodesMap[obj.parentId];
      if (!parentNode.checked) {
        parentNode.checked = true;
      }
    }
  } else {
    removePermission(permId);
    // 按钮
    obj.buttons.forEach(button => {
      removePermission(button.id);
    });
    obj.children.forEach(child => {
      const childNode = treeRef.value.store.nodesMap[child.id];
      if (childNode.checked) {
        childNode.checked = false;
      }
    });
  }
}

/*菜单权限树展开/折叠*/
function expandTree(isExpand) {
  const nodes = treeRef.value.store.nodesMap;
  for (const node in nodes) {
    nodes[node].expanded = isExpand;
  }
}

/*菜单权限树全选/不选*/
function checkAllTree(isCheckedAll) {
  const nodes = treeRef.value.store.nodesMap;
  for (const node in nodes) {
    if (!nodes[node].data.disabled) {
      if (nodes[node].checked != isCheckedAll) {
        nodes[node].checked = isCheckedAll;
      }
      const nodeButtons = nodes[node].data.buttons;
      for (const index in nodeButtons) {
        if (isCheckedAll && !nodeButtons[index].disabled) {
          setPermission(nodeButtons[index].id);
        } else {
          removePermission(nodeButtons[index].id);
        }
      }
    }
  }
}

function buttonCheckChange(isChecked, nodeData: any) {
  // 按钮勾选时自动勾选按钮所属菜单
  const menuId = nodeData.id;
  const node = treeRef.value.store.nodesMap[menuId];
  if (isChecked && !node.checked) {
    node.checked = true;
    // setPermission(menuId);
  }
}
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    label-width="82px"
    v-loading="loading"
  >
    <el-col class="mb-[20px]">
      <el-row>
        <el-col :span="6">
          <el-switch
            v-model="swCheckAll"
            active-text="全选/不选"
            @change="checkAllTree"
          />
        </el-col>
        <el-col :span="6">
          <el-switch
            v-model="swExpandTree"
            active-text="展开/折叠"
            @change="expandTree"
          />
        </el-col>
        <!--        <el-col :span="6">-->
        <!--          <el-switch v-model="swLinkage" active-text="父子联动" />-->
        <!--        </el-col>-->
      </el-row>
      <el-card shadow="never">
        <div class="max-h-[550px] overflow-y-auto">
          <el-tree
            ref="treeRef"
            :data="menuTree"
            :props="dataProps"
            show-checkbox
            check-strictly
            node-key="id"
            :render-after-expand="false"
            :indent="30"
            :default-checked-keys="newFormInline.permissions"
            default-expand-all
            @check-change="menuCheckChange"
          >
            <template v-slot:default="{ node, data }">
              <el-tree-line :node="node" :showLabelLine="true">
                <template v-slot:node-label>
                  <span class="text-sm">
                    {{ transformI18n(node.label) }}
                  </span>
                  <div class="demo-button-style" style="margin-left: 20px">
                    <el-checkbox-group
                      v-model="newFormInline.permissions"
                      size="small"
                    >
                      <el-checkbox-button
                        v-for="button in data.buttons"
                        :label="button.id"
                        :key="button.id"
                        :disabled="button.disabled"
                        @change="checked => buttonCheckChange(checked, data)"
                        >{{ transformI18n(button.meta.title) }}
                      </el-checkbox-button>
                    </el-checkbox-group>
                  </div>
                </template>
              </el-tree-line>
            </template>
          </el-tree>
        </div>
      </el-card>
    </el-col>
  </el-form>
</template>
