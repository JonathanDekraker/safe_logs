import React, { useCallback, useState } from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import { useHACCPStore } from '@/store/haccp-store';
import DashboardCard from '@/components/DashboardCard';
import AlertCard from '@/components/AlertCard';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { saveData, fetchData } from '@/utils/firestoreService';
import { useRestaurantStore } from '@/store/restaurant-store';

export default function DashboardScreen() {
  const router = useRouter();
  const { checklists, temperatureLogs, coolingLogs, sanitationTasks, alerts, markAlertAsRead, clearAlert } = useAppStore();
  const { plans, monitoringLogs, correctiveActionLogs } = useHACCPStore();
  const [firebaseItems, setFirebaseItems] = useState<any[]>([]);
  const { selectedRestaurant } = useRestaurantStore();

  const handleSave = async () => {
    await saveData({ message: 'Hello Firebase!', createdAt: new Date() });
    handleFetch();
  };

  const handleFetch = async () => {
    const data = await fetchData();
    setFirebaseItems(data);
  };

  const getTemperatureStatus = useCallback(() => {
    const todayLogs = temperatureLogs.filter(
      log => new Date(log.timestamp).toDateString() === new Date().toDateString()
    );
    
    if (todayLogs.length === 0) return 'pending';
    if (todayLogs.some(log => !log.isWithinRange)) return 'inProgress';
    return 'completed';
  }, [temperatureLogs]);

  const getChecklistStatus = useCallback((type: 'opening' | 'closing' | 'critical') => {
    const todayChecklist = checklists.find(
      checklist => 
        checklist.type === type && 
        new Date(checklist.date).toDateString() === new Date().toDateString()
    );
    
    if (!todayChecklist) return 'pending';
    if (todayChecklist.isCompleted) return 'completed';
    return 'inProgress';
  }, [checklists]);

  const getCoolingStatus = useCallback(() => {
    const activeLogs = coolingLogs.filter(log => !log.isCompleted);
    if (activeLogs.length === 0) return 'completed';
    return 'inProgress';
  }, [coolingLogs]);

  const getSanitationStatus = useCallback(() => {
    const now = Date.now();
    const overdueTasks = sanitationTasks.filter(
      task => task.isActive && task.nextDue < now
    );
    
    if (overdueTasks.length > 0) return 'pending';
    
    const dueSoonTasks = sanitationTasks.filter(
      task => task.isActive && task.nextDue < now + 24 * 60 * 60 * 1000 // Due within 24 hours
    );
    
    if (dueSoonTasks.length > 0) return 'inProgress';
    return 'completed';
  }, [sanitationTasks]);

  const getHACCPStatus = useCallback(() => {
    // Check if there are any active HACCP plans
    if (plans.filter(plan => plan.active).length === 0) return 'pending';
    
    // Check if there are any unverified monitoring logs
    const unverifiedLogs = monitoringLogs.filter(log => !log.verified);
    if (unverifiedLogs.length > 0) return 'inProgress';
    
    // Check if there are any pending corrective actions
    const pendingActions = correctiveActionLogs.filter(
      log => !log.verified || (log.followUpRequired && !log.followUpCompleted)
    );
    if (pendingActions.length > 0) return 'inProgress';
    
    return 'completed';
  }, [plans, monitoringLogs, correctiveActionLogs]);

  const getChecklistCompletion = useCallback((type: 'opening' | 'closing' | 'critical') => {
    const todayChecklist = checklists.find(
      checklist => 
        checklist.type === type && 
        new Date(checklist.date).toDateString() === new Date().toDateString()
    );
    
    if (!todayChecklist) return { completed: 0, total: 0 };
    
    const completed = todayChecklist.items.filter(item => item.isCompleted).length;
    return { completed, total: todayChecklist.items.length };
  }, [checklists]);

  const getSanitationCompletion = useCallback(() => {
    const now = Date.now();
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Tasks due today or overdue
    const dueTasks = sanitationTasks.filter(
      task => task.isActive && task.nextDue <= now + 24 * 60 * 60 * 1000
    );
    
    // Tasks completed today
    const completedToday = sanitationTasks.filter(
      task => task.lastCompleted && task.lastCompleted >= today
    );
    
    return { completed: completedToday.length, total: dueTasks.length };
  }, [sanitationTasks]);

  const getHACCPCompletion = useCallback(() => {
    // Count active plans
    const activePlans = plans.filter(plan => plan.active).length;
    
    // Count CCPs across all active plans
    const totalCCPs = plans
      .filter(plan => plan.active)
      .reduce((total, plan) => total + plan.criticalControlPoints.length, 0);
    
    // Count monitored CCPs today
    const today = new Date().setHours(0, 0, 0, 0);
    const monitoredCCPs = new Set(
      monitoringLogs
        .filter(log => log.timestamp >= today)
        .map(log => log.ccpId)
    ).size;
    
    return { completed: monitoredCCPs, total: totalCCPs };
  }, [plans, monitoringLogs]);

  const handleAlertPress = useCallback((alert: typeof alerts[0]) => {
    markAlertAsRead(alert.id);
    
    if (alert.relatedItemType === 'temperature') {
      router.push('/temperature');
    } else if (alert.relatedItemType === 'checklist') {
      router.push('/checklists');
    } else if (alert.relatedItemType === 'cooling') {
      router.push('/cooling');
    } else if (alert.relatedItemType === 'sanitation') {
      router.push('/sanitation');
    }
  }, [router, markAlertAsRead]);

  const unreadAlerts = alerts.filter(alert => !alert.isRead);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>SafeLogs</Text>
          <Text style={styles.subtitle}>Kitchen Compliance</Text>
          {selectedRestaurant && (
            <View style={styles.restaurantInfo}>
              <FontAwesome name="cutlery" size={14} color={colors.primary} style={styles.restaurantIcon} />
              <Text style={styles.restaurantName}>{selectedRestaurant.name}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.cardsContainer}>
          {/* Firebase Test Section */}
          <View style={styles.firebaseSection}>
            <Text style={styles.sectionTitle}>Firebase Test</Text>
            <View style={styles.firebaseButtons}>
              <TouchableOpacity 
                style={styles.firebaseButton}
                onPress={handleSave}
              >
                <Text style={styles.firebaseButtonText}>Save Data</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.firebaseButton}
                onPress={handleFetch}
              >
                <Text style={styles.firebaseButtonText}>Fetch Data</Text>
              </TouchableOpacity>
            </View>
            {firebaseItems.length > 0 && (
              <View style={styles.firebaseItems}>
                {firebaseItems.map((item, index) => (
                  <Text key={item.id || index} style={styles.firebaseItem}>
                    {item.message}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <DashboardCard
            title="Temperature Logs"
            status={getTemperatureStatus()}
            icon={<FontAwesome name="thermometer" size={24} color={colors.primary} />}
            onPress={() => router.push('/temperature')}
          />
          
          <DashboardCard
            title="Critical Violations"
            status={getChecklistStatus('critical')}
            icon={<FontAwesome name="exclamation-triangle" size={24} color={colors.warning} />}
            count={getChecklistCompletion('critical')}
            onPress={() => router.push('/checklists/critical')}
          />
          
          <DashboardCard
            title="Opening Checklist"
            status={getChecklistStatus('opening')}
            icon={<FontAwesome name="list-alt" size={24} color={colors.primary} />}
            count={getChecklistCompletion('opening')}
            onPress={() => router.push('/checklists/opening')}
          />
          
          <DashboardCard
            title="Closing Checklist"
            status={getChecklistStatus('closing')}
            icon={<FontAwesome name="list-alt" size={24} color={colors.primary} />}
            count={getChecklistCompletion('closing')}
            onPress={() => router.push('/checklists/closing')}
          />
          
          <DashboardCard
            title="Cooling Logs"
            status={getCoolingStatus()}
            icon={<FontAwesome name="snowflake-o" size={24} color={colors.primary} />}
            onPress={() => router.push('/cooling')}
          />
          
          <DashboardCard
            title="Sanitation Tasks"
            status={getSanitationStatus()}
            icon={<FontAwesome name="check-square-o" size={24} color={colors.primary} />}
            count={getSanitationCompletion()}
            onPress={() => router.push('/sanitation')}
          />
          
          <DashboardCard
            title="HACCP Plans"
            status={getHACCPStatus()}
            icon={<FontAwesome name="shield" size={24} color={colors.primary} />}
            count={getHACCPCompletion()}
            onPress={() => router.push('/haccp')}
          />
        </View>
        
        {unreadAlerts.length > 0 && (
          <View style={styles.alertsContainer}>
            <Text style={styles.alertsTitle}>Alerts</Text>
            <FlatList
              data={unreadAlerts}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <AlertCard
                  alert={item}
                  onPress={() => handleAlertPress(item)}
                  onDismiss={() => clearAlert(item.id)}
                />
              )}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  alertsContainer: {
    marginBottom: 16,
  },
  alertsTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  firebaseSection: {
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  firebaseButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  firebaseButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  firebaseButtonText: {
    color: colors.white,
    textAlign: 'center',
    fontWeight: '500',
  },
  firebaseItems: {
    marginTop: 8,
  },
  firebaseItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  restaurantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  restaurantIcon: {
    marginRight: 6,
  },
  restaurantName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray,
    letterSpacing: 0.3,
  },
});