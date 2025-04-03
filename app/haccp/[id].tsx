import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useHACCPStore } from '@/store/haccp-store';
import { HACCPPlan } from '@/types/haccp';
import { formatDate } from '@/utils/dateUtils';
import { 
  AlertTriangle, 
  ChevronRight, 
  Edit, 
  FileText, 
  List, 
  Plus, 
  ShieldCheck, 
  Thermometer, 
  Trash 
} from 'lucide-react-native';

export default function HACCPPlanDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { plans, deletePlan, updatePlan } = useHACCPStore();
  
  const [plan, setPlan] = useState<HACCPPlan | null>(null);
  
  useEffect(() => {
    if (!id) return;
    
    const foundPlan = plans.find(p => p.id === id);
    if (foundPlan) {
      setPlan(foundPlan);
    }
  }, [id, plans]);
  
  const handleDelete = useCallback(() => {
    if (!plan) return;
    
    Alert.alert(
      'Delete HACCP Plan',
      'Are you sure you want to delete this HACCP plan? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deletePlan(plan.id);
            router.back();
          },
        },
      ]
    );
  }, [plan, deletePlan, router]);
  
  const toggleActive = useCallback(() => {
    if (!plan) return;
    
    const updatedPlan = {
      ...plan,
      active: !plan.active
    };
    
    updatePlan(updatedPlan);
  }, [plan, updatePlan]);
  
  if (!plan) {
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
      <Stack.Screen 
        options={{ 
          title: 'HACCP Plan',
          headerRight: () => (
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={() => router.push(`/haccp/edit/${plan.id}`)}
              >
                <Edit size={20} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={handleDelete}
              >
                <Trash size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          ),
        }} 
      />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.title}>{plan.name}</Text>
            <TouchableOpacity
              style={[
                styles.statusBadge,
                plan.active ? styles.statusActive : styles.statusInactive
              ]}
              onPress={toggleActive}
            >
              <Text style={styles.statusText}>{plan.active ? 'Active' : 'Inactive'}</Text>
            </TouchableOpacity>
          </View>
          
          {plan.description ? (
            <View style={styles.descriptionContainer}>
              <Text style={styles.description}>{plan.description}</Text>
            </View>
          ) : null}
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Product:</Text>
                <Text style={styles.infoValue}>{plan.product}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Intended Use:</Text>
                <Text style={styles.infoValue}>{plan.intendedUse || 'Not specified'}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Last Updated:</Text>
                <Text style={styles.infoValue}>{formatDate(plan.updatedAt)}</Text>
              </View>
            </View>
          </View>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Process Flow</Text>
            <TouchableOpacity
              style={styles.sectionButton}
              onPress={() => router.push(`/haccp/process-flow/${plan.id}`)}
            >
              <Edit size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {plan.processFlow.length > 0 ? (
            <View style={styles.processFlowContainer}>
              {plan.processFlow.map((step, index) => (
                <View key={index} style={styles.processStep}>
                  <View style={styles.processStepNumber}>
                    <Text style={styles.processStepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.processStepText}>{step}</Text>
                </View>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptySection}
              onPress={() => router.push(`/haccp/process-flow/${plan.id}`)}
            >
              <List size={24} color={colors.gray} />
              <Text style={styles.emptySectionText}>Add process flow steps</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hazards</Text>
            <TouchableOpacity
              style={styles.sectionButton}
              onPress={() => router.push(`/haccp/hazards/${plan.id}`)}
            >
              <Plus size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {plan.hazards.length > 0 ? (
            <View style={styles.hazardsContainer}>
              {plan.hazards.map((hazard) => (
                <TouchableOpacity
                  key={hazard.id}
                  style={styles.hazardItem}
                  onPress={() => router.push(`/haccp/hazards/${plan.id}?hazardId=${hazard.id}`)}
                >
                  <View style={styles.hazardHeader}>
                    <View style={[
                      styles.hazardTypeTag,
                      hazard.type === 'biological' && styles.hazardTypeBiological,
                      hazard.type === 'chemical' && styles.hazardTypeChemical,
                      hazard.type === 'physical' && styles.hazardTypePhysical,
                      hazard.type === 'allergen' && styles.hazardTypeAllergen,
                    ]}>
                      <Text style={styles.hazardTypeText}>{hazard.type}</Text>
                    </View>
                    <AlertTriangle size={16} color={colors.warning} />
                  </View>
                  <Text style={styles.hazardName}>{hazard.name}</Text>
                  <Text style={styles.hazardDescription} numberOfLines={2}>
                    {hazard.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptySection}
              onPress={() => router.push(`/haccp/hazards/${plan.id}`)}
            >
              <AlertTriangle size={24} color={colors.gray} />
              <Text style={styles.emptySectionText}>Add hazards</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Critical Control Points</Text>
            <TouchableOpacity
              style={styles.sectionButton}
              onPress={() => router.push(`/haccp/ccp/new/${plan.id}`)}
            >
              <Plus size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
          
          {plan.criticalControlPoints.length > 0 ? (
            <View style={styles.ccpContainer}>
              {plan.criticalControlPoints.map((ccp) => (
                <TouchableOpacity
                  key={ccp.id}
                  style={styles.ccpItem}
                  onPress={() => router.push(`/haccp/ccp/${plan.id}/${ccp.id}`)}
                >
                  <View style={styles.ccpHeader}>
                    <ShieldCheck size={20} color={colors.primary} />
                    <Text style={styles.ccpHeaderText}>CCP</Text>
                  </View>
                  <Text style={styles.ccpStep}>{ccp.step}</Text>
                  
                  <View style={styles.ccpDetails}>
                    <View style={styles.ccpDetailItem}>
                      <Text style={styles.ccpDetailLabel}>Hazards:</Text>
                      <Text style={styles.ccpDetailValue}>
                        {ccp.hazards.length > 0 
                          ? ccp.hazards.map(hId => {
                              const hazard = plan.hazards.find(h => h.id === hId);
                              return hazard ? hazard.name : '';
                            }).filter(Boolean).join(', ')
                          : 'None'}
                      </Text>
                    </View>
                    
                    <View style={styles.ccpDetailItem}>
                      <Text style={styles.ccpDetailLabel}>Critical Limits:</Text>
                      <Text style={styles.ccpDetailValue}>
                        {ccp.criticalLimits.length > 0 
                          ? ccp.criticalLimits.map(limit => {
                              let limitText = limit.parameter;
                              if (limit.minimum !== undefined) {
                                limitText += ` ≥ ${limit.minimum}${limit.units}`;
                              }
                              if (limit.maximum !== undefined) {
                                limitText += ` ≤ ${limit.maximum}${limit.units}`;
                              }
                              return limitText;
                            }).join(', ')
                          : 'None'}
                      </Text>
                    </View>
                  </View>
                  
                  <View style={styles.ccpFooter}>
                    <TouchableOpacity
                      style={styles.ccpButton}
                      onPress={() => router.push(`/haccp/monitoring/${plan.id}/${ccp.id}`)}
                    >
                      <Thermometer size={16} color={colors.primary} />
                      <Text style={styles.ccpButtonText}>Monitor</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity
                      style={styles.ccpButton}
                      onPress={() => router.push(`/haccp/ccp/${plan.id}/${ccp.id}`)}
                    >
                      <Text style={styles.ccpButtonText}>Details</Text>
                      <ChevronRight size={16} color={colors.primary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <TouchableOpacity
              style={styles.emptySection}
              onPress={() => router.push(`/haccp/ccp/new/${plan.id}`)}
            >
              <ShieldCheck size={24} color={colors.gray} />
              <Text style={styles.emptySectionText}>Add critical control points</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => router.push(`/haccp/logs/${plan.id}`)}
            >
              <FileText size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>View Monitoring Logs</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => router.push(`/haccp/corrective-actions/${plan.id}`)}
            >
              <AlertTriangle size={20} color={colors.white} />
              <Text style={styles.actionButtonText}>Corrective Actions</Text>
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
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    marginLeft: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusActive: {
    backgroundColor: colors.successLight + '30',
    borderColor: colors.success,
  },
  statusInactive: {
    backgroundColor: colors.grayLight,
    borderColor: colors.gray,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },
  descriptionContainer: {
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
  description: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 24,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: colors.gray,
    marginRight: 4,
    width: 100,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  sectionButton: {
    padding: 8,
  },
  processFlowContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  processStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  processStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  processStepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  processStepText: {
    fontSize: 16,
    color: colors.text,
  },
  emptySection: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySectionText: {
    fontSize: 16,
    color: colors.gray,
    marginTop: 8,
  },
  hazardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    marginHorizontal: -6,
  },
  hazardItem: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    marginHorizontal: 6,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: '47%',
  },
  hazardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hazardTypeTag: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: colors.grayLight,
  },
  hazardTypeBiological: {
    backgroundColor: colors.dangerLight + '30',
  },
  hazardTypeChemical: {
    backgroundColor: colors.warningLight + '30',
  },
  hazardTypePhysical: {
    backgroundColor: colors.primaryLight + '30',
  },
  hazardTypeAllergen: {
    backgroundColor: colors.secondaryLight + '30',
  },
  hazardTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.text,
  },
  hazardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  hazardDescription: {
    fontSize: 12,
    color: colors.textLight,
  },
  ccpContainer: {
    marginBottom: 24,
  },
  ccpItem: {
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
  ccpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ccpHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 8,
  },
  ccpStep: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  ccpDetails: {
    marginBottom: 16,
  },
  ccpDetailItem: {
    marginBottom: 8,
  },
  ccpDetailLabel: {
    fontSize: 14,
    color: colors.gray,
    marginBottom: 2,
  },
  ccpDetailValue: {
    fontSize: 14,
    color: colors.text,
  },
  ccpFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 12,
  },
  ccpButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ccpButtonText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
    marginHorizontal: 4,
  },
  actionsContainer: {
    marginBottom: 24,
  },
  actionButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionButtonSecondary: {
    backgroundColor: colors.warning,
  },
  actionButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});