import { PropsWithChildren } from 'react';

export const EditorSection: React.FC<
  PropsWithChildren<{ title: string; subtitle?: string }>
> = (props) => {
  return (
    <div className=" flex-col  rounded-md border p-4">
      <div className="flex-1 space-y-1">
        <p className="text-sm font-medium leading-none">{props.title}</p>
        {props.subtitle && (
          <p className="text-sm text-muted-foreground">{props.subtitle}</p>
        )}
      </div>
      {props.children}
    </div>
  );
};
