import { PropsWithChildren } from 'react';

import { cn } from '@/lib/utils';

export const EditorSection: React.FC<
  PropsWithChildren<{ title: string; subtitle?: string; className?: string }>
> = (props) => {
  return (
    <section
      className={cn(
        'rounded-lg border border-border/70 bg-muted/30 p-3 shadow-sm',
        props.className
      )}
    >
      <header className="mb-3 space-y-1 border-b border-border/50 pb-2.5">
        <h3 className="text-sm font-semibold leading-none tracking-tight text-foreground">
          {props.title}
        </h3>
        {props.subtitle && (
          <p className="text-xs leading-relaxed text-muted-foreground">
            {props.subtitle}
          </p>
        )}
      </header>
      <div className="divide-y divide-border/40 [&>*]:py-3 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
        {props.children}
      </div>
    </section>
  );
};
