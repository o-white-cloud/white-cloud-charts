import { ValueEditorProps } from './property-editor';
import { Input } from '../ui/input';

export const NumericEditor = <T,>(props: ValueEditorProps<number> & { min?: number, max?: number, step?: number }) => {
    return <Input type='number' readOnly={props.readonly} value={props.value ?? undefined} min={props.min} step={props.step} max={props.max} onChange={(e) => props.onChange(e.currentTarget.valueAsNumber)} />;
}