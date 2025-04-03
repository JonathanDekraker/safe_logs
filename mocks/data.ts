import { Alert, Checklist, CoolingLog, Equipment, SanitationLog, SanitationTask, TemperatureLog } from '@/types';

export const mockEquipment: Equipment[] = [
  {
    id: '1',
    name: 'Main Cooler',
    type: 'cooler',
    minTemp: 32,
    maxTemp: 41,
  },
  {
    id: '2',
    name: 'Prep Area Cooler',
    type: 'cooler',
    minTemp: 32,
    maxTemp: 41,
  },
  {
    id: '3',
    name: 'Walk-in Freezer',
    type: 'freezer',
    minTemp: -10,
    maxTemp: 0,
  },
  {
    id: '4',
    name: 'Dessert Freezer',
    type: 'freezer',
    minTemp: -10,
    maxTemp: 0,
  },
];

export const mockTemperatureLogs: TemperatureLog[] = [
  {
    id: '1',
    equipmentId: '1',
    temperature: 38,
    timestamp: Date.now() - 3600000,
    isWithinRange: true,
  },
  {
    id: '2',
    equipmentId: '2',
    temperature: 36,
    timestamp: Date.now() - 3600000 * 2,
    isWithinRange: true,
  },
  {
    id: '3',
    equipmentId: '3',
    temperature: -5,
    timestamp: Date.now() - 3600000 * 3,
    isWithinRange: true,
  },
  {
    id: '4',
    equipmentId: '4',
    temperature: -2,
    timestamp: Date.now() - 3600000 * 4,
    isWithinRange: true,
  },
  {
    id: '5',
    equipmentId: '1',
    temperature: 43,
    timestamp: Date.now() - 3600000 * 24,
    isWithinRange: false,
    notes: 'Door was left open, fixed immediately',
  },
];

export const mockCriticalChecklist: Checklist = {
  id: '1',
  name: 'Daily Critical Violations Check',
  type: 'critical',
  date: Date.now(),
  isCompleted: false,
  items: [
    {
      id: '1',
      text: 'Verify all refrigerated items are below 41°F',
      isCompleted: true,
      timestamp: Date.now() - 1800000,
    },
    {
      id: '2',
      text: 'Ensure no cross-contamination between raw and cooked foods',
      isCompleted: true,
      timestamp: Date.now() - 1700000,
    },
    {
      id: '3',
      text: 'Check that all staff are wearing proper attire (hairnets, gloves)',
      isCompleted: false,
    },
    {
      id: '4',
      text: 'Verify handwashing stations are stocked and functional',
      isCompleted: false,
    },
    {
      id: '5',
      text: 'Ensure all food is properly labeled and dated',
      isCompleted: true,
      timestamp: Date.now() - 1600000,
    },
  ],
};

export const mockOpeningChecklist: Checklist = {
  id: '2',
  name: 'Morning Opening Procedures',
  type: 'opening',
  date: Date.now(),
  isCompleted: false,
  items: [
    {
      id: '1',
      text: 'Turn on all cooking equipment',
      isCompleted: true,
      timestamp: Date.now() - 28800000,
    },
    {
      id: '2',
      text: 'Check inventory levels for the day',
      isCompleted: true,
      timestamp: Date.now() - 28700000,
    },
    {
      id: '3',
      text: 'Ensure all surfaces are clean and sanitized',
      isCompleted: true,
      timestamp: Date.now() - 28600000,
    },
    {
      id: '4',
      text: 'Check temperatures of all coolers and freezers',
      isCompleted: true,
      timestamp: Date.now() - 28500000,
    },
    {
      id: '5',
      text: 'Prepare stations for service',
      isCompleted: false,
    },
  ],
};

export const mockClosingChecklist: Checklist = {
  id: '3',
  name: 'Evening Closing Procedures',
  type: 'closing',
  date: Date.now() - 86400000,
  isCompleted: true,
  items: [
    {
      id: '1',
      text: 'Turn off all equipment',
      isCompleted: true,
      timestamp: Date.now() - 86400000 + 3600000,
    },
    {
      id: '2',
      text: 'Clean and sanitize all surfaces',
      isCompleted: true,
      timestamp: Date.now() - 86400000 + 3500000,
    },
    {
      id: '3',
      text: 'Verify all perishable items are stored properly',
      isCompleted: true,
      timestamp: Date.now() - 86400000 + 3400000,
    },
    {
      id: '4',
      text: 'Take out trash and recycling',
      isCompleted: true,
      timestamp: Date.now() - 86400000 + 3300000,
    },
    {
      id: '5',
      text: 'Set alarm and lock all doors',
      isCompleted: true,
      timestamp: Date.now() - 86400000 + 3200000,
    },
  ],
};

export const mockCoolingLogs: CoolingLog[] = [
  {
    id: '1',
    foodItem: 'Chicken Soup',
    startTime: Date.now() - 7200000,
    targetEndTime: Date.now() - 3600000,
    isCompleted: true,
    readings: [
      {
        temperature: 165,
        timestamp: Date.now() - 7200000,
      },
      {
        temperature: 120,
        timestamp: Date.now() - 6000000,
      },
      {
        temperature: 70,
        timestamp: Date.now() - 4800000,
      },
      {
        temperature: 41,
        timestamp: Date.now() - 3600000,
      },
    ],
  },
  {
    id: '2',
    foodItem: 'Beef Stew',
    startTime: Date.now() - 3600000,
    targetEndTime: Date.now() + 3600000,
    isCompleted: false,
    readings: [
      {
        temperature: 170,
        timestamp: Date.now() - 3600000,
      },
      {
        temperature: 130,
        timestamp: Date.now() - 2400000,
      },
      {
        temperature: 90,
        timestamp: Date.now() - 1200000,
      },
    ],
  },
];

export const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'Temperature Alert',
    message: 'Main Cooler temperature is above safe range (43°F)',
    type: 'danger',
    timestamp: Date.now() - 3600000 * 24,
    isRead: true,
    relatedItemId: '5',
    relatedItemType: 'temperature',
  },
  {
    id: '2',
    title: 'Checklist Reminder',
    message: 'Critical violations checklist is not complete',
    type: 'warning',
    timestamp: Date.now() - 1800000,
    isRead: false,
    relatedItemId: '1',
    relatedItemType: 'checklist',
  },
  {
    id: '3',
    title: 'Cooling Log Due',
    message: 'Beef Stew needs final temperature reading',
    type: 'info',
    timestamp: Date.now() - 600000,
    isRead: false,
    relatedItemId: '2',
    relatedItemType: 'cooling',
  },
];

// Calculate dates for sanitation tasks
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);
tomorrow.setHours(9, 0, 0, 0);

const nextWeek = new Date(today);
nextWeek.setDate(nextWeek.getDate() + 7);
nextWeek.setHours(9, 0, 0, 0);

const lastWeek = new Date(today);
lastWeek.setDate(lastWeek.getDate() - 7);

const yesterday = new Date(today);
yesterday.setDate(yesterday.getDate() - 1);

export const mockSanitationTasks: SanitationTask[] = [
  {
    id: '1',
    name: 'Clean and sanitize prep surfaces',
    description: 'Thoroughly clean and sanitize all food preparation surfaces with approved sanitizer',
    frequency: 'daily',
    area: 'kitchen',
    assignedTo: 'Kitchen Staff',
    lastCompleted: yesterday.getTime(),
    nextDue: tomorrow.getTime(),
    isActive: true,
  },
  {
    id: '2',
    name: 'Deep clean refrigerators',
    description: 'Remove all items, clean interior surfaces, and sanitize',
    frequency: 'weekly',
    area: 'kitchen',
    assignedTo: 'Kitchen Manager',
    lastCompleted: lastWeek.getTime(),
    nextDue: nextWeek.getTime(),
    isActive: true,
  },
  {
    id: '3',
    name: 'Clean floor drains',
    description: 'Remove drain covers, clean with brush, and sanitize with bleach solution',
    frequency: 'weekly',
    area: 'kitchen',
    assignedTo: 'Closing Staff',
    lastCompleted: lastWeek.getTime(),
    nextDue: nextWeek.getTime(),
    isActive: true,
  },
  {
    id: '4',
    name: 'Clean and sanitize restrooms',
    description: 'Clean all surfaces, restock supplies, and sanitize',
    frequency: 'daily',
    area: 'restroom',
    assignedTo: 'Cleaning Staff',
    lastCompleted: yesterday.getTime(),
    nextDue: tomorrow.getTime(),
    isActive: true,
  },
  {
    id: '5',
    name: 'Clean exhaust hoods',
    description: 'Remove and clean filters, wipe down hood surfaces',
    frequency: 'monthly',
    area: 'kitchen',
    assignedTo: 'Maintenance',
    nextDue: new Date(today.getFullYear(), today.getMonth() + 1, 1).getTime(),
    isActive: true,
  },
];

export const mockSanitationLogs: SanitationLog[] = [
  {
    id: '1',
    taskId: '1',
    completedBy: 'John Smith',
    timestamp: yesterday.getTime(),
    notes: 'All surfaces cleaned and sanitized with quaternary sanitizer',
  },
  {
    id: '2',
    taskId: '4',
    completedBy: 'Maria Garcia',
    timestamp: yesterday.getTime(),
    notes: 'Restocked paper towels and soap',
  },
  {
    id: '3',
    taskId: '2',
    completedBy: 'David Johnson',
    timestamp: lastWeek.getTime(),
    notes: 'Found and discarded expired items during cleaning',
  },
  {
    id: '4',
    taskId: '3',
    completedBy: 'Sarah Williams',
    timestamp: lastWeek.getTime(),
    notes: 'All drains flowing properly after cleaning',
  },
];