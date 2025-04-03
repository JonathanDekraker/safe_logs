import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import { SanitationLog, SanitationTask } from '@/types';
import { formatDate, formatDateTime } from '@/utils/dateUtils';
import { Calendar, Check, Clock, Edit, Trash, User } from 'lucide-react-native';

export default function SanitationTaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sanitationTasks, sanitationLogs, completeSanitationTask, deleteSanitationTask } = useAppStore();
  
  const [task, setTask] = useState<SanitationTask | null>(null);
  const [logs, setLogs] = useState<SanitationLog[]>([]);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [completedBy, setCompletedBy] = useState('');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    if (!id) return;
    
    const foundTask = sanitationTasks.find(t => t.id === id);
    if (foundTask) {
      setTask(foundTask);
      
      // Pre-fill the completed by field if task has assignedTo
      if (foundTask.assignedTo) {
        setCompletedBy(foundTask.assignedTo);
      }
      
      // Get logs for this task
      const taskLogs = sanitationLogs.filter(log => log.taskId === id);
      setLogs(taskLogs.sort((a, b) => b.timestamp - a.timestamp)); // Sort by newest first
    }
  }, [id, sanitationTasks, sanitationLogs]);
  
  const handleComplete = useCallback(() => {
    if (!task || !completedBy.trim()) return;
    
    completeSanitationTask(task.id, {
      completedBy: completedBy.trim(),
      notes: notes.trim() || undefined,
    });
    
    setShowCompleteForm(false);
    setNotes('');
  }, [task, completedBy, notes, completeSanitationTask]);
  
  const handleDelete = useCallback(() => {
    if (!task) return;
    
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this sanitation task? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteSanitationTask(task.id);
            router.back();
          },
        },
      ]
    );
  }, [task, deleteSanitationTask, router]);
  
  const getTaskStatus = useCallback((task: SanitationTask) => {
    const now = Date.now();
    
    if (task.nextDue < now) {
      return 'Overdue';
    }
    
    if (task.nextDue < now + 24 * 60 * 60 * 1000) {
      return 'Due Today';
    }
    
    return 'Upcoming';
  }, []);
  
  if (!task) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Sanitation Task',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push(`/sanitation/edit/${task.id}`)}
              >
                <Edit size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleDelete}
              >
                <Trash size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.taskHeader}>
            <Text style={styles.taskName}>{task.name}</Text>
            <View style={[
              styles.statusBadge,
              task.nextDue < Date.now() ? styles.statusOverdue : 
              task.nextDue < Date.now() + 24 * 60 * 60 * 1000 ? styles.statusDueSoon : 
              styles.statusUpcoming
            ]}>
              <Text style={styles.statusText}>{getTaskStatus(task)}</Text>
            </View>
          </View>
          
          {task.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{task.description}</Text>
            </View>
          )}
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Calendar size={16} color={colors.gray} />
                <Text style={styles.infoLabel}>Next Due:</Text>
                <Text style={styles.infoValue}>{formatDate(task.nextDue)}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Clock size={16} color={colors.gray} />
                <Text style={styles.infoLabel}>Frequency:</Text>
                <Text style={styles.infoValue}>
                  {task.frequency === 'custom' 
                    ? `Every ${task.customDays} days` 
                    : task.frequency.charAt(0).toUpperCase() + task.frequency.slice(1)}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <User size={16} color={colors.gray} />
                <Text style={styles.infoLabel}>Assigned To:</Text>
                <Text style={styles.infoValue}>{task.assignedTo || 'Unassigned'}</Text>
              </View>
              
              {task.lastCompleted && (
                <View style={styles.infoItem}>
                  <Check size={16} color={colors.gray} />
                  <Text style={styles.infoLabel}>Last Done:</Text>
                  <Text style={styles.infoValue}>{formatDate(task.lastCompleted)}</Text>
                </View>
              )}
            </View>
          </View>
          
          {!showCompleteForm ? (
            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => setShowCompleteForm(true)}
            >
              <Check size={20} color={colors.white} />
              <Text style={styles.completeButtonText}>Mark as Completed</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.completeForm}>
              <Text style={styles.completeFormTitle}>Complete Task</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Completed By*</Text>
                <TextInput
                  style={styles.input}
                  value={completedBy}
                  onChangeText={setCompletedBy}
                  placeholder="Enter your name"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Notes</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Add any notes about this task completion"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.cancelButton]}
                  onPress={() => setShowCompleteForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.formButton, 
                    styles.submitButton,
                    !completedBy.trim() && styles.disabledButton,
                  ]}
                  onPress={handleComplete}
                  disabled={!completedBy.trim()}
                >
                  <Text style={styles.submitButtonText}>Complete</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <View style={styles.logsContainer}>
            <Text style={styles.logsTitle}>Completion History</Text>
            
            {logs.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No completion records yet</Text>
              </View>
            ) : (
              <FlatList
                data={logs}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.logItem}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logCompletedBy}>{item.completedBy}</Text>
                      <Text style={styles.logTimestamp}>{formatDateTime(item.timestamp)}</Text>
                    </View>
                    
                    {item.notes && (
                      <Text style={styles.logNotes}>{item.notes}</Text>
                    )}
                  </View>
                )}
                scrollEnabled={false}
              />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  taskName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusOverdue: {
    backgroundColor: colors.dangerLight + '30',
    borderColor: colors.danger,
  },
  statusDueSoon: {
    backgroundColor: colors.warningLight + '30',
    borderColor: colors.warning,
  },
  statusUpcoming: {
    backgroundColor: colors.successLight + '30',
    borderColor: colors.success,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  descriptionContainer: {
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
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  infoCard: {
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
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray,
    marginLeft: 4,
    marginRight: 4,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  completeForm: {
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
  completeFormTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
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
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
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
    backgroundColor: colors.success,
  },
  disabledButton: {
    backgroundColor: colors.grayLight,
    opacity: 0.7,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '500',
  },
  logsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  logsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  emptyState: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
  },
  logItem: {
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
    paddingVertical: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  logCompletedBy: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  logTimestamp: {
    fontSize: 12,
    color: colors.gray,
  },
  logNotes: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: 4,
  },
});