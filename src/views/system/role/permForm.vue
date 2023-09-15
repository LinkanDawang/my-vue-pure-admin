<script setup lang="ts">
import { ref } from "vue";
import { PermDialogProps } from "./utils/types";
import { transformI18n } from "@/plugins/i18n";
import ElTreeLine from "@/components/ReTreeLine";

const props = withDefaults(defineProps<PermDialogProps>(), {
  formInline: () => ({
    id: null,
    menuTree: [],
    permissions: []
  })
});
const newFormInline = ref(props.formInline);

const ruleFormRef = ref();
function getRef() {
  return ruleFormRef.value;
}
defineExpose({ getRef });

const dataProps = {
  value: "id",
  children: "children"
};

function menuCheckChange(obj, isChecked) {
  if (isChecked) {
    newFormInline.value.permissions.push(obj.id);
  } else {
    const delIndex = newFormInline.value.permissions.indexOf(obj.id);
    if (delIndex >= 0) {
      newFormInline.value.permissions.splice(delIndex, 1);
    }
  }
}
</script>

<template>
  <el-form ref="ruleFormRef" :model="newFormInline" label-width="82px">
    <el-col class="mb-[20px]">
      <el-card shadow="never">
        <div class="max-h-[550px] overflow-y-auto">
          <el-tree
            :data="newFormInline.menuTree"
            :props="dataProps"
            show-checkbox
            default-expand-all
            node-key="id"
            :indent="30"
            :default-checked-keys="newFormInline.permissions"
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
