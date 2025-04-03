import React, { useCallback } from 'react';
import { FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useAppStore } from '@/store/store';
import AlertCard from '@/components/AlertCard';

export default function AlertsScreen() {
  const router = useRouter();
  const { alerts, markAlertAsRead, clearAlert } = useAppStore();

  const handleAlertPress = useCallback((alert: typeof alerts[0]) => {
    markAlertAsRead(alert.id);
    
    if (alert.relatedItemType === 'temperature') {
      router.push('/temperature');
    } else if (alert.relatedItemType === 'checklist') {
      router.push('/checklists');
    } else if (alert.relatedItemType === 'cooling') {
      router.push('/cooling');
    }
  }, [router, markAlertAsRead]);

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Alerts</Text>
          <Text style={styles.subtitle}>
            {alerts.filter(alert => !alert.isRead).length} unread alerts
          </Text>
        </View>
        
        {alerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No alerts</Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Unread</Text>
              {alerts.filter(alert => !alert.isRead).length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>No unread alerts</Text>
                </View>
              ) : (
                <FlatList
                  data={alerts.filter(alert => !alert.isRead)}
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
              )}
            </View>
            
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Read</Text>
              {alerts.filter(alert => alert.isRead).length === 0 ? (
                <View style={styles.emptySection}>
                  <Text style={styles.emptySectionText}>No read alerts</Text>
                </View>
              ) : (
                <FlatList
                  data={alerts.filter(alert => alert.isRead)}
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
              )}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: colors.gray,
  },
  emptySection: {
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: colors.gray,
  },
});