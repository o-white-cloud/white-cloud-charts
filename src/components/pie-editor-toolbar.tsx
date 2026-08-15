'use client';

import { Download, FileText, HelpCircle, Palette, Plus, Route, Save, Upload } from 'lucide-react';
import { useCallback, useContext, useRef, useState } from 'react';
import { TreeApi } from 'react-arborist';

import { BulkItemDialog } from '@/app/pie/bulk-item-dialog';
import { ApplySpineStrokesDialog } from '@/app/pie/apply-spine-strokes-dialog';
import { MultiLevelPieChartDataContext } from '@/components/contexts/MultiLevelPieChartDataContext';
import { PaletteBrowserDialog } from '@/components/palettes/palette-browser-dialog';
import { SaveFileNameDialog } from '@/components/save-file-name-dialog';
import { Button } from '@/components/ui/button';
import { applySpineStartRadiusStrokes } from '@/lib/apply-spine-strokes';
import { migrateChartData, serializeChartData } from '@/lib/chart-data-migration';
import {
  reconstructParentRelationships,
  stripParentReferences,
} from '@/lib/chart-data-clone';
import { downloadChartSvgAsFile } from '@/lib/svg-download';
import { MultiLevelPieChartData, PieChartItem } from '@/lib/types/multi-level-pie-types';
import { createTree } from '@/components/tree/tree-utils';

export interface PieEditorToolbarProps {
  onDataChange: (data: MultiLevelPieChartData) => void;
  treeRef: React.MutableRefObject<TreeApi<PieChartItem> | null>;
}

export function PieEditorToolbar({ onDataChange, treeRef }: PieEditorToolbarProps) {
  const data = useContext(MultiLevelPieChartDataContext);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  const onRootItemCreate = useCallback(() => {
    treeRef.current?.create({
      index: null,
      parentId: null,
      type: 'leaf',
    });
  }, [treeRef]);

  const onBulkItemsCreate = useCallback(
    (text: string) => {
      onDataChange(createTree(text));
    },
    [onDataChange]
  );

  const onApplySpineStrokes = useCallback(
    (strokeWidth: number) => {
      onDataChange({
        ...data,
        items: applySpineStartRadiusStrokes(data.items, strokeWidth),
        levels: data.levels,
      });
    },
    [data, onDataChange]
  );

  const saveJsonAsFile = useCallback(
    (fileName: string) => {
      const cleanData = serializeChartData({
        items: data.items.map((item) => stripParentReferences(item)),
        levels: data.levels,
        paletteId: data.paletteId,
      });

      const jsonData = JSON.stringify(cleanData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [data]
  );

  const onLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const loadedData = migrateChartData(
            JSON.parse(e.target?.result as string) as MultiLevelPieChartData
          );
          const itemsWithParents = reconstructParentRelationships(loadedData.items);
          onDataChange({
            items: itemsWithParents,
            levels: loadedData.levels,
            paletteId: loadedData.paletteId,
          });
        } catch (error) {
          console.error('Error loading file:', error);
          alert('Error loading file. Please make sure it is a valid chart data file.');
        }
      };
      reader.readAsText(file);
      event.target.value = '';
    },
    [onDataChange]
  );

  const downloadSvgAsFile = useCallback(
    (fileName: string) => downloadChartSvgAsFile(data, fileName),
    [data]
  );

  return (
    <div className="flex w-full shrink-0 flex-wrap items-center gap-2 border-b bg-white px-4 py-2">
      <Button onClick={onRootItemCreate} variant="outline" className="h-9">
        <Plus className="h-4 w-4" /> Add root item
      </Button>
      <BulkItemDialog
        onSubmit={onBulkItemsCreate}
        trigger={
          <Button variant="outline" className="h-9">
            <FileText className="h-4 w-4" /> From file
          </Button>
        }
      />
      <ApplySpineStrokesDialog
        onApply={onApplySpineStrokes}
        trigger={
          <Button
            variant="outline"
            className="h-9"
            title="Apply start radius strokes along first-child chains"
          >
            <Route className="h-4 w-4" /> Spine strokes
          </Button>
        }
      />
      <PaletteBrowserDialog
        chartData={data}
        onChartChange={onDataChange}
        trigger={
          <Button variant="outline" className="h-9" title="Browse and apply color palettes">
            <Palette className="h-4 w-4" /> Palettes
          </Button>
        }
      />
      <Button
        onClick={() => setSaveDialogOpen(true)}
        variant="outline"
        className="h-9"
        title="Save chart data"
      >
        <Save className="h-4 w-4" />
      </Button>
      <SaveFileNameDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        title="Save chart data"
        defaultBaseName="pie-chart-data"
        extension=".json"
        onConfirm={saveJsonAsFile}
      />
      <Button onClick={onLoad} variant="outline" className="h-9" title="Load chart data">
        <Upload className="h-4 w-4" />
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".json"
        className="hidden"
      />

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          className="h-9"
          title="Open user manual in a new tab"
          onClick={() => window.open('/user-manual.html', '_blank', 'noopener,noreferrer')}
        >
          <HelpCircle className="h-4 w-4" /> Help
        </Button>
        <Button
          variant="outline"
          className="h-9"
          onClick={() => setDownloadDialogOpen(true)}
        >
          <Download className="h-4 w-4" /> Download
        </Button>
        <SaveFileNameDialog
          open={downloadDialogOpen}
          onOpenChange={setDownloadDialogOpen}
          title="Download chart as SVG"
          defaultBaseName="chart"
          extension=".svg"
          onConfirm={downloadSvgAsFile}
        />
      </div>
    </div>
  );
}
