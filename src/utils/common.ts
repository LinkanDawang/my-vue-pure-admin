import { ElMessageBox } from "element-plus";
import { message } from "@/utils/message";
import { computed } from "vue";
import { useDark } from "@pureadmin/utils";

type statusType = {
  valid: number;
  invalid: number;
};

const defaultStatusMap = {
  valid: 50,
  invalid: 100
};

export function usePublicHooks(giveStatus: statusType = defaultStatusMap) {
  const { isDark } = useDark();

  const switchStyle = computed(() => {
    return {
      "--el-switch-on-color": "#6abe39",
      "--el-switch-off-color": "#e84749"
    };
  });

  const tagStyle = computed(() => {
    return (status: number) => {
      return status === giveStatus.valid
        ? {
            "--el-tag-text-color": isDark.value ? "#6abe39" : "#389e0d",
            "--el-tag-bg-color": isDark.value ? "#172412" : "#f6ffed",
            "--el-tag-border-color": isDark.value ? "#274a17" : "#b7eb8f"
          }
        : {
            "--el-tag-text-color": isDark.value ? "#e84749" : "#cf1322",
            "--el-tag-bg-color": isDark.value ? "#2b1316" : "#fff1f0",
            "--el-tag-border-color": isDark.value ? "#58191c" : "#ffa39e"
          };
    };
  });

  return {
    /** 当前网页是否为`dark`模式 */
    isDark,
    /** 表现更鲜明的`el-switch`组件  */
    switchStyle,
    /** 表现更鲜明的`el-tag`组件  */
    tagStyle
  };
}

export function onStatusChange(
  scope,
  updateStatusApi,
  switchLoadMap,
  statusMap: statusType = defaultStatusMap
) {
  ElMessageBox.confirm(
    `确认要<strong>${
      scope.row.status === statusMap.invalid ? "停用" : "启用"
    }</strong><strong style='color:var(--el-color-primary)'>${
      scope.row.name
    }</strong>吗?`,
    "系统提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
      dangerouslyUseHTMLString: true,
      draggable: true
    }
  )
    .then(() => {
      switchLoadMap.value[scope.index] = Object.assign(
        {},
        switchLoadMap.value[scope.index],
        {
          loading: true
        }
      );
      updateStatusApi(scope.row.id, { status: scope.row.status })
        .then(res => {
          if (res.ret == 200 || res.ret == 201) {
            switchLoadMap.value[scope.index] = Object.assign(
              {},
              switchLoadMap.value[scope.index],
              {
                loading: false
              }
            );
            message(
              `已${scope.row.status === statusMap.invalid ? "停用" : "启用"}${
                scope.row.name
              }`,
              {
                type: "success"
              }
            );
          } else {
            message(JSON.stringify(res.data), { type: "error" });
          }
        })
        .catch(error => {
          switchLoadMap.value[scope.index] = Object.assign(
            {},
            switchLoadMap.value[scope.index],
            {
              loading: false
            }
          );
          message(error.data.msg, { type: "error" });
        });
      return;
    })
    .catch(() => {
      scope.row.status === statusMap.invalid
        ? (scope.row.status = statusMap.valid)
        : (scope.row.status = statusMap.invalid);
    });
}
