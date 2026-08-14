import { FontPicker } from '@/components/ui/font-picker';
import { ValueEditorProps } from '@/components/editors/property-editor';

export function FontFamilyEditor(props: ValueEditorProps<string>) {
  const { value, onChange, readonly } = props;

  return (
    <FontPicker
      width={200}
      className="px-2 py-0 m-0 h-8 w-full radius-sm shadow-none"
      value={value ?? undefined}
      onChange={(next) => {
        if (!readonly) {
          onChange(next);
        }
      }}
    />
  );
}
