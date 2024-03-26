import ClientPage from '@/components/client-page';
import { MultiLevelBuilder } from '@/components/data-builder/multi-level-builder';
import { MultiLevelPieChart } from '@/components/multi-level-pie-chart';
import { MultiLevelPieChartData } from '@/lib/types/multi-level-pie-types';

export default function Home() {
  return (
    <main className="flex h-screen flex-row justify-items-stretch items-stretch p-24">
      <ClientPage />
    </main>
  );
}
