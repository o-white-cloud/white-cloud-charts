import { pieLevels } from '@/lib/pie-data';
import { MultiLevelPieChartData } from '@/lib/types/multi-level-pie-types';

describe('multi-level data', () => {
  it('aggregates correctly', () => {
    const data: MultiLevelPieChartData = {
      levels: [
        {
          innerRadius: 200,
        },
        {
          innerRadius: 500,
        },
      ],
      items: [
        {
          label: 'sector 1',
          level: 0,
          parent: null,
          value: 1,
          children: [
            {
              label: 'sector 1.1',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
            {
              label: 'sector 1.2',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
            {
              label: 'sector 1.3',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
          ],
        },
        {
          label: 'sector 2',
          level: 0,
          parent: null,
          value: 1,
          children: [
            {
              label: 'sector 2.1',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
            {
              label: 'sector 2.2',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
            {
              label: 'sector 2.3',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
            {
              label: 'sector 2.4',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
            {
              label: 'sector 2.5',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
            {
              label: 'sector 2.6',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
          ],
        },
        {
          label: 'sector 3',
          level: 0,
          parent: null,
          value: 1,
          children: [
            {
              label: 'sector 3.1',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
            {
              label: 'sector 3.2',
              level: 1,
              parent: null,
              value: 1,
              children: [],
            },
          ],
        },
      ],
    };

    var flattenedLevels = pieLevels(data);
    expect(flattenedLevels).toEqual([
      {
        level: {
          radius: 200,
        },
        items: [
          { label: 'sector 1', level: 0, value: 1 },
          { label: 'sector 2', level: 0, value: 1 },
          { label: 'sector 3', level: 0, value: 1 },
        ],
      },
      {
        level: {
          radius: 500,
        },
        items: [
          { label: 'sector 1.1', level: 1, value: 1 },
          { label: 'sector 1.2', level: 1, value: 1 },
          { label: 'sector 1.3', level: 1, value: 1 },
          { label: 'sector 2.1', level: 1, value: 1 },
          { label: 'sector 2.2', level: 1, value: 1 },
          { label: 'sector 2.3', level: 1, value: 1 },
          { label: 'sector 2.4', level: 1, value: 1 },
          { label: 'sector 2.5', level: 1, value: 1 },
          { label: 'sector 2.6', level: 1, value: 1 },
          { label: 'sector 3.1', level: 1, value: 1 },
          { label: 'sector 3.2', level: 1, value: 1 },
        ],
      },
    ]);
  });
});
