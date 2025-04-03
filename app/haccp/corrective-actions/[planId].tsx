import React, { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useHACCPStore } from '@/store/haccp-store';
import { CorrectiveActionLog, HACCPPlan } from '@/types/haccp';
import { formatDateTime } from '@/utils/dateUtils';
import { AlertTriangle, Check, ChevronRight, FileText, Plus } from 'lucide-react-native';

export default function CorrectiveActionsScreen() {
  const { planId } = useLocalSearchParams<{ planId: string }>();
  const router = useRouter();
  const { plans, correctiveActionLogs, addCorrectiveActionLog, verifyCorrectiveAction, completeFollowUp } = useHACCPStore();
  
  const [plan, setPlan] = useState<HACCPPlan | null>(null);
  const [logs, setLogs] = useState<CorrectiveActionLog[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified'>('all');
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedCCP, setSelectedCCP] = useState<string>('');
  const [description, setDescription] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [takenBy, setTakenBy] = useState('');
  const [followUpRequired, setFollowUpRequired] = useState(false);
  const [followUpDescription, setFollowUpDescription] = useState('');
  
  // Verification form
  const [showVerifyForm, setShowVerifyForm] = useState<string | null>(null);
  const [verifiedBy, setVerifiedBy] = useState('');
  
  // Follow-up form
  const [showFollowUpForm, setShowFollowUpForm] = useState<string | null>(null);
  const [followUpCompletedBy, setFollowUpCompletedBy] = useState('');
  const [followUpCompletionNotes, setFollowUpCompletionNotes] = useState('');
  
  const [errors, setErrors] = useState<{
    selectedCCP?: string;
    description?: string;
    actionTaken?: string;
    takenBy?: string;
    followUpDescription?: string;
    verifiedBy?: string;
    followUpCompletedBy?: string;
  }>({});
  
  useEffect(() => {
    if (!planId) return;
    
    const foundPlan = plans.find(p => p.id === planId);
    if (foundPlan) {
      setPlan(foundPlan);
      
      if (foundPlan.criticalControlPoints.length > 0) {
        setSelectedCCP(foundPlan.criticalControlPoints[0].id);
      }
    }
    
    // Get corrective action logs for this plan
    const planLogs = correctiveActionLogs.filter(log => {
      // Check if the log's CCP belongs to this plan
      return foundPlan?.criticalControlPoints.some(ccp => ccp.id === log.ccpId);
    });
    
    setLogs(planLogs.sort((a, b) => b.timestamp - a.timestamp)); // Sort by newest first
    
  }, [planId, plans, correctiveActionLogs]);
  
  const getFilteredLogs = useCallback(() => {
    if (filter === 'pending') {
      return logs.filter(log => !log.verified);
    } else if (filter === 'verified') {
      return logs.filter(log => log.verified);
    }
    return logs;
  }, [logs, filter]);
  
  const validateForm = () => {
    const newErrors: {
      selectedCCP?: string;
      description?: string;
      actionTaken?: string;
      takenBy?: string;
      followUpDescription?: string;
    } = {};
    
    if (!selectedCCP) {
      newErrors.selectedCCP = 'Please select a CCP';
    }
    
    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!actionTaken.trim()) {
      newErrors.actionTaken = 'Action taken is required';
    }
    
    if (!takenBy.trim()) {
      newErrors.takenBy = 'Name is required';
    }
    
    if (followUpRequired && !followUpDescription.trim()) {
      newErrors.followUpDescription = 'Follow-up description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const validateVerifyForm = () => {
    if (!verifiedBy.trim()) {
      setErrors({ ...errors, verifiedBy: 'Name is required' });
      return false;
    }
    return true;
  };
  
  const validateFollowUpForm = () => {
    if (!followUpCompletedBy.trim()) {
      setErrors({ ...errors, followUpCompletedBy: 'Name is required' });
      return false;
    }
    return true;
  };
  
  const handleAddCorrectiveAction = () => {
    if (!validateForm()) return;
    
    addCorrectiveActionLog({
      ccpId: selectedCCP,
      description: description.trim(),
      actionTaken: actionTaken.trim(),
      takenBy: takenBy.trim(),
      followUpRequired,
      followUpDescription: followUpRequired ? followUpDescription.trim() : undefined
    });
    
    // Reset form
    setShowAddForm(false);
    setDescription('');
    setActionTaken('');
    setTakenBy('');
    setFollowUpRequired(false);
    setFollowUpDescription('');
  };
  
  const handleVerifyAction = (logId: string) => {
    if (!validateVerifyForm()) return;
    
    verifyCorrectiveAction(logId, verifiedBy.trim());
    setShowVerifyForm(null);
    setVerifiedBy('');
  };
  
  const handleCompleteFollowUp = (logId: string) => {
    if (!validateFollowUpForm()) return;
    
    completeFollowUp(logId, followUpCompletedBy.trim(), followUpCompletionNotes.trim() || undefined);
    setShowFollowUpForm(null);
    setFollowUpCompletedBy('');
    setFollowUpCompletionNotes('');
  };
  
  const renderFilterButton = (label: string, value: 'all' | 'pending' | 'verified') => (
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
  
  if (!plan) {
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
      <Stack.Screen options={{ title: 'Corrective Actions' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Corrective Actions</Text>
            <Text style={styles.subtitle}>{plan.name}</Text>
          </View>
          
          {!showAddForm ? (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddForm(true)}
            >
              <Plus size={20} color={colors.white} />
              <Text style={styles.addButtonText}>Add Corrective Action</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.actionForm}>
              <Text style={styles.formTitle}>New Corrective Action</Text>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Critical Control Point*</Text>
                {plan.criticalControlPoints.length > 0 ? (
                  <View style={styles.ccpSelector}>
                    {plan.criticalControlPoints.map(ccp => (
                      <TouchableOpacity
                        key={ccp.id}
                        style={[
                          styles.ccpOption,
                          selectedCCP === ccp.id && styles.ccpOptionSelected
                        ]}
                        onPress={() => setSelectedCCP(ccp.id)}
                      >
                        <Text
                          style={[
                            styles.ccpOptionText,
                            selectedCCP === ccp.id && styles.ccpOptionTextSelected
                          ]}
                        >
                          {ccp.step}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noCCPsText}>No CCPs defined for this plan</Text>
                )}
                {errors.selectedCCP && <Text style={styles.errorText}>{errors.selectedCCP}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description*</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.description && styles.inputError]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Describe the deviation or issue"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Action Taken*</Text>
                <TextInput
                  style={[styles.input, styles.textArea, errors.actionTaken && styles.inputError]}
                  value={actionTaken}
                  onChangeText={setActionTaken}
                  placeholder="Describe the corrective action taken"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
                {errors.actionTaken && <Text style={styles.errorText}>{errors.actionTaken}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Taken By*</Text>
                <TextInput
                  style={[styles.input, errors.takenBy && styles.inputError]}
                  value={takenBy}
                  onChangeText={setTakenBy}
                  placeholder="Enter your name"
                />
                {errors.takenBy && <Text style={styles.errorText}>{errors.takenBy}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[styles.checkbox, followUpRequired && styles.checkboxChecked]}
                    onPress={() => setFollowUpRequired(!followUpRequired)}
                  >
                    {followUpRequired && <Check size={16} color={colors.white} />}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>Follow-up required</Text>
                </View>
                
                {followUpRequired && (
                  <View style={styles.followUpContainer}>
                    <Text style={styles.followUpLabel}>Follow-up Description*</Text>
                    <TextInput
                      style={[styles.input, styles.textArea, errors.followUpDescription && styles.inputError]}
                      value={followUpDescription}
                      onChangeText={setFollowUpDescription}
                      placeholder="Describe the required follow-up"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                    {errors.followUpDescription && <Text style={styles.errorText}>{errors.followUpDescription}</Text>}
                  </View>
                )}
              </View>
              
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddForm(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddCorrectiveAction}
                >
                  <Text style={styles.submitButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          
          <View style={styles.filterContainer}>
            {renderFilterButton('All', 'all')}
            {renderFilterButton('Pending', 'pending')}
            {renderFilterButton('Verified', 'verified')}
          </View>
          
          <View style={styles.logsContainer}>
            {getFilteredLogs().length === 0 ? (
              <View style={styles.emptyState}>
                <FileText size={24} color={colors.gray} />
                <Text style={styles.emptyStateText}>No corrective actions found</Text>
              </View>
            ) : (
              getFilteredLogs().map(log => {
                const ccp = plan.criticalControlPoints.find(c => c.id === log.ccpId);
                
                return (
                  <View key={log.id} style={styles.logItem}>
                    <View style={styles.logHeader}>
                      <Text style={styles.logTimestamp}>{formatDateTime(log.timestamp)}</Text>
                      <View style={[
                        styles.logStatus,
                        log.verified ? styles.logStatusVerified : styles.logStatusPending
                      ]}>
                        <Text style={styles.logStatusText}>
                          {log.verified ? 'Verified' : 'Pending Verification'}
                        </Text>
                      </View>
                    </View>
                    
                    <Text style={styles.logCCP}>{ccp ? ccp.step : 'Unknown CCP'}</Text>
                    <Text style={styles.logTakenBy}>Action by: {log.takenBy}</Text>
                    
                    <View style={styles.logSection}>
                      <Text style={styles.logSectionLabel}>Description:</Text>
                      <Text style={styles.logSectionText}>{log.description}</Text>
                    </View>
                    
                    <View style={styles.logSection}>
                      <Text style={styles.logSectionLabel}>Action Taken:</Text>
                      <Text style={styles.logSectionText}>{log.actionTaken}</Text>
                    </View>
                    
                    {log.followUpRequired && (
                      <View style={styles.followUpSection}>
                        <View style={styles.followUpHeader}>
                          <Text style={styles.followUpTitle}>Follow-up Required</Text>
                          {log.followUpCompleted ? (
                            <View style={styles.followUpStatus}>
                              <Check size={12} color={colors.success} />
                              <Text style={[styles.followUpStatusText, { color: colors.success }]}>
                                Completed
                              </Text>
                            </View>
                          ) : (
                            <View style={[styles.followUpStatus, styles.followUpStatusPending]}>
                              <AlertTriangle size={12} color={colors.warning} />
                              <Text style={[styles.followUpStatusText, { color: colors.warning }]}>
                                Pending
                              </Text>
                            </View>
                          )}
                        </View>
                        
                        <Text style={styles.followUpDescription}>
                          {log.followUpDescription}
                        </Text>
                        
                        {log.followUpCompleted && log.followUpCompletedBy && (
                          <View style={styles.followUpCompletion}>
                            <Text style={styles.followUpCompletionText}>
                              Completed by {log.followUpCompletedBy} on {formatDateTime(log.followUpCompletedAt!)}
                            </Text>
                            {log.followUpDescription && (
                              <Text style={styles.followUpCompletionNotes}>
                                {log.followUpDescription}
                              </Text>
                            )}
                          </View>
                        )}
                      </View>
                    )}
                    
                    {log.verified ? (
                      <View style={styles.logVerification}>
                        <Text style={styles.logVerificationText}>
                          Verified by {log.verifiedBy} on {formatDateTime(log.verifiedAt!)}
                        </Text>
                      </View>
                    ) : (
                      <View style={styles.logActions}>
                        {showVerifyForm === log.id ? (
                          <View style={styles.verifyForm}>
                            <Text style={styles.verifyFormLabel}>Verified By*</Text>
                            <TextInput
                              style={[styles.input, errors.verifiedBy && styles.inputError]}
                              value={verifiedBy}
                              onChangeText={setVerifiedBy}
                              placeholder="Enter your name"
                            />
                            {errors.verifiedBy && <Text style={styles.errorText}>{errors.verifiedBy}</Text>}
                            
                            <View style={styles.verifyFormButtons}>
                              <TouchableOpacity
                                style={styles.verifyFormCancel}
                                onPress={() => {
                                  setShowVerifyForm(null);
                                  setVerifiedBy('');
                                  setErrors({ ...errors, verifiedBy: undefined });
                                }}
                              >
                                <Text style={styles.verifyFormCancelText}>Cancel</Text>
                              </TouchableOpacity>
                              
                              <TouchableOpacity
                                style={styles.verifyFormSubmit}
                                onPress={() => handleVerifyAction(log.id)}
                              >
                                <Text style={styles.verifyFormSubmitText}>Verify</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.verifyButton}
                            onPress={() => setShowVerifyForm(log.id)}
                          >
                            <Check size={16} color={colors.success} />
                            <Text style={styles.verifyButtonText}>Verify</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                    
                    {log.followUpRequired && !log.followUpCompleted && (
                      <View style={styles.logActions}>
                        {showFollowUpForm === log.id ? (
                          <View style={styles.followUpForm}>
                            <Text style={styles.followUpFormLabel}>Completed By*</Text>
                            <TextInput
                              style={[styles.input, errors.followUpCompletedBy && styles.inputError]}
                              value={followUpCompletedBy}
                              onChangeText={setFollowUpCompletedBy}
                              placeholder="Enter your name"
                            />
                            {errors.followUpCompletedBy && <Text style={styles.errorText}>{errors.followUpCompletedBy}</Text>}
                            
                            <Text style={styles.followUpFormLabel}>Notes (Optional)</Text>
                            <TextInput
                              style={[styles.input, styles.textArea]}
                              value={followUpCompletionNotes}
                              onChangeText={setFollowUpCompletionNotes}
                              placeholder="Add any notes about the follow-up completion"
                              multiline
                              numberOfLines={3}
                              textAlignVertical="top"
                            />
                            
                            <View style={styles.followUpFormButtons}>
                              <TouchableOpacity
                                style={styles.followUpFormCancel}
                                onPress={() => {
                                  setShowFollowUpForm(null);
                                  setFollowUpCompletedBy('');
                                  setFollowUpCompletionNotes('');
                                  setErrors({ ...errors, followUpCompletedBy: undefined });
                                }}
                              >
                                <Text style={styles.followUpFormCancelText}>Cancel</Text>
                              </TouchableOpacity>
                              
                              <TouchableOpacity
                                style={styles.followUpFormSubmit}
                                onPress={() => handleCompleteFollowUp(log.id)}
                              >
                                <Text style={styles.followUpFormSubmitText}>Complete</Text>
                              </TouchableOpacity>
                            </View>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.completeButton}
                            onPress={() => setShowFollowUpForm(log.id)}
                          >
                            <Check size={16} color={colors.primary} />
                            <Text style={styles.completeButtonText}>Complete Follow-up</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                );
              })
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
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  addButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
  actionForm: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
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
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  ccpSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  ccpOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.grayLight,
    margin: 4,
  },
  ccpOptionSelected: {
    backgroundColor: colors.primary,
  },
  ccpOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  ccpOptionTextSelected: {
    color: colors.white,
  },
  noCCPsText: {
    fontSize: 16,
    color: colors.gray,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkboxLabel: {
    fontSize: 16,
    color: colors.text,
  },
  followUpContainer: {
    marginTop: 8,
  },
  followUpLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.grayLight,
    marginRight: 8,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '500',
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
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 8,
  },
  logItem: {
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
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logTimestamp: {
    fontSize: 14,
    color: colors.gray,
  },
  logStatus: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
  },
  logStatusVerified: {
    backgroundColor: colors.successLight + '30',
    borderColor: colors.success,
  },
  logStatusPending: {
    backgroundColor: colors.warningLight + '30',
    borderColor: colors.warning,
  },
  logStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  logCCP: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  logTakenBy: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 12,
  },
  logSection: {
    marginBottom: 12,
  },
  logSectionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  logSectionText: {
    fontSize: 14,
    color: colors.text,
  },
  followUpSection: {
    backgroundColor: colors.grayLight + '50',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  followUpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  followUpTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  followUpStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followUpStatusPending: {
    backgroundColor: colors.warningLight + '20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  followUpStatusText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
  followUpDescription: {
    fontSize: 14,
    color: colors.text,
  },
  followUpCompletion: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
  },
  followUpCompletionText: {
    fontSize: 12,
    color: colors.gray,
    fontStyle: 'italic',
  },
  followUpCompletionNotes: {
    fontSize: 14,
    color: colors.text,
    marginTop: 4,
  },
  logVerification: {
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 12,
  },
  logVerificationText: {
    fontSize: 14,
    color: colors.gray,
    fontStyle: 'italic',
  },
  logActions: {
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 12,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.successLight + '30',
  },
  verifyButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.success,
    marginLeft: 4,
  },
  verifyForm: {
    marginTop: 8,
  },
  verifyFormLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  verifyFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  verifyFormCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.grayLight,
    marginRight: 8,
  },
  verifyFormCancelText: {
    fontSize: 14,
    color: colors.text,
  },
  verifyFormSubmit: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.success,
  },
  verifyFormSubmitText: {
    fontSize: 14,
    color: colors.white,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primaryLight + '30',
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
    marginLeft: 4,
  },
  followUpForm: {
    marginTop: 8,
  },
  followUpFormLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 4,
  },
  followUpFormButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  followUpFormCancel: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.grayLight,
    marginRight: 8,
  },
  followUpFormCancelText: {
    fontSize: 14,
    color: colors.text,
  },
  followUpFormSubmit: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  followUpFormSubmitText: {
    fontSize: 14,
    color: colors.white,
  },
});