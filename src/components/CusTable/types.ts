import { PureTableProps } from "@pureadmin/table";

export interface CusTableProps extends PureTableProps {
  /** 是否展示多选列 */
  showSelection?: boolean;
  /** 是否展示行号 */
  showIndex?: boolean;
}
