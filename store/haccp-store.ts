import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { 
  CCPMonitoringLog, 
  CorrectiveActionLog, 
  CriticalControlPoint, 
  HACCPPlan, 
  HACCPTemplate, 
  Hazard 
} from '@/types/haccp';
import { hacppTemplates } from '@/mocks/haccp-templates';

interface HACCPState {
  plans: HACCPPlan[];
  monitoringLogs: CCPMonitoringLog[];
  correctiveActionLogs: CorrectiveActionLog[];
  templates: HACCPTemplate[];
  
  // Plan actions
  createPlan: (plan: Omit<HACCPPlan, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePlan: (plan: HACCPPlan) => void;
  deletePlan: (id: string) => void;
  createPlanFromTemplate: (templateId: string, name: string) => string;
  
  // CCP actions
  addCCPToPlan: (planId: string, ccp: Omit<CriticalControlPoint, 'id'>) => string;
  updateCCP: (planId: string, ccp: CriticalControlPoint) => void;
  deleteCCP: (planId: string, ccpId: string) => void;
  
  // Hazard actions
  addHazardToPlan: (planId: string, hazard: Omit<Hazard, 'id'>) => string;
  updateHazard: (planId: string, hazard: Hazard) => void;
  deleteHazard: (planId: string, hazardId: string) => void;
  
  // Monitoring actions
  addMonitoringLog: (log: Omit<CCPMonitoringLog, 'id' | 'timestamp' | 'verified'>) => string;
  verifyMonitoringLog: (logId: string, verifiedBy: string) => void;
  
  // Corrective action actions
  addCorrectiveActionLog: (log: Omit<CorrectiveActionLog, 'id' | 'timestamp' | 'verified' | 'followUpCompleted'>) => string;
  verifyCorrectiveAction: (logId: string, verifiedBy: string) => void;
  completeFollowUp: (logId: string, completedBy: string, description?: string) => void;
}

export const useHACCPStore = create<HACCPState>()(
  persist(
    (set, get) => ({
      plans: [],
      monitoringLogs: [],
      correctiveActionLogs: [],
      templates: hacppTemplates,
      
      createPlan: (planData) => {
        const id = Date.now().toString();
        const now = Date.now();
        
        const newPlan: HACCPPlan = {
          ...planData,
          id,
          createdAt: now,
          updatedAt: now
        };
        
        set((state) => ({
          plans: [...state.plans, newPlan]
        }));
        
        return id;
      },
      
      updatePlan: (updatedPlan) => {
        set((state) => ({
          plans: state.plans.map(plan => 
            plan.id === updatedPlan.id 
              ? { ...updatedPlan, updatedAt: Date.now() } 
              : plan
          )
        }));
      },
      
      deletePlan: (id) => {
        set((state) => ({
          plans: state.plans.filter(plan => plan.id !== id)
        }));
      },
      
      createPlanFromTemplate: (templateId, name) => {
        const template = get().templates.find(t => t.id === templateId);
        if (!template) return '';
        
        const now = Date.now();
        const id = now.toString();
        
        // Create hazards from template
        const hazards: Hazard[] = template.hazards.map((hazard, index) => ({
          ...hazard,
          id: `${id}-hazard-${index}`
        }));
        
        // Create CCPs from template
        const criticalControlPoints: CriticalControlPoint[] = template.criticalControlPoints.map((ccp, ccpIndex) => {
          // Map hazard indices to actual hazard IDs
          const hazardIds = ccp.hazardIndices.map(index => {
            if (index < hazards.length) {
              return hazards[index].id;
            }
            return '';
          }).filter(id => id !== '');
          
          return {
            ...ccp,
            id: `${id}-ccp-${ccpIndex}`,
            hazards: hazardIds
          };
        });
        
        const newPlan: HACCPPlan = {
          id,
          name: name || template.name,
          description: template.description,
          product: template.product,
          intendedUse: template.intendedUse,
          processFlow: [...template.processFlow],
          hazards,
          criticalControlPoints,
          createdAt: now,
          updatedAt: now,
          active: true
        };
        
        set((state) => ({
          plans: [...state.plans, newPlan]
        }));
        
        return id;
      },
      
      addCCPToPlan: (planId, ccpData) => {
        const ccpId = `${planId}-ccp-${Date.now()}`;
        
        const newCCP: CriticalControlPoint = {
          ...ccpData,
          id: ccpId
        };
        
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === planId) {
              return {
                ...plan,
                criticalControlPoints: [...plan.criticalControlPoints, newCCP],
                updatedAt: Date.now()
              };
            }
            return plan;
          })
        }));
        
        return ccpId;
      },
      
      updateCCP: (planId, updatedCCP) => {
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === planId) {
              return {
                ...plan,
                criticalControlPoints: plan.criticalControlPoints.map(ccp => 
                  ccp.id === updatedCCP.id ? updatedCCP : ccp
                ),
                updatedAt: Date.now()
              };
            }
            return plan;
          })
        }));
      },
      
      deleteCCP: (planId, ccpId) => {
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === planId) {
              return {
                ...plan,
                criticalControlPoints: plan.criticalControlPoints.filter(ccp => ccp.id !== ccpId),
                updatedAt: Date.now()
              };
            }
            return plan;
          })
        }));
      },
      
      addHazardToPlan: (planId, hazardData) => {
        const hazardId = `${planId}-hazard-${Date.now()}`;
        
        const newHazard: Hazard = {
          ...hazardData,
          id: hazardId
        };
        
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === planId) {
              return {
                ...plan,
                hazards: [...plan.hazards, newHazard],
                updatedAt: Date.now()
              };
            }
            return plan;
          })
        }));
        
        return hazardId;
      },
      
      updateHazard: (planId, updatedHazard) => {
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === planId) {
              return {
                ...plan,
                hazards: plan.hazards.map(hazard => 
                  hazard.id === updatedHazard.id ? updatedHazard : hazard
                ),
                updatedAt: Date.now()
              };
            }
            return plan;
          })
        }));
      },
      
      deleteHazard: (planId, hazardId) => {
        set((state) => ({
          plans: state.plans.map(plan => {
            if (plan.id === planId) {
              // Remove hazard from plan
              const updatedPlan = {
                ...plan,
                hazards: plan.hazards.filter(hazard => hazard.id !== hazardId),
                updatedAt: Date.now()
              };
              
              // Also remove this hazard from any CCPs that reference it
              updatedPlan.criticalControlPoints = updatedPlan.criticalControlPoints.map(ccp => ({
                ...ccp,
                hazards: ccp.hazards.filter(id => id !== hazardId)
              }));
              
              return updatedPlan;
            }
            return plan;
          })
        }));
      },
      
      addMonitoringLog: (logData) => {
        const id = Date.now().toString();
        
        const newLog: CCPMonitoringLog = {
          ...logData,
          id,
          timestamp: Date.now(),
          verified: false
        };
        
        set((state) => ({
          monitoringLogs: [...state.monitoringLogs, newLog]
        }));
        
        // Check if any parameters are outside limits and create corrective action log if needed
        const outOfLimitParams = newLog.parameters.filter(param => !param.withinLimits);
        
        if (outOfLimitParams.length > 0) {
          const correctiveActionLog: Omit<CorrectiveActionLog, 'id' | 'timestamp' | 'verified' | 'followUpCompleted'> = {
            ccpId: newLog.ccpId,
            monitoringLogId: id,
            description: `Parameters outside critical limits: ${outOfLimitParams.map(p => `${p.parameter} (${p.value} ${p.units})`).join(', ')}`,
            actionTaken: 'Corrective action required',
            takenBy: newLog.monitoredBy,
            followUpRequired: true
          };
          
          get().addCorrectiveActionLog(correctiveActionLog);
        }
        
        return id;
      },
      
      verifyMonitoringLog: (logId, verifiedBy) => {
        set((state) => ({
          monitoringLogs: state.monitoringLogs.map(log => {
            if (log.id === logId) {
              return {
                ...log,
                verified: true,
                verifiedBy,
                verifiedAt: Date.now()
              };
            }
            return log;
          })
        }));
      },
      
      addCorrectiveActionLog: (logData) => {
        const id = Date.now().toString();
        
        const newLog: CorrectiveActionLog = {
          ...logData,
          id,
          timestamp: Date.now(),
          verified: false,
          followUpCompleted: false
        };
        
        set((state) => ({
          correctiveActionLogs: [...state.correctiveActionLogs, newLog]
        }));
        
        return id;
      },
      
      verifyCorrectiveAction: (logId, verifiedBy) => {
        set((state) => ({
          correctiveActionLogs: state.correctiveActionLogs.map(log => {
            if (log.id === logId) {
              return {
                ...log,
                verified: true,
                verifiedBy,
                verifiedAt: Date.now()
              };
            }
            return log;
          })
        }));
      },
      
      completeFollowUp: (logId, completedBy, description) => {
        set((state) => ({
          correctiveActionLogs: state.correctiveActionLogs.map(log => {
            if (log.id === logId) {
              return {
                ...log,
                followUpCompleted: true,
                followUpCompletedAt: Date.now(),
                followUpCompletedBy: completedBy,
                followUpDescription: description || log.followUpDescription
              };
            }
            return log;
          })
        }));
      }
    }),
    {
      name: 'haccp-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);