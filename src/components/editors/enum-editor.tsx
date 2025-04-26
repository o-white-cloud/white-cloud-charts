import {
    getEnumKeys, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { ValueEditorProps } from './property-editor';

interface EnumPickerProps<T> extends ValueEditorProps<T> {
    options: Array<string>
}
export const EnumEditor = <T,>(props: EnumPickerProps<T>) => {
    return (<Select value={props.value?.toString()} onValueChange={(value) => { props.onChange(value as T) }} disabled={props.readonly}>
        <SelectTrigger className="w-[280px]">
            <SelectValue placeholder={"Select value"} />
        </SelectTrigger>
        <SelectContent>
            <SelectGroup>
                {/* <SelectLabel>Label display</SelectLabel> */}
                {props.options.map((key) => (
                    <SelectItem key={key.toString()} value={key.toString()}>
                        {key.toString()}
                    </SelectItem>
                ))}
            </SelectGroup>
        </SelectContent>
    </Select>);
}