'use client';
import { useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';

import Canvas from '@/components/Canvas';
import Navbar from '@/components/Navbar';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MultiLevelPieChartData, PieChartItem } from '@/lib/types/multi-level-pie-types';
import { TabsContent } from '@radix-ui/react-tabs';

import { MultiLevelPieChart } from './multi-level-pie-chart';
import { PieTree } from './tree';
import TreeItemEditor from './tree-item-editor';

export default function Page() {
  const [data, setData] = useState<MultiLevelPieChartData>({
    items: [],
    levels: [],
  });

  const [selectedItem, setSelectedItem] = useState<PieChartItem | null>(null);

  return (
    <main className="h-screen overflow-hidden">
      <Navbar />
      <section className="flex h-full flex-row">
        <PanelGroup direction="horizontal">
          <Panel defaultSize={25} className="p-2">
            <Tabs defaultValue="items" className="h-full flex flex-col">
              <TabsList>
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="levels">Levels</TabsTrigger>
              </TabsList>
              <TabsContent value="items" className="flex-1">
                <PieTree
                  data={data}
                  onDataChange={setData}
                  onSelectionChange={setSelectedItem}
                />
              </TabsContent>
            </Tabs>
          </Panel>
          <PanelResizeHandle />
          <Panel>
            <Canvas>
              <MultiLevelPieChart data={data} />
            </Canvas>
          </Panel>
          <PanelResizeHandle />
          <Panel defaultSize={25}>
            <TreeItemEditor item={selectedItem} />
          </Panel>
        </PanelGroup>
      </section>
    </main>
  );
}
