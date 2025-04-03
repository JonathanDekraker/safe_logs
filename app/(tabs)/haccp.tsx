import React, { useCallback, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useHACCPStore } from '@/store/haccp-store';
import { HACCPPlan } from '@/types/haccp';
import { formatDate } from '@/utils/dateUtils';
import { ChevronRight, Plus, ShieldCheck } from 'lucide-react-native';

export default function HACCPScreen() {
  const router = useRouter();
  const { plans } = useHACCPStore();
  const [filter, setFilter] = useState<'all' | 'active'>('active');

  const getFilteredPlans = useCallback(() => {
    if (filter === 'active') {
      return plans.filter(plan => plan.active);
    }
    return plans;
  }, [plans, filter]);

  const renderFilterButton = (label: string, value: 'all' | 'active') => (
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

  const renderPlanItem = ({ item }: { item: HACCPPlan }) => (
    <TouchableOpacity
      style={styles.planItem}
      onPress={() => router.push(`/haccp/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.planHeader}>
        <View style={styles.planIconContainer}>
          <ShieldCheck size={20} color={colors.primary} />
        </View>
        <View style={[
          styles.statusBadge,
          item.active ? styles.statusActive : styles.statusInactive
        ]}>
          <Text style={styles.statusText}>{item.active ? 'Active' : 'Inactive'}</Text>
        </View>
      </View>
      
      <Text style={styles.planName}>{item.name}</Text>
      
      <Text style={styles.planDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.planDetails}>
        <View style={styles.planDetailItem}>
          <Text style={styles.planDetailLabel}>Product:</Text>
          <Text style={styles.planDetailValue}>{item.product}</Text>
        </View>
        
        <View style={styles.planDetailItem}>
          <Text style={styles.planDetailLabel}>CCPs:</Text>
          <Text style={styles.planDetailValue}>{item.criticalControlPoints.length}</Text>
        </View>
        
        <View style={styles.planDetailItem}>
          <Text style={styles.planDetailLabel}>Hazards:</Text>
          <Text style={styles.planDetailValue}>{item.hazards.length}</Text>
        </View>
      </View>
      
      <View style={styles.planFooter}>
        <Text style={styles.planDate}>
          Updated: {formatDate(item.updatedAt)}
        </Text>
        <ChevronRight size={16} color={colors.gray} />
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>HACCP Plans</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/haccp/new')}
            activeOpacity={0.7}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.filterContainer}>
          {renderFilterButton('Active', 'active')}
          {renderFilterButton('All', 'all')}
        </View>
        
        <FlatList
          data={getFilteredPlans()}
          keyExtractor={(item) => item.id}
          renderItem={renderPlanItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.plansList}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <ShieldCheck size={48} color={colors.grayLight} />
              <Text style={styles.emptyStateTitle}>No HACCP Plans</Text>
              <Text style={styles.emptyStateText}>
                Create your first HACCP plan to track critical control points and ensure food safety.
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/haccp/new')}
              >
                <Text style={styles.emptyStateButtonText}>Create HACCP Plan</Text>
              </TouchableOpacity>
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
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
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
  plansList: {
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  planItem: {
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
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  planIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: colors.successLight + '30',
    borderColor: colors.success,
  },
  statusInactive: {
    backgroundColor: colors.grayLight,
    borderColor: colors.gray,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  planDetails: {
    marginBottom: 12,
  },
  planDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  planDetailLabel: {
    fontSize: 14,
    color: colors.gray,
    marginRight: 4,
    width: 70,
  },
  planDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 12,
  },
  planDate: {
    fontSize: 12,
    color: colors.gray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.white,
    borderRadius: 12,
    marginTop: 24,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyStateButton: {
    backgroundColor: colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
});