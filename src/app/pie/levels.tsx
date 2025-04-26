import clsx from 'clsx';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import {
    LabelDisplayType, MultiLevelPieChartData, PieChartItem, PieChartLevel
} from '@/lib/types/multi-level-pie-types';
import { cn } from '@/lib/utils';
import { useContext } from 'react';
import { MultiLevelPieChartDataContext } from '@/components/contexts/MultiLevelPieChartDataContext';

export interface LevelsProps {
  onSelectionChange: (item: PieChartLevel | null) => void;
  selectedLevel: PieChartLevel | null;
}

export const Levels: React.FC<LevelsProps> = (props) => {
  const data = useContext(MultiLevelPieChartDataContext);
  return (
    <nav className="flex">
      {data.levels.map((level) => (
        <Link
          key={level.id}
          href={''}
          id={level.id}
          onClick={(e) => {
            const newSelected = data.levels.find(
              (l) => l.id === e.currentTarget.id
            );
            if (newSelected) {
              props.onSelectionChange(newSelected);
            }
          }}
          className={clsx(
            buttonVariants({ variant: 'ghost' }),
            level.id === props.selectedLevel?.id
              ? 'bg-muted hover:bg-muted'
              : 'hover:bg-transparent hover:underline',
            'justify-start'
          )}
        >
          {`Level ${level.id}`}
        </Link>
      ))}
    </nav>
  );
};
