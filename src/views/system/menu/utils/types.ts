interface FormItemProps {
  higherMenuOptions: Record<string, unknown>[];
  id: number;
  parentId: number;
  name: string;
  component: string;
  code: string;
  path: string;
  redirect: string;
  order: number;
  status: number;
  meta: any;
  type: number;
}

interface FormProps {
  formInline: FormItemProps;
}

interface ButtonItemProps {
  parentId: number;
  buttons: {
    id: number;
    type: number;
    order: number;
    code: string;
    parentId: number;
    meta: { rank: number; title: string; icon: string };
  }[];
}
interface ButtonProps {
  formInline: ButtonItemProps;
}

export type { FormItemProps, FormProps, ButtonItemProps, ButtonProps };
