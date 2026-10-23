export type Role = 'citizen' | 'collection_engineer' | 'factory_engineer' | 'auditor' | 'admin';

export type DeviceCondition = 'working' | 'locked' | 'not_booting';

export type DeviceStatus =
  | 'REGISTERED'
  | 'DETAILS_CONFIRMED'
  | 'HOLD'
  | 'WIPING'
  | 'WIPE_VERIFIED'
  | 'PAYMENT_SENT'
  | 'PAYMENT_ACKNOWLEDGED'
  | 'READY_FOR_DISPATCH'
  | 'FACTORY_INSPECTION'
  | 'FLAGGED'
  | 'ACCEPTED'
  | 'RECYCLED'
  | 'CERTIFIED';

export type DeviceCategory =
  | 'Smartphone'
  | 'Laptop'
  | 'Desktop & Workstation'
  | 'Server & Network'
  | 'Lithium Battery Pack'
  | 'Solar PV Panel'
  | 'PCB & Component Board'
  | 'Peripheral & Cable';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  mobile: string;
  role: Role;
  organization?: string;
  avatarUrl?: string;
  state: string;
  city: string;
  pincode: string;
  upiId?: string;
  bankAccount?: {
    accountNumber: string;
    ifsc: string;
    bankName: string;
  };
}

export interface WipeRecord {
  id: string;
  deviceId: string;
  method: string;
  standard: 'NIST SP 800-88 Rev. 2' | 'IEEE 2883-2022' | 'DoD 5220.22-M';
  toolName: string;
  toolVersion: string;
  startTime: string;
  endTime: string;
  status: 'In Progress' | 'Pass' | 'Fail';
  verificationHash: string; // SHA-256
  recoverySampleTest: 'Passed (0 sectors recoverable)' | 'Failed (Residual data detected)';
  energyKwh: number;
  videoProofUrl: string;
  engineerName: string;
  notes: string;
}

export interface OperatorIntervention {
  id: string;
  deviceId: string;
  timestamp: string;
  operatorId: string;
  operatorName: string;
  station: string;
  actionType: 'Hazard Extraction' | 'Component Segregation' | 'Manual Override' | 'Weight Discrepancy Note';
  notes: string;
  hazardDetected?: boolean;
  hazardType?: string;
}

export interface MaterialYield {
  copperGrams: number;
  goldGrams: number;
  aluminumGrams: number;
  plasticGrams: number;
  glassGrams: number;
  rareEarthGrams: number;
  hazardousResidueGrams: number;
}

export interface DeviceItem {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  category: DeviceCategory;
  brand: string;
  model: string;
  serialNumber: string;
  imei?: string;
  uefiVersion?: string;
  storageType?: 'NVMe SSD' | 'SATA SSD' | 'HDD' | 'eMMC' | 'Flash' | 'None';
  storageSizeGb?: number;
  batteryPresent: boolean;
  batteryHealth?: 'Good' | 'Degraded' | 'Swollen Hazard';
  condition: DeviceCondition;
  status: DeviceStatus;
  intakeWeightKg: number;
  factoryWeightKg?: number;
  weightDiscrepancyPct?: number;
  holdReason?: string;
  flagReason?: string;
  flagNotes?: string;
  estimatedScrapValue: number;
  resaleValue: number;
  payoutAmount: number;
  payoutMethod: 'UPI' | 'Bank Transfer' | 'Green Karma Points';
  payoutTxnRef?: string;
  payoutSentAt?: string;
  payoutAcknowledgedAt?: string;
  city: string;
  state: string;
  hubLocation: string;
  registeredAt: string;
  updatedAt: string;
  intakeImageUrl: string;
  batchId?: string;
  recyclerPartnerId?: string;
  recyclerName?: string;
  wipeRecord?: WipeRecord;
  interventions?: OperatorIntervention[];
  materialYield?: MaterialYield;
  certificateId?: string;
  certificateHash?: string;
  co2SavedKg: number;
  notes?: string;
}

export interface RecyclerPartner {
  id: string;
  name: string;
  cpcbRegNumber: string;
  spcbConsentNumber: string;
  state: string;
  city: string;
  annualCapacityTonnes: number;
  processedThisYearTonnes: number;
  validityExpiry: string;
  status: 'Active & Verified' | 'Expiring Soon' | 'Suspended';
  specialization: string[];
  contactEmail: string;
}

export interface RouteStop {
  stopName: string;
  arrivalTime: string;
  departureTime?: string;
  status: 'Completed' | 'Current' | 'Pending';
  weightLoggedKg?: number;
  eWayBillNumber?: string;
  notes?: string;
}

export interface RouteTripHistory {
  tripId: string;
  date: string;
  origin: string;
  destination: string;
  totalDistanceKm: number;
  transitHours: number;
  totalEwasteKg: number;
  co2SavedKg: number;
  status: 'Completed' | 'In Progress';
  stops: RouteStop[];
}

export interface FleetTruck {
  id: string;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  currentRoute: string;
  currentLocationName: string;
  state: string;
  coordinates: [number, number]; // [lat, lng]
  mapCoordinates?: { x: number; y: number }; // [x%, y%] on India spatial grid
  speedKmph?: number;
  headingDeg?: number;
  routeProgressPct?: number;
  nextStop?: string;
  eWayBillNumber?: string;
  gpsWaypoints?: [number, number][]; // [lat, lng]
  waypoints?: { x: number; y: number; name: string }[];
  stops?: RouteStop[];
  tripHistory?: RouteTripHistory[];
  loadPercentage: number;
  capacityKg: number;
  currentLoadKg: number;
  status: 'In Transit' | 'At Collection Point' | 'Unloading at Recycler' | 'Maintenance Required';
  engineHours: number;
  tirePressurePsi: number; // optimal ~32-35
  pastBreakdownCount: number;
  vibrationAnomalyScore: number; // 0-100
  serviceIntervalRecommendation: string;
  maintenanceAlert: boolean;
  trafficLevel: 'Clear' | 'Moderate' | 'Heavy Congestion' | 'Route Diverted';
  activeAlert?: string;
}

export interface LandfillCluster {
  id: string;
  name: string;
  city: string;
  state: string;
  coordinates: [number, number];
  currentCapacityPct: number;
  riskLevel: 'Normal' | 'Elevated' | 'Critical Threshold Exceeded';
  totalEwasteDivertedTonnes: number;
  leachatePreventedLiters: number;
  nearestCollectionHub: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: Role;
  action: string;
  entityType: 'Device' | 'Batch' | 'Payment' | 'Certificate' | 'System Setting' | 'Wipe Record';
  entityId: string;
  ipAddress: string;
  details: string;
  tamperProofHash: string;
}

export interface SystemAlert {
  id: string;
  timestamp: string;
  type: 'traffic' | 'landfill_overflow' | 'cpcb_deadline' | 'device_flag' | 'data_integrity';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  linkToTab?: string;
}

export interface LeaderboardEntry {
  rank: number;
  name: string;
  category: 'Campus / Hostel' | 'Tech Park / Corporate' | 'Municipal Ward';
  state: string;
  kgCollected: number;
  devicesRecycled: number;
  co2OffsetTonnes: number;
  greenCredits: number;
  badge: string;
}

export interface ComplianceDeadlineReminder {
  id: string;
  title: string;
  filingType: 'MoEFCC Form 3 (Quarterly)' | 'State PCB Form 4 (Annual)' | 'Battery EPR Half-Yearly' | 'Refurbisher Ledger Audit' | 'EPR Credit Reconciliation';
  deadlineDate: string;
  quarter: string;
  leadTimeDays: number;
  priority: 'critical' | 'high' | 'medium';
  notificationChannel: 'Push Notification' | 'In-App & Push' | 'SMS & Push';
  assignedOfficer: string;
  notes: string;
  isTriggered: boolean;
  createdAt: string;
}
