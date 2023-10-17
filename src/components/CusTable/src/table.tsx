import { defineComponent, ref } from "vue";
import { CusTableProps } from "../types";

const props: CusTableProps = {
  /** 开启行选中 */
  showSelection: {
    type: Boolean,
    default: true
  },
  /** 展示行号 */
  showIndex: {
    type: Boolean,
    default: false
  },
  /** 需要展示的列 */
  columns: {
    type: Array as PropType<TableColumnList>,
    default: () => []
  },
  headerFilter: {
    type: Boolean,
    default: false
  }
};

export default defineComponent({
  name: "CusTable",
  props,
  emits: ["showHeaderFilter"],
  setup(props, { emit, slots, attrs }) {
    const searchParams = ref({});
    console.log(attrs);

    function showHeaderFilter() {
      emit("showHeaderFilter");
    }

    /** 根据表头字段类型格式化筛选方式 */
    function formatColumnFilter(column) {
      return (
        <div>
          <el-col onClick={showHeaderFilter}>{column.label}</el-col>
          {column.meta?.filterType ? (
            <el-col v-show={props.headerFilter == true}>
              {column.meta.filterType == "date" ? (
                <el-date-picker
                  type="date"
                  placeholder="请选择日期"
                  v-model={searchParams.value[column.prop]}
                />
              ) : column.meta.filterType == "select" ? (
                <el-select
                  clearable
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择"
                  v-model={searchParams.value[column.prop]}
                >
                  {column.meta?.selectOptions?.map(option => (
                    <el-option
                      key={option.value}
                      label={option.label}
                      value={option.value}
                    />
                  ))}
                </el-select>
              ) : (
                <el-input v-model={searchParams.value[column.prop]} />
              )}
            </el-col>
          ) : null}
        </div>
      );
    }

    function tableDefault() {
      return (
        <>
          {props.showSelection ? (
            <el-table-column label="" type="selection" fixed={"left"} />
          ) : null}
          {props.showIndex ? (
            <el-table-column label="序号" type="index" />
          ) : null}
          {props.columns.map((column, index) => {
            if (column.hide) {
              return null;
            }
            const { label, prop, align, ...args } = column;
            return (
              <el-table-column
                key={index}
                label={label}
                prop={prop}
                align={align ?? "center"}
                {...args}
                v-slots={{
                  header: () => formatColumnFilter(column)
                }}
              ></el-table-column>
            );
          })}
        </>
      );
    }

    return () => (
      <>
        <el-table
          {...attrs}
          v-loading={attrs.loading}
          header-cell-style={{ background: "#f5f7fa", color: "#303133" }}
        >
          {{
            default: () => (slots.default ? slots.default() : tableDefault()),
            append: () => slots.append && slots.append(),
            empty: () => slots.empty && slots.empty()
          }}
        </el-table>
      </>
    );
  }
});
