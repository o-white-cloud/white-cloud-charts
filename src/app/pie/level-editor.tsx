import React from 'react';
import { LabelDisplayType, PieChartItem, Property, PieChartLevel, LabelAnchorType } from '@/lib/types/multi-level-pie-types';
import { DefaultTreeItemProperties } from '@/lib/default-values';
import { PropertyEditor } from '@/components/editors/property-editor';
import { EnumEditor } from '@/components/editors/enum-editor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ColorEditor, SingleColorEditor } from '@/components/editors/color-editor';
import { FontFamilyEditor } from '@/components/editors/font-family-editor';
import { NumericEditor } from '@/components/editors/numeric-editor';
import { EditorSection } from '@/components/editors/editor-section';
import { Button } from '@/components/ui/button';

interface LevelEditorProps {
  level: PieChartLevel | null;
  items: PieChartItem[];
  onLevelUpdated: (item: PieChartLevel, property?: Property<any>) => void;
  calibrateParentsToThis: (level: PieChartLevel) => void;
  resetSpanFontSizesOnLevel: (level: PieChartLevel) => void;
  resetSpanFontFamiliesOnLevel: (level: PieChartLevel) => void;
  centerAllSectorText: (level: PieChartLevel) => void;
}

const LevelEditor = (props: LevelEditorProps) => {
  const { level, onLevelUpdated } = props;

  if (!level) {
    return <div className="p-3 text-sm text-muted-foreground">No level selected</div>;
  }

  return (
    <div className="space-y-3 p-3">
      <EditorSection
        title="Ring geometry"
        subtitle="Size and shape of this ring, including spacing and corner rounding."
      >
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Level thickness</Label>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Inner and outer radius in chart units.
          </p>
          <div className="flex max-w-xs items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="iradius" className="text-xs text-muted-foreground">
                Inner
              </Label>
              <Input
                id="iradius"
                placeholder="Inner"
                type="number"
                compact
                className="max-w-[6.5rem]"
                value={level.innerRadius}
                onChange={(e) =>
                  onLevelUpdated({ ...level, innerRadius: e.currentTarget.valueAsNumber })
                }
              />
            </div>
            <span className="pb-2 text-muted-foreground">–</span>
            <div className="space-y-1">
              <Label htmlFor="oradius" className="text-xs text-muted-foreground">
                Outer
              </Label>
              <Input
                id="oradius"
                placeholder="Outer"
                type="number"
                compact
                className="max-w-[6.5rem]"
                value={level.outerRadius}
                onChange={(e) =>
                  onLevelUpdated({ ...level, outerRadius: e.currentTarget.valueAsNumber })
                }
              />
            </div>
          </div>
        </div>

        <PropertyEditor
          level={level}
          property={level.properties.startAngle}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.startAngle)}
          render={(valueProps) => (
            <NumericEditor {...valueProps} min={-360} max={360} step={10} />
          )}
        />

        <PropertyEditor
          level={level}
          property={level.properties.padAngle}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.padAngle)}
          render={(valueProps) => (
            <NumericEditor {...valueProps} min={0} max={0.2} step={0.01} />
          )}
        />

        <PropertyEditor
          level={level}
          property={level.properties.cornerRadius}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.padAngle)}
          render={(valueProps) => (
            <NumericEditor
              {...valueProps}
              min={0}
              max={(level.outerRadius - level.innerRadius) / 2}
              step={10}
            />
          )}
        />
      </EditorSection>

      <EditorSection
        title="Fill"
        subtitle="Default fill color for sectors on this ring. Can be a single color, gradient, or per-sibling palette."
      >
        <PropertyEditor
          level={level}
          property={level.properties.color}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.color)}
          render={(valueProps) => <ColorEditor {...valueProps} />}
        />
      </EditorSection>

      <EditorSection
        title="Outer edge"
        subtitle="Border drawn along the outside of each sector on this ring."
      >
        <PropertyEditor
          level={level}
          property={level.properties.edgeColor}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.edgeColor)}
          render={(valueProps) => <SingleColorEditor {...valueProps} />}
        />

        <PropertyEditor
          level={level}
          property={level.properties.edgeThickness}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.edgeThickness)}
          render={(valueProps) => (
            <NumericEditor {...valueProps} min={0} max={100} step={1} />
          )}
        />
      </EditorSection>

      <EditorSection
        title="Label layout"
        subtitle="Default label placement for all sectors on this ring."
      >
        <PropertyEditor
          level={level}
          property={level.properties.labelDisplay}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.labelDisplay)}
          render={(valueProps) => (
            <EnumEditor {...valueProps} options={Object.keys(LabelDisplayType)} />
          )}
        />

        <PropertyEditor
          level={level}
          property={level.properties.labelAnchor}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.labelAnchor)}
          render={(valueProps) => (
            <EnumEditor {...valueProps} options={Object.keys(LabelAnchorType)} />
          )}
        />

        <PropertyEditor
          level={level}
          property={level.properties.labelDX}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.labelDX)}
          render={(valueProps) => <NumericEditor {...valueProps} wheelAdjust />}
        />

        <PropertyEditor
          level={level}
          property={level.properties.labelDY}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.labelDY)}
          render={(valueProps) => <NumericEditor {...valueProps} wheelAdjust />}
        />

        <div className="space-y-1.5 pt-1">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => props.centerAllSectorText(level)}
          >
            Center all sector text
          </Button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Centers each centroid or radial label block on this level. Click again after changing text or spans.
          </p>
        </div>
      </EditorSection>

      <EditorSection
        title="Typography"
        subtitle="Default font and color settings for labels on this ring."
      >
        <PropertyEditor
          level={level}
          property={level.properties.labelColor}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.labelColor)}
          render={(valueProps) => <SingleColorEditor {...valueProps} />}
        />

        <PropertyEditor
          level={level}
          property={level.properties.labelFontSize}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.labelFontSize)}
          render={(valueProps) => <NumericEditor {...valueProps} />}
        />

        <PropertyEditor
          level={level}
          property={level.properties.labelFontFamily}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.labelFontFamily)}
          render={(valueProps) => <FontFamilyEditor {...valueProps} />}
        />

        <div className="space-y-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => props.resetSpanFontSizesOnLevel(level)}
          >
            Reset span sizes to inherit
          </Button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Clears per-span font-size overrides on this level so spans use the level or sector font size.
          </p>
        </div>

        <div className="space-y-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => props.resetSpanFontFamiliesOnLevel(level)}
          >
            Reset span fonts to inherit
          </Button>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Clears per-span font-family overrides on this level so spans use the level or sector font.
          </p>
        </div>

        <PropertyEditor
          level={level}
          property={
            level.properties.textLineHeight ?? DefaultTreeItemProperties(null).textLineHeight
          }
          onLevelChange={(level) => onLevelUpdated(level, level.properties.textLineHeight)}
          render={(valueProps) => <NumericEditor {...valueProps} min={1} />}
        />
      </EditorSection>

      <EditorSection
        title="Stroke"
        subtitle="Default border around each sector on this ring."
      >
        <PropertyEditor
          level={level}
          property={level.properties.strokeWidth}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.strokeWidth)}
          render={(valueProps) => <NumericEditor {...valueProps} />}
        />

        <PropertyEditor
          level={level}
          property={level.properties.strokeColor}
          onLevelChange={(level) => onLevelUpdated(level, level.properties.strokeColor)}
          render={(valueProps) => <SingleColorEditor {...valueProps} />}
        />
      </EditorSection>

      <EditorSection
        title="Sector values"
        subtitle="Adjust how slice sizes are distributed on this ring."
      >
        <Button
          size="sm"
          className="h-8"
          onClick={() => {
            if (props.level) {
              props.calibrateParentsToThis(props.level);
            }
          }}
        >
          Equalize sector values
        </Button>
        <p className="text-xs text-muted-foreground leading-relaxed">
          All the sectors on this level will be equal. The parent levels will adjust accordingly. Lower levels will continue to work the same way.
        </p>
      </EditorSection>
    </div>
  );
};

export default LevelEditor;
