import { HACCPTemplate } from '@/types/haccp';

export const hacppTemplates: HACCPTemplate[] = [
  {
    id: 'template-1',
    name: 'Hot Food Preparation HACCP Plan',
    description: 'A comprehensive HACCP plan for hot food preparation in restaurants and food service establishments.',
    product: 'Hot prepared foods',
    intendedUse: 'Immediate consumption',
    processFlow: [
      'Receiving',
      'Storage',
      'Preparation',
      'Cooking',
      'Hot Holding',
      'Serving'
    ],
    hazards: [
      {
        name: 'Bacterial Pathogens',
        type: 'biological',
        description: 'Salmonella, E. coli, Listeria, and other bacterial pathogens that can cause foodborne illness.'
      },
      {
        name: 'Cross-Contamination',
        type: 'biological',
        description: 'Transfer of harmful bacteria from raw foods to ready-to-eat foods.'
      },
      {
        name: 'Time-Temperature Abuse',
        type: 'biological',
        description: 'Allowing food to remain in the temperature danger zone (41°F to 135°F) for extended periods.'
      }
    ],
    criticalControlPoints: [
      {
        step: 'Cooking',
        hazardIndices: [0, 2],
        controlMeasures: [
          { id: 'cm-1', description: 'Cook foods to proper internal temperatures to kill pathogens.' }
        ],
        criticalLimits: [
          { id: 'cl-1', parameter: 'Internal Temperature', minimum: 165, units: '°F' }
        ],
        monitoringProcedures: [
          { 
            id: 'mp-1', 
            description: 'Check internal temperature of food using a calibrated thermometer.',
            frequency: 'Every batch',
            responsiblePerson: 'Cook'
          }
        ],
        correctiveActions: [
          {
            id: 'ca-1',
            description: 'Continue cooking until proper temperature is reached. If proper temperature cannot be reached, discard the food.',
            responsiblePerson: 'Cook/Manager'
          }
        ],
        verificationActivities: [
          {
            id: 'va-1',
            description: 'Review temperature logs daily. Calibrate thermometers weekly.',
            frequency: 'Daily/Weekly',
            responsiblePerson: 'Manager'
          }
        ],
        recordkeepingProcedures: 'Maintain cooking temperature logs, thermometer calibration logs, and corrective action reports.'
      },
      {
        step: 'Hot Holding',
        hazardIndices: [0, 2],
        controlMeasures: [
          { id: 'cm-2', description: 'Hold hot foods at proper temperatures to prevent bacterial growth.' }
        ],
        criticalLimits: [
          { id: 'cl-2', parameter: 'Hot Holding Temperature', minimum: 135, units: '°F' }
        ],
        monitoringProcedures: [
          { 
            id: 'mp-2', 
            description: 'Check temperature of hot holding units and food items using a calibrated thermometer.',
            frequency: 'Every 2 hours',
            responsiblePerson: 'Cook/Server'
          }
        ],
        correctiveActions: [
          {
            id: 'ca-2',
            description: 'Reheat food to 165°F if found below 135°F for less than 2 hours. Discard if below 135°F for more than 2 hours.',
            responsiblePerson: 'Cook/Manager'
          }
        ],
        verificationActivities: [
          {
            id: 'va-2',
            description: 'Review hot holding temperature logs daily. Verify hot holding equipment functionality.',
            frequency: 'Daily',
            responsiblePerson: 'Manager'
          }
        ],
        recordkeepingProcedures: 'Maintain hot holding temperature logs, equipment maintenance records, and corrective action reports.'
      }
    ]
  },
  {
    id: 'template-2',
    name: 'Cold Food Storage HACCP Plan',
    description: 'A HACCP plan for cold food storage and preparation in food service establishments.',
    product: 'Cold prepared and stored foods',
    intendedUse: 'Immediate consumption or storage',
    processFlow: [
      'Receiving',
      'Cold Storage',
      'Preparation',
      'Display',
      'Serving'
    ],
    hazards: [
      {
        name: 'Bacterial Growth',
        type: 'biological',
        description: 'Growth of harmful bacteria due to improper refrigeration temperatures.'
      },
      {
        name: 'Chemical Contamination',
        type: 'chemical',
        description: 'Contamination from cleaning chemicals or other chemical hazards.'
      },
      {
        name: 'Physical Contaminants',
        type: 'physical',
        description: 'Foreign objects such as glass, metal, or plastic in food.'
      }
    ],
    criticalControlPoints: [
      {
        step: 'Cold Storage',
        hazardIndices: [0],
        controlMeasures: [
          { id: 'cm-1', description: 'Maintain proper refrigeration temperatures to prevent bacterial growth.' }
        ],
        criticalLimits: [
          { id: 'cl-1', parameter: 'Refrigeration Temperature', maximum: 41, units: '°F' }
        ],
        monitoringProcedures: [
          { 
            id: 'mp-1', 
            description: 'Check refrigerator temperatures using calibrated thermometers.',
            frequency: 'Every 4 hours',
            responsiblePerson: 'Kitchen Staff'
          }
        ],
        correctiveActions: [
          {
            id: 'ca-1',
            description: 'Adjust refrigerator settings if temperature is above 41°F. Move food to functioning unit if necessary. Discard food if above 41°F for more than 4 hours.',
            responsiblePerson: 'Manager'
          }
        ],
        verificationActivities: [
          {
            id: 'va-1',
            description: 'Review temperature logs daily. Calibrate thermometers weekly.',
            frequency: 'Daily/Weekly',
            responsiblePerson: 'Manager'
          }
        ],
        recordkeepingProcedures: 'Maintain refrigeration temperature logs, thermometer calibration logs, and corrective action reports.'
      },
      {
        step: 'Cold Display',
        hazardIndices: [0],
        controlMeasures: [
          { id: 'cm-2', description: 'Maintain proper cold holding temperatures during display.' }
        ],
        criticalLimits: [
          { id: 'cl-2', parameter: 'Cold Holding Temperature', maximum: 41, units: '°F' }
        ],
        monitoringProcedures: [
          { 
            id: 'mp-2', 
            description: 'Check temperature of cold display units and food items using a calibrated thermometer.',
            frequency: 'Every 2 hours',
            responsiblePerson: 'Server/Manager'
          }
        ],
        correctiveActions: [
          {
            id: 'ca-2',
            description: 'Adjust display unit settings if temperature is above 41°F. Move food to functioning unit if necessary. Discard food if above 41°F for more than 4 hours.',
            responsiblePerson: 'Manager'
          }
        ],
        verificationActivities: [
          {
            id: 'va-2',
            description: 'Review cold holding temperature logs daily. Verify cold display equipment functionality.',
            frequency: 'Daily',
            responsiblePerson: 'Manager'
          }
        ],
        recordkeepingProcedures: 'Maintain cold holding temperature logs, equipment maintenance records, and corrective action reports.'
      }
    ]
  },
  {
    id: 'template-3',
    name: 'Cooling Process HACCP Plan',
    description: 'A HACCP plan for properly cooling hot foods to prevent bacterial growth during the cooling process.',
    product: 'Cooked foods that require cooling',
    intendedUse: 'Storage and later reheating/serving',
    processFlow: [
      'Cooking',
      'Initial Cooling',
      'Final Cooling',
      'Cold Storage',
      'Reheating',
      'Serving'
    ],
    hazards: [
      {
        name: 'Bacterial Growth During Cooling',
        type: 'biological',
        description: 'Growth of spore-forming bacteria like C. perfringens and B. cereus during slow cooling.'
      },
      {
        name: 'Toxin Formation',
        type: 'biological',
        description: 'Formation of heat-stable toxins during improper cooling.'
      }
    ],
    criticalControlPoints: [
      {
        step: 'Initial Cooling',
        hazardIndices: [0, 1],
        controlMeasures: [
          { id: 'cm-1', description: 'Rapidly cool hot foods using appropriate cooling methods.' }
        ],
        criticalLimits: [
          { id: 'cl-1', parameter: 'Cooling Time (135°F to 70°F)', maximum: 2, units: 'hours' }
        ],
        monitoringProcedures: [
          { 
            id: 'mp-1', 
            description: 'Check food temperatures using a calibrated thermometer at the start of cooling and after 2 hours.',
            frequency: 'Every cooling batch',
            responsiblePerson: 'Cook'
          }
        ],
        correctiveActions: [
          {
            id: 'ca-1',
            description: 'If food has not reached 70°F within 2 hours, reheat to 165°F and restart the cooling process using more efficient methods. If unable to cool properly, discard the food.',
            responsiblePerson: 'Cook/Manager'
          }
        ],
        verificationActivities: [
          {
            id: 'va-1',
            description: 'Review cooling logs daily. Verify cooling equipment functionality.',
            frequency: 'Daily',
            responsiblePerson: 'Manager'
          }
        ],
        recordkeepingProcedures: 'Maintain cooling temperature logs, time records, and corrective action reports.'
      },
      {
        step: 'Final Cooling',
        hazardIndices: [0, 1],
        controlMeasures: [
          { id: 'cm-2', description: 'Continue cooling process to reach safe refrigeration temperature.' }
        ],
        criticalLimits: [
          { id: 'cl-2', parameter: 'Cooling Time (70°F to 41°F)', maximum: 4, units: 'hours' }
        ],
        monitoringProcedures: [
          { 
            id: 'mp-2', 
            description: 'Check food temperatures using a calibrated thermometer after initial cooling and at the end of the cooling process.',
            frequency: 'Every cooling batch',
            responsiblePerson: 'Cook'
          }
        ],
        correctiveActions: [
          {
            id: 'ca-2',
            description: 'If food has not reached 41°F within 4 hours after reaching 70°F (total 6 hours from start), discard the food.',
            responsiblePerson: 'Cook/Manager'
          }
        ],
        verificationActivities: [
          {
            id: 'va-2',
            description: 'Review cooling logs daily. Verify cooling procedures are being followed correctly.',
            frequency: 'Daily',
            responsiblePerson: 'Manager'
          }
        ],
        recordkeepingProcedures: 'Maintain cooling temperature logs, time records, and corrective action reports.'
      }
    ]
  }
];