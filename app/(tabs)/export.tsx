import React, { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import { useHACCPStore } from '@/store/haccp-store';
import { formatDate } from '@/utils/dateUtils';
import * as FileSystem from 'expo-file-system';
import { Download, Share2, Calendar } from 'lucide-react-native';

export default function ExportScreen() {
  const { temperatureLogs, checklists, coolingLogs, sanitationTasks, sanitationLogs } = useAppStore();
  const { plans, monitoringLogs, correctiveActionLogs } = useHACCPStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [exportType, setExportType] = useState<'all' | 'temperature' | 'checklists' | 'cooling' | 'sanitation' | 'haccp'>('all');
  const [exportData, setExportData] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter'>('week');

  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    let startDate;
    if (selectedPeriod === 'day') {
      startDate = today;
    } else if (selectedPeriod === 'week') {
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
    } else if (selectedPeriod === 'month') {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
    } else if (selectedPeriod === 'quarter') {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 3);
    }
    
    return { startDate, endDate: now };
  };

  const generateExportData = () => {
    const { startDate, endDate } = getDateRange();
    const startTimestamp = startDate.getTime();
    const endTimestamp = endDate.getTime();
    
    // Filter logs for the selected date range
    const filteredTemperatureLogs = temperatureLogs.filter(
      log => log.timestamp >= startTimestamp && log.timestamp <= endTimestamp
    );
    
    const filteredChecklists = checklists.filter(
      checklist => checklist.date >= startTimestamp && checklist.date <= endTimestamp
    );
    
    const filteredCoolingLogs = coolingLogs.filter(
      log => log.startTime >= startTimestamp && log.startTime <= endTimestamp
    );
    
    const filteredSanitationLogs = sanitationLogs.filter(
      log => log.timestamp >= startTimestamp && log.timestamp <= endTimestamp
    );
    
    const filteredMonitoringLogs = monitoringLogs.filter(
      log => log.timestamp >= startTimestamp && log.timestamp <= endTimestamp
    );
    
    const filteredCorrectiveActionLogs = correctiveActionLogs.filter(
      log => log.timestamp >= startTimestamp && log.timestamp <= endTimestamp
    );

    let data = `SafeLogs Export - ${formatDate(startDate)} to ${formatDate(endDate)}\n\n`;
    
    // Temperature logs
    data += "TEMPERATURE LOGS\n";
    data += "----------------\n";
    
    if (filteredTemperatureLogs.length === 0) {
      data += "No temperature logs for this period.\n";
    } else {
      filteredTemperatureLogs.forEach(log => {
        const equipment = useAppStore.getState().equipment.find(e => e.id === log.equipmentId);
        data += `${formatDate(new Date(log.timestamp))} - ${equipment?.name || 'Unknown'}: ${log.temperature}°F `;
        data += log.isWithinRange ? "(Within Range)" : "(OUT OF RANGE)";
        data += "\n";
      });
    }
    
    data += "\n";
    
    // Checklists
    data += "CHECKLISTS\n";
    data += "----------\n";
    
    if (filteredChecklists.length === 0) {
      data += "No checklists for this period.\n";
    } else {
      filteredChecklists.forEach(checklist => {
        const completedItems = checklist.items.filter(item => item.isCompleted).length;
        data += `${formatDate(new Date(checklist.date))} - ${checklist.type.toUpperCase()} Checklist: `;
        data += `${completedItems}/${checklist.items.length} completed`;
        data += checklist.isCompleted ? " (COMPLETED)" : " (INCOMPLETE)";
        data += "\n";
        
        checklist.items.forEach(item => {
          data += `  - ${item.text}: ${item.isCompleted ? "✓" : "✗"}`;
          if (item.notes) data += ` (Note: ${item.notes})`;
          data += "\n";
        });
        
        data += "\n";
      });
    }
    
    // Cooling logs
    data += "COOLING LOGS\n";
    data += "------------\n";
    
    if (filteredCoolingLogs.length === 0) {
      data += "No cooling logs for this period.\n";
    } else {
      filteredCoolingLogs.forEach(log => {
        data += `${formatDate(new Date(log.startTime))} - ${log.foodItem}\n`;
        if (log.readings.length > 0) {
          data += `  Start: ${log.readings[0].temperature}°F at ${new Date(log.readings[0].timestamp).toLocaleTimeString()}\n`;
          
          if (log.readings.length > 1) {
            log.readings.slice(1).forEach((reading, index) => {
              data += `  Reading ${index + 1}: ${reading.temperature}°F at ${new Date(reading.timestamp).toLocaleTimeString()}\n`;
            });
          }
        }
        
        data += `  Status: ${log.isCompleted ? "Completed" : "In Progress"}\n`;
        data += "\n";
      });
    }
    
    // Sanitation logs
    data += "SANITATION LOGS\n";
    data += "--------------\n";
    
    if (filteredSanitationLogs.length === 0) {
      data += "No sanitation logs for this period.\n";
    } else {
      filteredSanitationLogs.forEach(log => {
        const task = sanitationTasks.find(t => t.id === log.taskId);
        data += `${formatDate(new Date(log.timestamp))} - ${task ? task.name : "Unknown Task"}\n`;
        data += `  Completed by: ${log.completedBy}\n`;
        if (log.notes) data += `  Notes: ${log.notes}\n`;
        data += "\n";
      });
    }
    
    // HACCP monitoring logs
    data += "HACCP MONITORING LOGS\n";
    data += "--------------------\n";
    
    if (filteredMonitoringLogs.length === 0) {
      data += "No HACCP monitoring logs for this period.\n";
    } else {
      filteredMonitoringLogs.forEach(log => {
        const plan = plans.find(p => p.id === log.planId);
        const ccp = plan?.criticalControlPoints.find(c => c.id === log.ccpId);
        
        data += `${formatDate(new Date(log.timestamp))} - ${plan?.name || "Unknown Plan"}: ${ccp?.name || "Unknown CCP"}\n`;
        data += `  Measurement: ${log.measurement} ${log.unit}\n`;
        data += `  Within limits: ${log.withinLimits ? "Yes" : "No"}\n`;
        data += `  Monitored by: ${log.monitoredBy}\n`;
        if (log.notes) data += `  Notes: ${log.notes}\n`;
        data += `  Verified: ${log.verified ? "Yes" : "No"}\n`;
        if (log.verifiedBy) data += `  Verified by: ${log.verifiedBy}\n`;
        data += "\n";
      });
    }
    
    // HACCP corrective actions
    data += "HACCP CORRECTIVE ACTIONS\n";
    data += "------------------------\n";
    
    if (filteredCorrectiveActionLogs.length === 0) {
      data += "No corrective actions for this period.\n";
    } else {
      filteredCorrectiveActionLogs.forEach(log => {
        const plan = plans.find(p => p.id === log.planId);
        const ccp = plan?.criticalControlPoints.find(c => c.id === log.ccpId);
        
        data += `${formatDate(new Date(log.timestamp))} - ${plan?.name || "Unknown Plan"}: ${ccp?.name || "Unknown CCP"}\n`;
        data += `  Action taken: ${log.actionTaken}\n`;
        data += `  Performed by: ${log.performedBy || "Unknown"}\n`;
        if (log.rootCause) data += `  Root cause: ${log.rootCause}\n`;
        if (log.preventiveMeasure) data += `  Preventive measure: ${log.preventiveMeasure}\n`;
        if (log.productDisposition) data += `  Product disposition: ${log.productDisposition}\n`;
        data += `  Follow-up required: ${log.followUpRequired ? "Yes" : "No"}\n`;
        if (log.followUpRequired) {
          data += `  Follow-up completed: ${log.followUpCompleted ? "Yes" : "No"}\n`;
          if (log.followUpDescription) data += `  Follow-up notes: ${log.followUpDescription}\n`;
        }
        data += `  Verified: ${log.verified ? "Yes" : "No"}\n`;
        if (log.verifiedBy) data += `  Verified by: ${log.verifiedBy}\n`;
        data += "\n";
      });
    }
    
    setExportData(data);
    return data;
  };

  const handleShare = async () => {
    const data = generateExportData();
    try {
      await Share.share({
        message: data,
        title: `SafeLogs Export - ${formatDate(new Date())}`,
      });
    } catch (error) {
      console.error("Error sharing data:", error);
      Alert.alert("Error", "Failed to share export data");
    }
  };

  const handleDownload = async () => {
    if (Platform.OS === 'web') {
      // For web, just use the share functionality
      handleShare();
      return;
    }
    
    try {
      const data = generateExportData();
      const fileUri = `${FileSystem.documentDirectory}safelogs-export-${Date.now()}.txt`;
      
      await FileSystem.writeAsStringAsync(fileUri, data);
      
      Alert.alert(
        "Export Complete",
        "Data has been exported successfully",
        [
          { text: "OK" },
          { 
            text: "Share", 
            onPress: () => handleShare() 
          }
        ]
      );
    } catch (error) {
      console.error("Error downloading data:", error);
      Alert.alert("Error", "Failed to download export data");
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Data</Text>
        <Text style={styles.subtitle}>Generate reports for compliance</Text>
      </View>
      
      <View style={styles.periodSelector}>
        <Text style={styles.sectionTitle}>Select Period:</Text>
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'day' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('day')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'day' && styles.selectedPeriodText]}>
              Today
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'week' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('week')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.selectedPeriodText]}>
              Week
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'month' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('month')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.selectedPeriodText]}>
              Month
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 'quarter' && styles.selectedPeriod]}
            onPress={() => setSelectedPeriod('quarter')}
          >
            <Text style={[styles.periodButtonText, selectedPeriod === 'quarter' && styles.selectedPeriodText]}>
              Quarter
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.previewContainer}>
        <Text style={styles.sectionTitle}>Preview:</Text>
        <ScrollView style={styles.preview}>
          <Text style={styles.previewText}>{exportData}</Text>
        </ScrollView>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
          <Share2 size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Share</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.actionButton, styles.primaryButton]} onPress={handleDownload}>
          <Download size={20} color={colors.white} />
          <Text style={styles.actionButtonText}>Download</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textLight,
    marginTop: 4,
  },
  periodSelector: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    backgroundColor: colors.grayLight,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: colors.primary,
  },
  periodButtonText: {
    color: colors.text,
    fontWeight: '500',
  },
  selectedPeriodText: {
    color: colors.white,
  },
  previewContainer: {
    flex: 1,
    marginBottom: 24,
  },
  preview: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  previewText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
    color: colors.text,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.gray,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
});