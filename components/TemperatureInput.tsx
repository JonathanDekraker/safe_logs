import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { Equipment } from '@/types';
import { ChevronDown, Thermometer } from 'lucide-react-native';

interface TemperatureInputProps {
  equipment: Equipment[];
  onSubmit: (equipmentId: string, temperature: number) => void;
}

export default function TemperatureInput({ equipment, onSubmit }: TemperatureInputProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    equipment.length > 0 ? equipment[0] : null
  );
  const [temperature, setTemperature] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    if (!selectedEquipment) {
      setError('Please select equipment');
      return;
    }

    const tempValue = parseFloat(temperature);
    if (isNaN(tempValue)) {
      setError('Please enter a valid temperature');
      return;
    }

    onSubmit(selectedEquipment.id, tempValue);
    setTemperature('');
    setError('');
  };

  const isOutOfRange = () => {
    if (!selectedEquipment || temperature === '') return false;
    
    const tempValue = parseFloat(temperature);
    return (
      tempValue < selectedEquipment.minTemp || 
      tempValue > selectedEquipment.maxTemp
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Record Temperature</Text>
      
      {/* Equipment Selector */}
      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <Text style={styles.dropdownText}>
          {selectedEquipment ? selectedEquipment.name : 'Select Equipment'}
        </Text>
        <ChevronDown size={20} color={colors.gray} />
      </TouchableOpacity>
      
      {showDropdown && (
        <View style={styles.dropdownMenu}>
          {equipment.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.dropdownItem}
              onPress={() => {
                setSelectedEquipment(item);
                setShowDropdown(false);
              }}
            >
              <Text style={styles.dropdownItemText}>{item.name}</Text>
              <Text style={styles.dropdownItemType}>
                {item.type === 'cooler' ? 'Cooler' : 'Freezer'} ({item.minTemp}°F - {item.maxTemp}°F)
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      {/* Temperature Input */}
      <View style={styles.inputRow}>
        <View style={[styles.inputContainer, isOutOfRange() && styles.inputError]}>
          <Thermometer size={20} color={isOutOfRange() ? colors.danger : colors.gray} />
          <TextInput
            style={styles.input}
            value={temperature}
            onChangeText={setTemperature}
            placeholder="Temperature"
            keyboardType="numeric"
            returnKeyType="done"
          />
          <Text style={styles.unit}>°F</Text>
        </View>
        
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Record</Text>
        </TouchableOpacity>
      </View>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : isOutOfRange() ? (
        <Text style={styles.errorText}>
          Temperature is outside safe range ({selectedEquipment?.minTemp}°F - {selectedEquipment?.maxTemp}°F)
        </Text>
      ) : null}
      
      {selectedEquipment && (
        <Text style={styles.rangeText}>
          Safe range: {selectedEquipment.minTemp}°F - {selectedEquipment.maxTemp}°F
        </Text>
      )}
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  dropdownText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownMenu: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    marginBottom: 12,
    maxHeight: 200,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    fontSize: 16,
    color: colors.text,
  },
  dropdownItemType: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  inputError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    marginLeft: 8,
  },
  unit: {
    fontSize: 16,
    color: colors.gray,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginBottom: 8,
  },
  rangeText: {
    color: colors.gray,
    fontSize: 14,
  },
});