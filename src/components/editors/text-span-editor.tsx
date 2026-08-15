import { DEFAULT_CHART_FONT_FAMILY } from "@/lib/chart-typography";
import { LabelAnchorType, PieChartItemLabelTextSpan } from "@/lib/types/multi-level-pie-types";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { debounce, isEqual } from "lodash";
import { FontPicker } from "@/components/ui/font-picker";
import { ColorPicker } from "@/components/ui/color-picker";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";

export interface TextSpanEditorProps {
    span: PieChartItemLabelTextSpan;
    onSpanUpdated: (span: PieChartItemLabelTextSpan) => void;
    onSpanRemoved: (span: PieChartItemLabelTextSpan) => void;
}

const textSpanSchema = z.object({
    text: z.string().min(1, "Text is required").max(100, "Text must be at most 100 characters"),
    color: z.string(),
    fontSizeOverrideEnabled: z.boolean(),
    fontSize: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const parsed = parseFloat(val as string);
        return isNaN(parsed) ? undefined : parsed;
    }, z.number().min(1, "Font size must be at least 1").max(100, "Font size must be at most 100").optional()),
    fontWeight: z.enum(["normal", "bold", "bolder", "lighter"]),
    fontFamilyOverrideEnabled: z.boolean(),
    fontFamily: z.string().max(100, "Font family must be at most 100 characters").optional(),
    x: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const parsed = parseFloat(val as string);
        return isNaN(parsed) ? undefined : parsed;
    }, z.number().optional()),
    y: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const parsed = parseFloat(val as string);
        return isNaN(parsed) ? undefined : parsed;
    }, z.number().optional()),
    dx: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const parsed = parseFloat(val as string);
        return isNaN(parsed) ? undefined : parsed;
    }, z.number().optional()),
    dy: z.preprocess((val) => {
        if (val === "" || val === null || val === undefined) return undefined;
        const parsed = parseFloat(val as string);
        return isNaN(parsed) ? undefined : parsed;
    }, z.number().optional()),
    anchor: z.nativeEnum(LabelAnchorType)
});

type TextSpanFormValues = z.infer<typeof textSpanSchema>;

function spanToFormValues(span: PieChartItemLabelTextSpan): TextSpanFormValues {
    return {
        text: span.text || "",
        color: span.color || "#000000",
        fontSizeOverrideEnabled: span.fontSize !== undefined,
        fontSize: span.fontSize ?? 12,
        fontWeight: (span.fontWeight || "normal") as TextSpanFormValues["fontWeight"],
        fontFamilyOverrideEnabled: span.fontFamily !== undefined,
        fontFamily: span.fontFamily ?? DEFAULT_CHART_FONT_FAMILY,
        anchor: span.anchor || LabelAnchorType.start,
        x: span.x ?? undefined,
        y: span.y ?? undefined,
        dx: span.dx ?? undefined,
        dy: span.dy ?? undefined,
    };
}

function formValuesToSpan(
    span: PieChartItemLabelTextSpan,
    formValues: TextSpanFormValues
): PieChartItemLabelTextSpan {
    const merged: PieChartItemLabelTextSpan = {
        ...span,
        text: formValues.text,
        color: formValues.color,
        fontWeight: formValues.fontWeight,
        anchor: formValues.anchor,
        x: formValues.x,
        y: formValues.y,
        dx: formValues.dx,
        dy: formValues.dy,
    };

    if (formValues.fontSizeOverrideEnabled && formValues.fontSize !== undefined) {
        merged.fontSize = formValues.fontSize;
    } else {
        delete merged.fontSize;
    }

    if (formValues.fontFamilyOverrideEnabled && formValues.fontFamily) {
        merged.fontFamily = formValues.fontFamily;
    } else {
        delete merged.fontFamily;
    }

    return merged;
}

const POSITION_KEYS = ["x", "y", "dx", "dy"] as const;

export const TextSpanEditor: React.FC<TextSpanEditorProps> = (props) => {
    const { span, onSpanUpdated, onSpanRemoved } = props;
    const [isCollapsed, setIsCollapsed] = useState(false);
    const spanRef = useRef(span);
    spanRef.current = span;
    const formRef = useRef<UseFormReturn<TextSpanFormValues> | null>(null);
    const onSpanUpdatedRef = useRef(onSpanUpdated);
    onSpanUpdatedRef.current = onSpanUpdated;

    const form = useForm<TextSpanFormValues>({
        resolver: zodResolver(textSpanSchema),
        defaultValues: spanToFormValues(span),
    });
    formRef.current = form;

    const debouncedUpdate = useMemo(
        () =>
            debounce((updatedData: TextSpanFormValues) => {
                const s = spanRef.current;
                const f = formRef.current;
                if (!f) return;
                const merged = formValuesToSpan(s, updatedData);
                for (const key of POSITION_KEYS) {
                    if (updatedData[key] === undefined) {
                        if (f.getFieldState(key).isDirty) {
                            merged[key] = undefined;
                        } else {
                            merged[key] = s[key];
                        }
                    }
                }
                if (isEqual(merged, s)) return;
                onSpanUpdatedRef.current(merged);
            }, 300),
        []
    );

    useEffect(() => {
        debouncedUpdate.cancel();
        form.reset(spanToFormValues(span));
    }, [span, form, debouncedUpdate]);

    const watchedFields = form.watch();

    useEffect(() => {
        debouncedUpdate(watchedFields);
        return () => debouncedUpdate.cancel();
    }, [watchedFields, debouncedUpdate]);

    const fontSizeOverrideEnabled = form.watch("fontSizeOverrideEnabled");
    const fontFamilyOverrideEnabled = form.watch("fontFamilyOverrideEnabled");

    return (
        <div className="rounded-md border border-border/60">
            <div
                role="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex w-full cursor-pointer items-center justify-between bg-muted/40 px-2 py-1.5"
                tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsCollapsed(!isCollapsed);
                    }
                }}
            >
                <div className="flex min-w-0 items-center gap-2">
                    {isCollapsed ? <ChevronRight className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
                    <h4 className="truncate text-sm font-medium">{span.text || "Untitled"}</h4>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 text-destructive hover:text-destructive"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSpanRemoved(span);
                    }}
                >
                    <Trash className="h-4 w-4" />
                </Button>
            </div>

            {!isCollapsed && (
                <Form {...form}>
                    <div className="space-y-3 p-3">
                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-sm">Text</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Text" compact {...field} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-sm">Color</FormLabel>
                                    <FormControl>
                                        <ColorPicker
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="fontFamilyOverrideEnabled"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-sm">Font</FormLabel>
                                    <FormControl>
                                        <label className="flex h-8 items-center gap-2 text-sm">
                                            <input
                                                type="checkbox"
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                className="rounded border-gray-300"
                                            />
                                            Override
                                        </label>
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {fontFamilyOverrideEnabled && (
                            <FormField
                                control={form.control}
                                name="fontFamily"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <FontPicker width={200}
                                                className="px-2 py-0 m-0 h-8 w-full radius-sm shadow-none"
                                                value={field.value}
                                                onChange={(value) => {
                                                    field.onChange(value);
                                                }} />
                                        </FormControl></FormItem>)} />
                        )}
                        {!fontFamilyOverrideEnabled && (
                            <p className="text-xs text-muted-foreground">Inherits the sector or level font family.</p>
                        )}

                        <div className="flex flex-wrap items-end gap-3">
                            <FormField
                                control={form.control}
                                name="fontSizeOverrideEnabled"
                                render={({ field }) => (
                                    <FormItem className="flex-none space-y-1">
                                        <FormLabel className="text-sm">Font size</FormLabel>
                                        <FormControl>
                                            <label className="flex h-8 items-center gap-2 text-sm">
                                                <input
                                                    type="checkbox"
                                                    checked={field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                    className="rounded border-gray-300"
                                                />
                                                Override
                                            </label>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {fontSizeOverrideEnabled && (
                                <FormField
                                    control={form.control}
                                    name="fontSize"
                                    render={({ field }) => (
                                        <FormItem className="flex-none">
                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    compact
                                                    type="number"
                                                    min={1}
                                                    max={100}
                                                    value={field.value ?? ''}
                                                    onChange={(e) => {
                                                        const next = e.currentTarget.valueAsNumber;
                                                        field.onChange(Number.isNaN(next) ? undefined : next);
                                                    }}
                                                    className="max-w-[5rem]"
                                                />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            )}

                            <FormField
                                control={form.control}
                                name="fontWeight"
                                render={({ field }) => (
                                    <FormItem className="min-w-0 flex-1 space-y-1">
                                        <FormLabel className="text-sm">Weight</FormLabel>
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value}
                                            >
                                                <SelectTrigger className="h-8 shadow-none">
                                                    <SelectValue placeholder="Select weight" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="bold">Bold</SelectItem>
                                                    <SelectItem value="bolder">Bolder</SelectItem>
                                                    <SelectItem value="lighter">Lighter</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>
                        {!fontSizeOverrideEnabled && (
                            <p className="text-xs text-muted-foreground">Inherits the sector or level font size.</p>
                        )}
                        <div className="space-y-1.5">
                            <FormLabel className="text-sm">Position</FormLabel>
                            <div className="flex flex-wrap gap-2">
                                <FormField
                                    control={form.control}
                                    name="x"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="x" compact {...field} type="number" className="max-w-[4.5rem]" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="y"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="y" compact {...field} type="number" className="max-w-[4.5rem]" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dx"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="dX" compact {...field} type="number" className="max-w-[4.5rem]" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="dy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="dY" compact {...field} type="number" className="max-w-[4.5rem]" />
                                            </FormControl>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="anchor"
                            render={({ field }) => (
                                <FormItem className="space-y-1">
                                    <FormLabel className="text-sm">Anchor</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value}
                                        >
                                            <SelectTrigger className="h-8 shadow-none">
                                                <SelectValue placeholder="Select anchor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(LabelAnchorType).map((anchor) => (
                                                    <SelectItem key={anchor} value={anchor}>
                                                        {anchor}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                    </div>
                </Form>
            )}
        </div>
    );
};
