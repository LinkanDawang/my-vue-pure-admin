// 虽然字段很少 但是抽离出来 后续有扩展字段需求就很方便了

interface FormItemProps {
  id: number;
  /** 角色名称 */
  name: string;
  /** 角色编号 */
  code: string;
  /** 备注 */
  remark: string;
  is_super_role: boolean;
}
interface FormProps {
  formInline: FormItemProps;
}

interface PermDialogItemProps {
  id: number;
  /** 菜单权限 */
  permissions: Array<number>;
}

interface PermDialogProps {
  formInline: PermDialogItemProps;
}

interface MemberDialogItemProps {
  id: number;
  member: Array<number>;
}

interface MemberDialogProps {
  formInline: MemberDialogItemProps;
}

export type {
  FormItemProps,
  FormProps,
  PermDialogItemProps,
  PermDialogProps,
  MemberDialogProps,
  MemberDialogItemProps
};
