import React, { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import ChecklistItem from '@/components/ChecklistItem';
import { Checklist } from '@/types';
import { Plus } from 'lucide-react-native';

export default function ChecklistDetailScreen() {
  const { type } = useLocalSearchParams<{ type: string }>();
  const { checklists, updateChecklistItem, addChecklistItem } = useAppStore();
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [newItemText, setNewItemText] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!type) return;
    
    // Find today's checklist of the specified type
    const todayChecklist = checklists.find(
      list => 
        list.type === type && 
        new Date(list.date).toDateString() === new Date().toDateString()
    );
    
    if (todayChecklist) {
      setChecklist(todayChecklist);
    } else {
      // If no checklist exists for today, find the template for this type
      const templateChecklist = checklists.find(list => list.type === type);
      
      if (templateChecklist) {
        // Create a new checklist for today based on the template
        const newChecklist: Checklist = {
          ...templateChecklist,
          id: Date.now().toString(),
          date: Date.now(),
          isCompleted: false,
          items: templateChecklist.items.map(item => ({
            ...item,
            isCompleted: false,
            timestamp: undefined,
          })),
        };
        
        setChecklist(newChecklist);
      }
    }
  }, [type, checklists]);

  const handleToggleItem = useCallback((itemId: string, isCompleted: boolean) => {
    if (!checklist) return;
    updateChecklistItem(checklist.id, itemId, isCompleted);
  }, [checklist, updateChecklistItem]);

  const handleAddItem = useCallback(() => {
    if (!checklist || !type) return;
    
    if (!newItemText.trim()) {
      setError('Please enter a task description');
      return;
    }
    
    addChecklistItem(checklist.id, {
      text: newItemText.trim(),
      isCompleted: false,
    });
    
    setNewItemText('');
    setError('');
    setShowAddForm(false);
  }, [checklist, type, newItemText, addChecklistItem]);

  const getTitle = () => {
    if (!type) return 'Checklist';
    
    switch (type) {
      case 'critical':
        return 'Critical Violations';
      case 'opening':
        return 'Opening Procedures';
      case 'closing':
        return 'Closing Procedures';
      default:
        return 'Checklist';
    }
  };

  const getCompletionStatus = () => {
    if (!checklist) return { completed: 0, total: 0 };
    
    const completed = checklist.items.filter(item => item.isCompleted).length;
    return { completed, total: checklist.items.length };
  };

  return (
    <>
      <Stack.Screen options={{ title: getTitle() }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{getTitle()}</Text>
            <Text style={styles.subtitle}>
              {getCompletionStatus().completed}/{getCompletionStatus().total} tasks completed
            </Text>
          </View>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${getCompletionStatus().total === 0 
                      ? 0 
                      : (getCompletionStatus().completed / getCompletionStatus().total) * 100}%` 
                  }
                ]} 
              />
            </View>
          </View>
          
          <View style={styles.checklistContainer}>
            {checklist?.items.map(item => (
              <ChecklistItem
                key={item.id}
                item={item}
                onToggle={handleToggleItem}
              />
            ))}
            
            {showAddForm ? (
              <View style={styles.addItemForm}>
                <TextInput
                  style={[styles.addItemInput, error ? styles.inputError : null]}
                  value={newItemText}
                  onChangeText={setNewItemText}
                  placeholder="Enter new task..."
                  multiline
                  autoFocus
                />
                {error ? <Text style={styles.errorText}>{error}</Text> : null}
                <View style={styles.addItemButtons}>
                  <TouchableOpacity 
                    style={[styles.addItemButton, styles.cancelButton]} 
                    onPress={() => {
                      setShowAddForm(false);
                      setNewItemText('');
                      setError('');
                    }}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.addItemButton, styles.addButton]} 
                    onPress={handleAddItem}
                  >
                    <Text style={styles.addButtonText}>Add Task</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.addItemTrigger}
                onPress={() => setShowAddForm(true)}
              >
                <Plus size={20} color={colors.primary} />
                <Text style={styles.addItemTriggerText}>Add New Task</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.grayLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  checklistContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  addItemTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    marginTop: 8,
  },
  addItemTriggerText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.primary,
    fontWeight: '500',
  },
  addItemForm: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 16,
  },
  addItemInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  addItemButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  addItemButton: {
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
  addButton: {
    backgroundColor: colors.primary,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
});