import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ChecklistItem as ChecklistItemType } from '@/types';
import { colors } from '@/constants/colors';
import { Check, Circle } from 'lucide-react-native';
import { formatTime } from '@/utils/dateUtils';

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string, value: boolean) => void;
}

export default function ChecklistItem({ item, onToggle }: ChecklistItemProps) {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onToggle(item.id, !item.isCompleted)}
      activeOpacity={0.7}
    >
      <TouchableOpacity
        style={[
          styles.checkbox,
          item.isCompleted && { backgroundColor: colors.primary, borderColor: colors.primary },
        ]}
        onPress={() => onToggle(item.id, !item.isCompleted)}
      >
        {item.isCompleted ? (
          <Check size={16} color={colors.white} />
        ) : (
          <Circle size={16} color={colors.gray} strokeWidth={1.5} />
        )}
      </TouchableOpacity>
      <View style={styles.content}>
        <Text
          style={[
            styles.text,
            item.isCompleted && styles.completedText,
          ]}
        >
          {item.text}
        </Text>
        {item.timestamp && (
          <Text style={styles.timestamp}>Completed at {formatTime(item.timestamp)}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  text: {
    fontSize: 16,
    color: colors.text,
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: colors.gray,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray,
  },
});