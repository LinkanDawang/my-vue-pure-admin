<script lang="ts" setup>
import { ref } from "vue";
import { MemberDialogProps } from "../utils/types";
import { getUserList, getRoleMember } from "@/api/system";
import { message } from "@/utils/message";

const props = withDefaults(defineProps<MemberDialogProps>(), {
  formInline: () => ({
    id: null,
    member: []
  })
});

const newFormInline = ref(props.formInline);

const ruleFormRef = ref();
function getRef() {
  return ruleFormRef.value;
}
defineExpose({ getRef });

// 获取角色已关联用户
getRoleMember(newFormInline.value.id)
  .then(res => {
    newFormInline.value.member = res.data.member;
  })
  .catch(error => {
    message(`${error.data.ret}: ${error.data.msg}\n角色成员获取失败`, {
      type: "error"
    });
  });

// 获取全部用户
const allUsers = ref([]);
const q = { deptId: "", phone: "", status: "", username: "" };
getUserList(q)
  .then(res => {
    allUsers.value = res.data.list;
  })
  .catch(error => {
    message(`${error.data.ret}: ${error.data.msg}\n用户数据获取失败`, {
      type: "error"
    });
  });

const dataProps = {
  key: "id",
  label: "nickname"
};

function randomAvatar() {
  const Avatars = [
    "https://avatars.githubusercontent.com/u/44761321",
    "https://avatars.githubusercontent.com/u/52823142"
  ];
  return Avatars[Math.round(Math.random())];
}
</script>

<template>
  <el-form ref="ruleFormRef" :model="newFormInline" label-width="82px">
    <div style="text-align: center">
      <el-transfer
        v-model="newFormInline.member"
        style="display: inline-block; text-align: left"
        :props="dataProps"
        filterable
        :titles="['未选', '已选']"
        :format="{
          noChecked: '${total}',
          hasChecked: '${checked}/${total}'
        }"
        :data="allUsers"
      >
        <template #default="{ option }">
          <el-image
            fit="cover"
            preview-teleported
            :src="option.avatar || randomAvatar()"
            :preview-src-list="Array.of(option.avatar || randomAvatar())"
            class="w-[24px] h-[24px] rounded-full align-middle"
          />
          {{ " " }}
          <span>{{ option.username }}</span>
        </template>
      </el-transfer>
    </div>
  </el-form>
</template>
