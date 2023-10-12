<script lang="ts" setup>
import { ref } from "vue";
import type { FormInstance } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ButtonProps } from "@/views/system/menu/utils/types";
import { localesConfigs, transformI18n } from "@/plugins/i18n";
import IconSelect from "@/components/ReIcon/src/Select.vue";
import { getMenuButtons } from "@/api/system";

const formRef = ref<FormInstance>();
function getRef() {
  return formRef.value;
}

defineExpose({ getRef });

const loading = ref(true);

const props = withDefaults(defineProps<ButtonProps>(), {
  formInline: () => ({
    parentId: null,
    buttons: [
      {
        id: null,
        type: 3,
        order: 0,
        code: "",
        parentId: null,
        meta: { rank: 0, title: "", icon: "" }
      }
    ]
  })
});

const dynamicValidateForm = ref(props.formInline);

getMenuButtons(dynamicValidateForm.value.parentId).then(res => {
  dynamicValidateForm.value.buttons = res.data;
  loading.value = false;
});

const buttonSort = () => {
  dynamicValidateForm.value.buttons.sort(function (a, b) {
    return a.order - b.order;
  });
  for (let i = 0; i < dynamicValidateForm.value.buttons.length; i++) {
    dynamicValidateForm.value.buttons[i].order = i;
    dynamicValidateForm.value.buttons[i].meta.rank = i;
  }
};

const removeDomain = item => {
  const index = dynamicValidateForm.value.buttons.indexOf(item);
  if (index !== -1) {
    dynamicValidateForm.value.buttons.splice(index, 1);
  }
  buttonSort();
};

const addDomain = () => {
  dynamicValidateForm.value.buttons.push({
    id: null,
    type: 3,
    order: dynamicValidateForm.value.buttons.length,
    code: "",
    parentId: dynamicValidateForm.value.parentId,
    meta: { rank: 1, title: "", icon: "" }
  });
  buttonSort();
};

const moveDomain = (item: any, steps: number) => {
  const toIndex = item.order + steps;
  dynamicValidateForm.value.buttons[toIndex].order = toIndex - steps;
  item.order = toIndex;
  buttonSort();
};

const validateButton = (rule: any, value: any, callback: any) => {
  if (!value.code) {
    callback(new Error("按钮code不能为空"));
  } else if (!value.meta.title) {
    callback(new Error("按钮name不能为空"));
  } else {
    callback();
  }
};

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const submitForm = (formEl: FormInstance | undefined) => {
//   if (!formEl) return;
//   formEl.validate(valid => {
//     if (valid) {
//       console.log("submit!");
//     } else {
//       console.log("error submit!");
//       return false;
//     }
//   });
// };
//
// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// const resetForm = (formEl: FormInstance | undefined) => {
//   if (!formEl) return;
//   formEl.resetFields();
// };

const menuList = ref([]);
const menuKey = "buttons";
const menuMap = localesConfigs.zh[menuKey];
menuList.value.length = 0;
for (const key in menuMap) {
  const _menuKey = `${menuKey}.${key}`;
  menuList.value.push({ key: _menuKey, label: transformI18n(_menuKey) });
}
</script>

<template>
  <el-form
    ref="formRef"
    v-loading="loading"
    :model="dynamicValidateForm"
    label-width="100px"
    class="demo-dynamic"
  >
    <el-form-item :gutter="24">
      <el-col :span="5"><p>编号</p></el-col>
      <el-col :span="5"><p>名称</p></el-col>
      <el-col :span="5"><p>图标</p></el-col>
      <el-col :span="5"><p>顺序</p></el-col>
      <el-col :span="4">
        <el-button
          :icon="useRenderIcon('fa-solid:plus')"
          @click.prevent="addDomain"
          circle
        />
      </el-col>
    </el-form-item>
    <el-form-item
      :gutter="24"
      v-for="(button, index) in dynamicValidateForm.buttons"
      :key="button.id"
      :label="'Button' + button.order"
      :prop="'buttons.' + index"
      :rules="{
        validator: validateButton,
        trigger: 'change'
      }"
    >
      <el-col :span="5"><el-input v-model="button.code" /></el-col>
      <el-col :span="5">
        <el-select
          v-model="button.meta.title"
          style="width: 100%"
          placeholder="请选择"
          clearable
          filterable
        >
          <el-option
            v-for="item in menuList"
            :key="item.key"
            :label="item.label"
            :value="item.key"
          />
        </el-select>
      </el-col>
      <el-col :span="5">
        <IconSelect v-model="button.meta.icon" style="width: 100%" />
      </el-col>
      <el-col :span="5">
        <el-input-number
          :min="0"
          :max="100"
          v-model="button.order"
          readonly
          disabled
          style="width: 100%"
        />
      </el-col>
      <el-col :span="4">
        <el-row>
          <el-button
            :span="8"
            :disabled="button.order == 0"
            @click.prevent="moveDomain(button, -1)"
            :icon="useRenderIcon('ep:arrow-up-bold')"
            circle
          />
          <el-button
            :span="8"
            :disabled="button.order == dynamicValidateForm.buttons.length - 1"
            @click.prevent="moveDomain(button, 1)"
            :icon="useRenderIcon('ep:arrow-down-bold')"
            circle
          />
          <el-button
            :span="8"
            @click.prevent="removeDomain(button)"
            :icon="useRenderIcon('fa-solid:minus')"
            circle
          />
        </el-row>
      </el-col>
    </el-form-item>
  </el-form>
</template>
