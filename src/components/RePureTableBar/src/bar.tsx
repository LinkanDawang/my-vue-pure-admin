import { useEpThemeStoreHook } from "@/store/modules/epTheme";
import { computed, defineComponent, nextTick, type PropType, ref } from "vue";
import {
  delay,
  cloneDeep,
  isBoolean,
  isFunction,
  getKeyList
} from "@pureadmin/utils";

import Sortable from "sortablejs";
import DragIcon from "./svg/drag.svg?component";
import ExpandIcon from "./svg/expand.svg?component";
import RefreshIcon from "./svg/refresh.svg?component";
import SettingIcon from "./svg/settings.svg?component";
import CollapseIcon from "./svg/collapse.svg?component";
import SearchIcon from "./svg/search.svg?component";
import { IconifyIconOnline } from "@/components/ReIcon";

const props = {
  /** 头部最左边的标题 */
  title: {
    type: String,
    default: "列表"
  },
  /** 对于树形表格，如果想启用展开和折叠功能，传入当前表格的ref即可 */
  tableRef: {
    type: Object as PropType<any>
  },
  /** 需要展示的列 */
  columns: {
    type: Array as PropType<TableColumnList>,
    default: () => []
  },
  /** 启用表头搜索 */
  useColumnFilter: {
    type: Boolean,
    default: false
  },
  columnsApi: {
    type: Function,
    default: undefined
  }
};

async function fixApiColumns(columnsApi, normalColumns) {
  // TODO columns字段转换
  const columnsExtraInfo = {};
  const extraColumns = [];
  normalColumns.forEach(item => {
    if (item.slot && !item.prop) {
      extraColumns.push(item);
      return;
    }
    if (!item.prop) return;
    columnsExtraInfo[item.prop] = item;
  });
  const { data } = await columnsApi();
  let rawColumns = data.map(column => {
    const _meta = {};
    if (["number", "text"].includes(column.type)) {
      _meta["filterType"] = "input";
    } else if (column.type === "select") {
      _meta["filterType"] = "selectMultiple";
      _meta["selectOptions"] = column.choices;
    } else if (column.type === "datetime") {
      _meta["filterType"] = "dateTimeRange";
    } else if (column.type === "date") {
      _meta["filterType"] = "dateRange";
    }
    const extraInfo = columnsExtraInfo[column.key] ?? {};
    return {
      ...extraInfo,
      label: column.ui.label,
      prop: column.key,
      meta: _meta
    };
  });
  rawColumns = rawColumns.concat(extraColumns);
  return rawColumns;
}

function SetUp(props, { emit, slots, attrs }) {
  const tableBorders = [
    { value: 0, label: "隐藏" },
    { value: 1, label: "展示" }
  ];
  const tableAligns = [
    { value: "left", label: "左对齐" },
    { value: "center", label: "居中" },
    { value: "right", label: "右对齐" }
  ];
  const tableLayouts = [
    { value: "fixed", label: "固定" },
    { value: "auto", label: "自动" }
  ];
  const showTableBorder = ref(0);
  const headerAlign = ref("center");
  const tableLayout = ref("fixed");
  const tableStripe = ref(0);
  const buttonRef = ref();
  const tableConfRef = ref();
  const size = ref("default");
  const isExpandAll = ref(true);
  const loading = ref(false);
  const checkAll = ref(true);
  const isIndeterminate = ref(false);
  const filterColumns = cloneDeep(props?.columns).filter(column =>
    isBoolean(column?.hide)
      ? !column.hide
      : !(isFunction(column?.hide) && column?.hide())
  );
  let checkColumnList = getKeyList(cloneDeep(props?.columns), "label");
  const checkedColumns = ref(getKeyList(cloneDeep(filterColumns), "label"));
  const dynamicColumns = ref(cloneDeep(props?.columns));

  const getDropdownItemStyle = computed(() => {
    return s => {
      return {
        background: s === size.value ? useEpThemeStoreHook().epThemeColor : "",
        color: s === size.value ? "#fff" : "var(--el-text-color-primary)"
      };
    };
  });

  const iconClass = computed(() => {
    return [
      "text-black",
      "dark:text-white",
      "duration-100",
      "hover:!text-primary",
      "cursor-pointer",
      "outline-none"
    ];
  });

  const topClass = computed(() => {
    return [
      "flex",
      "justify-between",
      "pt-[3px]",
      "px-[11px]",
      "border-b-[1px]",
      "border-solid",
      "border-[#dcdfe6]",
      "dark:border-[#303030]"
    ];
  });

  function onReFresh() {
    loading.value = true;
    emit("refresh");
    delay(500).then(() => (loading.value = false));
  }

  function onDisplayFilter() {
    emit("displayHeaderFilter");
  }

  function onExpand() {
    isExpandAll.value = !isExpandAll.value;
    toggleRowExpansionAll(props.tableRef.data, isExpandAll.value);
  }

  function toggleRowExpansionAll(data, isExpansion) {
    data.forEach(item => {
      props.tableRef.toggleRowExpansion(item, isExpansion);
      if (item.children !== undefined && item.children !== null) {
        toggleRowExpansionAll(item.children, isExpansion);
      }
    });
  }

  function handleCheckAllChange(val: boolean) {
    checkedColumns.value = val ? checkColumnList : [];
    isIndeterminate.value = false;
    dynamicColumns.value.map(column =>
      val ? (column.hide = false) : (column.hide = true)
    );
  }

  function handleCheckedColumnsChange(value: string[]) {
    const checkedCount = value.length;
    checkAll.value = checkedCount === checkColumnList.length;
    isIndeterminate.value =
      checkedCount > 0 && checkedCount < checkColumnList.length;
  }

  function handleCheckColumnListChange(val: boolean, label: string) {
    dynamicColumns.value.filter(item => item.label === label)[0].hide = !val;
  }

  async function onReset() {
    checkAll.value = true;
    isIndeterminate.value = false;
    dynamicColumns.value = cloneDeep(props?.columns);
    checkColumnList = [];
    checkColumnList = await getKeyList(cloneDeep(props?.columns), "label");
    checkedColumns.value = getKeyList(cloneDeep(filterColumns), "label");
  }

  const dropdown = {
    dropdown: () => (
      <el-dropdown-menu class="translation">
        <el-dropdown-item
          style={getDropdownItemStyle.value("large")}
          onClick={() => (size.value = "large")}
        >
          宽松
        </el-dropdown-item>
        <el-dropdown-item
          style={getDropdownItemStyle.value("default")}
          onClick={() => (size.value = "default")}
        >
          默认
        </el-dropdown-item>
        <el-dropdown-item
          style={getDropdownItemStyle.value("small")}
          onClick={() => (size.value = "small")}
        >
          紧凑
        </el-dropdown-item>
      </el-dropdown-menu>
    )
  };

  /** 列展示拖拽排序 */
  const rowDrop = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    nextTick(() => {
      const wrapper: HTMLElement = document.querySelector(
        ".el-checkbox-group>div"
      );
      Sortable.create(wrapper, {
        animation: 300,
        handle: ".drag-btn",
        onEnd: ({ newIndex, oldIndex, item }) => {
          const targetThElem = item;
          const wrapperElem = targetThElem.parentNode as HTMLElement;
          const oldColumn = dynamicColumns.value[oldIndex];
          const newColumn = dynamicColumns.value[newIndex];
          if (oldColumn?.fixed || newColumn?.fixed) {
            // 当前列存在fixed属性 则不可拖拽
            const oldThElem = wrapperElem.children[oldIndex] as HTMLElement;
            if (newIndex > oldIndex) {
              wrapperElem.insertBefore(targetThElem, oldThElem);
            } else {
              wrapperElem.insertBefore(
                targetThElem,
                oldThElem ? oldThElem.nextElementSibling : oldThElem
              );
            }
            return;
          }
          const currentRow = dynamicColumns.value.splice(oldIndex, 1)[0];
          dynamicColumns.value.splice(newIndex, 0, currentRow);
        }
      });
    });
  };

  const isFixedColumn = (label: string) => {
    return dynamicColumns.value.filter(item => item.label === label)[0].fixed
      ? true
      : false;
  };

  const reference = {
    reference: () => (
      <SettingIcon
        class={["w-[16px]", iconClass.value]}
        onMouseover={e => (buttonRef.value = e.currentTarget)}
      />
    )
  };

  return () => (
    <>
      <div {...attrs} class="w-[99/100] mt-2 px-2 pb-2 bg-bg_color">
        <div class="flex justify-between w-full h-[60px] p-4">
          {slots?.title ? (
            slots.title()
          ) : (
            <p class="font-bold truncate">{props.title}</p>
          )}
          <div class="flex items-center justify-around">
            {slots?.buttons ? (
              <div class="flex mr-4">{slots.buttons()}</div>
            ) : null}
            {props.tableRef?.size ? (
              <>
                <el-tooltip
                  effect="dark"
                  content={isExpandAll.value ? "折叠" : "展开"}
                  placement="top"
                >
                  <ExpandIcon
                    class={["w-[16px]", iconClass.value]}
                    style={{
                      transform: isExpandAll.value ? "none" : "rotate(-90deg)"
                    }}
                    onClick={() => onExpand()}
                  />
                </el-tooltip>
                <el-divider direction="vertical" />
              </>
            ) : null}
            {props.useColumnFilter ? (
              <>
                <el-tooltip effect="dark" content="搜索" placement="top">
                  <SearchIcon
                    class={["w-[16px]", iconClass.value]}
                    onClick={() => onDisplayFilter()}
                  />
                </el-tooltip>
                <el-divider direction="vertical" />
              </>
            ) : null}
            <el-tooltip effect="dark" content="刷新" placement="top">
              <RefreshIcon
                class={[
                  "w-[16px]",
                  iconClass.value,
                  loading.value ? "animate-spin" : ""
                ]}
                onClick={() => onReFresh()}
              />
            </el-tooltip>
            <el-divider direction="vertical" />
            <el-tooltip effect="dark" content="密度" placement="top">
              <el-dropdown v-slots={dropdown} trigger="click">
                <CollapseIcon class={["w-[16px]", iconClass.value]} />
              </el-dropdown>
            </el-tooltip>
            <el-divider direction="vertical" />

            <el-popover
              v-slots={reference}
              placement="bottom-start"
              popper-style={{ padding: 0 }}
              width="160"
              trigger="click"
            >
              <div class={[topClass.value]}>
                <el-checkbox
                  class="!-mr-1"
                  label="列展示"
                  v-model={checkAll.value}
                  indeterminate={isIndeterminate.value}
                  onChange={value => handleCheckAllChange(value)}
                />
                <el-button type="primary" link onClick={() => onReset()}>
                  重置
                </el-button>
              </div>

              <div class="pt-[6px] pl-[11px]">
                <el-checkbox-group
                  v-model={checkedColumns.value}
                  onChange={value => handleCheckedColumnsChange(value)}
                >
                  <el-space
                    direction="vertical"
                    alignment="flex-start"
                    size={0}
                  >
                    {checkColumnList.map(item => {
                      return (
                        <div class="flex items-center">
                          <DragIcon
                            class={[
                              "drag-btn w-[16px] mr-2",
                              isFixedColumn(item)
                                ? "!cursor-no-drop"
                                : "!cursor-grab"
                            ]}
                            onMouseenter={(event: {
                              preventDefault: () => void;
                            }) => rowDrop(event)}
                          />
                          <el-checkbox
                            key={item}
                            label={item}
                            onChange={value =>
                              handleCheckColumnListChange(value, item)
                            }
                          >
                            <span
                              title={item}
                              class="inline-block w-[120px] truncate hover:text-text_color_primary"
                            >
                              {item}
                            </span>
                          </el-checkbox>
                        </div>
                      );
                    })}
                  </el-space>
                </el-checkbox-group>
              </div>
            </el-popover>

            <el-divider direction="vertical" />
            <el-popover
              width="240"
              v-slots={{
                reference: () => (
                  <IconifyIconOnline
                    class={["w-[16px]", iconClass.value]}
                    icon="ep:menu"
                    onMouseover={e => (tableConfRef.value = e.currentTarget)}
                  />
                )
              }}
              trigger="click"
            >
              <el-row>
                <el-col
                  span={6}
                  style={
                    "display: flex; justify-content: center; align-items: center;"
                  }
                >
                  边框
                </el-col>
                <el-col
                  span={3}
                  style={
                    "display: flex; justify-content: center; align-items: center;"
                  }
                >
                  <el-divider align={"center"} direction="vertical" />
                </el-col>
                <el-col span={15}>
                  <el-select v-model={showTableBorder.value}>
                    {tableBorders.map(item => (
                      <el-option value={item.value} label={item.label} />
                    ))}
                  </el-select>
                </el-col>
              </el-row>
              <el-row>
                <el-col
                  span={6}
                  style={
                    "display: flex; justify-content: center; align-items: center;"
                  }
                >
                  对齐
                </el-col>
                <el-col
                  span={3}
                  style={
                    "display: flex; justify-content: center; align-items: center;"
                  }
                >
                  <el-divider direction="vertical" />
                </el-col>
                <el-col span={15}>
                  <el-select v-model={headerAlign.value}>
                    {tableAligns.map(item => (
                      <el-option value={item.value} label={item.label} />
                    ))}
                  </el-select>
                </el-col>
              </el-row>
              <el-row>
                <el-col
                  span={6}
                  style={
                    "display: flex; justify-content: center; align-items: center;"
                  }
                >
                  排列
                </el-col>
                <el-col
                  span={3}
                  style={
                    "display: flex; justify-content: center; align-items: center;"
                  }
                >
                  <el-divider direction="vertical" />
                </el-col>
                <el-col span={15}>
                  <el-select v-model={tableLayout.value}>
                    {tableLayouts.map(item => (
                      <el-option value={item.value} label={item.label} />
                    ))}
                  </el-select>
                </el-col>
              </el-row>
              <el-row>
                <el-col
                  span={6}
                  style={
                    "display: flex; justify-content: center; align-items: center;"
                  }
                >
                  <p>斑马纹</p>
                </el-col>
                <el-col
                  span={3}
                  style={
                    "display: flex; justify-content: center; align-items: center;"
                  }
                >
                  <el-divider direction="vertical" />
                </el-col>
                <el-col span={15}>
                  <el-select v-model={tableStripe.value}>
                    {tableBorders.map(item => (
                      <el-option value={item.value} label={item.label} />
                    ))}
                  </el-select>
                </el-col>
              </el-row>
            </el-popover>
          </div>

          <el-tooltip
            popper-options={{
              modifiers: [
                {
                  name: "computeStyles",
                  options: {
                    adaptive: false,
                    enabled: false
                  }
                }
              ]
            }}
            placement="top"
            virtual-ref={buttonRef.value}
            virtual-triggering
            trigger="hover"
            content="列设置"
          />
        </div>
        <el-tooltip
          popper-options={{
            modifiers: [
              {
                name: "computeStyles",
                options: {
                  adaptive: false,
                  enabled: false
                }
              }
            ]
          }}
          placement="top"
          virtual-ref={tableConfRef.value}
          virtual-triggering
          trigger="hover"
          content="表设置"
        />
        {slots.default({
          size: size.value,
          dynamicColumns: dynamicColumns.value,
          tableConf: {
            // todo 完善表设置
            stripe: Boolean(tableStripe.value),
            border: Boolean(showTableBorder.value),
            alignWhole: headerAlign.value,
            tableLayout: tableLayout.value
          }
        })}
      </div>
    </>
  );
}

export default defineComponent({
  name: "PureTableBar",
  props,
  emits: ["refresh", "displayHeaderFilter"],
  setup(props, { emit, slots, attrs }) {
    if (props?.columnsApi !== undefined) {
      const fixedProps = cloneDeep(props);
      return new Promise(resolve => {
        fixApiColumns(props.columnsApi, props.columns).then(fixedColumns => {
          fixedProps.columns = fixedColumns;
          resolve(SetUp(fixedProps, { emit, slots, attrs }));
        });
      });
    } else {
      return SetUp(props, { emit, slots, attrs });
    }
  }
});
