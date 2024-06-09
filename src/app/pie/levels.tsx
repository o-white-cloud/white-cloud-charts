import clsx from 'clsx';
import Link from 'next/link';

import { buttonVariants } from '@/components/ui/button';
import { SelectContent, SelectGroup, SelectItem } from '@/components/ui/select';
import {
    LabelDisplay, MultiLevelPieChartData, PieChartItem, PieChartLevel
} from '@/lib/types/multi-level-pie-types';
import { cn } from '@/lib/utils';

export interface LevelsProps {
  data: MultiLevelPieChartData;
  onSelectionChange: (item: PieChartLevel | null) => void;
  selectedLevel: PieChartLevel | null;
}

export const Levels: React.FC<LevelsProps> = (props) => {
  return (
    <nav className="flex">
      {props.data.levels.map((level) => (
        <Link
          key={level.id}
          href={''}
          id={level.id}
          onClick={(e) => {
            const newSelected = props.data.levels.find(
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
