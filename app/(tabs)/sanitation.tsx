import React, { useCallback, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import { SanitationTask } from '@/types';
import { formatDate, formatDistanceToNow } from '@/utils/dateUtils';
import StatusBadge from '@/components/StatusBadge';
import { ChevronRight, Plus, CheckSquare } from 'lucide-react-native';

export default function SanitationScreen() {
  const router = useRouter();
  const { sanitationTasks } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming' | 'completed'>('all');

  const getFilteredTasks = useCallback(() => {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'overdue':
        return sanitationTasks.filter(task => task.isActive && task.nextDue < now);
      case 'upcoming':
        return sanitationTasks.filter(
          task => task.isActive && task.nextDue >= now && task.nextDue <= now + 7 * 24 * 60 * 60 * 1000 // Due within 7 days
        );
      case 'completed':
        return sanitationTasks.filter(
          task => task.lastCompleted && task.lastCompleted >= today // Completed today
        );
      default:
        return sanitationTasks.filter(task => task.isActive);
    }
  }, [sanitationTasks, filter]);

  const getTaskStatus = useCallback((task: SanitationTask) => {
    const now = Date.now();
    
    if (task.nextDue < now) {
      return 'pending'; // Overdue
    }
    
    if (task.nextDue < now + 24 * 60 * 60 * 1000) {
      return 'inProgress'; // Due within 24 hours
    }
    
    return 'completed'; // Not due soon
  }, []);

  const renderFilterButton = (label: string, value: 'all' | 'overdue' | 'upcoming' | 'completed') => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderTaskItem = ({ item }: { item: SanitationTask }) => {
    const status = getTaskStatus(item);
    
    return (
      <TouchableOpacity
        style={styles.taskItem}
        onPress={() => router.push(`/sanitation/${item.id}`)}
        activeOpacity={0.7}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskIconContainer}>
            <CheckSquare size={20} color={colors.primary} />
          </View>
          <StatusBadge status={status} size="small" />
        </View>
        
        <Text style={styles.taskName}>{item.name}</Text>
        
        {item.description && (
          <Text style={styles.taskDescription} numberOfLines={2}>
            {item.description}
          </Text>
        )}
        
        <View style={styles.taskDetails}>
          <View style={styles.taskDetailItem}>
            <Text style={styles.taskDetailLabel}>Area:</Text>
            <Text style={styles.taskDetailValue}>
              {item.area.charAt(0).toUpperCase() + item.area.slice(1)}
            </Text>
          </View>
          
          <View style={styles.taskDetailItem}>
            <Text style={styles.taskDetailLabel}>Frequency:</Text>
            <Text style={styles.taskDetailValue}>
              {item.frequency.charAt(0).toUpperCase() + item.frequency.slice(1)}
            </Text>
          </View>
          
          <View style={styles.taskDetailItem}>
            <Text style={styles.taskDetailLabel}>Assigned to:</Text>
            <Text style={styles.taskDetailValue}>{item.assignedTo || 'Unassigned'}</Text>
          </View>
        </View>
        
        <View style={styles.taskFooter}>
          <Text style={styles.taskDueDate}>
            {item.nextDue < Date.now()
              ? `Overdue by ${formatDistanceToNow(item.nextDue)}`
              : `Due ${formatDate(item.nextDue)}`}
          </Text>
          <ChevronRight size={16} color={colors.gray} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Sanitation Tasks</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/sanitation/new')}
            activeOpacity={0.7}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterContainer}>
          {renderFilterButton('All', 'all')}
          {renderFilterButton('Overdue', 'overdue')}
          {renderFilterButton('Upcoming', 'upcoming')}
          {renderFilterButton('Completed Today', 'completed')}
        </View>
        
        <FlatList
          data={getFilteredTasks()}
          keyExtractor={(item) => item.id}
          renderItem={renderTaskItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.tasksList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No tasks found</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: colors.grayLight,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    color: colors.gray,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.white,
  },
  tasksList: {
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  taskItem: {
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
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  taskName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  taskDetails: {
    marginBottom: 12,
  },
  taskDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  taskDetailLabel: {
    fontSize: 14,
    color: colors.gray,
    marginRight: 4,
    width: 80,
  },
  taskDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 12,
  },
  taskDueDate: {
    fontSize: 12,
    color: colors.gray,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
  },
});