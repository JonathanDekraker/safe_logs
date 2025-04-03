import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CoolingLog } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate, formatTime } from '@/utils/dateUtils';
import StatusBadge from './StatusBadge';
import { ChevronRight } from 'lucide-react-native';

interface CoolingLogItemProps {
  log: CoolingLog;
  onPress: () => void;
}

export default function CoolingLogItem({ log, onPress }: CoolingLogItemProps) {
  const getLastReading = () => {
    if (log.readings.length === 0) return null;
    return log.readings[log.readings.length - 1];
  };

  const lastReading = getLastReading();

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.foodItem}>{log.foodItem}</Text>
        <StatusBadge status={log.isCompleted ? 'completed' : 'inProgress'} size="small" />
      </View>
      
      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Started:</Text>
          <Text style={styles.detailValue}>{formatTime(log.startTime)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Target:</Text>
          <Text style={styles.detailValue}>{formatTime(log.targetEndTime)}</Text>
        </View>
        
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Readings:</Text>
          <Text style={styles.detailValue}>{log.readings.length}</Text>
        </View>
        
        {lastReading && (
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Last:</Text>
            <Text style={styles.detailValue}>{lastReading.temperature}°F</Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.date}>{formatDate(log.startTime)}</Text>
        <ChevronRight size={16} color={colors.gray} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  foodItem: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  details: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.gray,
    marginRight: 4,
  },
  detailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 12,
  },
  date: {
    fontSize: 12,
    color: colors.gray,
  },
});