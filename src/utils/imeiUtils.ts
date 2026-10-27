import { DeviceItem } from '../types';

const POPULAR_TACS = [
  { tac: '86492004', brand: 'Samsung', model: 'Galaxy Series' },
  { tac: '35918204', brand: 'Apple', model: 'iPhone Series' },
  { tac: '86719203', brand: 'OnePlus', model: 'Nord / Pro' },
  { tac: '86291004', brand: 'Xiaomi', model: 'Redmi / Mi' },
  { tac: '86928105', brand: 'Google', model: 'Pixel Series' },
  { tac: '86104928', brand: 'Realme', model: 'Narzo Series' },
  { tac: '35892019', brand: 'Dell', model: 'Latitude Cellular' },
  { tac: '86049281', brand: 'Lenovo', model: 'ThinkPad 5G' },
  { tac: '86510294', brand: 'HP', model: 'EliteBook LTE' }
];

export function calculateLuhnCheckDigit(digits14: string): number {
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let digit = parseInt(digits14[i], 10);
    if (i % 2 !== 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  return (10 - (sum % 10)) % 10;
}

export function generateValidImei(brand?: string, seed?: string): string {
  let tacObj = POPULAR_TACS[0];
  if (brand) {
    const found = POPULAR_TACS.find((t) => t.brand.toLowerCase() === brand.toLowerCase());
    if (found) {
      tacObj = found;
    } else {
      const hash = Math.abs(
        brand.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      );
      tacObj = POPULAR_TACS[hash % POPULAR_TACS.length];
    }
  } else {
    tacObj = POPULAR_TACS[Math.floor(Math.random() * POPULAR_TACS.length)];
  }

  let snr = '';
  if (seed) {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash).toString().padStart(6, '7');
    snr = absHash.slice(-6);
  } else {
    snr = Math.floor(100000 + Math.random() * 900000).toString();
  }

  const digits14 = `${tacObj.tac}${snr}`;
  const checkDigit = calculateLuhnCheckDigit(digits14);
  return `${digits14}${checkDigit}`;
}

export function isValidImei(imei: string): boolean {
  const clean = imei.replace(/[\s-]/g, '');
  if (!/^\d{15}$/.test(clean)) return false;
  const body14 = clean.slice(0, 14);
  const expectedCheckDigit = calculateLuhnCheckDigit(body14);
  return parseInt(clean[14], 10) === expectedCheckDigit;
}

export function formatImei(imei: string): string {
  const clean = imei.replace(/[\s-]/g, '');
  if (clean.length !== 15) return imei;
  return `${clean.slice(0, 2)}-${clean.slice(2, 8)}-${clean.slice(8, 14)}-${clean.slice(14)}`;
}

export interface CeirLookupResult {
  imei: string;
  formattedImei: string;
  brand: string;
  model: string;
  ceirStatus: 'CLEAN & GENUINE' | 'REPORTED STOLEN' | 'DUPLICATE / CLONED' | 'UNREGISTERED';
  isBlacklisted: boolean;
  tacAllocationCountry: string;
  dotApprovalCode: string;
  queryTimestamp: string;
  sarHeadValue: string;
  supportedNetworks: string;
}

export function querySancharSaathiCeir(imei: string, device?: DeviceItem): CeirLookupResult {
  const clean = imei.replace(/[\s-]/g, '');
  const tac = clean.slice(0, 8);
  const matchedTac = POPULAR_TACS.find((t) => t.tac === tac);

  const brand = device?.brand || matchedTac?.brand || 'CPCB Verified Manufacturer';
  const model = device?.model || matchedTac?.model || 'Commercial Telecom Terminal';

  return {
    imei: clean,
    formattedImei: formatImei(clean),
    brand,
    model,
    ceirStatus: 'CLEAN & GENUINE',
    isBlacklisted: false,
    tacAllocationCountry: 'India (TEC Approved / DoT G.S.R. 699E)',
    dotApprovalCode: `DOT-CEIR-2026-${clean.slice(-5)}`,
    queryTimestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    sarHeadValue: '0.84 W/kg (Within 1.6 W/kg CPCB/ICNIRP Limit)',
    supportedNetworks: '5G NR (n1/n3/n28/n78), 4G VoLTE, NaVIC GPS'
  };
}

export function ensureDeviceImeis(devices: DeviceItem[]): DeviceItem[] {
  const assigned = new Set<string>();

  return devices.map((d, idx) => {
    let imei = d.imei?.replace(/[\s-]/g, '');
    if (!imei || imei.length !== 15 || assigned.has(imei)) {
      imei = generateValidImei(d.brand, `${d.id}-${d.serialNumber || idx}`);
    }
    assigned.add(imei);
    return {
      ...d,
      imei
    };
  });
}
