import React, { useState } from "react";
import { LabelAnchorType, PieChartItem, PieChartItemLabelTextSpan } from "@/lib/types/multi-level-pie-types";
import { TextSpanEditor } from "./text-span-editor";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Label } from "../ui/label";

export interface TextSpansProps {
    item: PieChartItem;
    onItemUpdated: (updatedItem: PieChartItem) => void;
}

export const TextSpans: React.FC<TextSpansProps> = ({ item, onItemUpdated }) => {
    const [labelSpans, setLabelSpans] = useState<PieChartItemLabelTextSpan[]>(item.labelSpans);

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
            fontSize: 12,
            fontWeight: "normal",
            fontFamily: "Arial",
            anchor: LabelAnchorType.start,
        };
        const updatedSpans = [...labelSpans, newSpan];
        setLabelSpans(updatedSpans);
        onItemUpdated({ ...item, labelSpans: updatedSpans });
    };

    return (
        <div className="space-y-2 mt-4">
            {/* Header Section */}
            <div className="flex items-center justify-between">
            <Label>Text spans</Label>
            <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleAddSpan}
                    className="flex items-center space-x-2"
                >
                    <Plus className="w-4 h-4" />
                </Button>
            </div>

            {/* Text Span Editors */}
            {labelSpans.map((span, index) => (
                <TextSpanEditor
                    key={index}
                    span={span}
                    onSpanUpdated={(updatedSpan) => handleSpanUpdated(updatedSpan, index)}
                    onSpanRemoved={() => handleSpanRemoved(index)}
                />
            ))}
        </div>
    );
};