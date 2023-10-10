<script lang="ts" setup>
import { ref } from "vue";
import { MemberDialogProps } from "./utils/types";

const props = withDefaults(defineProps<MemberDialogProps>(), {
  formInline: () => ({
    member: [],
    all: []
  })
});

const newFormInline = ref(props.formInline);

const ruleFormRef = ref();
function getRef() {
  return ruleFormRef.value;
}
defineExpose({ getRef });

const dataProps = {
  key: "id",
  label: "nickname"
};
</script>

<template>
  <el-form ref="ruleFormRef" :model="newFormInline" label-width="82px">
    <div style="text-align: center">
      <el-transfer
        v-model="newFormInline.member"
        style="text-align: left; display: inline-block"
        :props="dataProps"
        filterable
        :titles="['未选', '已选']"
        :format="{
          noChecked: '${total}',
          hasChecked: '${checked}/${total}'
        }"
        :data="newFormInline.all"
      >
        <template #default="{ option }">
          <el-image
            fit="cover"
            preview-teleported
            :src="option.avatar"
            :preview-src-list="Array.of(option.avatar)"
            class="w-[24px] h-[24px] rounded-full align-middle"
          />
          {{ " " }}
          <span>{{ option.nickname }}</span>
        </template>
      </el-transfer>
    </div>
  </el-form>
</template>
