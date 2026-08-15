import { PieChartItem, Property, PieChartLevel } from "@/lib/types/multi-level-pie-types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useCallback, useContext } from "react";
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
    }, [property, item, onItemChange, data]);

    const valueChanged = useCallback((newValue: T) => {
        if (item && onItemChange) {
            const newItem: PieChartItem = {
                ...item,
                properties: {
                    ...item.properties,
                    [property.name]: {
                        ...property,
                        source: 'override',
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

    return (
        <div className="space-y-1.5">
            <div className="space-y-0.5">
                <Label className="text-sm font-medium">{props.property.label}</Label>
                {property.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {property.description}
                    </p>
                )}
            </div>
            <div className="flex flex-row items-start gap-2">
                <div className="min-w-0 flex-1">
                    {props.render({
                        value: item ? getPropertyValue(item, property, data) : property.value,
                        onChange: valueChanged,
                        readonly: item !== undefined && (property.source !== 'override')
                    })}
                </div>
                {item && (
                    <Select value={property.source} onValueChange={sourceChanged}>
                        <SelectTrigger className="h-8 w-[6.5rem] shrink-0 px-2 py-0 text-xs">
                            <SelectValue placeholder="Source" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="level">Level</SelectItem>
                            {props.item?.parent && <SelectItem value="parent">Parent</SelectItem>}
                            <SelectItem value="override">Override</SelectItem>
                        </SelectContent>
                    </Select>
                )}
            </div>
        </div>
    );
}
