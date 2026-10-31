import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Truck,
  MapPin,
  AlertTriangle,
  Activity,
  Layers,
  Wrench,
  Gauge,
  Navigation,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  TrendingDown,
  Info,
  Download,
  FileSpreadsheet,
  Check,
  Search,
  Filter,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Play,
  Pause,
  ChevronRight,
  Route,
  Compass,
  FileText,
  Calendar,
  X,
  Phone,
  Globe,
  Building2,
  Factory,
  Flame,
  SlidersHorizontal,
  Package,
  Sparkles,
  TrendingUp,
  Printer
} from 'lucide-react';
import L from 'leaflet';
import { FLEET_TRUCKS } from '../data/mockData';
import { DeviceItem, FleetTruck } from '../types';
import { FleetRegulatoryReportModal } from '../components/FleetRegulatoryReportModal';
import { GoogleMapsFleetGISLayer } from '../components/GoogleMapsFleetGISLayer';

// Fix Leaflet default icon paths in bundler environments to prevent 404s
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export interface TrackingFleetGISViewProps {
  devices?: DeviceItem[];
  onSelectDevice?: (deviceId: string) => void;
}

interface StateGISNode {
  code: string;
  name: string;
  coords: [number, number];
  ewasteGenerationTons: number;
  recyclingRatePct: number;
  activeTrucks: number;
  hubCity: string;
  truckId?: string;
  stateFilterValue: string;
}

interface LogisticsHub {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  coords: [number, number];
  dailyCapacityKg: number;
  currentIntakeKg: number;
  dockBays: number;
  activeVehicles: number;
  contactPerson: string;
  contactPhone: string;
  type: 'Consolidation Center' | 'Intake Depot' | 'Regional Transit Yard';
}

interface RecyclingFacility {
  id: string;
  name: string;
  cpcbRegNumber: string;
  spcbConsentNumber: string;
  city: string;
  state: string;
  coords: [number, number];
  annualCapacityTonnes: number;
  recoveryEfficiencyPct: number;
  streams: string[];
  status: 'CPCB Certified' | 'Operational & Audited';
  divertedTonnes: number;
  contactEmail: string;
}

interface TrafficCorridor {
  id: string;
  name: string;
  state: string;
  level: 'Heavy Congestion' | 'Moderate' | 'Clear';
  avgSpeedKmph: number;
  delayMin: number;
  activeTruckCount: number;
  waypoints: [number, number][];
  color: string;
  dashArray?: string;
  note: string;
}

// 12 State GIS nodes and percentages strictly matching Screenshot 2
const GIS_STATES: StateGISNode[] = [
  {
    code: 'PB',
    name: 'Punjab',
    coords: [30.9010, 75.8573],
    ewasteGenerationTons: 68000,
    recyclingRatePct: 34,
    activeTrucks: 0,
    hubCity: 'Mohali Industrial Cluster',
    stateFilterValue: 'ALL'
  },
  {
    code: 'HR',
    name: 'Haryana',
    coords: [29.0588, 76.0856],
    ewasteGenerationTons: 92000,
    recyclingRatePct: 88,
    activeTrucks: 0,
    hubCity: 'Manesar Logistics Park',
    stateFilterValue: 'ALL'
  },
  {
    code: 'DEL',
    name: 'Delhi NCR',
    coords: [28.6139, 77.2090],
    ewasteGenerationTons: 145000,
    recyclingRatePct: 62,
    activeTrucks: 1,
    hubCity: 'Delhi NCR Hub 04',
    truckId: 'TRK-IND-01',
    stateFilterValue: 'Uttar Pradesh'
  },
  {
    code: 'UP',
    name: 'Uttar Pradesh',
    coords: [26.8467, 80.9462],
    ewasteGenerationTons: 180000,
    recyclingRatePct: 95,
    activeTrucks: 1,
    hubCity: 'Greater Noida Recycler Plant',
    truckId: 'TRK-IND-01',
    stateFilterValue: 'Uttar Pradesh'
  },
  {
    code: 'RJ',
    name: 'Rajasthan',
    coords: [26.9124, 73.7873],
    ewasteGenerationTons: 88000,
    recyclingRatePct: 38,
    activeTrucks: 0,
    hubCity: 'Bhiwadi Circular Depot',
    stateFilterValue: 'ALL'
  },
  {
    code: 'GJ',
    name: 'Gujarat',
    coords: [22.2587, 71.1924],
    ewasteGenerationTons: 135000,
    recyclingRatePct: 45,
    activeTrucks: 0,
    hubCity: 'Sanand Industrial Cluster',
    stateFilterValue: 'ALL'
  },
  {
    code: 'MP',
    name: 'Madhya Pradesh',
    coords: [23.2599, 77.4126],
    ewasteGenerationTons: 78000,
    recyclingRatePct: 68,
    activeTrucks: 0,
    hubCity: 'Mandideep Terminal',
    stateFilterValue: 'ALL'
  },
  {
    code: 'WB',
    name: 'West Bengal',
    coords: [23.2868, 87.8550],
    ewasteGenerationTons: 110000,
    recyclingRatePct: 33,
    activeTrucks: 0,
    hubCity: 'Salt Lake Sector V Hub',
    stateFilterValue: 'ALL'
  },
  {
    code: 'MH',
    name: 'Maharashtra',
    coords: [19.2560, 74.8777],
    ewasteGenerationTons: 240000,
    recyclingRatePct: 41,
    activeTrucks: 1,
    hubCity: 'Taloja MIDC Refinery',
    truckId: 'TRK-IND-03',
    stateFilterValue: 'Maharashtra'
  },
  {
    code: 'TG',
    name: 'Telangana',
    coords: [17.3850, 78.4867],
    ewasteGenerationTons: 120000,
    recyclingRatePct: 89,
    activeTrucks: 1,
    hubCity: 'Patancheru Eco Zone',
    truckId: 'TRK-IND-04',
    stateFilterValue: 'Telangana'
  },
  {
    code: 'KA',
    name: 'Karnataka',
    coords: [14.5716, 75.8946],
    ewasteGenerationTons: 165000,
    recyclingRatePct: 46,
    activeTrucks: 1,
    hubCity: 'Peenya Recovery Hub',
    truckId: 'TRK-IND-02',
    stateFilterValue: 'Karnataka'
  },
  {
    code: 'TN',
    name: 'Tamil Nadu',
    coords: [11.0827, 78.4707],
    ewasteGenerationTons: 150000,
    recyclingRatePct: 44,
    activeTrucks: 1,
    hubCity: 'Sriperumbudur SEZ',
    truckId: 'TRK-IND-05',
    stateFilterValue: 'Tamil Nadu'
  }
];

// Logistics Hubs Dataset
const LOGISTICS_HUBS: LogisticsHub[] = [
  {
    id: 'HUB-DEL-04',
    name: 'Delhi Central Consignment Hub #04',
    code: 'DEL-CP-04',
    city: 'New Delhi',
    state: 'Delhi NCR',
    coords: [28.6315, 77.2167],
    dailyCapacityKg: 5000,
    currentIntakeKg: 3840,
    dockBays: 6,
    activeVehicles: 3,
    contactPerson: 'Rajesh Verma (Lead Engineer)',
    contactPhone: '+91 98110 44211',
    type: 'Consolidation Center'
  },
  {
    id: 'HUB-DEL-OKH',
    name: 'Okhla Phase III Quarantine & Sorting Depot',
    code: 'DEL-OKH-01',
    city: 'South Delhi',
    state: 'Delhi NCR',
    coords: [28.5350, 77.2680],
    dailyCapacityKg: 7500,
    currentIntakeKg: 6200,
    dockBays: 8,
    activeVehicles: 4,
    contactPerson: 'Sunil Mehta (Depot Incharge)',
    contactPhone: '+91 98112 55432',
    type: 'Intake Depot'
  },
  {
    id: 'HUB-RJ-BHW',
    name: 'Bhiwadi Circular Interstate Gateway Depot',
    code: 'RJ-BHW-02',
    city: 'Bhiwadi',
    state: 'Rajasthan',
    coords: [28.2104, 76.8606],
    dailyCapacityKg: 6000,
    currentIntakeKg: 4100,
    dockBays: 6,
    activeVehicles: 2,
    contactPerson: 'Rameshwar Gurjar',
    contactPhone: '+91 94140 88219',
    type: 'Regional Transit Yard'
  },
  {
    id: 'HUB-HR-MAN',
    name: 'Manesar Clean Tech Logistics Terminal',
    code: 'HR-MAN-01',
    city: 'Gurugram',
    state: 'Haryana',
    coords: [28.3588, 76.9400],
    dailyCapacityKg: 9000,
    currentIntakeKg: 7800,
    dockBays: 10,
    activeVehicles: 5,
    contactPerson: 'Karanvir Singh',
    contactPhone: '+91 98120 77341',
    type: 'Consolidation Center'
  },
  {
    id: 'HUB-KA-PEE',
    name: 'Peenya South Zonal Recovery & Transit Hub',
    code: 'KA-BLR-02',
    city: 'Bengaluru',
    state: 'Karnataka',
    coords: [13.0310, 77.5260],
    dailyCapacityKg: 12000,
    currentIntakeKg: 10450,
    dockBays: 12,
    activeVehicles: 6,
    contactPerson: 'Basavaraj Gowda',
    contactPhone: '+91 94480 34567',
    type: 'Consolidation Center'
  },
  {
    id: 'HUB-KA-ECI',
    name: 'Electronic City Phase 1 IT Collection Hub',
    code: 'KA-BLR-01',
    city: 'Bengaluru',
    state: 'Karnataka',
    coords: [12.8452, 77.6602],
    dailyCapacityKg: 4500,
    currentIntakeKg: 3200,
    dockBays: 4,
    activeVehicles: 2,
    contactPerson: 'Deepak Rao',
    contactPhone: '+91 98450 11982',
    type: 'Intake Depot'
  },
  {
    id: 'HUB-MH-TAL',
    name: 'Taloja Industrial Coastal Transit Depot',
    code: 'MH-MUM-03',
    city: 'Navi Mumbai',
    state: 'Maharashtra',
    coords: [19.0600, 73.1100],
    dailyCapacityKg: 11000,
    currentIntakeKg: 8900,
    dockBays: 8,
    activeVehicles: 4,
    contactPerson: 'Sachin Kulkarni',
    contactPhone: '+91 98200 66541',
    type: 'Regional Transit Yard'
  },
  {
    id: 'HUB-TG-PAT',
    name: 'Patancheru Semiconductor & Telecom Depot',
    code: 'TG-HYD-01',
    city: 'Hyderabad',
    state: 'Telangana',
    coords: [17.5280, 78.2670],
    dailyCapacityKg: 8500,
    currentIntakeKg: 6900,
    dockBays: 8,
    activeVehicles: 3,
    contactPerson: 'Venkat Reddy',
    contactPhone: '+91 98490 22319',
    type: 'Consolidation Center'
  },
  {
    id: 'HUB-TN-SRI',
    name: 'Sriperumbudur High-Tech Hardware Depot',
    code: 'TN-CHE-02',
    city: 'Chennai',
    state: 'Tamil Nadu',
    coords: [12.9800, 79.9400],
    dailyCapacityKg: 7800,
    currentIntakeKg: 6400,
    dockBays: 6,
    activeVehicles: 3,
    contactPerson: 'M. Senthil Kumar',
    contactPhone: '+91 94440 99812',
    type: 'Consolidation Center'
  },
  {
    id: 'HUB-WB-SLK',
    name: 'Salt Lake Sector V Eastern Zonal Hub',
    code: 'WB-KOL-01',
    city: 'Kolkata',
    state: 'West Bengal',
    coords: [22.5800, 88.4300],
    dailyCapacityKg: 6200,
    currentIntakeKg: 4700,
    dockBays: 6,
    activeVehicles: 2,
    contactPerson: 'Debabrata Mukherjee',
    contactPhone: '+91 98300 45678',
    type: 'Regional Transit Yard'
  }
];

// Recycling Facilities Dataset (CPCB Registered)
const RECYCLING_FACILITIES: RecyclingFacility[] = [
  {
    id: 'REC-UP-001',
    name: 'EcoRecycle Apex Solutions India Ltd.',
    cpcbRegNumber: 'CPCB/EPR/REC/2023/UP/0492',
    spcbConsentNumber: 'UPPCB/CTO/NOI/2024/9182',
    city: 'Greater Noida Eco-Tech III',
    state: 'Uttar Pradesh',
    coords: [28.5080, 77.4680],
    annualCapacityTonnes: 45000,
    recoveryEfficiencyPct: 98.4,
    streams: ['PCB Hydrometallurgy', 'Li-ion Battery Refining', 'Rare Earth Extraction', 'NIST Data Scrub'],
    status: 'CPCB Certified',
    divertedTonnes: 32400,
    contactEmail: 'compliance@ecorecycle-apex.in'
  },
  {
    id: 'REC-HR-002',
    name: 'GreenEarth Demanufacturing & Refinery',
    cpcbRegNumber: 'CPCB/EPR/REC/2022/HR/1104',
    spcbConsentNumber: 'HSPCB/EWASTE/2023/4521',
    city: 'Manesar Industrial Area, Gurugram',
    state: 'Haryana',
    coords: [28.3650, 76.9200],
    annualCapacityTonnes: 38000,
    recoveryEfficiencyPct: 96.2,
    streams: ['Enterprise IT Disposition', 'Optical Vision Sorting', 'Precious Metal Smelting'],
    status: 'Operational & Audited',
    divertedTonnes: 28900,
    contactEmail: 'ops@greenearthmanesar.com'
  },
  {
    id: 'REC-TG-003',
    name: 'Deccan Circular Tech & Materials Corp',
    cpcbRegNumber: 'CPCB/EPR/REC/2023/TG/0843',
    spcbConsentNumber: 'TSPCB/HW-EPR/HYD/2024/220',
    city: 'Patancheru Eco Zone, Hyderabad',
    state: 'Telangana',
    coords: [17.5340, 78.2560],
    annualCapacityTonnes: 52000,
    recoveryEfficiencyPct: 97.8,
    streams: ['Solar PV Delamination', 'Semiconductor Scrap', 'Telecom Grade Recycling'],
    status: 'CPCB Certified',
    divertedTonnes: 41200,
    contactEmail: 'regulatory@deccancircular.org'
  },
  {
    id: 'REC-MH-004',
    name: 'Sahyadri Urban Mining & Refurbishing Ltd',
    cpcbRegNumber: 'CPCB/EPR/REC/2024/MH/0319',
    spcbConsentNumber: 'MPCB/RO-PUN/EWASTE/2024/774',
    city: 'Taloja MIDC, Navi Mumbai',
    state: 'Maharashtra',
    coords: [19.0720, 73.1250],
    annualCapacityTonnes: 30000,
    recoveryEfficiencyPct: 95.5,
    streams: ['Automated Cable Stripping', 'E-Waste Mechanical Shredding', 'Refurbishing Labs'],
    status: 'Operational & Audited',
    divertedTonnes: 21500,
    contactEmail: 'info@sahyadrimining.co.in'
  },
  {
    id: 'REC-KA-005',
    name: 'Bengaluru E-Clean Recovery Network',
    cpcbRegNumber: 'CPCB/EPR/REC/2023/KA/1902',
    spcbConsentNumber: 'KSPCB/E-WASTE/BLR/2023/651',
    city: 'Peenya Industrial Estate, Bengaluru',
    state: 'Karnataka',
    coords: [13.0380, 77.5180],
    annualCapacityTonnes: 35000,
    recoveryEfficiencyPct: 98.1,
    streams: ['Motherboard Pyrolysis', 'Hydrometallurgical Leaching', 'IEEE 2883 Sanitization'],
    status: 'CPCB Certified',
    divertedTonnes: 26100,
    contactEmail: 'compliance@bengalurueclean.in'
  },
  {
    id: 'REC-TN-006',
    name: 'Coromandel Green E-Stewards',
    cpcbRegNumber: 'CPCB/EPR/REC/2024/TN/0155',
    spcbConsentNumber: 'TNPCB/CHE/E-REG/2024/318',
    city: 'Sriperumbudur High-Tech SEZ, Chennai',
    state: 'Tamil Nadu',
    coords: [12.9900, 79.9500],
    annualCapacityTonnes: 28000,
    recoveryEfficiencyPct: 94.8,
    streams: ['Display Glass CRT/OLED Recovery', 'Copper & Aluminum Smelting'],
    status: 'Operational & Audited',
    divertedTonnes: 19800,
    contactEmail: 'support@coromandelewaste.com'
  },
  {
    id: 'REC-UK-007',
    name: 'Attero Zero-Discharge Extraction Complex',
    cpcbRegNumber: 'CPCB/EPR/REC/2021/UK/0088',
    spcbConsentNumber: 'UKPCB/RO-ROO/EPR/2023/110',
    city: 'Bhagwanpur, Roorkee',
    state: 'Uttarakhand',
    coords: [29.9300, 77.7800],
    annualCapacityTonnes: 60000,
    recoveryEfficiencyPct: 99.1,
    streams: ['Zero Liquid Discharge (ZLD)', 'Lithium Cobalt Recovery', 'Pure Gold Leaching'],
    status: 'CPCB Certified',
    divertedTonnes: 49500,
    contactEmail: 'roorkee@atterorecycling.org'
  }
];

// Traffic Corridors Dataset
const TRAFFIC_CORRIDORS: TrafficCorridor[] = [
  {
    id: 'COR-01',
    name: 'Delhi NCR -> Greater Noida Expressway Corridor',
    state: 'Uttar Pradesh / Delhi',
    level: 'Heavy Congestion',
    avgSpeedKmph: 32,
    delayMin: 25,
    activeTruckCount: 2,
    color: '#f43f5e',
    dashArray: '6, 6',
    note: 'Heavy bottleneck near Pari Chowk & Ghazipur border (+25 min delay)',
    waypoints: [
      [28.6315, 77.2167],
      [28.6139, 77.2450],
      [28.6080, 77.2950],
      [28.5800, 77.3200],
      [28.5355, 77.3910],
      [28.4900, 77.4400],
      [28.4715, 77.5100],
      [28.5080, 77.4680]
    ]
  },
  {
    id: 'COR-02',
    name: 'Bengaluru NICE Ring Road Transit Corridor',
    state: 'Karnataka',
    level: 'Moderate',
    avgSpeedKmph: 52,
    delayMin: 8,
    activeTruckCount: 1,
    color: '#f59e0b',
    note: 'Steady transit flow via NICE Cloverleaf toll plazas (+8 min delay)',
    waypoints: [
      [12.8452, 77.6602],
      [12.8870, 77.5920],
      [12.9141, 77.5385],
      [12.9550, 77.5100],
      [12.9750, 77.4980],
      [13.0310, 77.5260]
    ]
  },
  {
    id: 'COR-03',
    name: 'Mumbai Sion-Panvel to Taloja MIDC Arterial',
    state: 'Maharashtra',
    level: 'Heavy Congestion',
    avgSpeedKmph: 26,
    delayMin: 22,
    activeTruckCount: 1,
    color: '#f43f5e',
    dashArray: '6, 6',
    note: 'Vashi Bridge freight inspection lane crawl (+22 min delay)',
    waypoints: [
      [19.0600, 72.8700],
      [19.0500, 72.9300],
      [19.0350, 73.0100],
      [19.0400, 73.0800],
      [19.0720, 73.1250]
    ]
  },
  {
    id: 'COR-04',
    name: 'Hyderabad Outer Ring Road (ORR) Expressway',
    state: 'Telangana',
    level: 'Clear',
    avgSpeedKmph: 74,
    delayMin: 0,
    activeTruckCount: 1,
    color: '#10b981',
    note: 'High-speed green transit lane clear to Patancheru Eco Zone',
    waypoints: [
      [17.4400, 78.3800],
      [17.4700, 78.3400],
      [17.5100, 78.3000],
      [17.5340, 78.2560]
    ]
  },
  {
    id: 'COR-05',
    name: 'Chennai Guindy to Sriperumbudur SEZ (NH-48)',
    state: 'Tamil Nadu',
    level: 'Moderate',
    avgSpeedKmph: 46,
    delayMin: 6,
    activeTruckCount: 1,
    color: '#f59e0b',
    note: 'Standard commercial freight flow at Sriperumbudur Toll',
    waypoints: [
      [13.0067, 80.2000],
      [13.0100, 80.1200],
      [12.9900, 80.0500],
      [12.9800, 79.9400]
    ]
  }
];

// Predictive E-Waste Demand Dataset (Next 7 Days Hotspots based on historical telemetry)
export interface PredictiveDemandHotspot {
  dayIndex: number;
  dayLabel: string;
  dateStr: string;
  projectedTonnes: number;
  surgePct: number;
  hotspotDistrict: string;
  state: string;
  dominantCategory: string;
  urgency: 'Critical Surge' | 'High Demand' | 'Steady Flow';
  recommendedDispatch: string;
  assignedTruckId: string;
  riskFactor: 'High Battery Risk' | 'RoHS Heavy Metal' | 'Normal';
}

export const PREDICTIVE_DEMAND_DATA: PredictiveDemandHotspot[] = [
  {
    dayIndex: 1,
    dayLabel: 'Tomorrow (D+1)',
    dateStr: '24 Oct 2026',
    projectedTonnes: 14.8,
    surgePct: 38,
    hotspotDistrict: 'Okhla Industrial Area Phase-III & Nehru Place',
    state: 'Delhi NCR',
    dominantCategory: 'Enterprise IT Servers & Telecom Boards',
    urgency: 'Critical Surge',
    recommendedDispatch: 'Deploy TRK-IND-01 (10 MT capacity) & reserve Dock Bay 2',
    assignedTruckId: 'TRK-IND-01',
    riskFactor: 'RoHS Heavy Metal'
  },
  {
    dayIndex: 2,
    dayLabel: 'Day 2 (D+2)',
    dateStr: '25 Oct 2026',
    projectedTonnes: 18.2,
    surgePct: 44,
    hotspotDistrict: 'Whitefield EPIP Zone & Electronic City Phase-I',
    state: 'Karnataka',
    dominantCategory: 'Lithium Battery Packs & Corporate Laptops',
    urgency: 'Critical Surge',
    recommendedDispatch: 'Dispatch TRK-IND-02 with Class 9 fire-retardant safety cages',
    assignedTruckId: 'TRK-IND-02',
    riskFactor: 'High Battery Risk'
  },
  {
    dayIndex: 3,
    dayLabel: 'Day 3 (D+3)',
    dateStr: '26 Oct 2026',
    projectedTonnes: 16.5,
    surgePct: 22,
    hotspotDistrict: 'Andheri SEEPZ & Navi Mumbai MIDC',
    state: 'Maharashtra',
    dominantCategory: 'Network Switches & Flat Panel Displays',
    urgency: 'High Demand',
    recommendedDispatch: 'Route TRK-IND-03 via Eastern Freeway green freight lane',
    assignedTruckId: 'TRK-IND-03',
    riskFactor: 'Normal'
  },
  {
    dayIndex: 4,
    dayLabel: 'Day 4 (D+4)',
    dateStr: '27 Oct 2026',
    projectedTonnes: 12.4,
    surgePct: 29,
    hotspotDistrict: 'Hitec City, Madhapur & Patancheru Industrial Belt',
    state: 'Telangana',
    dominantCategory: 'Semiconductor R&D Scrap & Multi-layer Motherboards',
    urgency: 'High Demand',
    recommendedDispatch: 'Pre-allocate TRK-IND-04 via Outer Ring Road express lane',
    assignedTruckId: 'TRK-IND-04',
    riskFactor: 'RoHS Heavy Metal'
  },
  {
    dayIndex: 5,
    dayLabel: 'Day 5 (D+5)',
    dateStr: '28 Oct 2026',
    projectedTonnes: 11.1,
    surgePct: 15,
    hotspotDistrict: 'Peenya Industrial Cluster & Yeshwanthpur Yards',
    state: 'Karnataka',
    dominantCategory: 'Industrial Inverters & High-Capacity UPS Units',
    urgency: 'Steady Flow',
    recommendedDispatch: 'Standard consolidation transit to Peenya Recovery Hub',
    assignedTruckId: 'TRK-IND-02',
    riskFactor: 'High Battery Risk'
  },
  {
    dayIndex: 6,
    dayLabel: 'Day 6 (D+6)',
    dateStr: '29 Oct 2026',
    projectedTonnes: 13.9,
    surgePct: 26,
    hotspotDistrict: 'Sriperumbudur Electronics SEZ & Oragadam',
    state: 'Tamil Nadu',
    dominantCategory: 'Smartphone Assembly Scrapped Modules & Camera ICs',
    urgency: 'High Demand',
    recommendedDispatch: 'Schedule TRK-IND-05 for evening CPCB dock intake',
    assignedTruckId: 'TRK-IND-05',
    riskFactor: 'Normal'
  },
  {
    dayIndex: 7,
    dayLabel: 'Day 7 (D+7)',
    dateStr: '30 Oct 2026',
    projectedTonnes: 9.6,
    surgePct: 8,
    hotspotDistrict: 'Sanand Industrial Cluster & Ahmedabad Electronics Park',
    state: 'Gujarat',
    dominantCategory: 'Automotive Electronics & Solar Inverters',
    urgency: 'Steady Flow',
    recommendedDispatch: 'Batch transport to certified Gujarat refinery',
    assignedTruckId: 'TRK-IND-01',
    riskFactor: 'Normal'
  }
];

// Helper to determine color category matching Screenshot 2
const getStatusTheme = (pct: number) => {
  if (pct > 80) {
    return {
      label: '>80% Recycled',
      haloClass: 'bg-emerald-400',
      bgClass: 'bg-emerald-950/95 border-emerald-400 text-emerald-300 shadow-emerald-500/25',
      textPctClass: 'text-emerald-300'
    };
  }
  if (pct >= 40) {
    return {
      label: '40-80%',
      haloClass: 'bg-amber-400',
      bgClass: 'bg-amber-950/95 border-amber-400 text-amber-300 shadow-amber-500/25',
      textPctClass: 'text-amber-300'
    };
  }
  return {
    label: '<40% Lagging',
    haloClass: 'bg-rose-500',
    bgClass: 'bg-rose-950/95 border-rose-500 text-rose-300 shadow-rose-500/25',
    textPctClass: 'text-rose-300'
  };
};

export const TrackingFleetGISView: React.FC<TrackingFleetGISViewProps> = React.memo(({
  devices = [],
  onSelectDevice
}) => {
  // Read CARTO API key from env with default fallback to user's provided key
  const cartoApiKey =
    (import.meta as any).env?.VITE_CARTO_API_KEY ||
    (import.meta as any).env?.NEXT_PUBLIC_CARTO_API_KEY ||
    (import.meta as any).env?.REACT_APP_MAP_API_KEY ||
    'cb1_4sqy_1_15a3fad41d4a776cdaf03ad0';

  // Trucks and Selection State
  const [trucks, setTrucks] = useState<FleetTruck[]>(FLEET_TRUCKS);
  const [selectedTruckId, setSelectedTruckId] = useState<string>(FLEET_TRUCKS[0].id);

  // Map Mode: 'live' (Live Fleet Map) vs 'gis' (National Fleet & Landfill Spatial Grid)
  const [mapMode, setMapMode] = useState<'live' | 'gis'>('live');

  // Layer Controls State: Traffic Density, Logistics Hubs, Recycling Facilities
  const [activeLayers, setActiveLayers] = useState<{
    traffic: boolean;
    hubs: boolean;
    recyclers: boolean;
  }>({
    traffic: true,
    hubs: true,
    recyclers: true
  });

  // Layer control popup dropdown state
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);

  // Simulation controls
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1); // 1x, 2x, 4x

  // Table filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStateFilter, setSelectedStateFilter] = useState('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('ALL');
  const [selectedTrafficFilter, setSelectedTrafficFilter] = useState('ALL');

  // Route history tab
  const [routeHistoryTab, setRouteHistoryTab] = useState<'active' | 'past'>('active');

  // Regulatory PDF Report Modal State
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);

  // Predictive Demand State (Next 7 Days Hotspots)
  const [selectedForecastDay, setSelectedForecastDay] = useState<number>(1);
  const [allocationToast, setAllocationToast] = useState<string | null>(null);

  // Map Engine: 'google' (Google Maps Platform API) or 'leaflet' (DarkOps Leaflet)
  const [mapEngine, setMapEngine] = useState<'google' | 'leaflet'>('google');

  // Leaflet Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  // Dedicated LayerGroups for high-performance toggling without marker recreation
  const polylineLayerRef = useRef<L.LayerGroup | null>(null);
  const stateMarkersLayerRef = useRef<L.LayerGroup | null>(null);
  const trucksLayerRef = useRef<L.LayerGroup | null>(null);
  const trafficLayerRef = useRef<L.LayerGroup | null>(null);
  const hubsLayerRef = useRef<L.LayerGroup | null>(null);
  const recyclersLayerRef = useRef<L.LayerGroup | null>(null);
  const hazardCircleRef = useRef<L.Circle | null>(null);

  // Marker reference caches to avoid creating DOM nodes during animation ticks
  const truckMarkersRef = useRef<Record<string, L.Marker>>({});
  const hubMarkersRef = useRef<Record<string, L.Marker>>({});
  const recyclerMarkersRef = useRef<Record<string, L.Marker>>({});
  const stateMarkersRef = useRef<Record<string, L.Marker>>({});

  // Selected truck object
  const selectedTruck = useMemo(() => {
    return trucks.find((t) => t.id === selectedTruckId) || trucks[0];
  }, [trucks, selectedTruckId]);

  // Memoized Device-Derived Metrics (prevents map thrashing when device state changes)
  const deviceMetrics = useMemo(() => {
    const inTransitCount = devices.filter(
      (d) => d.status === 'READY_FOR_DISPATCH' || d.status === 'FACTORY_INSPECTION' || d.status === 'ACCEPTED'
    ).length;
    const totalWeightInTransitKg = devices
      .filter((d) => d.status === 'READY_FOR_DISPATCH' || d.status === 'FACTORY_INSPECTION' || d.status === 'ACCEPTED')
      .reduce((acc, curr) => acc + (curr.intakeWeightKg || 0.4), 0);
    return {
      inTransitCount,
      totalWeightInTransitKg: Math.round(totalWeightInTransitKg * 10) / 10
    };
  }, [devices]);

  // Filtered trucks for roster table
  const filteredTrucks = useMemo(() => {
    return trucks.filter((t) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        q === '' ||
        t.vehicleNumber.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.driverName.toLowerCase().includes(q) ||
        t.currentRoute.toLowerCase().includes(q);

      const matchState =
        selectedStateFilter === 'ALL' ||
        t.state.toLowerCase() === selectedStateFilter.toLowerCase();

      const matchStatus =
        selectedStatusFilter === 'ALL' || t.status === selectedStatusFilter;

      const matchTraffic =
        selectedTrafficFilter === 'ALL' || t.trafficLevel === selectedTrafficFilter;

      return matchSearch && matchState && matchStatus && matchTraffic;
    });
  }, [trucks, searchQuery, selectedStateFilter, selectedStatusFilter, selectedTrafficFilter]);

  // Memoized Marker Generator Helpers
  const createTruckIcon = useCallback((isSelected: boolean) => {
    const truckHtml = `
      <div class="relative flex items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none">
        ${
          isSelected
            ? '<span class="animate-ping absolute inline-flex h-9 w-9 rounded-full bg-emerald-400 opacity-60"></span>'
            : ''
        }
        <div class="relative w-7 h-7 rounded-lg ${
          isSelected
            ? 'bg-[#10b981] text-slate-950 ring-2 ring-emerald-300'
            : 'bg-slate-900 border border-emerald-400/80 text-emerald-400'
        } flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <svg class="w-4 h-4 ${isSelected ? 'text-slate-950' : 'text-emerald-400'}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/>
            <path d="M15 18H9"/>
            <path d="M19 18h2a1 1 0 0 0 1-1v-5.2a1 1 0 0 0-.28-.7L18.8 8H15v10z"/>
            <circle cx="7" cy="18" r="2"/>
            <circle cx="17" cy="18" r="2"/>
          </svg>
        </div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-truck-marker',
      html: truckHtml,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });
  }, []);

  const createHubMarker = useCallback((hub: LogisticsHub) => {
    const html = `
      <div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none group">
        <div class="absolute -inset-1 rounded-full bg-cyan-400 opacity-30 blur-[2px] group-hover:opacity-75 transition-opacity"></div>
        <div class="relative w-7 h-7 rounded-lg bg-slate-900 border-2 border-cyan-400 text-cyan-300 flex items-center justify-center shadow-lg shadow-cyan-500/25 transition-transform group-hover:scale-115">
          <svg class="w-3.5 h-3.5 text-cyan-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
            <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
            <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
            <path d="M10 6h4"/>
            <path d="M10 10h4"/>
            <path d="M10 14h4"/>
            <path d="M10 18h4"/>
          </svg>
        </div>
        <div class="absolute -bottom-4 bg-slate-950/90 text-cyan-300 border border-cyan-800 text-[8px] font-mono px-1 rounded whitespace-nowrap shadow">
          ${hub.code}
        </div>
      </div>
    `;

    const icon = L.divIcon({
      className: 'custom-hub-marker',
      html,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker(hub.coords, { icon, zIndexOffset: 300 });
    const popupHtml = `
      <div style="font-family: Satoshi, sans-serif; min-width: 220px; color: #f8fafc; padding: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 5px;">
          <div>
            <div style="font-size: 10px; color: #38bdf8; font-weight: bold; text-transform: uppercase;">Logistics Hub</div>
            <strong style="color: #fff; font-size: 12px;">${hub.name}</strong>
          </div>
          <span style="font-size: 9px; font-weight: bold; padding: 1px 6px; border-radius: 4px; background: #0c4a6e; color: #38bdf8;">${hub.code}</span>
        </div>
        <div style="font-size: 11px; line-height: 1.45; color: #cbd5e1; font-family: monospace;">
          <div>Location: <strong style="color: #f1f5f9;">${hub.city}, ${hub.state}</strong></div>
          <div>Daily Intake: <strong style="color: #38bdf8;">${hub.currentIntakeKg.toLocaleString()} / ${hub.dailyCapacityKg.toLocaleString()} kg</strong></div>
          <div>Dock Bays: <strong style="color: #10b981;">${hub.dockBays} Active Bays</strong></div>
          <div>Active Fleet: <strong style="color: #fbbf24;">${hub.activeVehicles} Vehicles</strong></div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #334155; font-size: 10px; color: #94a3b8; font-family: sans-serif;">
            Coordinator: ${hub.contactPerson} (${hub.contactPhone})
          </div>
        </div>
      </div>
    `;
    marker.bindPopup(popupHtml, { closeButton: false, className: 'custom-leaflet-popup' });
    return marker;
  }, []);

  const createRecyclerMarker = useCallback((facility: RecyclingFacility) => {
    const html = `
      <div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none group">
        <div class="absolute -inset-1 rounded-full bg-emerald-400 opacity-30 blur-[2px] group-hover:opacity-75 transition-opacity"></div>
        <div class="relative w-7 h-7 rounded-lg bg-emerald-950 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-115">
          <svg class="w-3.5 h-3.5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/>
            <path d="M11 19h8.2a1.8 1.8 0 0 0 1.57-.88 1.8 1.8 0 0 0 .004-1.78l-3.95-6.84"/>
            <path d="M14 5l-2.45 4.25"/>
            <path d="M9.55 9.25 12 5l2.45 4.25"/>
          </svg>
        </div>
        <div class="absolute -bottom-4 bg-slate-950/90 text-emerald-300 border border-emerald-800 text-[8px] font-mono px-1 rounded whitespace-nowrap shadow">
          ${facility.recoveryEfficiencyPct}% REC
        </div>
      </div>
    `;

    const icon = L.divIcon({
      className: 'custom-recycler-marker',
      html,
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    const marker = L.marker(facility.coords, { icon, zIndexOffset: 400 });
    const popupHtml = `
      <div style="font-family: Satoshi, sans-serif; min-width: 230px; color: #f8fafc; padding: 4px;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 4px; margin-bottom: 5px;">
          <div>
            <div style="font-size: 10px; color: #34d399; font-weight: bold; text-transform: uppercase;">CPCB Recycling Plant</div>
            <strong style="color: #fff; font-size: 12px;">${facility.name}</strong>
          </div>
          <span style="font-size: 9px; font-weight: bold; padding: 1px 6px; border-radius: 4px; background: #064e3b; color: #34d399;">CPCB VALID</span>
        </div>
        <div style="font-size: 11px; line-height: 1.45; color: #cbd5e1; font-family: monospace;">
          <div>CPCB Reg: <span style="color: #94a3b8;">${facility.cpcbRegNumber}</span></div>
          <div>Annual Cap: <strong style="color: #f1f5f9;">${facility.annualCapacityTonnes.toLocaleString()} Tonnes/yr</strong></div>
          <div>Recovery Efficiency: <strong style="color: #34d399;">${facility.recoveryEfficiencyPct}%</strong></div>
          <div>Streams: <span style="color: #38bdf8;">${facility.streams.slice(0, 2).join(', ')}</span></div>
          <div style="margin-top: 4px; padding-top: 4px; border-top: 1px dashed #334155; font-size: 10px; color: #94a3b8; font-family: sans-serif;">
            Inquiries: ${facility.contactEmail}
          </div>
        </div>
      </div>
    `;
    marker.bindPopup(popupHtml, { closeButton: false, className: 'custom-leaflet-popup' });
    return marker;
  }, []);

  // 1. Initialize Leaflet Map and Persistent LayerGroups ONCE
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initialCoords: [number, number] = [28.5355, 77.391];
    const map = L.map(mapContainerRef.current, {
      center: initialCoords,
      zoom: 11,
      zoomControl: false,
      attributionControl: false
    });

    // Authenticated CARTO Voyager Raster Tiles with provided API key cb1_4sqy_1_15a3fad41d4a776cdaf03ad0
    const tileUrl = `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${cartoApiKey}`;
    const tileLayer = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: 'Leaflet | Tiles © CARTO (Voyager) © OpenStreetMap'
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    tileLayer.on('tileerror', () => {
      // Fallback in case of network restrictions
      tileLayer.setUrl('https://tile.openstreetmap.org/{z}/{x}/{y}.png');
    });

    // Invalidate size shortly after mount to ensure crisp rendering
    const sizeTimer = setTimeout(() => {
      map.invalidateSize();
    }, 150);

    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener('resize', handleResize);

    // Create Dedicated LayerGroups attached to map
    const polylineLayer = L.layerGroup().addTo(map);
    polylineLayerRef.current = polylineLayer;

    const trafficLayer = L.layerGroup().addTo(map);
    trafficLayerRef.current = trafficLayer;

    const hubsLayer = L.layerGroup().addTo(map);
    hubsLayerRef.current = hubsLayer;

    const recyclersLayer = L.layerGroup().addTo(map);
    recyclersLayerRef.current = recyclersLayer;

    const stateLayer = L.layerGroup();
    stateMarkersLayerRef.current = stateLayer;

    const trucksLayer = L.layerGroup().addTo(map);
    trucksLayerRef.current = trucksLayer;

    // Build Static Hubs Layer Once
    LOGISTICS_HUBS.forEach((hub) => {
      const marker = createHubMarker(hub);
      hubMarkersRef.current[hub.id] = marker;
      hubsLayer.addLayer(marker);
    });

    // Build Static Recyclers Layer Once
    RECYCLING_FACILITIES.forEach((facility) => {
      const marker = createRecyclerMarker(facility);
      recyclerMarkersRef.current[facility.id] = marker;
      recyclersLayer.addLayer(marker);
    });

    // Build Static Traffic Corridors Layer Once
    TRAFFIC_CORRIDORS.forEach((corridor) => {
      // Glow polyline
      const glowLine = L.polyline(corridor.waypoints, {
        color: corridor.color,
        weight: corridor.level === 'Heavy Congestion' ? 7 : 5,
        opacity: 0.35,
        dashArray: corridor.dashArray
      });
      trafficLayer.addLayer(glowLine);

      // Core polyline
      const coreLine = L.polyline(corridor.waypoints, {
        color: corridor.color,
        weight: 3,
        opacity: 0.9,
        dashArray: corridor.dashArray
      });

      const popupContent = `
        <div style="font-family: Satoshi, sans-serif; min-width: 200px; color: #f8fafc; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 3px; margin-bottom: 4px;">
            <strong style="color: #fff; font-size: 11px;">${corridor.name}</strong>
            <span style="font-size: 8px; font-weight: bold; padding: 1px 5px; border-radius: 3px; background: ${
              corridor.level === 'Heavy Congestion'
                ? '#881337'
                : corridor.level === 'Moderate'
                ? '#78350f'
                : '#064e3b'
            }; color: ${
              corridor.level === 'Heavy Congestion'
                ? '#fda4af'
                : corridor.level === 'Moderate'
                ? '#fde68a'
                : '#6ee7b7'
            };">${corridor.level}</span>
          </div>
          <div style="font-size: 10px; line-height: 1.4; color: #cbd5e1; font-family: monospace;">
            <div>Speed: <strong style="color: #38bdf8;">${corridor.avgSpeedKmph} km/h</strong></div>
            <div>Delay Factor: <strong style="color: #f43f5e;">+${corridor.delayMin} min</strong></div>
            <div>Active Freight: <strong style="color: #10b981;">${corridor.activeTruckCount} Trucks</strong></div>
            <div style="margin-top: 3px; color: #94a3b8; font-family: sans-serif; font-size: 9px;">${corridor.note}</div>
          </div>
        </div>
      `;
      coreLine.bindPopup(popupContent, { closeButton: false, className: 'custom-leaflet-popup' });
      trafficLayer.addLayer(coreLine);
    });

    // Build Static State Nodes Layer Once
    GIS_STATES.forEach((st) => {
      const theme = getStatusTheme(st.recyclingRatePct);
      const html = `
        <div class="relative flex flex-col items-center justify-center -translate-x-1/2 -translate-y-1/2 cursor-pointer select-none group">
          <div class="absolute -inset-1 rounded-full ${theme.haloClass} opacity-35 blur-[2.5px] group-hover:opacity-75 transition-opacity"></div>
          <div class="relative w-8 h-8 rounded-full border-2 ${theme.bgClass} flex flex-col items-center justify-center text-center shadow-lg transition-transform group-hover:scale-115">
            <span class="text-[9px] font-bold font-mono tracking-tight text-white leading-none">${st.code}</span>
            <span class="text-[8px] font-mono font-semibold ${theme.textPctClass} leading-none mt-0.5">${st.recyclingRatePct}%</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-state-node-marker',
        html,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker(st.coords, { icon, zIndexOffset: 1200 });
      const popupContent = `
        <div style="font-family: Satoshi, sans-serif; min-width: 180px; color: #f8fafc; padding: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #334155; padding-bottom: 3px; margin-bottom: 4px;">
            <strong style="color: #38bdf8; font-size: 12px;">${st.name} (${st.code})</strong>
            <span style="font-size: 9px; font-weight: bold; padding: 1px 5px; border-radius: 4px; background: #064e3b; color: #34d399;">${theme.label}</span>
          </div>
          <div style="font-size: 11px; line-height: 1.4; color: #cbd5e1; font-family: monospace;">
            <div>E-Waste: <strong style="color: #fff;">${st.ewasteGenerationTons.toLocaleString()} T/yr</strong></div>
            <div>Formal Recycled: <strong style="color: #38bdf8;">${st.recyclingRatePct}%</strong></div>
            <div>Regional Hub: <span style="color: #94a3b8; font-family: sans-serif;">${st.hubCity}</span></div>
            <div>Active Fleet: <strong style="color: #10b981;">${st.activeTrucks} vehicles</strong></div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { closeButton: false, className: 'custom-leaflet-popup' });
      marker.on('click', () => {
        if (st.stateFilterValue !== 'ALL') {
          setSelectedStateFilter(st.stateFilterValue);
        }
        if (st.truckId) {
          setSelectedTruckId(st.truckId);
        }
        setMapMode('live');
      });

      stateMarkersRef.current[st.code] = marker;
      stateLayer.addLayer(marker);
    });

    mapInstanceRef.current = map;

    return () => {
      clearTimeout(sizeTimer);
      window.removeEventListener('resize', handleResize);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [createHubMarker, createRecyclerMarker]);

  // 2. High-Performance Layer Visibility Toggles (Zero marker recreation)
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Traffic Density Layer Toggle
    if (trafficLayerRef.current) {
      if (activeLayers.traffic) {
        if (!map.hasLayer(trafficLayerRef.current)) {
          map.addLayer(trafficLayerRef.current);
        }
      } else {
        if (map.hasLayer(trafficLayerRef.current)) {
          map.removeLayer(trafficLayerRef.current);
        }
      }
    }

    // Logistics Hubs Layer Toggle
    if (hubsLayerRef.current) {
      if (activeLayers.hubs) {
        if (!map.hasLayer(hubsLayerRef.current)) {
          map.addLayer(hubsLayerRef.current);
        }
      } else {
        if (map.hasLayer(hubsLayerRef.current)) {
          map.removeLayer(hubsLayerRef.current);
        }
      }
    }

    // Recycling Facilities Layer Toggle
    if (recyclersLayerRef.current) {
      if (activeLayers.recyclers) {
        if (!map.hasLayer(recyclersLayerRef.current)) {
          map.addLayer(recyclersLayerRef.current);
        }
      } else {
        if (map.hasLayer(recyclersLayerRef.current)) {
          map.removeLayer(recyclersLayerRef.current);
        }
      }
    }
  }, [activeLayers]);

  // 3. Map Mode Switch & Route Drawing (Only runs on mode switch or selectedTruckId change)
  useEffect(() => {
    const map = mapInstanceRef.current;
    const polylineLayer = polylineLayerRef.current;
    const stateLayer = stateMarkersLayerRef.current;
    const trucksLayer = trucksLayerRef.current;
    if (!map || !polylineLayer || !stateLayer || !trucksLayer) return;

    polylineLayer.clearLayers();

    if (hazardCircleRef.current) {
      hazardCircleRef.current.remove();
      hazardCircleRef.current = null;
    }

    if (mapMode === 'gis') {
      // GIS Grid Mode: Zoom out to view entire India spatial grid
      map.flyTo([22.8, 78.9], 5, { duration: 0.8 });

      // Show state nodes
      if (!map.hasLayer(stateLayer)) {
        map.addLayer(stateLayer);
      }

      // Hide truck markers in GIS Grid mode for clear spatial overview
      if (map.hasLayer(trucksLayer)) {
        map.removeLayer(trucksLayer);
      }
    } else {
      // Live Map Mode: Focus on selected truck's route corridor
      const activeTruck = trucks.find((t) => t.id === selectedTruckId) || trucks[0];
      const currentCoords = activeTruck.coordinates;
      map.flyTo(currentCoords, 11, { duration: 0.7 });

      // Hide state nodes, show trucks
      if (map.hasLayer(stateLayer)) {
        map.removeLayer(stateLayer);
      }
      if (!map.hasLayer(trucksLayer)) {
        map.addLayer(trucksLayer);
      }

      // Ensure truck markers exist in trucksLayer with updated selection icon
      trucks.forEach((truck) => {
        const isSelected = truck.id === selectedTruckId;
        const icon = createTruckIcon(isSelected);

        if (truckMarkersRef.current[truck.id]) {
          const marker = truckMarkersRef.current[truck.id];
          marker.setIcon(icon);
          if (!trucksLayer.hasLayer(marker)) {
            trucksLayer.addLayer(marker);
          }
        } else {
          const marker = L.marker(truck.coordinates, { icon });
          marker.on('click', () => {
            setSelectedTruckId(truck.id);
          });
          truckMarkersRef.current[truck.id] = marker;
          trucksLayer.addLayer(marker);
        }
      });

      // Render Route Polylines for active truck
      if (activeTruck.gpsWaypoints && activeTruck.gpsWaypoints.length > 1) {
        // Glow line
        const glowLine = L.polyline(activeTruck.gpsWaypoints, {
          color: '#10b981',
          weight: 6,
          opacity: 0.35
        });
        polylineLayer.addLayer(glowLine);

        // Core line
        const routeLine = L.polyline(activeTruck.gpsWaypoints, {
          color: '#10b981',
          weight: 3.5,
          opacity: 0.95
        });
        polylineLayer.addLayer(routeLine);

        // Origin
        const originMarker = L.circleMarker(activeTruck.gpsWaypoints[0], {
          radius: 4.5,
          color: '#10b981',
          fillColor: '#047857',
          fillOpacity: 1,
          weight: 2
        });
        polylineLayer.addLayer(originMarker);

        // Waypoints
        activeTruck.gpsWaypoints.slice(1, -1).forEach((pt) => {
          const wpMarker = L.circleMarker(pt, {
            radius: 3,
            color: '#38bdf8',
            fillColor: '#0284c7',
            fillOpacity: 0.8,
            weight: 1.5
          });
          polylineLayer.addLayer(wpMarker);
        });

        // Destination
        const destMarker = L.circleMarker(
          activeTruck.gpsWaypoints[activeTruck.gpsWaypoints.length - 1],
          {
            radius: 5.5,
            color: '#38bdf8',
            fillColor: '#0f172a',
            fillOpacity: 1,
            weight: 2.5
          }
        );
        polylineLayer.addLayer(destMarker);
      }

      // Ghazipur Hazard Zone Buffer
      if (activeTruck.id === 'TRK-IND-01') {
        const hazardCircle = L.circle([28.6284, 77.3292], {
          radius: 3500,
          color: '#f43f5e',
          fillColor: '#f43f5e',
          fillOpacity: 0.12,
          weight: 1.5,
          dashArray: '4, 4'
        }).addTo(map);
        hazardCircleRef.current = hazardCircle;
      }
    }
  }, [mapMode, selectedTruckId, createTruckIcon]);

  // 4. Lightweight GPS Coordinate Updater (Updates markers in-place without re-rendering layers)
  useEffect(() => {
    trucks.forEach((truck) => {
      const marker = truckMarkersRef.current[truck.id];
      if (marker) {
        marker.setLatLng(truck.coordinates);
      }
    });
  }, [trucks]);

  // 5. Real-time GPS movement simulation tick
  useEffect(() => {
    if (!isSimulating) return;

    const intervalTime = 1200 / simulationSpeed;
    const interval = setInterval(() => {
      setTrucks((prevTrucks) =>
        prevTrucks.map((truck) => {
          if (truck.status === 'At Collection Point') return truck;

          const waypoints = truck.gpsWaypoints || [];
          if (waypoints.length < 2) return truck;

          const currentPct = truck.routeProgressPct ?? 50;
          let newPct = currentPct + 0.6 * simulationSpeed;
          if (newPct >= 100) newPct = 0;

          const totalSegments = waypoints.length - 1;
          const segmentIndex = Math.min(
            Math.floor((newPct / 100) * totalSegments),
            totalSegments - 1
          );
          const segmentProgress = (newPct / 100) * totalSegments - segmentIndex;

          const p1 = waypoints[segmentIndex];
          const p2 = waypoints[segmentIndex + 1];

          const curLat = p1[0] + (p2[0] - p1[0]) * segmentProgress;
          const curLng = p1[1] + (p2[1] - p1[1]) * segmentProgress;

          return {
            ...truck,
            coordinates: [curLat, curLng],
            routeProgressPct: Math.round(newPct)
          };
        })
      );
    }, intervalTime);

    return () => clearInterval(interval);
  }, [isSimulating, simulationSpeed]);

  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const toggleAllIndiaCorridor = () => {
    if (mapMode === 'live') {
      setMapMode('gis');
    } else {
      setMapMode('live');
    }
  };

  const toggleLayer = (layerKey: 'traffic' | 'hubs' | 'recyclers') => {
    setActiveLayers((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  const activeLayerCount = Object.values(activeLayers).filter(Boolean).length;

  return (
    <div className="w-full space-y-2.5">
      {/* ========================================================= */}
      {/* SECTION 1: TOP SECTION (LIVE MAP / GIS GRID + TELEMETRY)  */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        {/* LEFT COLUMN: LIVE MAP & GIS SPATIAL GRID CARD */}
        <div className="lg:col-span-7 xl:col-span-8 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden relative shadow-lg flex flex-col h-[340px] sm:h-[355px]">
          {/* Card Header */}
          <div className="px-3.5 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-950/40">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                <h3 className="text-xs font-bold text-white font-sans flex items-center gap-2">
                  {mapMode === 'live' ? 'Live Fleet Map' : 'National Fleet & Landfill Spatial Grid'}
                </h3>
                <p className="text-[10px] text-slate-400">
                  {mapMode === 'live'
                    ? 'Real-time truck positions along assigned corridors • click a truck to inspect'
                    : 'Hover over state symbols to reveal real-time e-waste generation clusters & landfill buffers'}
                </p>
              </div>
            </div>

            {/* Right side of header: Legend (when in GIS) + [Live Map] [GIS Grid] Toggle */}
            <div className="flex items-center gap-2.5">
              {/* GIS Grid Mode Legend */}
              {mapMode === 'gis' && (
                <div className="hidden sm:flex items-center gap-3 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span className="text-emerald-400 font-semibold">&gt;80% Recycled</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                    <span className="text-amber-400 font-semibold">40-80%</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                    <span className="text-rose-400 font-semibold">&lt;40% Lagging</span>
                  </div>
                </div>
              )}

              {/* Map Engine Toggle: Google Maps vs Leaflet */}
              <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setMapEngine('google')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-1.5 ${
                    mapEngine === 'google'
                      ? 'bg-purple-900/70 text-purple-200 border border-purple-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Google Maps Platform API with real-time GPS fleet telemetry"
                >
                  <Globe className="w-3 h-3 text-purple-400" />
                  <span>Google Maps API</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMapEngine('leaflet')}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold transition flex items-center gap-1.5 ${
                    mapEngine === 'leaflet'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Leaflet DarkOps Vector Map"
                >
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>Leaflet</span>
                </button>
              </div>

              {/* [Live Map] / [GIS Grid] Toggle Pill */}
              <div className="flex items-center rounded-lg bg-slate-950 p-0.5 border border-slate-800">
                <button
                  onClick={() => setMapMode('live')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                    mapMode === 'live'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Live Map
                </button>
                <button
                  onClick={() => setMapMode('gis')}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-semibold transition ${
                    mapMode === 'gis'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  GIS Grid
                </button>
              </div>

              {/* Generate PDF Report Button */}
              <button
                onClick={() => setIsReportModalOpen(true)}
                role="button"
                aria-haspopup="dialog"
                aria-label="Generate PDF Report: CPCB Form 6 Hazardous Transit Manifest"
                className="h-6 px-2.5 rounded-lg text-[11px] font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white transition flex items-center gap-1.5 shadow-sm shadow-emerald-950/40 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                title="Generate CPCB Form 6 Hazardous Transit Manifest & Fleet Telemetry PDF Report"
              >
                <FileText className="w-3 h-3 text-emerald-200" />
                <span className="hidden sm:inline font-sans">Generate PDF Report</span>
                <span className="sm:hidden font-sans">PDF</span>
              </button>
            </div>
          </div>

          {/* Map Canvas Container */}
          <div className="relative flex-1 w-full bg-[#0b1320] overflow-hidden min-h-[580px]">
            {/* Google Maps Platform API Layer */}
            {mapEngine === 'google' && (
              <div className="w-full h-full min-h-[580px]">
                <GoogleMapsFleetGISLayer
                  trucks={trucks}
                  selectedTruckId={selectedTruckId}
                  onSelectTruck={(id) => setSelectedTruckId(id)}
                  hubs={LOGISTICS_HUBS}
                  recyclers={RECYCLING_FACILITIES}
                  activeLayers={{
                    traffic: activeLayers.traffic,
                    hubs: activeLayers.hubs,
                    recyclers: activeLayers.recyclers,
                    corridors: true
                  }}
                />
              </div>
            )}

            {/* Leaflet DarkOps Map Layer */}
            <div className={mapEngine === 'leaflet' ? 'w-full h-full' : 'hidden'}>
              <div ref={mapContainerRef} className="w-full h-full" />

            {/* Top-Left Zoom Controls */}
            <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 shadow-md">
              <button
                onClick={handleZoomIn}
                className="w-6 h-6 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 rounded flex items-center justify-center font-bold text-xs transition"
                title="Zoom in"
              >
                +
              </button>
              <button
                onClick={handleZoomOut}
                className="w-6 h-6 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700/80 rounded flex items-center justify-center font-bold text-xs transition"
                title="Zoom out"
              >
                −
              </button>
            </div>

            {/* Top-Right Control Buttons: Layer Control + All India / Corridor View */}
            {/* Top-Right Control Buttons: Quick Layer Toggles + Detailed Layer Menu */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
              {/* Quick 1-Click Layer Toggle Pills */}
              <div className="hidden sm:flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800/90 shadow-md backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => toggleLayer('traffic')}
                  className={`h-6 px-2 rounded-md text-[10px] font-semibold flex items-center gap-1 transition ${
                    activeLayers.traffic
                      ? 'bg-rose-950 text-rose-300 border border-rose-600/60 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Traffic Density Layer"
                >
                  <Flame className="w-2.5 h-2.5" />
                  <span>Traffic</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleLayer('hubs')}
                  className={`h-6 px-2 rounded-md text-[10px] font-semibold flex items-center gap-1 transition ${
                    activeLayers.hubs
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-600/60 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Logistics Hubs Layer"
                >
                  <Building2 className="w-2.5 h-2.5" />
                  <span>Hubs</span>
                </button>

                <button
                  type="button"
                  onClick={() => toggleLayer('recyclers')}
                  className={`h-6 px-2 rounded-md text-[10px] font-semibold flex items-center gap-1 transition ${
                    activeLayers.recyclers
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-600/60 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Toggle Recycling Facilities Layer"
                >
                  <Factory className="w-2.5 h-2.5" />
                  <span>Recyclers</span>
                </button>
              </div>

              {/* Interactive Layer Control Widget */}
              <div className="relative">
                <button
                  onClick={() => setShowLayerMenu((prev) => !prev)}
                  className={`h-6 px-2 rounded-md text-[10px] font-semibold flex items-center gap-1.5 transition border shadow-md ${
                    showLayerMenu || activeLayerCount > 0
                      ? 'bg-slate-900/95 text-cyan-300 border-cyan-500/60'
                      : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                  title="Toggle Map Layers: Traffic, Logistics Hubs, Recycling Facilities"
                >
                  <Layers className="w-3 h-3 text-cyan-400" />
                  <span>Layers</span>
                  <span className="px-1 py-0.2 rounded-full bg-cyan-950 border border-cyan-800 text-[8px] font-mono text-cyan-300">
                    {activeLayerCount}/3
                  </span>
                </button>

                {/* Layer Control Dropdown Panel */}
                {showLayerMenu && (
                  <div className="absolute right-0 top-7 z-30 w-64 p-2.5 rounded-xl bg-slate-950/95 backdrop-blur-md border border-slate-800 shadow-2xl space-y-2 text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                      <span className="text-[11px] font-bold text-white flex items-center gap-1.5 font-sans">
                        <SlidersHorizontal className="w-3 h-3 text-cyan-400" />
                        <span>GIS Layer Controls</span>
                      </span>
                      <button
                        onClick={() => setShowLayerMenu(false)}
                        className="text-slate-500 hover:text-white transition"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Toggle 1: Traffic Density */}
                    <div
                      onClick={() => toggleLayer('traffic')}
                      className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        activeLayers.traffic
                          ? 'bg-rose-950/30 border-rose-500/40 text-slate-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className={`w-3.5 h-3.5 ${activeLayers.traffic ? 'text-rose-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="text-[11px] font-bold text-white leading-tight">Traffic Density</div>
                          <div className="text-[9px] text-slate-400">Congestion, bottlenecks & speeds</div>
                        </div>
                      </div>
                      <div
                        className={`w-7 h-4 rounded-full p-0.5 transition-colors ${
                          activeLayers.traffic ? 'bg-rose-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white transition-transform ${
                            activeLayers.traffic ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Toggle 2: Logistics Hubs */}
                    <div
                      onClick={() => toggleLayer('hubs')}
                      className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        activeLayers.hubs
                          ? 'bg-cyan-950/30 border-cyan-500/40 text-slate-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className={`w-3.5 h-3.5 ${activeLayers.hubs ? 'text-cyan-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="text-[11px] font-bold text-white leading-tight">Logistics Hubs</div>
                          <div className="text-[9px] text-slate-400">10 Collection depots & docks</div>
                        </div>
                      </div>
                      <div
                        className={`w-7 h-4 rounded-full p-0.5 transition-colors ${
                          activeLayers.hubs ? 'bg-cyan-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white transition-transform ${
                            activeLayers.hubs ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Toggle 3: Recycling Facility Views */}
                    <div
                      onClick={() => toggleLayer('recyclers')}
                      className={`p-2 rounded-lg border transition cursor-pointer flex items-center justify-between ${
                        activeLayers.recyclers
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-slate-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Factory className={`w-3.5 h-3.5 ${activeLayers.recyclers ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <div>
                          <div className="text-[11px] font-bold text-white leading-tight">Recycling Facilities</div>
                          <div className="text-[9px] text-slate-400">7 CPCB Smelters & Refineries</div>
                        </div>
                      </div>
                      <div
                        className={`w-7 h-4 rounded-full p-0.5 transition-colors ${
                          activeLayers.recyclers ? 'bg-emerald-500' : 'bg-slate-700'
                        }`}
                      >
                        <div
                          className={`w-3 h-3 rounded-full bg-white transition-transform ${
                            activeLayers.recyclers ? 'translate-x-3' : 'translate-x-0'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Quick Action Footer */}
                    <div className="pt-1 flex items-center justify-between text-[9px] text-slate-400">
                      <button
                        onClick={() => setActiveLayers({ traffic: true, hubs: true, recyclers: true })}
                        className="hover:text-cyan-300 font-semibold"
                      >
                        Enable All
                      </button>
                      <button
                        onClick={() => setActiveLayers({ traffic: false, hubs: false, recyclers: false })}
                        className="hover:text-rose-400 font-semibold"
                      >
                        Clear All
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* [All India] / [Corridor View] Toggle Button */}
              <button
                onClick={toggleAllIndiaCorridor}
                className={`h-6 px-2.5 rounded-md text-[10px] font-semibold flex items-center gap-1 transition border shadow-md ${
                  mapMode === 'gis'
                    ? 'bg-blue-600 text-white border-blue-400'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
                title="Toggle between All India Spatial Grid and Corridor Zoom"
              >
                <Globe className="w-3 h-3 text-cyan-400" />
                <span>{mapMode === 'gis' ? 'Corridor View' : 'All India'}</span>
              </button>
            </div>

            {/* Quick Layer Control Pills (Floating overlay for instant 1-click toggling) */}
            <div className="absolute top-10 right-2.5 z-20 hidden md:flex flex-col gap-1 pointer-events-auto">
              <button
                onClick={() => toggleLayer('traffic')}
                className={`h-5 px-1.5 rounded text-[9px] font-mono font-semibold flex items-center gap-1 transition border backdrop-blur-md shadow-sm ${
                  activeLayers.traffic
                    ? 'bg-rose-950/80 text-rose-300 border-rose-500/50'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Toggle Traffic Density"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeLayers.traffic ? 'bg-rose-400 animate-pulse' : 'bg-slate-600'}`}></span>
                <span>Traffic {activeLayers.traffic ? 'ON' : 'OFF'}</span>
              </button>
              <button
                onClick={() => toggleLayer('hubs')}
                className={`h-5 px-1.5 rounded text-[9px] font-mono font-semibold flex items-center gap-1 transition border backdrop-blur-md shadow-sm ${
                  activeLayers.hubs
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Toggle Logistics Hubs"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeLayers.hubs ? 'bg-cyan-400' : 'bg-slate-600'}`}></span>
                <span>Hubs {activeLayers.hubs ? 'ON' : 'OFF'}</span>
              </button>
              <button
                onClick={() => toggleLayer('recyclers')}
                className={`h-5 px-1.5 rounded text-[9px] font-mono font-semibold flex items-center gap-1 transition border backdrop-blur-md shadow-sm ${
                  activeLayers.recyclers
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:text-white'
                }`}
                title="Toggle Recycling Facilities"
              >
                <span className={`w-1.5 h-1.5 rounded-full ${activeLayers.recyclers ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                <span>Recyclers {activeLayers.recyclers ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* Bottom Floating Bar */}
            {mapMode === 'live' ? (
              // Live Mode: Playback controls + hints
              <div className="absolute bottom-2 inset-x-2 z-20 flex flex-wrap items-center justify-between text-xs pointer-events-none gap-2">
                <div className="flex items-center gap-1 pointer-events-auto bg-slate-950/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-800 shadow-md">
                  <button
                    onClick={() => setIsSimulating(!isSimulating)}
                    className={`h-5 px-1.5 rounded text-[10px] font-bold flex items-center gap-1 transition ${
                      isSimulating
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <span>{isSimulating ? '⏸ Live' : '▶ Paused'}</span>
                  </button>

                  <div className="flex items-center gap-0.5 ml-0.5 font-mono text-[10px]">
                    {[1, 2, 4].map((spd) => (
                      <button
                        key={spd}
                        onClick={() => setSimulationSpeed(spd)}
                        className={`h-5 px-1.5 rounded font-bold transition ${
                          simulationSpeed === spd
                            ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {spd}x
                      </button>
                    ))}
                  </div>

                  {/* Consignments in transit indicator (bound to memoized devices) */}
                  {deviceMetrics.inTransitCount > 0 && (
                    <div className="hidden sm:flex items-center gap-1 ml-1 pl-1 border-l border-slate-800 text-[9px] font-mono text-cyan-300">
                      <Package className="w-2.5 h-2.5 text-cyan-400" />
                      <span>{deviceMetrics.inTransitCount} devices ({deviceMetrics.totalWeightInTransitKg} kg) in transit</span>
                    </div>
                  )}
                </div>

                <div className="hidden md:block text-[9px] text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-full border border-slate-800">
                  Click a truck, hub, or smelter to inspect • scroll to zoom
                </div>

                <div className="text-[8px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 font-mono truncate max-w-[170px] sm:max-w-none">
                  Leaflet | Tiles © CARTO © Esri
                </div>
              </div>
            ) : (
              // GIS Mode: Screenshot 2 Bottom Banner
              <div className="absolute bottom-2 inset-x-2 z-20 flex items-center justify-between text-xs pointer-events-none gap-2">
                <div className="flex items-center gap-1.5 text-[10px] text-cyan-300 bg-slate-950/90 backdrop-blur-md px-2.5 py-0.5 rounded-lg border border-slate-800 shadow-md pointer-events-auto">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>Hover state nodes, hubs, or recyclers to view real-time CPCB capacity metrics</span>
                </div>

                <div className="text-[8px] text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800 font-mono">
                  Leaflet | Tiles © CARTO © Esri
                </div>
              </div>
            )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FLEET PREDICTIVE MAINTENANCE ENGINE */}
        <div className="lg:col-span-5 xl:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-3 shadow-lg flex flex-col justify-between h-[340px] sm:h-[355px] overflow-hidden">
          <div className="space-y-2">
            {/* Header: Wrench icon + Title + [IOT TELEMETRY] Badge */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
              <div className="flex items-center gap-1.5">
                <Wrench className="w-4 h-4 text-amber-400 shrink-0" />
                <h3 className="text-xs font-bold text-white font-sans">
                  Fleet Predictive Maintenance Engine
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold border border-amber-500/40 text-amber-400 bg-amber-950/20">
                IOT TELEMETRY
              </span>
            </div>

            {/* Active Collection Vehicle Dropdown */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Active Collection Vehicle:
              </label>
              <select
                value={selectedTruckId}
                onChange={(e) => {
                  setSelectedTruckId(e.target.value);
                  setMapMode('live');
                }}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs font-mono font-medium text-white focus:outline-none focus:border-blue-500 transition"
              >
                {trucks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.vehicleNumber} ({t.driverName} - {t.state})
                  </option>
                ))}
              </select>
            </div>

            {/* Inner Details Card */}
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 space-y-2">
              {/* Vehicle Number & Status Badge */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white font-mono tracking-tight">
                    {selectedTruck.vehicleNumber}
                  </h3>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-[190px] sm:max-w-[230px]">
                    {selectedTruck.currentRoute}
                  </p>
                </div>
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    selectedTruck.status === 'At Collection Point'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }`}
                >
                  {selectedTruck.status === 'In Transit' ? 'IN TRANSIT' : 'AT COLLECTION POINT'}
                </span>
              </div>

              {/* 2x2 Telemetry Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 font-sans block">
                    Engine Hours Run:
                  </span>
                  <span className="text-white font-bold text-xs">{selectedTruck.engineHours} hrs</span>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 font-sans block">
                    Tire Pressure:
                  </span>
                  <span className="text-emerald-400 font-bold text-xs">
                    {selectedTruck.tirePressurePsi} PSI
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 font-sans block">
                    Vibration Anomaly Score:
                  </span>
                  <span className="text-emerald-400 font-bold text-xs">
                    {selectedTruck.vibrationAnomalyScore}/100
                  </span>
                </div>

                <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                  <span className="text-[9px] text-slate-400 font-sans block">
                    Past Breakdowns:
                  </span>
                  <span className="text-white font-bold text-xs">
                    {selectedTruck.pastBreakdownCount} Incidents
                  </span>
                </div>
              </div>

              {/* Green Recommendation Card */}
              <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-600/40 text-emerald-300 text-[10px] space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-emerald-400 text-[10px]">
                  <CheckCircle2 className="w-3 h-3 shrink-0" />
                  <span>Predictive Maintenance Recommendation:</span>
                </div>
                <p className="text-[10px] leading-relaxed text-slate-300">
                  {selectedTruck.serviceIntervalRecommendation}
                </p>
              </div>

              {/* Warning / Clear Card */}
              {selectedTruck.activeAlert ? (
                <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-600/40 text-amber-300 text-[10px] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[10px] leading-tight">{selectedTruck.activeAlert}</p>
                </div>
              ) : (
                <div className="p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-400 text-[10px] flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Corridor clear. Standard travel speed maintaining on schedule.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1.5: PREDICTIVE DEMAND & 7-DAY COLLECTION HOTSPOTS*/}
      {/* ========================================================= */}
      <section
        role="region"
        aria-labelledby="predictive-demand-heading"
        className="glass-panel rounded-2xl p-4 sm:p-5 shadow-xl relative overflow-hidden border border-slate-800/80"
      >
        {/* Subtle background ambient mesh */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 id="predictive-demand-heading" className="text-sm font-bold text-white tracking-tight flex items-center gap-2 font-sans">
                  Predictive Demand • Upcoming Collection Hotspots (Next 7 Days)
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                  <TrendingUp className="w-2.5 h-2.5 text-emerald-400" />
                  <span>AI Telemetry Model v3</span>
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Forecasted e-waste influx based on municipal commercial renewal cycles, tech park hardware depreciation patterns, and historical CPCB manifest logs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono shrink-0">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-sans">7-Day Projected Influx</span>
              <span className="text-sm font-bold text-emerald-400 font-mono">96.5 Metric Tonnes</span>
            </div>
            <div className="h-7 w-px bg-slate-800" />
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-sans">Peak Hotspot</span>
              <span className="text-sm font-bold text-cyan-400 font-mono">Whitefield (18.2 T)</span>
            </div>
          </div>
        </div>

        {/* 7-Day Interactive Horizon Selector */}
        <div className="pt-3">
          <div
            role="tablist"
            aria-label="Predictive 7-day forecast days"
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2"
          >
            {PREDICTIVE_DEMAND_DATA.map((hotspot) => {
              const isSelected = selectedForecastDay === hotspot.dayIndex;
              return (
                <button
                  key={hotspot.dayIndex}
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls={`hotspot-panel-${hotspot.dayIndex}`}
                  id={`hotspot-tab-${hotspot.dayIndex}`}
                  onClick={() => setSelectedForecastDay(hotspot.dayIndex)}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-1.5 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none ${
                    isSelected
                      ? 'bg-gradient-to-b from-slate-800/90 to-slate-900 border-emerald-500/60 shadow-lg shadow-emerald-950/40 scale-[1.02]'
                      : 'bg-slate-950/50 hover:bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-[10px] font-bold font-sans ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {hotspot.dayLabel}
                    </span>
                    <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                      hotspot.urgency === 'Critical Surge'
                        ? 'bg-rose-950/80 text-rose-300 border border-rose-800/60'
                        : hotspot.urgency === 'High Demand'
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      +{hotspot.surgePct}%
                    </span>
                  </div>

                  <div>
                    <div className="text-sm font-extrabold text-white font-mono">
                      {hotspot.projectedTonnes} <span className="text-[10px] text-slate-400 font-sans font-normal">MT</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans truncate" title={hotspot.hotspotDistrict}>
                      {hotspot.state}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Hotspot In-Depth Drilldown */}
        {(() => {
          const current = PREDICTIVE_DEMAND_DATA.find((h) => h.dayIndex === selectedForecastDay) || PREDICTIVE_DEMAND_DATA[0];
          return (
            <div
              id={`hotspot-panel-${current.dayIndex}`}
              role="tabpanel"
              aria-labelledby={`hotspot-tab-${current.dayIndex}`}
              className="mt-3.5 p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
            >
              <div className="md:col-span-8 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-mono font-semibold text-cyan-400">
                    {current.dateStr}
                  </span>
                  <span className="text-slate-500">•</span>
                  <span className="text-xs font-bold text-white flex items-center gap-1 font-sans">
                    <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                    <span>{current.hotspotDistrict} ({current.state})</span>
                  </span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                    current.riskFactor === 'High Battery Risk'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : current.riskFactor === 'RoHS Heavy Metal'
                      ? 'bg-purple-950 text-purple-300 border border-purple-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {current.riskFactor}
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex items-center gap-1.5 font-sans">
                  <span className="text-slate-400">Dominant Stream:</span>
                  <span className="font-semibold text-white">{current.dominantCategory}</span>
                </div>

                <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-sans bg-emerald-950/30 px-2.5 py-1.5 rounded-lg border border-emerald-800/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>Statutory Directive:</strong> {current.recommendedDispatch}</span>
                </div>
              </div>

              <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col justify-end items-end gap-2">
                <button
                  onClick={() => {
                    setSelectedTruckId(current.assignedTruckId);
                    setMapMode('live');
                    setAllocationToast(`Fleet Vessel ${current.assignedTruckId} pre-allocated to ${current.hotspotDistrict}`);
                    setTimeout(() => setAllocationToast(null), 4000);
                  }}
                  className="w-full sm:w-auto md:w-full px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Pre-allocate {current.assignedTruckId} to Hotspot</span>
                </button>

                {allocationToast && (
                  <div
                    aria-live="polite"
                    className="w-full text-[10px] text-emerald-300 bg-emerald-950/80 border border-emerald-500/60 rounded-lg px-2.5 py-1 text-center font-mono animate-fadeIn"
                  >
                    ✓ {allocationToast}
                  </div>
                )}
              </div>
            </div>
          );
        })()}
      </section>

      {/* ========================================================= */}
      {/* SECTION 2: LIVE FLEET TRACKING ROSTER TABLE               */}
      {/* ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 shadow-lg">
        {/* Table Section Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <div>
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
              <Navigation className="w-3.5 h-3.5 text-cyan-400" />
              <span>Live Fleet Tracking Roster</span>
            </h3>
            <p className="text-[10px] text-slate-400">
              Select any vehicle to load its telemetry, map focus and route history.
            </p>
          </div>

          <div className="px-2 py-0.5 rounded bg-blue-950/70 border border-cyan-800/50 text-cyan-400 font-mono text-[10px] font-bold">
            {filteredTrucks.length} / {trucks.length} VEHICLES
          </div>
        </div>

        {/* Search & Filters Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-950/70 p-1.5 rounded-lg border border-slate-800">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search vehicle no., truck ID, driver or route..."
              className="w-full bg-transparent pl-8 pr-2 py-0.5 text-xs text-white placeholder-slate-500 focus:outline-none font-sans"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={selectedStateFilter}
              onChange={(e) => setSelectedStateFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="ALL">All states</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Telangana">Telangana</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="ALL">All statuses</option>
              <option value="In Transit">In Transit</option>
              <option value="At Collection Point">At Collection Point</option>
            </select>

            <select
              value={selectedTrafficFilter}
              onChange={(e) => setSelectedTrafficFilter(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-sans"
            >
              <option value="ALL">All traffic</option>
              <option value="Clear">Clear</option>
              <option value="Moderate">Moderate</option>
              <option value="Heavy Congestion">Heavy Congestion</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto rounded-lg border border-slate-800/80">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 font-mono text-[9px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-1.5 px-3 font-semibold">VEHICLE</th>
                <th className="py-1.5 px-3 font-semibold">DRIVER</th>
                <th className="py-1.5 px-3 font-semibold">ROUTE / NEXT STOP</th>
                <th className="py-1.5 px-3 font-semibold">TRIP PROGRESS</th>
                <th className="py-1.5 px-3 font-semibold">LOAD</th>
                <th className="py-1.5 px-3 font-semibold">TRAFFIC</th>
                <th className="py-1.5 px-3 font-semibold text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredTrucks.map((truck) => {
                const isSelected = selectedTruckId === truck.id;
                return (
                  <tr
                    key={truck.id}
                    onClick={() => {
                      setSelectedTruckId(truck.id);
                      setMapMode('live');
                    }}
                    className={`cursor-pointer transition ${
                      isSelected
                        ? 'bg-blue-950/30 border-l-2 border-l-emerald-400'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    {/* Vehicle */}
                    <td className="py-1.5 px-3 font-mono">
                      <div className="font-bold text-white text-xs">{truck.vehicleNumber}</div>
                      <div className="text-[9px] text-slate-500 font-sans">{truck.id}</div>
                    </td>

                    {/* Driver */}
                    <td className="py-1.5 px-3">
                      <div className="font-medium text-slate-200 text-xs">{truck.driverName}</div>
                      <div className="text-[9px] text-slate-500 flex items-center gap-1 font-mono">
                        <Phone className="w-2.5 h-2.5 text-slate-500" />
                        <span>{truck.driverPhone}</span>
                      </div>
                    </td>

                    {/* Route / Next Stop */}
                    <td className="py-1.5 px-3 max-w-xs">
                      <div className="font-medium text-slate-300 text-xs truncate">{truck.currentRoute}</div>
                      <div className="text-[9px] text-slate-500 truncate mt-0.5">
                        {truck.nextStop || 'En route to authorized terminal'}
                      </div>
                    </td>

                    {/* Trip Progress */}
                    <td className="py-1.5 px-3 w-28 font-mono">
                      <div className="text-[10px] text-cyan-400 font-bold mb-0.5">
                        {truck.routeProgressPct}%
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-cyan-400 rounded-full transition-all duration-300"
                          style={{ width: `${truck.routeProgressPct}%` }}
                        />
                      </div>
                    </td>

                    {/* Load */}
                    <td className="py-1.5 px-3 w-36 font-mono">
                      <div className="flex items-center justify-between text-[9px] mb-0.5">
                        <span className="text-amber-400 font-bold">{truck.loadPercentage}%</span>
                        <span className="text-slate-400">
                          {truck.currentLoadKg}/{truck.capacityKg} kg
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-400 rounded-full transition-all duration-300"
                          style={{ width: `${truck.loadPercentage}%` }}
                        />
                      </div>
                    </td>

                    {/* Traffic */}
                    <td className="py-1.5 px-3 font-semibold text-xs">
                      <span
                        className={
                          truck.trafficLevel === 'Heavy Congestion'
                            ? 'text-rose-400'
                            : truck.trafficLevel === 'Moderate'
                            ? 'text-amber-400'
                            : 'text-emerald-400'
                        }
                      >
                        {truck.trafficLevel}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-1.5 px-3 text-right">
                      <span
                        className={`inline-block text-[8px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          truck.status === 'At Collection Point'
                            ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50'
                            : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50'
                        }`}
                      >
                        {truck.status === 'In Transit' ? 'IN TRANSIT' : 'AT COLLECTION POINT'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 3: TRUCK ROUTE HISTORY                            */}
      {/* ========================================================= */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 shadow-lg">
        {/* Header & Selected Truck Meta */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
          <div>
            <h3 className="text-xs font-bold text-white">Truck Route History</h3>
            <p className="text-[10px] text-slate-400">
              {selectedTruck.vehicleNumber} • {selectedTruck.driverName} — live trip progress and logged trip records.
            </p>
          </div>

          <div className="font-mono text-xs text-slate-400 font-bold">{selectedTruck.id}</div>
        </div>

        {/* Sub-tabs: ACTIVE TRIP STOPS vs PAST TRIPS */}
        <div className="flex items-center gap-5 border-b border-slate-800/60 pb-1">
          <button
            onClick={() => setRouteHistoryTab('active')}
            className={`flex items-center gap-1.5 text-xs font-semibold transition ${
              routeHistoryTab === 'active' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Route className="w-3.5 h-3.5 text-cyan-400" />
            <span className="uppercase tracking-wider text-[10px]">ACTIVE TRIP STOPS</span>
            <span className="ml-1 text-[10px] font-mono text-cyan-400 font-bold">
              {selectedTruck.routeProgressPct}% complete
            </span>
          </button>

          <button
            onClick={() => setRouteHistoryTab('past')}
            className={`flex items-center gap-1.5 text-xs font-semibold transition ${
              routeHistoryTab === 'past' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="uppercase tracking-wider text-[10px]">
              PAST TRIPS ({selectedTruck.tripHistory?.length || 3})
            </span>
          </button>
        </div>

        {/* Tab Content: Active Trip Stops */}
        {routeHistoryTab === 'active' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-0.5">
            {(selectedTruck.stops || []).map((stop, idx) => {
              const isCompleted = stop.status === 'Completed';
              const isCurrent = stop.status === 'Current';
              return (
                <div
                  key={idx}
                  className={`p-2 rounded-lg border flex items-start gap-2.5 text-xs transition ${
                    isCurrent
                      ? 'bg-blue-950/20 border-cyan-500/50 shadow-sm'
                      : isCompleted
                      ? 'bg-slate-950/60 border-slate-800'
                      : 'bg-slate-950/30 border-slate-800/50 opacity-70'
                  }`}
                >
                  {/* Indicator Dot */}
                  <div className="mt-0.5 shrink-0">
                    {isCompleted ? (
                      <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                      </div>
                    ) : isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-cyan-400 opacity-75"></span>
                        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                      </div>
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full border border-slate-600 bg-slate-800" />
                    )}
                  </div>

                  {/* Stop Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span
                        className={`truncate text-xs ${
                          isCurrent
                            ? 'text-cyan-300 font-bold'
                            : isCompleted
                            ? 'text-white font-semibold'
                            : 'text-slate-400'
                        }`}
                      >
                        {stop.stopName}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 shrink-0 ml-1">
                        {stop.arrivalTime}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                      {stop.notes || (isCompleted ? 'Passed • scan logged' : 'Scheduled corridor stop')}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab Content: Past Trips */}
        {routeHistoryTab === 'past' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 pt-0.5 font-mono text-xs">
            {selectedTruck.tripHistory && selectedTruck.tripHistory.length > 0 ? (
              selectedTruck.tripHistory.map((trip, idx) => (
                <div
                  key={trip.tripId}
                  className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-between text-[11px]"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white">{trip.tripId}</span>
                      <span
                        className={`text-[8px] px-1.5 py-0.2 rounded uppercase font-bold ${
                          idx === 0
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {idx === 0 ? 'DELAYED' : 'COMPLETED'}
                      </span>
                    </div>
                    <div className="text-slate-400 font-sans text-[10px] truncate">
                      {trip.origin} → {trip.destination}
                    </div>
                  </div>

                  <div className="text-right text-[10px] text-slate-300 shrink-0 ml-2">
                    <div>{trip.totalDistanceKm} km • {Math.round(trip.transitHours * 60)} min</div>
                    <div className="text-cyan-400 font-bold">{trip.totalEwasteKg} kg</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-slate-400 text-xs text-center col-span-3">No past trips recorded</div>
            )}
          </div>
        )}
      </div>

      {/* CPCB Form 6 Regulatory Transit & Fleet Manifest PDF Generator Modal */}
      <FleetRegulatoryReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        trucks={trucks}
        totalInTransitWeightKg={deviceMetrics.totalWeightInTransitKg}
      />
    </div>
  );
});
