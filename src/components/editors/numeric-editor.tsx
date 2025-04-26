import { ValueEditorProps } from './property-editor';
import { Input } from '../ui/input';

export const NumericEditor = <T,>(props: ValueEditorProps<number>) => {
    return <Input type='number' readOnly={props.readonly} value={props.value ?? undefined} onChange={(e) => props.onChange(e.currentTarget.valueAsNumber)} />;
}