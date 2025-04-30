import { NodeApi } from "react-arborist";
import { LabelAnchorType, LabelDisplayType, PieChartItem, PieChartItemProperties, PieChartLevelProperties } from "./types/multi-level-pie-types";

export const DefaultTreeItemProperties = (parentNode: PieChartItem | null): PieChartItemProperties => {

    return {
        color: {
            description: 'Color of the pie sector',
            label: 'Color',
            name: 'color',
            source: parentNode ? 'parent' : 'level',
            value: null
        },
        labelAnchor: {
            description: 'Anchor of the pie sector label',
            label: 'Anchor',
            name: 'labelAnchor',
            source: 'level',
            value: LabelAnchorType.middle
        },
        labelDisplay: {
            description: 'Display type of label',
            label: 'Display',
            name: 'labelDisplay',
            source: 'level',
            value: null
        },
        labelDX: {
            description: 'X offset of the label',
            label: 'Delta X',
            name: 'labelDX',
            source: 'level',
            value: 0
        },
        labelDY: {
            description: 'Y offset of the label',
            label: 'Delta Y',
            name: 'labelDY',
            source: 'level',
            value: 0
        },
        labelFontSize: {
            description: "Size of the label font",
            label: "Font size",
            name: 'labelFontSize',
            source: 'level',
            value: 12
        },
        strokeColor: {
            description: 'Color of the stroke',
            label: 'Stroke color',
            name: 'strokeColor',
            source: 'level',
            value: null
        },
        strokeWidth: {
            description: 'Width of the stroke',
            label: 'Stroke width',
            name: 'strokeWidth',
            source: 'level',
            value: null
        },
        startRadiusStrokeColor: {
            description: 'Color of the leading radius edge of the sector',
            label: 'Start radius stroke color',
            name: 'startRadiusStrokeColor',
            source: 'override',
            value: {
                type: 'single',
                value: '#000'
            }
        },
        endRadiusStrokeColor: {
            description: 'Color of the trailing radius edge of the sector',
            label: 'End radius stroke color',
            name: 'endRadiusStrokeColor',
            source: 'override',
            value: {
                type: 'single',
                value: '#000'
            }
        },
        startRadiusStrokeWidth: {
            description: 'Width of the leading radius edge of the sector',
            label: 'Start radius stroke width',
            name: 'startRadiusStrokeWidth',
            source: 'override',
            value: 0
        },
        endRadiusStrokeWidth: {
            description: 'Width of the trailing radius edge of the sector',
            label: 'End radius stroke width',
            name: 'endRadiusStrokeWidth',
            source: 'override',
            value: 0
        }
    }
};

export const DefaultLevelProperties = (): PieChartLevelProperties => {

    let levelProps :PieChartLevelProperties = {...DefaultTreeItemProperties(null), 
        padAngle: {
            description: 'Spacing as angle between each sector',
            label: 'Pad angle',
            name: 'padAngle',
            source: 'level',
            value: 0
        },
        cornerRadius: {
            description: 'Roundness of the corners of each sector',
            label: 'Corner radius',
            name: 'cornerRadius',
            source: 'level',
            value: 0
        },
        startAngle: {
            description: 'Angle at which the first sector starts from',
            label: 'Start angle',
            name: 'startAngle',
            source: 'level',
            value: 0
        },
        edgeColor: {
            description: 'Sector outer edge color',
            label: 'Edge color',
            name: 'edgeColor',
            source: 'level',
            value: {
                type: 'single',
                value: '#000'
            }
        },
        edgeThickness: {
            description: 'Thickness of sector outer edge',
            label: 'Edge thickness',
            name: 'edgeThickness',
            source: 'level',
            value: 0
        },
    };

    Object.keys(levelProps).forEach((key: keyof PieChartItemProperties) => {
        levelProps[key].source = 'level';
    });

    levelProps.color.value = {
        type: 'single',
        value: '#ffffff'
    };
    levelProps.padAngle
    levelProps.labelAnchor.value = LabelAnchorType.middle;
    levelProps.labelDisplay.value = LabelDisplayType.centroid;
    levelProps.labelDX.value = 0;
    levelProps.labelDY.value = 0;
    levelProps.labelFontSize.value = 12;
    levelProps.strokeColor.value = {  type: 'single',
        value: '#000'};
    levelProps.strokeWidth.value = 1;

    return levelProps;
}