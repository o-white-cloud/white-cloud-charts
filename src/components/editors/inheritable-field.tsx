import { Link2, Link2Off } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormLabel } from "@/components/ui/form";
import { cn } from "@/lib/utils";

export interface InheritableFieldProps {
  label: string;
  inheritedDisplayValue: string;
  isOverridden: boolean;
  onEnableOverride: () => void;
  onClearOverride: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function InheritableField({
  label,
  inheritedDisplayValue,
  isOverridden,
  onEnableOverride,
  onClearOverride,
  className,
  children,
}: InheritableFieldProps) {
  return (
    <div className={cn("min-w-0 flex-1 space-y-1", className)}>
      <FormLabel className="text-sm">{label}</FormLabel>
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">
          {isOverridden ? (
            children
          ) : (
            <Input
              readOnly
              compact
              value={inheritedDisplayValue}
              className="cursor-default text-muted-foreground"
              tabIndex={-1}
            />
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-8 w-8 shrink-0"
          title={isOverridden ? "Use inherited value" : "Override"}
          aria-label={isOverridden ? "Use inherited value" : "Override"}
          onClick={isOverridden ? onClearOverride : onEnableOverride}
        >
          {isOverridden ? (
            <Link2 className="h-4 w-4" />
          ) : (
            <Link2Off className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
}
