import { LabelAnchorType, PieChartItemLabelTextSpan } from "@/lib/types/multi-level-pie-types";
import { Input } from "../ui/input";
import { z } from "zod";
import { useForm, Controller, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronRight, Trash, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import { debounce, isEqual } from "lodash";
import { FontPicker } from "@/components/ui/font-picker";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";

export interface TextSpanEditorProps {
    span: PieChartItemLabelTextSpan;
    onSpanUpdated: (span: PieChartItemLabelTextSpan) => void;
    onSpanRemoved: (span: PieChartItemLabelTextSpan) => void;
}

const textSpanSchema = z.object({
    text: z.string().min(1, "Text is required").max(100, "Text must be at most 100 characters"),
    color: z.string(),
    fontSize: z.number().min(1, "Font size is required").max(100, "Font size must be at most 100"),
    fontWeight: z.enum(["normal", "bold", "bolder", "lighter"]),
    fontFamily: z.string().min(1, "Font family is required").max(100, "Font family must be at most 100 characters"),
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

function spanToFormValues(span: PieChartItemLabelTextSpan): PieChartItemLabelTextSpan {
    return {
        text: span.text || "",
        color: span.color || "#000000",
        fontSize: span.fontSize || 12,
        fontWeight: span.fontWeight || "normal",
        fontFamily: span.fontFamily || "Arial",
        anchor: span.anchor || LabelAnchorType.start,
        x: span.x ?? undefined,
        y: span.y ?? undefined,
        dx: span.dx ?? undefined,
        dy: span.dy ?? undefined,
    };
}

const POSITION_KEYS = ["x", "y", "dx", "dy"] as const;

export const TextSpanEditor: React.FC<TextSpanEditorProps> = (props) => {
    const { span, onSpanUpdated, onSpanRemoved } = props;
    const [isCollapsed, setIsCollapsed] = useState(false); // State to manage collapse/expand
    const spanRef = useRef(span);
    spanRef.current = span;
    const formRef = useRef<UseFormReturn<PieChartItemLabelTextSpan> | null>(null);
    const onSpanUpdatedRef = useRef(onSpanUpdated);
    onSpanUpdatedRef.current = onSpanUpdated;

    const form = useForm<PieChartItemLabelTextSpan>({
        resolver: zodResolver(textSpanSchema),
        defaultValues: spanToFormValues(span),
    });
    formRef.current = form;

    const debouncedUpdate = useMemo(
        () =>
            debounce((updatedData: PieChartItemLabelTextSpan) => {
                const s = spanRef.current;
                const f = formRef.current;
                if (!f) return;
                const merged: PieChartItemLabelTextSpan = { ...s, ...updatedData };
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

    const watchedFields = form.watch(); // Watch all fields for changes

    useEffect(() => {
        debouncedUpdate(watchedFields);
        return () => debouncedUpdate.cancel(); // Cleanup debounce on unmount
    }, [watchedFields, debouncedUpdate]);


    return (
        <div className="border rounded-md">
            {/* Header Section */}
            <div
                role="button"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="flex items-center justify-between w-full pl-2 py-1 bg-gray-100 cursor-pointer"
                tabIndex={0} // Makes it focusable for accessibility
                onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                        setIsCollapsed(!isCollapsed); // Toggle on Enter or Space key
                    }
                }}
            >
                <div className="flex items-center space-x-2">
                    {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    <h3 className="text-sm font-medium">{span.text || "Untitled"}</h3>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent collapsing/expanding when clicking the delete button
                        onSpanRemoved(span);
                    }}
                    className="text-red-500 hover:text-red-700"
                >
                    <Trash className="w-4 h-4" />
                </Button>
            </div>

            {/* Collapsible Content */}
            {!isCollapsed && (
                <Form {...form}>
                    <div className="space-y-4 p-4">
                        <FormField
                            control={form.control}
                            name="text"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Text</FormLabel>
                                    <FormControl>
                                        <Input placeholder="text" {...field} />
                                    </FormControl></FormItem>)} />

                        <FormField
                            control={form.control}
                            name="color"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Color</FormLabel>
                                    <FormControl>
                                        <Input type="color" {...field} />
                                    </FormControl></FormItem>)} />

                        <FormField
                            control={form.control}
                            name="fontFamily"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Font</FormLabel>
                                    <FormControl>
                                        <FontPicker width={200}
                                            className="px-2 py-0 m-0 h-8 w-full radius-sm shadow-none"
                                            value={span.fontFamily}
                                            onChange={(value) => {
                                                field.onChange(value);
                                            }} />
                                    </FormControl></FormItem>)} />


                        <div className="flex space-x-4">
                            <FormField
                                control={form.control}
                                name="fontSize"
                                render={({ field }) => (
                                    <FormItem className="flex-none">
                                        <FormControl>
                                            <Input {...field} className="px-2 py-0 m-0 h-8 rounded-sm"/>
                                        </FormControl></FormItem>)} />

                            <FormField
                                control={form.control}
                                name="fontWeight"
                                render={({ field }) => (
                                    <FormItem className="flex-2">
                                        <FormControl>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}
                                            >
                                                <SelectTrigger id="font-weight-input" className="px-2 py-0 m-0 h-8 rounded-sm shadow-none">
                                                    <SelectValue placeholder="Select weight" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="normal">Normal</SelectItem>
                                                    <SelectItem value="bold">Bold</SelectItem>
                                                    <SelectItem value="bolder">Bolder</SelectItem>
                                                    <SelectItem value="lighter">Lighter</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormControl></FormItem>)} />
                        </div>
                        <div>
                            <FormLabel>Position</FormLabel>
                            <div className="flex space-x-4 mt-2"><FormField
                                control={form.control}
                                name="x"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input placeholder="x" {...field} type="number" className="px-2 py-0 m-0 h-8 rounded-sm" />
                                        </FormControl></FormItem>)} />
                                <FormField
                                    control={form.control}
                                    name="y"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="y" {...field} type="number" className="px-2 py-0 m-0 h-8 rounded-sm" />
                                            </FormControl></FormItem>)} />
                                <FormField
                                    control={form.control}
                                    name="dx"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="dX" {...field} type="number" className="px-2 py-0 m-0 h-8 rounded-sm" />
                                            </FormControl></FormItem>)} />
                                <FormField
                                    control={form.control}
                                    name="dy"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormControl>
                                                <Input placeholder="dY" {...field} type="number" className="px-2 py-0 m-0 h-8 rounded-sm" />
                                            </FormControl></FormItem>)} />
                            </div>
                        </div>
                        <FormField
                            control={form.control}
                            name="anchor"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Anchor</FormLabel>
                                    <FormControl>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                        >
                                            <SelectTrigger id="font-weight-input" className="px-2 py-0 m-0 h-8 rounded-sm shadow-none">
                                                <SelectValue placeholder="Select weight" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.values(LabelAnchorType).map((anchor) => (
                                                    <SelectItem key={anchor} value={anchor}>
                                                        {anchor}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormControl></FormItem>)} />
                    </div>
                </Form>
            )}
        </div>
    );
};