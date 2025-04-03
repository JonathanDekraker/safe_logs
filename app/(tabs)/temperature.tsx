import React, { useCallback, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import TemperatureInput from '@/components/TemperatureInput';
import TemperatureLogItem from '@/components/TemperatureLogItem';
import { isToday } from '@/utils/dateUtils';
import AddEquipmentForm from '@/components/AddEquipmentForm';
import { Equipment } from '@/types';
import { Plus } from 'lucide-react-native';

export default function TemperatureScreen() {
  const { equipment, temperatureLogs, addTemperatureLog, addEquipment } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'today' | 'issues'>('today');
  const [showAddEquipment, setShowAddEquipment] = useState(false);

  const handleAddTemperatureLog = useCallback((equipmentId: string, temperature: number) => {
    addTemperatureLog({ equipmentId, temperature });
  }, [addTemperatureLog]);

  const handleAddEquipment = useCallback((newEquipment: Omit<Equipment, 'id'>) => {
    addEquipment(newEquipment);
    setShowAddEquipment(false);
  }, [addEquipment]);

  const getFilteredLogs = useCallback(() => {
    if (filter === 'today') {
      return temperatureLogs.filter(log => isToday(log.timestamp));
    } else if (filter === 'issues') {
      return temperatureLogs.filter(log => !log.isWithinRange);
    }
    return temperatureLogs;
  }, [temperatureLogs, filter]);

  const filteredLogs = getFilteredLogs();

  const renderFilterButton = (label: string, value: 'all' | 'today' | 'issues') => (
    <View
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
        onPress={() => setFilter(value)}
      >
        {label}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Temperature Logs</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddEquipment(true)}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
        
        {showAddEquipment ? (
          <AddEquipmentForm 
            onSubmit={handleAddEquipment}
            onCancel={() => setShowAddEquipment(false)}
          />
        ) : (
          <TemperatureInput
            equipment={equipment}
            onSubmit={handleAddTemperatureLog}
          />
        )}
        
        <View style={styles.filterContainer}>
          {renderFilterButton('Today', 'today')}
          {renderFilterButton('All', 'all')}
          {renderFilterButton('Issues', 'issues')}
        </View>
        
        <View style={styles.logsContainer}>
          <Text style={styles.logsTitle}>Temperature Logs</Text>
          
          {filteredLogs.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No logs found</Text>
            </View>
          ) : (
            <FlatList
              data={filteredLogs}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TemperatureLogItem
                  log={item}
                  equipment={equipment.find(e => e.id === item.equipmentId)}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.logsList}
            />
          )}
        </View>
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
  logsContainer: {
    flex: 1,
  },
  logsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  logsList: {
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
  },
});