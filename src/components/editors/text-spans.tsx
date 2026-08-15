import React, { useContext, useEffect, useState } from "react";
import { LabelAnchorType, PieChartItem, PieChartItemLabelTextSpan } from "@/lib/types/multi-level-pie-types";
import { TextSpanEditor } from "./text-span-editor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "../ui/label";
import { MultiLevelPieChartDataContext } from "../contexts/MultiLevelPieChartDataContext";
import { getPropertyValue } from "@/lib/pie-chart-item-value";
import { DEFAULT_CHART_FONT_FAMILY } from "@/lib/chart-typography";

export interface TextSpansProps {
    item: PieChartItem;
    onItemUpdated: (updatedItem: PieChartItem) => void;
}

export const TextSpans: React.FC<TextSpansProps> = ({ item, onItemUpdated }) => {
    const [labelSpans, setLabelSpans] = useState<PieChartItemLabelTextSpan[]>(item.labelSpans);
    const data = useContext(MultiLevelPieChartDataContext);
    const inheritedFontFamily =
        getPropertyValue(item, item.properties.labelFontFamily, data) ?? DEFAULT_CHART_FONT_FAMILY;
    const inheritedFontSize = getPropertyValue(item, item.properties.labelFontSize, data) ?? 12;

    useEffect(() => {
        setLabelSpans(item.labelSpans);
    }, [item.id, item.labelSpans]);

    const handleSpanUpdated = (updatedSpan: PieChartItemLabelTextSpan, index: number) => {
        const updatedSpans = [...labelSpans];
        updatedSpans[index] = updatedSpan;
        setLabelSpans(updatedSpans);
        onItemUpdated({ ...item, labelSpans: updatedSpans });
    };

    const handleSpanRemoved = (index: number) => {
        const updatedSpans = labelSpans.filter((_, i) => i !== index);
        setLabelSpans(updatedSpans);
        onItemUpdated({ ...item, labelSpans: updatedSpans });
    };

    const handleAddSpan = () => {
        const newSpan: PieChartItemLabelTextSpan = {
            text: "",
            color: "#000000",
            fontWeight: "normal",
            anchor: LabelAnchorType.start,
        };
        const updatedSpans = [...labelSpans, newSpan];
        setLabelSpans(updatedSpans);
        onItemUpdated({ ...item, labelSpans: updatedSpans });
    };

    if (labelSpans.length === 0) {
        return (
            <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Text spans</Label>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={handleAddSpan}
                        title="Add text span"
                        aria-label="Add text span"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                    No extra lines yet. Split main text or add a span for additional styled label lines.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Text spans</Label>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleAddSpan}
                    title="Add text span"
                    aria-label="Add text span"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {labelSpans.map((span, index) => (
                <TextSpanEditor
                    key={index}
                    span={span}
                    inheritedFontFamily={inheritedFontFamily}
                    inheritedFontSize={inheritedFontSize}
                    onSpanUpdated={(updatedSpan) => handleSpanUpdated(updatedSpan, index)}
                    onSpanRemoved={() => handleSpanRemoved(index)}
                />
            ))}
        </div>
    );
};
