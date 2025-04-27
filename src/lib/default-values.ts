import { NodeApi } from "react-arborist";
import { LabelAnchorType, LabelDisplayType, PieChartItem, PieChartItemProperties, PieChartLevelProperties } from "./types/multi-level-pie-types";

export const DefaultTreeItemProperties = (parentNode: NodeApi<PieChartItem> | null): PieChartItemProperties => {

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
    }
};

export const DefaultLevelProperties = (): PieChartLevelProperties => {

    var itemProps = DefaultTreeItemProperties(null);
    Object.keys(itemProps).forEach((key: keyof PieChartItemProperties) => {
        itemProps[key].source = 'level';
    });

    itemProps.color.value = {
        type: 'single',
        value: '#ffffff'
    };

    itemProps.labelAnchor.value = LabelAnchorType.middle;
    itemProps.labelDisplay.value = LabelDisplayType.centroid;
    itemProps.labelDX.value = 0;
    itemProps.labelDY.value = 0;
    itemProps.labelFontSize.value = 12;
    itemProps.strokeColor.value = {  type: 'single',
        value: '#000'};
    itemProps.strokeWidth.value = 1;

    return itemProps;
}