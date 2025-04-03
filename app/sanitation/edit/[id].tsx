import React, { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import { SanitationTask } from '@/types';

type AreaType = SanitationTask['area'];
type FrequencyType = SanitationTask['frequency'];

export default function EditSanitationTaskScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { sanitationTasks, updateSanitationTask } = useAppStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [area, setArea] = useState<AreaType>('kitchen');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  const [customDays, setCustomDays] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [task, setTask] = useState<SanitationTask | null>(null);
  
  const [errors, setErrors] = useState<{
    name?: string;
    customDays?: string;
  }>({});
  
  useEffect(() => {
    if (!id) return;
    
    const foundTask = sanitationTasks.find(t => t.id === id);
    if (foundTask) {
      setTask(foundTask);
      setName(foundTask.name);
      setDescription(foundTask.description || '');
      setArea(foundTask.area);
      setFrequency(foundTask.frequency);
      setCustomDays(foundTask.customDays?.toString() || '');
      setAssignedTo(foundTask.assignedTo || '');
    }
  }, [id, sanitationTasks]);
  
  const validateForm = () => {
    const newErrors: {
      name?: string;
      customDays?: string;
    } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Task name is required';
    }
    
    if (frequency === 'custom') {
      if (!customDays) {
        newErrors.customDays = 'Number of days is required';
      } else if (isNaN(parseInt(customDays)) || parseInt(customDays) <= 0) {
        newErrors.customDays = 'Must be a positive number';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = () => {
    if (!validateForm() || !task) return;
    
    const updatedTask: SanitationTask = {
      ...task,
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      customDays: frequency === 'custom' ? parseInt(customDays) : undefined,
      area,
      assignedTo: assignedTo.trim() || undefined,
    };
    
    updateSanitationTask(updatedTask);
    router.back();
  };
  
  const renderAreaButton = (label: string, value: AreaType) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        area === value && styles.optionButtonActive,
      ]}
      onPress={() => setArea(value)}
    >
      <Text
        style={[
          styles.optionButtonText,
          area === value && styles.optionButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
  const renderFrequencyButton = (label: string, value: FrequencyType) => (
    <TouchableOpacity
      style={[
        styles.optionButton,
        frequency === value && styles.optionButtonActive,
      ]}
      onPress={() => setFrequency(value)}
    >
      <Text
        style={[
          styles.optionButtonText,
          frequency === value && styles.optionButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
  
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
      <Stack.Screen options={{ title: 'Edit Sanitation Task' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Task Name*</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Clean prep surfaces"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter detailed instructions for this task"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Area</Text>
            <View style={styles.optionsContainer}>
              {renderAreaButton('Kitchen', 'kitchen')}
              {renderAreaButton('Dining', 'dining')}
              {renderAreaButton('Storage', 'storage')}
              {renderAreaButton('Restroom', 'restroom')}
              {renderAreaButton('Exterior', 'exterior')}
              {renderAreaButton('Other', 'other')}
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Frequency</Text>
            <View style={styles.optionsContainer}>
              {renderFrequencyButton('Daily', 'daily')}
              {renderFrequencyButton('Weekly', 'weekly')}
              {renderFrequencyButton('Monthly', 'monthly')}
              {renderFrequencyButton('Quarterly', 'quarterly')}
              {renderFrequencyButton('Custom', 'custom')}
            </View>
            
            {frequency === 'custom' && (
              <View style={styles.customFrequency}>
                <Text style={styles.customFrequencyLabel}>Repeat every</Text>
                <TextInput
                  style={[
                    styles.customFrequencyInput,
                    errors.customDays && styles.inputError,
                  ]}
                  value={customDays}
                  onChangeText={setCustomDays}
                  keyboardType="numeric"
                  placeholder="14"
                />
                <Text style={styles.customFrequencyLabel}>days</Text>
                {errors.customDays && (
                  <Text style={styles.errorText}>{errors.customDays}</Text>
                )}
              </View>
            )}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Assigned To</Text>
            <TextInput
              style={styles.input}
              value={assignedTo}
              onChangeText={setAssignedTo}
              placeholder="e.g., Kitchen Staff"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => router.back()}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.submitButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.submitButtonText}>Save Changes</Text>
            </TouchableOpacity>
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
  formGroup: {
    marginBottom: 20,
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
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  optionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.grayLight,
    margin: 4,
  },
  optionButtonActive: {
    backgroundColor: colors.primary,
  },
  optionButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  optionButtonTextActive: {
    color: colors.white,
  },
  customFrequency: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  customFrequencyLabel: {
    fontSize: 16,
    color: colors.text,
    marginRight: 8,
  },
  customFrequencyInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.white,
    width: 60,
    marginRight: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 12,
  },
  cancelButton: {
    backgroundColor: colors.grayLight,
  },
  cancelButtonText: {
    color: colors.text,
    fontWeight: '500',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: colors.primary,
  },
  submitButtonText: {
    color: colors.white,
    fontWeight: '500',
    fontSize: 16,
  },
});