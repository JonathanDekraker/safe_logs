import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { Alert, Checklist, CoolingLog, Equipment, SanitationLog, SanitationTask, TemperatureLog } from '@/types';
import { mockAlerts, mockClosingChecklist, mockCoolingLogs, mockCriticalChecklist, mockEquipment, mockOpeningChecklist, mockSanitationLogs, mockSanitationTasks, mockTemperatureLogs } from '@/mocks/data';

interface AppState {
  equipment: Equipment[];
  temperatureLogs: TemperatureLog[];
  checklists: Checklist[];
  coolingLogs: CoolingLog[];
  alerts: Alert[];
  sanitationTasks: SanitationTask[];
  sanitationLogs: SanitationLog[];
  
  // Equipment actions
  addEquipment: (equipment: Omit<Equipment, 'id'>) => void;
  updateEquipment: (equipment: Equipment) => void;
  deleteEquipment: (id: string) => void;
  
  // Temperature log actions
  addTemperatureLog: (log: Omit<TemperatureLog, 'id' | 'timestamp' | 'isWithinRange'>) => void;
  
  // Checklist actions
  addChecklist: (checklist: Omit<Checklist, 'id' | 'date' | 'isCompleted'>) => void;
  updateChecklistItem: (checklistId: string, itemId: string, isCompleted: boolean) => void;
  addChecklistItem: (checklistId: string, item: { text: string, isCompleted: boolean }) => void;
  
  // Cooling log actions
  addCoolingLog: (log: Omit<CoolingLog, 'id' | 'readings' | 'isCompleted'>) => void;
  addCoolingReading: (logId: string, temperature: number) => void;
  completeCoolingLog: (logId: string) => void;
  
  // Alert actions
  markAlertAsRead: (id: string) => void;
  clearAlert: (id: string) => void;
  
  // Sanitation task actions
  addSanitationTask: (task: Omit<SanitationTask, 'id' | 'lastCompleted' | 'nextDue'>) => void;
  updateSanitationTask: (task: SanitationTask) => void;
  deleteSanitationTask: (id: string) => void;
  
  // Sanitation log actions
  completeSanitationTask: (taskId: string, log: Omit<SanitationLog, 'id' | 'taskId' | 'timestamp'>) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      equipment: mockEquipment,
      temperatureLogs: mockTemperatureLogs,
      checklists: [mockCriticalChecklist, mockOpeningChecklist, mockClosingChecklist],
      coolingLogs: mockCoolingLogs,
      alerts: mockAlerts,
      sanitationTasks: mockSanitationTasks,
      sanitationLogs: mockSanitationLogs,
      
      // Equipment actions
      addEquipment: (equipment) => 
        set((state) => ({
          equipment: [...state.equipment, { ...equipment, id: Date.now().toString() }]
        })),
      
      updateEquipment: (updatedEquipment) => 
        set((state) => ({
          equipment: state.equipment.map(item => 
            item.id === updatedEquipment.id ? updatedEquipment : item
          )
        })),
      
      deleteEquipment: (id) => 
        set((state) => ({
          equipment: state.equipment.filter(item => item.id !== id)
        })),
      
      // Temperature log actions
      addTemperatureLog: (log) => 
        set((state) => {
          const equipment = state.equipment.find(e => e.id === log.equipmentId);
          if (!equipment) return state;
          
          const isWithinRange = 
            log.temperature >= equipment.minTemp && 
            log.temperature <= equipment.maxTemp;
          
          const newLog: TemperatureLog = {
            ...log,
            id: Date.now().toString(),
            timestamp: Date.now(),
            isWithinRange
          };
          
          // Create alert if temperature is out of range
          let newAlerts = [...state.alerts];
          if (!isWithinRange) {
            newAlerts.push({
              id: Date.now().toString(),
              title: 'Temperature Alert',
              message: `${equipment.name} temperature is ${log.temperature > equipment.maxTemp ? 'above' : 'below'} safe range (${log.temperature}°F)`,
              type: 'danger',
              timestamp: Date.now(),
              isRead: false,
              relatedItemId: newLog.id,
              relatedItemType: 'temperature'
            });
          }
          
          return {
            temperatureLogs: [newLog, ...state.temperatureLogs],
            alerts: newAlerts
          };
        }),
      
      // Checklist actions
      addChecklist: (checklist) => 
        set((state) => ({
          checklists: [
            ...state.checklists, 
            { 
              ...checklist, 
              id: Date.now().toString(), 
              date: Date.now(),
              isCompleted: false
            }
          ]
        })),
      
      updateChecklistItem: (checklistId, itemId, isCompleted) => 
        set((state) => {
          const updatedChecklists = state.checklists.map(checklist => {
            if (checklist.id !== checklistId) return checklist;
            
            const updatedItems = checklist.items.map(item => {
              if (item.id !== itemId) return item;
              return { 
                ...item, 
                isCompleted, 
                timestamp: isCompleted ? Date.now() : undefined 
              };
            });
            
            const allCompleted = updatedItems.every(item => item.isCompleted);
            
            return {
              ...checklist,
              items: updatedItems,
              isCompleted: allCompleted
            };
          });
          
          return { checklists: updatedChecklists };
        }),
      
      addChecklistItem: (checklistId, item) => 
        set((state) => {
          const updatedChecklists = state.checklists.map(checklist => {
            if (checklist.id !== checklistId) return checklist;
            
            const newItem = {
              ...item,
              id: Date.now().toString(),
              timestamp: undefined
            };
            
            return {
              ...checklist,
              items: [...checklist.items, newItem],
              isCompleted: checklist.items.every(item => item.isCompleted) && !newItem.isCompleted
            };
          });
          
          return { checklists: updatedChecklists };
        }),
      
      // Cooling log actions
      addCoolingLog: (log) => 
        set((state) => ({
          coolingLogs: [
            ...state.coolingLogs,
            {
              ...log,
              id: Date.now().toString(),
              readings: [],
              isCompleted: false
            }
          ]
        })),
      
      addCoolingReading: (logId, temperature) => 
        set((state) => {
          const updatedLogs = state.coolingLogs.map(log => {
            if (log.id !== logId) return log;
            
            const newReading = {
              temperature,
              timestamp: Date.now()
            };
            
            return {
              ...log,
              readings: [...log.readings, newReading]
            };
          });
          
          return { coolingLogs: updatedLogs };
        }),
      
      completeCoolingLog: (logId) => 
        set((state) => ({
          coolingLogs: state.coolingLogs.map(log => 
            log.id === logId ? { ...log, isCompleted: true } : log
          )
        })),
      
      // Alert actions
      markAlertAsRead: (id) => 
        set((state) => ({
          alerts: state.alerts.map(alert => 
            alert.id === id ? { ...alert, isRead: true } : alert
          )
        })),
      
      clearAlert: (id) => 
        set((state) => ({
          alerts: state.alerts.filter(alert => alert.id !== id)
        })),
      
      // Sanitation task actions
      addSanitationTask: (task) => 
        set((state) => {
          const now = new Date();
          let nextDue: Date;
          
          // Calculate next due date based on frequency
          switch (task.frequency) {
            case 'daily':
              nextDue = new Date(now);
              nextDue.setDate(nextDue.getDate() + 1);
              nextDue.setHours(9, 0, 0, 0); // Set to 9 AM next day
              break;
            case 'weekly':
              nextDue = new Date(now);
              nextDue.setDate(nextDue.getDate() + 7);
              nextDue.setHours(9, 0, 0, 0);
              break;
            case 'monthly':
              nextDue = new Date(now);
              nextDue.setMonth(nextDue.getMonth() + 1);
              nextDue.setDate(1); // First day of next month
              nextDue.setHours(9, 0, 0, 0);
              break;
            case 'quarterly':
              nextDue = new Date(now);
              nextDue.setMonth(nextDue.getMonth() + 3);
              nextDue.setDate(1);
              nextDue.setHours(9, 0, 0, 0);
              break;
            case 'custom':
              nextDue = new Date(now);
              nextDue.setDate(nextDue.getDate() + (task.customDays || 14)); // Default to 14 days if not specified
              nextDue.setHours(9, 0, 0, 0);
              break;
            default:
              nextDue = new Date(now);
              nextDue.setDate(nextDue.getDate() + 1);
              nextDue.setHours(9, 0, 0, 0);
          }
          
          const newTask: SanitationTask = {
            ...task,
            id: Date.now().toString(),
            nextDue: nextDue.getTime(),
            isActive: true
          };
          
          return {
            sanitationTasks: [...state.sanitationTasks, newTask]
          };
        }),
      
      updateSanitationTask: (updatedTask) => 
        set((state) => ({
          sanitationTasks: state.sanitationTasks.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          )
        })),
      
      deleteSanitationTask: (id) => 
        set((state) => ({
          sanitationTasks: state.sanitationTasks.filter(task => task.id !== id)
        })),
      
      // Sanitation log actions
      completeSanitationTask: (taskId, log) => 
        set((state) => {
          const now = Date.now();
          const task = state.sanitationTasks.find(t => t.id === taskId);
          
          if (!task) return state;
          
          // Create a new log entry
          const newLog: SanitationLog = {
            ...log,
            id: now.toString(),
            taskId,
            timestamp: now
          };
          
          // Calculate next due date based on frequency
          let nextDue: Date;
          switch (task.frequency) {
            case 'daily':
              nextDue = new Date();
              nextDue.setDate(nextDue.getDate() + 1);
              nextDue.setHours(9, 0, 0, 0);
              break;
            case 'weekly':
              nextDue = new Date();
              nextDue.setDate(nextDue.getDate() + 7);
              nextDue.setHours(9, 0, 0, 0);
              break;
            case 'monthly':
              nextDue = new Date();
              nextDue.setMonth(nextDue.getMonth() + 1);
              nextDue.setDate(1);
              nextDue.setHours(9, 0, 0, 0);
              break;
            case 'quarterly':
              nextDue = new Date();
              nextDue.setMonth(nextDue.getMonth() + 3);
              nextDue.setDate(1);
              nextDue.setHours(9, 0, 0, 0);
              break;
            case 'custom':
              nextDue = new Date();
              nextDue.setDate(nextDue.getDate() + (task.customDays || 14));
              nextDue.setHours(9, 0, 0, 0);
              break;
            default:
              nextDue = new Date();
              nextDue.setDate(nextDue.getDate() + 1);
              nextDue.setHours(9, 0, 0, 0);
          }
          
          // Update the task with new lastCompleted and nextDue dates
          const updatedTasks = state.sanitationTasks.map(t => {
            if (t.id === taskId) {
              return {
                ...t,
                lastCompleted: now,
                nextDue: nextDue.getTime()
              };
            }
            return t;
          });
          
          return {
            sanitationLogs: [newLog, ...state.sanitationLogs],
            sanitationTasks: updatedTasks
          };
        }),
    }),
    {
      name: 'safelogs-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);