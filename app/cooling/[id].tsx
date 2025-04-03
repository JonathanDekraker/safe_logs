import React, { useCallback, useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import { CoolingLog } from '@/types';
import { formatDateTime, formatTime } from '@/utils/dateUtils';
import { AlertTriangle, Check, Clock, Thermometer } from 'lucide-react-native';

export default function CoolingLogDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { coolingLogs, addCoolingReading, completeCoolingLog } = useAppStore();
  
  const [log, setLog] = useState<CoolingLog | null>(null);
  const [temperature, setTemperature] = useState('');
  const [error, setError] = useState('');
  
  useEffect(() => {
    if (!id) return;
    
    const foundLog = coolingLogs.find(log => log.id === id);
    if (foundLog) {
      setLog(foundLog);
    }
  }, [id, coolingLogs]);
  
  const handleAddReading = useCallback(() => {
    if (!log) return;
    
    const tempValue = parseFloat(temperature);
    if (isNaN(tempValue)) {
      setError('Please enter a valid temperature');
      return;
    }
    
    addCoolingReading(log.id, tempValue);
    setTemperature('');
    setError('');
  }, [log, temperature, addCoolingReading]);
  
  const handleComplete = useCallback(() => {
    if (!log) return;
    
    completeCoolingLog(log.id);
    router.back();
  }, [log, completeCoolingLog, router]);
  
  const getTimeRemaining = () => {
    if (!log) return null;
    
    const now = Date.now();
    const remaining = log.targetEndTime - now;
    
    if (remaining <= 0) return 'Time expired';
    
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m remaining`;
  };
  
  const isCoolingOnTrack = () => {
    if (!log || log.readings.length < 2) return true;
    
    const lastReading = log.readings[log.readings.length - 1];
    const firstReading = log.readings[0];
    
    // Check if temperature is decreasing
    return lastReading.temperature < firstReading.temperature;
  };
  
  if (!log) {
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
      <Stack.Screen options={{ title: 'Cooling Log' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{log.foodItem}</Text>
            <Text style={styles.subtitle}>
              Started at {formatTime(log.startTime)}
            </Text>
          </View>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Clock size={16} color={colors.gray} />
                <Text style={styles.infoLabel}>Target Time:</Text>
                <Text style={styles.infoValue}>{formatTime(log.targetEndTime)}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Clock size={16} color={colors.gray} />
                <Text style={styles.infoLabel}>Remaining:</Text>
                <Text style={styles.infoValue}>{getTimeRemaining()}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Thermometer size={16} color={colors.gray} />
                <Text style={styles.infoLabel}>Readings:</Text>
                <Text style={styles.infoValue}>{log.readings.length}</Text>
              </View>
              
              <View style={styles.infoItem}>
                <Thermometer size={16} color={colors.gray} />
                <Text style={styles.infoLabel}>Last Temp:</Text>
                <Text style={styles.infoValue}>
                  {log.readings.length > 0 
                    ? `${log.readings[log.readings.length - 1].temperature}°F` 
                    : 'N/A'}
                </Text>
              </View>
            </View>
            
            {!isCoolingOnTrack() && (
              <View style={styles.warningContainer}>
                <AlertTriangle size={16} color={colors.warning} />
                <Text style={styles.warningText}>
                  Warning: Cooling may not be progressing as expected
                </Text>
              </View>
            )}
          </View>
          
          {!log.isCompleted && (
            <View style={styles.addReadingContainer}>
              <Text style={styles.addReadingTitle}>Add Temperature Reading</Text>
              
              <View style={styles.inputRow}>
                <View style={styles.inputContainer}>
                  <Thermometer size={20} color={colors.gray} />
                  <TextInput
                    style={styles.input}
                    value={temperature}
                    onChangeText={setTemperature}
                    placeholder="Enter temperature"
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                  <Text style={styles.unit}>°F</Text>
                </View>
                
                <TouchableOpacity style={styles.button} onPress={handleAddReading}>
                  <Text style={styles.buttonText}>Add</Text>
                </TouchableOpacity>
              </View>
              
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
              
              <TouchableOpacity 
                style={styles.completeButton}
                onPress={handleComplete}
              >
                <Check size={20} color={colors.white} />
                <Text style={styles.completeButtonText}>Mark as Completed</Text>
              </TouchableOpacity>
            </View>
          )}
          
          <View style={styles.readingsContainer}>
            <Text style={styles.readingsTitle}>Temperature Readings</Text>
            
            {log.readings.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No readings recorded yet</Text>
              </View>
            ) : (
              log.readings.map((reading, index) => (
                <View key={index} style={styles.readingItem}>
                  <View style={styles.readingTemp}>
                    <Thermometer size={16} color={colors.primary} />
                    <Text style={styles.readingTempText}>{reading.temperature}°F</Text>
                  </View>
                  <Text style={styles.readingTime}>
                    {formatDateTime(reading.timestamp)}
                  </Text>
                </View>
              ))
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
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
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warningLight + '30',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: colors.warning,
    marginLeft: 8,
    flex: 1,
  },
  addReadingContainer: {
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
  addReadingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
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
    marginBottom: 16,
  },
  completeButton: {
    flexDirection: 'row',
    backgroundColor: colors.success,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  completeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  readingsContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  readingsTitle: {
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
  readingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.grayLight,
  },
  readingTemp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  readingTempText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 8,
  },
  readingTime: {
    fontSize: 14,
    color: colors.gray,
  },
});