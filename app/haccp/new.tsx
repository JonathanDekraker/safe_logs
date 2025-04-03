import React, { useState } from 'react';
import { FlatList, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { useHACCPStore } from '@/store/haccp-store';
import { HACCPTemplate } from '@/types/haccp';
import { ChevronRight, FileText, Plus, ShieldCheck } from 'lucide-react-native';

export default function NewHACCPPlanScreen() {
  const router = useRouter();
  const { templates, createPlanFromTemplate, createPlan } = useHACCPStore();
  
  const [showTemplates, setShowTemplates] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [product, setProduct] = useState('');
  const [intendedUse, setIntendedUse] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    product?: string;
  }>({});
  
  const validateForm = () => {
    const newErrors: {
      name?: string;
      product?: string;
    } = {};
    
    if (!name.trim()) {
      newErrors.name = 'Plan name is required';
    }
    
    if (!product.trim()) {
      newErrors.product = 'Product description is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCreateBlankPlan = () => {
    if (!validateForm()) return;
    
    const planId = createPlan({
      name: name.trim(),
      description: description.trim(),
      product: product.trim(),
      intendedUse: intendedUse.trim(),
      processFlow: [],
      hazards: [],
      criticalControlPoints: [],
      active: true
    });
    
    router.replace(`/haccp/${planId}`);
  };
  
  const handleCreateFromTemplate = (templateId: string) => {
    if (!name.trim()) {
      setErrors({ name: 'Plan name is required' });
      return;
    }
    
    const planId = createPlanFromTemplate(templateId, name.trim());
    router.replace(`/haccp/${planId}`);
  };
  
  const renderTemplateItem = ({ item }: { item: HACCPTemplate }) => (
    <TouchableOpacity
      style={styles.templateItem}
      onPress={() => handleCreateFromTemplate(item.id)}
      activeOpacity={0.7}
    >
      <View style={styles.templateHeader}>
        <View style={styles.templateIconContainer}>
          <FileText size={20} color={colors.primary} />
        </View>
        <Text style={styles.templateCCPs}>{item.criticalControlPoints.length} CCPs</Text>
      </View>
      
      <Text style={styles.templateName}>{item.name}</Text>
      
      <Text style={styles.templateDescription} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.templateDetails}>
        <View style={styles.templateDetailItem}>
          <Text style={styles.templateDetailLabel}>Product:</Text>
          <Text style={styles.templateDetailValue}>{item.product}</Text>
        </View>
        
        <View style={styles.templateDetailItem}>
          <Text style={styles.templateDetailLabel}>Hazards:</Text>
          <Text style={styles.templateDetailValue}>{item.hazards.length}</Text>
        </View>
      </View>
      
      <View style={styles.templateFooter}>
        <Text style={styles.useTemplateText}>Use this template</Text>
        <ChevronRight size={16} color={colors.primary} />
      </View>
    </TouchableOpacity>
  );
  
  return (
    <>
      <Stack.Screen options={{ title: 'Create HACCP Plan' }} />
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.formGroup}>
            <Text style={styles.label}>Plan Name*</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="e.g., Hot Food Preparation HACCP Plan"
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
          </View>
          
          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                showTemplates && styles.segmentButtonActive,
              ]}
              onPress={() => setShowTemplates(true)}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  showTemplates && styles.segmentButtonTextActive,
                ]}
              >
                Use Template
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.segmentButton,
                !showTemplates && styles.segmentButtonActive,
              ]}
              onPress={() => setShowTemplates(false)}
            >
              <Text
                style={[
                  styles.segmentButtonText,
                  !showTemplates && styles.segmentButtonTextActive,
                ]}
              >
                Create Blank
              </Text>
            </TouchableOpacity>
          </View>
          
          {showTemplates ? (
            <View style={styles.templatesContainer}>
              <Text style={styles.sectionTitle}>Choose a Template</Text>
              <FlatList
                data={templates}
                keyExtractor={(item) => item.id}
                renderItem={renderTemplateItem}
                scrollEnabled={false}
              />
            </View>
          ) : (
            <View style={styles.blankFormContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Brief description of this HACCP plan"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product*</Text>
                <TextInput
                  style={[styles.input, errors.product && styles.inputError]}
                  value={product}
                  onChangeText={setProduct}
                  placeholder="e.g., Hot prepared foods"
                />
                {errors.product && <Text style={styles.errorText}>{errors.product}</Text>}
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.label}>Intended Use</Text>
                <TextInput
                  style={styles.input}
                  value={intendedUse}
                  onChangeText={setIntendedUse}
                  placeholder="e.g., Immediate consumption"
                />
              </View>
              
              <TouchableOpacity
                style={styles.createButton}
                onPress={handleCreateBlankPlan}
              >
                <Plus size={20} color={colors.white} />
                <Text style={styles.createButtonText}>Create Blank Plan</Text>
              </TouchableOpacity>
            </View>
          )}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
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
    color: colors.text,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.danger,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 12,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    marginTop: 4,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.grayLight,
    borderRadius: 8,
    marginBottom: 24,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentButtonActive: {
    backgroundColor: colors.white,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentButtonText: {
    color: colors.gray,
    fontWeight: '500',
  },
  segmentButtonTextActive: {
    color: colors.text,
  },
  templatesContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  templateItem: {
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
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  templateIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
  },
  templateCCPs: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  templateName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  templateDescription: {
    fontSize: 14,
    color: colors.textLight,
    marginBottom: 12,
  },
  templateDetails: {
    marginBottom: 12,
  },
  templateDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  templateDetailLabel: {
    fontSize: 14,
    color: colors.gray,
    marginRight: 4,
    width: 70,
  },
  templateDetailValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    flex: 1,
  },
  templateFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.grayLight,
    paddingTop: 12,
  },
  useTemplateText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  blankFormContainer: {
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  createButtonText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});