import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import StatusBadge from './StatusBadge';

interface DashboardCardProps {
  title: string;
  status: 'completed' | 'pending' | 'inProgress';
  icon: React.ReactNode;
  count?: {
    completed: number;
    total: number;
  };
  onPress: () => void;
}

export default function DashboardCard({
  title,
  status,
  icon,
  count,
  onPress,
}: DashboardCardProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>{icon}</View>
        <StatusBadge status={status} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {count && (
        <Text style={styles.count}>
          {count.completed}/{count.total} completed
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  count: {
    fontSize: 14,
    color: colors.textLight,
  },
});