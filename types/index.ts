export type TemperatureLog = {
  id: string;
  equipmentId: string;
  temperature: number;
  timestamp: number;
  isWithinRange: boolean;
  notes?: string;
};

export type Equipment = {
  id: string;
  name: string;
  type: 'cooler' | 'freezer';
  minTemp: number;
  maxTemp: number;
};

export type ChecklistItem = {
  id: string;
  text: string;
  isCompleted: boolean;
  timestamp?: number;
};

export type Checklist = {
  id: string;
  name: string;
  type: 'opening' | 'closing' | 'critical';
  items: ChecklistItem[];
  date: number;
  isCompleted: boolean;
};

export type CoolingLog = {
  id: string;
  foodItem: string;
  startTime: number;
  targetEndTime: number;
  readings: {
    temperature: number;
    timestamp: number;
  }[];
  isCompleted: boolean;
  notes?: string;
};

export type Alert = {
  id: string;
  title: string;
  message: string;
  type: 'danger' | 'warning' | 'info';
  timestamp: number;
  isRead: boolean;
  relatedItemId?: string;
  relatedItemType?: 'temperature' | 'checklist' | 'cooling' | 'sanitation';
};

export type SanitationTask = {
  id: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  customDays?: number; // For custom frequency (in days)
  area: 'kitchen' | 'dining' | 'storage' | 'restroom' | 'exterior' | 'other';
  assignedTo?: string;
  lastCompleted?: number; // timestamp
  nextDue: number; // timestamp
  isActive: boolean;
};

export type SanitationLog = {
  id: string;
  taskId: string;
  completedBy: string;
  timestamp: number;
  notes?: string;
  photoUri?: string; // For storing photo evidence
};