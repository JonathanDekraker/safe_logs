import { TemperatureLog, CoolingLog } from './index';

export type HazardType = 'biological' | 'chemical' | 'physical' | 'allergen';

export type Hazard = {
  id: string;
  name: string;
  type: HazardType;
  description: string;
};

export type ControlMeasure = {
  id: string;
  description: string;
};

export type MonitoringProcedure = {
  id: string;
  description: string;
  frequency: string; // e.g., "Every 4 hours", "Each batch"
  responsiblePerson: string;
};

export type CriticalLimit = {
  id: string;
  parameter: string; // e.g., "Temperature", "Time", "pH"
  minimum?: number;
  maximum?: number;
  units: string; // e.g., "°F", "hours", "pH units"
};

export type CorrectiveAction = {
  id: string;
  description: string;
  responsiblePerson: string;
};

export type VerificationActivity = {
  id: string;
  description: string;
  frequency: string;
  responsiblePerson: string;
};

export type CriticalControlPoint = {
  id: string;
  step: string; // e.g., "Cooking", "Cooling", "Storage"
  hazards: string[]; // IDs of associated hazards
  controlMeasures: ControlMeasure[];
  criticalLimits: CriticalLimit[];
  monitoringProcedures: MonitoringProcedure[];
  correctiveActions: CorrectiveAction[];
  verificationActivities: VerificationActivity[];
  recordkeepingProcedures: string;
  linkedTemperatureEquipment?: string[]; // IDs of equipment to monitor
  linkedCoolingProcesses?: boolean; // Whether to link cooling logs
};

export type CCPMonitoringLog = {
  id: string;
  ccpId: string;
  timestamp: number;
  parameters: {
    parameter: string;
    value: number;
    units: string;
    withinLimits: boolean;
  }[];
  notes?: string;
  monitoredBy: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
};

export type CorrectiveActionLog = {
  id: string;
  ccpId: string;
  monitoringLogId?: string;
  timestamp: number;
  description: string;
  actionTaken: string;
  takenBy: string;
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: number;
  followUpRequired: boolean;
  followUpDescription?: string;
  followUpCompleted: boolean;
  followUpCompletedAt?: number;
  followUpCompletedBy?: string;
};

export type HACCPPlan = {
  id: string;
  name: string;
  description: string;
  product: string;
  intendedUse: string;
  processFlow: string[];
  hazards: Hazard[];
  criticalControlPoints: CriticalControlPoint[];
  createdAt: number;
  updatedAt: number;
  active: boolean;
};

export type HACCPTemplate = {
  id: string;
  name: string;
  description: string;
  product: string;
  intendedUse: string;
  processFlow: string[];
  hazards: Omit<Hazard, 'id'>[];
  criticalControlPoints: Omit<CriticalControlPoint, 'id' | 'hazards'> & { 
    hazardIndices: number[] 
  }[];
};