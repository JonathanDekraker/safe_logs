import React, { useCallback, useState } from 'react';
import { FlatList, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import CoolingLogItem from '@/components/CoolingLogItem';
import { Plus } from 'lucide-react-native';

export default function CoolingScreen() {
  const router = useRouter();
  const { coolingLogs, addCoolingLog } = useAppStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [foodItem, setFoodItem] = useState('');
  const [error, setError] = useState('');

  const handleAddCoolingLog = useCallback(() => {
    if (!foodItem.trim()) {
      setError('Please enter a food item name');
      return;
    }

    const now = Date.now();
    // Target end time is 4 hours from now (standard cooling time)
    const targetEndTime = now + 4 * 60 * 60 * 1000;

    addCoolingLog({
      foodItem: foodItem.trim(),
      startTime: now,
      targetEndTime,
    });

    setFoodItem('');
    setShowAddForm(false);
    setError('');
  }, [foodItem, addCoolingLog]);

  const toggleAddForm = () => {
    setShowAddForm(!showAddForm);
    if (!showAddForm) {
      setFoodItem('');
      setError('');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Cooling Logs</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={toggleAddForm}
            activeOpacity={0.7}
          >
            <Plus size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {showAddForm && (
          <View style={styles.addFormContainer}>
            <Text style={styles.addFormTitle}>New Cooling Log</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Food Item</Text>
              <TextInput
                style={styles.input}
                value={foodItem}
                onChangeText={setFoodItem}
                placeholder="Enter food item name"
                placeholderTextColor={colors.gray}
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>
            
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, styles.cancelButton]}
                onPress={toggleAddForm}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.formButton, styles.submitButton]}
                onPress={handleAddCoolingLog}
              >
                <Text style={styles.submitButtonText}>Start Log</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.logsContainer}>
          <Text style={styles.sectionTitle}>Active Logs</Text>
          
          {coolingLogs.filter(log => !log.isCompleted).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No active cooling logs</Text>
            </View>
          ) : (
            <FlatList
              data={coolingLogs.filter(log => !log.isCompleted)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CoolingLogItem
                  log={item}
                  onPress={() => router.push(`/cooling/${item.id}`)}
                />
              )}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.logsList}
            />
          )}
          
          <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Completed Logs</Text>
          
          {coolingLogs.filter(log => log.isCompleted).length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No completed cooling logs</Text>
            </View>
          ) : (
            <FlatList
              data={coolingLogs.filter(log => log.isCompleted)}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <CoolingLogItem
                  log={item}
                  onPress={() => router.push(`/cooling/${item.id}`)}
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
  addFormContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: colors.text,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  formButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: colors.grayLight,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  logsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  logsList: {
    paddingBottom: Platform.OS === 'ios' ? 16 : 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
  },
});