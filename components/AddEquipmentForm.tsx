import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { Equipment } from '@/types';
import { X } from 'lucide-react-native';

interface AddEquipmentFormProps {
  onSubmit: (equipment: Omit<Equipment, 'id'>) => void;
  onCancel: () => void;
}

export default function AddEquipmentForm({ onSubmit, onCancel }: AddEquipmentFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'cooler' | 'freezer'>('cooler');
  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    minTemp?: string;
    maxTemp?: string;
  }>({});

  const validateForm = () => {
    const newErrors: {
      name?: string;
      minTemp?: string;
      maxTemp?: string;
    } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!minTemp) {
      newErrors.minTemp = 'Minimum temperature is required';
    } else if (isNaN(parseFloat(minTemp))) {
      newErrors.minTemp = 'Must be a valid number';
    }
    
    if (!maxTemp) {
      newErrors.maxTemp = 'Maximum temperature is required';
    } else if (isNaN(parseFloat(maxTemp))) {
      newErrors.maxTemp = 'Must be a valid number';
    } else if (parseFloat(maxTemp) <= parseFloat(minTemp)) {
      newErrors.maxTemp = 'Max temp must be greater than min temp';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit({
        name: name.trim(),
        type,
        minTemp: parseFloat(minTemp),
        maxTemp: parseFloat(maxTemp),
      });
      
      // Reset form
      setName('');
      setType('cooler');
      setMinTemp('');
      setMaxTemp('');
      setErrors({});
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Add New Equipment</Text>
        <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
          <X size={20} color={colors.gray} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="e.g., Prep Area Cooler"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
      </View>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Type</Text>
        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'cooler' && styles.typeButtonActive,
            ]}
            onPress={() => setType('cooler')}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'cooler' && styles.typeButtonTextActive,
              ]}
            >
              Cooler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.typeButton,
              type === 'freezer' && styles.typeButtonActive,
            ]}
            onPress={() => setType('freezer')}
          >
            <Text
              style={[
                styles.typeButtonText,
                type === 'freezer' && styles.typeButtonTextActive,
              ]}
            >
              Freezer
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.tempContainer}>
        <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Min Temp (°F)</Text>
          <TextInput
            style={[styles.input, errors.minTemp && styles.inputError]}
            value={minTemp}
            onChangeText={setMinTemp}
            placeholder={type === 'cooler' ? "32" : "-10"}
            keyboardType="numeric"
          />
          {errors.minTemp && <Text style={styles.errorText}>{errors.minTemp}</Text>}
        </View>
        
        <View style={[styles.formGroup, { flex: 1 }]}>
          <Text style={styles.label}>Max Temp (°F)</Text>
          <TextInput
            style={[styles.input, errors.maxTemp && styles.inputError]}
            value={maxTemp}
            onChangeText={setMaxTemp}
            placeholder={type === 'cooler' ? "41" : "0"}
            keyboardType="numeric"
          />
          {errors.maxTemp && <Text style={styles.errorText}>{errors.maxTemp}</Text>}
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
        >
          <Text style={styles.submitButtonText}>Add Equipment</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  closeButton: {
    padding: 4,
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
  },
  inputError: {
    borderColor: colors.danger,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  typeSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  typeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  tempContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  button: {
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
});