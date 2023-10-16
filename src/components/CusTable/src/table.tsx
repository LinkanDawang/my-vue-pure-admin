import { defineComponent, ref } from "vue";
import { CusTableProps } from "../types";

const props: CusTableProps = {
  size: {
    type: String,
    default: "default"
  },
  showSelection: {
    type: Boolean,
    default: true
  },
  showIndex: {
    type: Boolean,
    default: false
  },
  /** 需要展示的列 */
  columns: {
    type: Array as PropType<TableColumnList>,
    default: () => []
  },
  data: {
    type: Array,
    default: () => []
  }
};

export default defineComponent({
  name: "CusTable",
  props,
  emits: [],
  setup(props, { emit, slots, attrs }) {
    console.log(emit);
    console.log(slots);
    console.log(attrs);
    const headerFilter = ref(false);
    const params = ref({});

    return () => (
      <>
        <el-table
          v-model={props.data}
          // size={props.size}
          v-loading={props.loading}
          // style={props.style ?? { width: "100%" }}
        >
          <el-table-column
            label=""
            type="selection"
            v-if={props.showSelection}
          ></el-table-column>
          <el-table-column
            label="序号"
            type="index"
            v-if={props.showIndex}
          ></el-table-column>
          {props.columns.map((column, index) => (
            <el-table-column
              key={index}
              label={column.label}
              prop={column.prop}
              align={column.align ?? "default"}
            >
              <el-col onClick={(headerFilter.value = !headerFilter.value)}>
                {column.label}
              </el-col>
              <el-col
                v-if={column.meta?.filterType ?? false}
                v-show={headerFilter.value}
              >
                <el-date-picker
                  v-if={column.meta.filterType == "date"}
                  v-model={params.value[column.prop]}
                  type="date"
                  placeholder="Pick a day"
                />
                <el-select
                  v-else-if={column.meta.filterType == "select"}
                  v-model={params.value[column.prop]}
                  clearable
                  multiple
                  collapse-tags
                  collapse-tags-tooltip
                  placeholder="请选择"
                >
                  {column.meta?.selectOptions?.map(option => {
                    return (
                      <el-option
                        key={option.value}
                        label={option.label}
                        value={option.value}
                      />
                    );
                  })}
                </el-select>
                <el-input v-else v-model={params.value[column.prop]} />
              </el-col>
            </el-table-column>
          ))}
        </el-table>
      </>
    );
  }
});
