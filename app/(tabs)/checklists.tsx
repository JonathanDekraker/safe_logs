import React from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { AlertTriangle, ClipboardCheck } from 'lucide-react-native';
import { useAppStore } from '@/store/store';
import StatusBadge from '@/components/StatusBadge';

export default function ChecklistsScreen() {
  const router = useRouter();
  const { checklists } = useAppStore();

  const getTodayChecklist = (type: 'opening' | 'closing' | 'critical') => {
    return checklists.find(
      checklist => 
        checklist.type === type && 
        new Date(checklist.date).toDateString() === new Date().toDateString()
    );
  };

  const getCompletionStatus = (type: 'opening' | 'closing' | 'critical') => {
    const checklist = getTodayChecklist(type);
    if (!checklist) return 'pending';
    if (checklist.isCompleted) return 'completed';
    return 'inProgress';
  };

  const getCompletionCount = (type: 'opening' | 'closing' | 'critical') => {
    const checklist = getTodayChecklist(type);
    if (!checklist) return { completed: 0, total: 0 };
    
    const completed = checklist.items.filter(item => item.isCompleted).length;
    return { completed, total: checklist.items.length };
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Checklists</Text>
          <Text style={styles.subtitle}>Track daily compliance tasks</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/checklists/critical')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <AlertTriangle size={24} color={colors.warning} />
            </View>
            <StatusBadge status={getCompletionStatus('critical')} />
          </View>
          
          <Text style={styles.cardTitle}>Critical Violations</Text>
          <Text style={styles.cardDescription}>
            Daily checks to prevent health code violations
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>
                {getCompletionCount('critical').completed}/{getCompletionCount('critical').total} completed
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${getCompletionCount('critical').total === 0 
                      ? 0 
                      : (getCompletionCount('critical').completed / getCompletionCount('critical').total) * 100}%` 
                  }
                ]} 
              />
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/checklists/opening')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <ClipboardCheck size={24} color={colors.primary} />
            </View>
            <StatusBadge status={getCompletionStatus('opening')} />
          </View>
          
          <Text style={styles.cardTitle}>Opening Procedures</Text>
          <Text style={styles.cardDescription}>
            Tasks to complete when opening the kitchen
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>
                {getCompletionCount('opening').completed}/{getCompletionCount('opening').total} completed
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${getCompletionCount('opening').total === 0 
                      ? 0 
                      : (getCompletionCount('opening').completed / getCompletionCount('opening').total) * 100}%` 
                  }
                ]} 
              />
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.card}
          onPress={() => router.push('/checklists/closing')}
          activeOpacity={0.7}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <ClipboardCheck size={24} color={colors.primary} />
            </View>
            <StatusBadge status={getCompletionStatus('closing')} />
          </View>
          
          <Text style={styles.cardTitle}>Closing Procedures</Text>
          <Text style={styles.cardDescription}>
            Tasks to complete when closing the kitchen
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressTextContainer}>
              <Text style={styles.progressText}>
                {getCompletionCount('closing').completed}/{getCompletionCount('closing').total} completed
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { 
                    width: `${getCompletionCount('closing').total === 0 
                      ? 0 
                      : (getCompletionCount('closing').completed / getCompletionCount('closing').total) * 100}%` 
                  }
                ]} 
              />
            </View>
          </View>
        </TouchableOpacity>
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
  card: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 16,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  progressText: {
    fontSize: 14,
    color: colors.gray,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.grayLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
});