'use client'
import { useState } from 'react';

import { MultiLevelPieChartData } from '@/lib/types/multi-level-pie-types';

import { MultiLevelBuilder } from './data-builder/multi-level-builder';
import { MultiLevelPieChart } from './multi-level-pie-chart';

export default function ClientPage() {
    const [data, setData] = useState<MultiLevelPieChartData>({
        items: [{
            id: 'tree',
            children: [],
            name: 'Multi-level donut chart',
            absoluteValue: 1,
            innerValue: 1,
            level: -1
        }],
        levels: []
    });

    return (<div className='flex flex-row flex-1'>
        <MultiLevelBuilder data={data} onDataChange={setData}/>
        <MultiLevelPieChart data={data}/>
    </div>)
}