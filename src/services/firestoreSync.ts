import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  getDocFromServer
} from 'firebase/firestore';
import { db } from '../firebase.ts';
import { Product, Order, Coupon, StoreSettings } from '../types/index.ts';
import firebaseConfig from '../../firebase-applet-config.json';

export interface DatabaseStatus {
  connected: boolean;
  projectId: string;
  databaseId: string;
  lastSync?: string;
  collections: {
    products: number;
    orders: number;
    coupons: number;
    settings: boolean;
  };
}

// Check database connection and collection counts
export async function checkFirestoreHealth(): Promise<DatabaseStatus> {
  const status: DatabaseStatus = {
    connected: false,
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    collections: {
      products: 0,
      orders: 0,
      coupons: 0,
      settings: false
    }
  };

  try {
    // Quick test ping
    await getDocFromServer(doc(db, 'test', 'connection')).catch(() => null);
    status.connected = true;

    // Fetch counts from Firestore
    const [prodsSnap, ordersSnap, couponsSnap, settingsSnap] = await Promise.all([
      getDocs(collection(db, 'products')).catch(() => null),
      getDocs(collection(db, 'orders')).catch(() => null),
      getDocs(collection(db, 'coupons')).catch(() => null),
      getDoc(doc(db, 'settings', 'general')).catch(() => null)
    ]);

    if (prodsSnap) status.collections.products = prodsSnap.size;
    if (ordersSnap) status.collections.orders = ordersSnap.size;
    if (couponsSnap) status.collections.coupons = couponsSnap.size;
    if (settingsSnap && settingsSnap.exists()) status.collections.settings = true;
  } catch (e) {
    console.warn('Firestore health check notice:', e);
  }

  return status;
}

// Sync single product to Firestore
export async function syncProductToFirestore(product: Product): Promise<boolean> {
  try {
    await setDoc(doc(db, 'products', product.id), product, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving product to Firestore:', e);
    return false;
  }
}

// Delete product from Firestore
export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'products', productId));
    return true;
  } catch (e) {
    console.error('Error deleting product from Firestore:', e);
    return false;
  }
}

// Sync single order to Firestore
export async function syncOrderToFirestore(order: Order): Promise<boolean> {
  try {
    await setDoc(doc(db, 'orders', order.id), order, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving order to Firestore:', e);
    return false;
  }
}

// Sync coupons to Firestore
export async function syncCouponToFirestore(coupon: Coupon): Promise<boolean> {
  try {
    await setDoc(doc(db, 'coupons', coupon.id), coupon, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving coupon to Firestore:', e);
    return false;
  }
}

// Sync settings to Firestore
export async function syncSettingsToFirestore(settings: StoreSettings): Promise<boolean> {
  try {
    await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving settings to Firestore:', e);
    return false;
  }
}

// Full Database Sync: Backup existing local catalog/orders/settings into Firestore
export async function syncAllDatabaseToFirestore(data: {
  products: Product[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;
}): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let synced = 0;

    // Batch or parallel promises
    const promises: Promise<any>[] = [];

    // Products
    for (const prod of data.products) {
      promises.push(
        setDoc(doc(db, 'products', prod.id), prod, { merge: true }).then(() => synced++)
      );
    }

    // Orders
    for (const ord of data.orders) {
      promises.push(
        setDoc(doc(db, 'orders', ord.id), ord, { merge: true }).then(() => synced++)
      );
    }

    // Coupons
    for (const c of data.coupons) {
      promises.push(
        setDoc(doc(db, 'coupons', c.id), c, { merge: true }).then(() => synced++)
      );
    }

    // Settings
    promises.push(
      setDoc(doc(db, 'settings', 'general'), data.settings, { merge: true }).then(() => synced++)
    );

    await Promise.all(promises);
    return { success: true, count: synced };
  } catch (e: any) {
    console.error('Full Firestore sync error:', e);
    return { success: false, count: 0, error: e.message || 'Erro ao sincronizar' };
  }
}
