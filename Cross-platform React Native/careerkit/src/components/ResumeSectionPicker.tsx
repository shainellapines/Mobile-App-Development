import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card } from '@/components/Card';
import { Checkbox } from '@/components/Checkbox';
import { FieldHint } from '@/components/FieldHint';
import { SectionTitle } from '@/components/SectionTitle';
import { Colors, FontSize, MIN_TOUCH_SIZE } from '@/constants/theme';

type ResumeSectionPickerProps<T extends { id: number }> = {
  title: string;
  /** Every entry in this vault category. */
  items: T[];
  /** Ids of the chosen entries, IN RESUME ORDER. */
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  /** Text for one entry's checkbox. */
  describe: (item: T) => { label: string; description?: string };
};

/**
 * One resume section in the builder (FR-R1, R2):
 * selected entries on top, in resume order, with ▲ ▼ to reorder; unselected entries below.
 */
export function ResumeSectionPicker<T extends { id: number }>({
  title,
  items,
  selectedIds,
  onChange,
  describe,
}: ResumeSectionPickerProps<T>) {
  const byId = new Map(items.map((item) => [item.id, item]));
  const selected = selectedIds.map((id) => byId.get(id)).filter((item): item is T => item !== undefined);
  const unselected = items.filter((item) => !selectedIds.includes(item.id));

  /** Swaps an entry with its neighbour: direction -1 = up, +1 = down. */
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= selectedIds.length) return;
    const next = [...selectedIds];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  };

  return (
    <Card>
      <SectionTitle title={title} note={`(${selected.length} of ${items.length})`} />

      {items.length === 0 ? <FieldHint>{`No ${title.toLowerCase()} in your vault yet.`}</FieldHint> : null}

      {selected.map((item, index) => {
        const { label, description } = describe(item);
        return (
          <View key={item.id} style={styles.row}>
            <Checkbox
              label={label}
              description={description}
              checked
              onChange={() => onChange(selectedIds.filter((id) => id !== item.id))}
            />
            <MoveButton icon="chevron-up" label={`Move ${label} up`} disabled={index === 0} onPress={() => move(index, -1)} />
            <MoveButton
              icon="chevron-down"
              label={`Move ${label} down`}
              disabled={index === selected.length - 1}
              onPress={() => move(index, 1)}
            />
          </View>
        );
      })}

      {unselected.map((item) => {
        const { label, description } = describe(item);
        return (
          <View key={item.id} style={styles.row}>
            {/* Newly checked entries go to the end of the section. */}
            <Checkbox
              label={label}
              description={description}
              checked={false}
              onChange={() => onChange([...selectedIds, item.id])}
            />
          </View>
        );
      })}
    </Card>
  );
}

type MoveButtonProps = {
  icon: 'chevron-up' | 'chevron-down';
  label: string;
  disabled: boolean;
  onPress: () => void;
};

function MoveButton({ icon, label, disabled, onPress }: MoveButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={({ pressed }) => [styles.move, pressed && styles.pressed]}>
      <Ionicons name={icon} size={FontSize.lg} color={disabled ? Colors.border : Colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  move: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
  },
});
