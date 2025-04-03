import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Equipment, TemperatureLog } from '@/types';
import { colors } from '@/constants/colors';
import { formatDate, formatTime } from '@/utils/dateUtils';
import { AlertTriangle, CheckCircle, Thermometer } from 'lucide-react-native';

interface TemperatureLogItemProps {
  log: TemperatureLog;
  equipment: Equipment | undefined;
}

export default function TemperatureLogItem({ log, equipment }: TemperatureLogItemProps) {
  if (!equipment) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.equipmentInfo}>
          <Text style={styles.equipmentName}>{equipment.name}</Text>
          <Text style={styles.equipmentType}>
            {equipment.type === 'cooler' ? 'Cooler' : 'Freezer'}
          </Text>
        </View>
        <View
          style={[
            styles.temperatureContainer,
            log.isWithinRange ? styles.temperatureGood : styles.temperatureBad,
          ]}
        >
          <Thermometer
            size={16}
            color={log.isWithinRange ? colors.success : colors.danger}
          />
          <Text
            style={[
              styles.temperature,
              log.isWithinRange ? styles.temperatureTextGood : styles.temperatureTextBad,
            ]}
          >
            {log.temperature}°F
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Safe Range:</Text>
          <Text style={styles.detailValue}>
            {equipment.minTemp}°F - {equipment.maxTemp}°F
          </Text>
        </View>

        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Status:</Text>
          <View style={styles.statusContainer}>
            {log.isWithinRange ? (
              <>
                <CheckCircle size={14} color={colors.success} />
                <Text style={[styles.detailValue, { color: colors.success }]}>
                  Within Range
                </Text>
              </>
            ) : (
              <>
                <AlertTriangle size={14} color={colors.danger} />
                <Text style={[styles.detailValue, { color: colors.danger }]}>
                  Out of Range
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      {log.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesLabel}>Notes:</Text>
          <Text style={styles.notesText}>{log.notes}</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          {formatDate(log.timestamp)} at {formatTime(log.timestamp)}
        </Text>
      </View>
    </View>
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
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  equipmentType: {
    fontSize: 14,
    color: colors.gray,
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  temperatureGood: {
    backgroundColor: colors.successLight + '30',
  },
  temperatureBad: {
    backgroundColor: colors.dangerLight + '30',
  },
  temperature: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  temperatureTextGood: {
    color: colors.success,
  },
  temperatureTextBad: {
    color: colors.danger,
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  notes: {
    backgroundColor: colors.grayLight + '50',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: colors.text,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 12,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray,
    textAlign: 'right',
  },
});