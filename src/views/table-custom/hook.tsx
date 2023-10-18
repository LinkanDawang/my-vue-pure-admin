export function useTable() {
  const columns = [
    {
      label: "日期",
      prop: "date",
      meta: { filterType: "date" }
    },
    {
      label: "姓名",
      prop: "name",
      meta: { filterType: "input" }
    },
    {
      label: "性别",
      prop: "sex",
      meta: {
        filterType: "select",
        selectOptions: [
          { value: 1, label: "男" },
          { value: 2, label: "女" }
        ]
      },
      cellRenderer: ({ row, props }) => (
        <el-tag
          size={props.size}
          type={row.sex === 1 ? "danger" : ""}
          effect="plain"
        >
          {row.sex === 1 ? "女" : "男"}
        </el-tag>
      )
    },
    {
      label: "地址",
      prop: "address",
      meta: { filterType: "input" }
    }
  ];

  return { columns };
}
