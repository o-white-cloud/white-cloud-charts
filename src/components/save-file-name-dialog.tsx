'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useEffect, useState } from 'react';

function sanitizeBaseName(raw: string): string {
  return raw
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '')
    .replace(/^\.+/, '')
    .trim()
    .slice(0, 200);
}

export interface SaveFileNameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  /** Filename without extension, e.g. "pie-chart-data" */
  defaultBaseName: string;
  /** Including dot, e.g. ".json" or ".svg" */
  extension: string;
  onConfirm: (fileName: string) => void;
}

export function SaveFileNameDialog({
  open,
  onOpenChange,
  title,
  defaultBaseName,
  extension,
  onConfirm,
}: SaveFileNameDialogProps) {
  const [baseName, setBaseName] = useState(defaultBaseName);

  const ext = extension.startsWith('.') ? extension : `.${extension}`;

  useEffect(() => {
    if (open) {
      setBaseName(defaultBaseName);
    }
  }, [open, defaultBaseName]);

  const handleConfirm = () => {
    const fallback = sanitizeBaseName(defaultBaseName) || 'export';
    const base = sanitizeBaseName(baseName) || fallback;
    onConfirm(`${base}${ext}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-1">
          <Label htmlFor="save-file-name">File name</Label>
          <div className="flex items-center gap-1">
            <Input
              id="save-file-name"
              value={baseName}
              autoFocus
              onChange={(e) => setBaseName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleConfirm();
                }
              }}
              autoComplete="off"
            />
            <span className="shrink-0 text-sm text-muted-foreground">{ext}</span>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleConfirm}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
