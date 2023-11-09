import { ref } from "vue";

import { getRoleList, updateRole } from "@/api/system";
import { useUserStoreHook } from "@/store/modules/user";
import { onStatusChange, usePublicHooks } from "@/utils/common";
import { useTableBase } from "@/utils/tableHook";

export function useTable() {
  const switchLoadMap = ref({});
  const { switchStyle } = usePublicHooks();

  const columns: TableColumnList = [
    {
      label: "状态",
      prop: "status",
      cellRenderer: scope => (
        <el-switch
          size={scope.props.size === "small" ? "small" : "default"}
          loading={switchLoadMap.value[scope.index]?.loading}
          v-model={scope.row.status}
          disabled={
            scope.row.is_super_role ||
            !useUserStoreHook().hasPermission("sys:role:edit")
          }
          active-value={50}
          inactive-value={100}
          active-text="已启用"
          inactive-text="已停用"
          inline-prompt
          style={switchStyle.value}
          onChange={() =>
            onStatusChange(scope as any, updateRole, switchLoadMap)
          }
        />
      )
    },
    {
      label: "成员",
      prop: "member",
      slot: "member"
    },
    {
      label: "操作",
      fixed: "right",
      slot: "operation"
    }
  ];

  const { tableLoading, tableColumns, dataList, onSearch, onReFresh } =
    useTableBase(getRoleList, columns);

  return {
    tableLoading,
    tableColumns,
    dataList,
    onSearch,
    onReFresh
  };
}
