import { PieChartItem, Property, PieChartLevel } from "@/lib/types/multi-level-pie-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCallback, useContext, useState } from "react";
import { getPropertyValue } from "@/lib/pie-chart-item-value";
import { Label } from "../ui/label";
import { MultiLevelPieChartDataContext } from "../contexts/MultiLevelPieChartDataContext";

export interface PropertyEditorProps<T = any> {
    level: PieChartLevel;
    item?: PieChartItem;
    property: Property<T>
    onItemChange?: (item: PieChartItem) => void;
    onLevelChange?: (level: PieChartLevel) => void;
}

export interface ValueEditorProps<T> {
    value: T | null,
    onChange: (newValue: T) => void,
    readonly: boolean
}



export const PropertyEditor = <T,>(props: React.PropsWithChildren<PropertyEditorProps<T> & { render: (valueProps: ValueEditorProps<T>) => JSX.Element }>) => {
    const { item, level, onItemChange, onLevelChange, property } = props;
    const data = useContext(MultiLevelPieChartDataContext);
    const sourceChanged = useCallback((newSource: "override" | "parent" | "level") => {
        if (!item || !onItemChange) {
            return;
        }

        const newItem: PieChartItem = {
            ...item,
            properties: {
                ...item.properties,
                [property.name]: {
                    ...property,
                    source: newSource,
                    value: newSource === 'override' ? getPropertyValue(item, property, data) : null
                }
            }
        };

        onItemChange(newItem);
    }, [property.source, item, level, onItemChange]);

    const valueChanged = useCallback((newValue: T) => {
        if (item && onItemChange) {
            const newItem: PieChartItem = {
                ...item,
                properties: {
                    ...item.properties,
                    [property.name]: {
                        ...property,
                        value: newValue
                    }
                }
            };

            onItemChange(newItem);
        } else if (onLevelChange) {
            const newLevel: PieChartLevel = {
                ...level,
                properties: {
                    ...level.properties,
                    [property.name]: {
                        ...property,
                        value: newValue
                    }
                }
            }
            onLevelChange(newLevel);
        }
    }, [item, level, property, onItemChange, onLevelChange]);

    return <div className="mt-5 mb-5">
        <div className="flex flex-row items-center mb-2">
            <Label className="flex-1">{props.property.label}</Label>
            {item && (<Select value={property.source} onValueChange={sourceChanged}>
                <SelectTrigger className="w-[100px] px-2 py-0 h-[28px]">
                    <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="level">Level</SelectItem>
                    {props.item?.parent && <SelectItem value="parent">Parent</SelectItem>}
                    <SelectItem value="override">Override</SelectItem>
                </SelectContent>
            </Select>)}</div>
        {props.render({
            value: item ? getPropertyValue(item, property, data) : property.value,
            onChange: valueChanged,
            readonly: item !== undefined && (property.source !== 'override')
        })}
        <span>{property.description}</span>
    </div>;
}

