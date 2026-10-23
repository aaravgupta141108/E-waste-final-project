import { DeviceItem, UserProfile } from '../types';
import { DEMO_USERS, MOCK_DEVICES } from '../data/mockData';

const STORAGE_KEY = 'bharat_ewaste_users_registry_v2';

export interface StoredUserBundle {
  user: UserProfile;
  devices: DeviceItem[];
  savedAt: string;
}

/**
 * Normalize phone, email, or name to create a consistent lookup key
 */
export function normalizeUserKey(identifier: string): string {
  if (!identifier) return 'anonymous';
  const clean = identifier.trim().toLowerCase();
  // If looks like mobile, strip non-digits except leading +
  const digits = clean.replace(/[^0-9]/g, '');
  if (digits.length >= 10) {
    return `mobile_${digits.slice(-10)}`;
  }
  // Otherwise alphanumeric slug
  return `id_${clean.replace(/[^a-z0-9]/g, '_')}`;
}

/**
 * Get all stored user bundles from localStorage
 */
export function getAllStoredUsers(): Record<string, StoredUserBundle> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with initial demo citizen (Ananya Sharma)
      const initialStore: Record<string, StoredUserBundle> = {};
      const demoUser = DEMO_USERS.citizen;
      const demoKey = normalizeUserKey(demoUser.mobile);
      const demoEmailKey = normalizeUserKey(demoUser.email);
      const demoDevices = MOCK_DEVICES.filter((d) => d.userId === demoUser.id);
      
      const bundle: StoredUserBundle = {
        user: demoUser,
        devices: demoDevices,
        savedAt: new Date().toISOString()
      };
      
      initialStore[demoKey] = bundle;
      initialStore[demoEmailKey] = bundle;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialStore));
      return initialStore;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read user registry from localStorage:', err);
    return {};
  }
}

/**
 * Look up existing user by phone, email, or name
 */
export function findStoredUser(identifier: string): StoredUserBundle | null {
  if (!identifier) return null;
  const store = getAllStoredUsers();
  const directKey = normalizeUserKey(identifier);
  
  if (store[directKey]) {
    return store[directKey];
  }

  // Fallback search across stored users by phone, email, or name
  const cleanTerm = identifier.trim().toLowerCase();
  for (const bundle of Object.values(store)) {
    if (
      bundle.user.mobile.toLowerCase().includes(cleanTerm) ||
      bundle.user.email.toLowerCase() === cleanTerm ||
      bundle.user.name.toLowerCase() === cleanTerm
    ) {
      return bundle;
    }
  }

  return null;
}

/**
 * Save user profile and their registered devices to localStorage
 */
export function saveUserData(user: UserProfile, devices: DeviceItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const store = getAllStoredUsers();
    
    // User-specific devices only (or devices matching this user's ID)
    const userDevices = devices.filter((d) => d.userId === user.id);

    const bundle: StoredUserBundle = {
      user: {
        ...user,
        registeredDevicesCount: userDevices.length,
        totalCarbonCreditsKg: userDevices.reduce((sum, d) => sum + (d.co2SavedKg || 0), 0),
        totalFinancialBenefitsInr: userDevices.reduce((sum, d) => sum + (d.payoutAmount || 0), 0)
      },
      devices: userDevices,
      savedAt: new Date().toISOString()
    };

    // Store under mobile key
    if (user.mobile) {
      store[normalizeUserKey(user.mobile)] = bundle;
    }
    // Also store under email key
    if (user.email) {
      store[normalizeUserKey(user.email)] = bundle;
    }
    // Also store under name key
    if (user.name) {
      store[normalizeUserKey(user.name)] = bundle;
    }
    // Store under ID
    if (user.id) {
      store[normalizeUserKey(user.id)] = bundle;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Failed to save user data to localStorage:', err);
  }
}

/**
 * Retrieve list of all unique previously entered citizen consignors
 */
export function getSavedCitizensList(): Array<{
  user: UserProfile;
  deviceCount: number;
  lastSaved: string;
}> {
  const store = getAllStoredUsers();
  const uniqueUsers = new Map<string, { user: UserProfile; deviceCount: number; lastSaved: string }>();

  for (const bundle of Object.values(store)) {
    if (!uniqueUsers.has(bundle.user.id)) {
      uniqueUsers.set(bundle.user.id, {
        user: bundle.user,
        deviceCount: bundle.devices.length,
        lastSaved: bundle.savedAt
      });
    }
  }

  return Array.from(uniqueUsers.values());
}
