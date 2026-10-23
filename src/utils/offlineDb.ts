/**
 * Bharat E-Waste Hub - Offline Storage & Sync Engine (IndexedDB)
 * Enables Collection Engineers to log e-waste consignments in remote/low-connectivity field hubs
 * with automatic background synchronization when online.
 */

import { DeviceCondition, DeviceCategory } from '../types';

const DB_NAME = 'BharatEwasteHub_OfflineDB';
const DB_VERSION = 1;
const STORE_PENDING_DEVICES = 'pending_device_logs';
const STORE_FLEET_LOGS = 'pending_fleet_logs';

export interface OfflineDeviceRecord {
  offlineId: string;
  category: DeviceCategory | string;
  brand: string;
  model: string;
  serialNumber: string;
  imei?: string;
  condition: DeviceCondition;
  intakeWeightKg: number;
  hubLocation: string;
  loggedAt: string;
  engineerId: string;
  engineerName: string;
  synced: boolean;
  notes?: string;
}

// Open / initialize IndexedDB
export function openOfflineDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_PENDING_DEVICES)) {
        db.createObjectStore(STORE_PENDING_DEVICES, { keyPath: 'offlineId' });
      }
      if (!db.objectStoreNames.contains(STORE_FLEET_LOGS)) {
        db.createObjectStore(STORE_FLEET_LOGS, { keyPath: 'logId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Store an offline device log in IndexedDB
export async function saveOfflineDeviceLog(
  record: Omit<OfflineDeviceRecord, 'offlineId' | 'loggedAt' | 'synced'>
): Promise<OfflineDeviceRecord> {
  const db = await openOfflineDb();
  const fullRecord: OfflineDeviceRecord = {
    ...record,
    offlineId: `OFFLINE-DEV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    loggedAt: new Date().toLocaleString(),
    synced: false
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_DEVICES, 'readwrite');
    const store = tx.objectStore(STORE_PENDING_DEVICES);
    const req = store.put(fullRecord);

    req.onsuccess = () => {
      // Dispatch custom window event so UI immediately updates pending count
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('offline-db-updated'));
      }
      resolve(fullRecord);
    };
    req.onerror = () => reject(req.error);
  });
}

// Retrieve all pending offline device logs
export async function getPendingOfflineDeviceLogs(): Promise<OfflineDeviceRecord[]> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_DEVICES, 'readonly');
    const store = tx.objectStore(STORE_PENDING_DEVICES);
    const req = store.getAll();

    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// Delete a synced device log from IndexedDB
export async function deleteOfflineDeviceLog(offlineId: string): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_DEVICES, 'readwrite');
    const store = tx.objectStore(STORE_PENDING_DEVICES);
    const req = store.delete(offlineId);

    req.onsuccess = () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('offline-db-updated'));
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

// Clear all pending records
export async function clearAllOfflineDeviceLogs(): Promise<void> {
  const db = await openOfflineDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PENDING_DEVICES, 'readwrite');
    const store = tx.objectStore(STORE_PENDING_DEVICES);
    const req = store.clear();

    req.onsuccess = () => {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('offline-db-updated'));
      }
      resolve();
    };
    req.onerror = () => reject(req.error);
  });
}

// Sync all pending offline logs to the active system
export async function syncOfflineLogs(
  onSyncedDevice: (device: OfflineDeviceRecord) => void
): Promise<{ syncedCount: number; errors: number }> {
  const pending = await getPendingOfflineDeviceLogs();
  let syncedCount = 0;
  let errors = 0;

  for (const item of pending) {
    try {
      onSyncedDevice(item);
      await deleteOfflineDeviceLog(item.offlineId);
      syncedCount++;
    } catch (err) {
      console.error('Failed to sync offline record:', item.offlineId, err);
      errors++;
    }
  }

  return { syncedCount, errors };
}
