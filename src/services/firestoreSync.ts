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
import { Product, Order, Coupon, Banner, StoreSettings } from '../types/index.ts';
import firebaseConfig from '../../firebase-applet-config.json';

export interface DatabaseStatus {
  connected: boolean;
  projectId: string;
  databaseId: string;
  lastSync?: string;
  collections: {
    products: number;
    banners: number;
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
      banners: 0,
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
    const [prodsSnap, bannersSnap, ordersSnap, couponsSnap, settingsSnap] = await Promise.all([
      getDocs(collection(db, 'products')).catch(() => null),
      getDocs(collection(db, 'banners')).catch(() => null),
      getDocs(collection(db, 'orders')).catch(() => null),
      getDocs(collection(db, 'coupons')).catch(() => null),
      getDoc(doc(db, 'settings', 'general')).catch(() => null)
    ]);

    if (prodsSnap) status.collections.products = prodsSnap.size;
    if (bannersSnap) status.collections.banners = bannersSnap.size;
    if (ordersSnap) status.collections.orders = ordersSnap.size;
    if (couponsSnap) status.collections.coupons = couponsSnap.size;
    if (settingsSnap && settingsSnap.exists()) status.collections.settings = true;
  } catch (e) {
    console.warn('Firestore health check notice:', e);
  }

  return status;
}

// --- PRODUCTS ---
export async function syncProductToFirestore(product: Product): Promise<boolean> {
  try {
    await setDoc(doc(db, 'products', product.id), product, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving product to Firestore:', e);
    return false;
  }
}

export async function deleteProductFromFirestore(productId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'products', productId));
    return true;
  } catch (e) {
    console.error('Error deleting product from Firestore:', e);
    return false;
  }
}

export async function fetchProductsFromFirestore(): Promise<Product[]> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    if (!snap.empty) {
      const items: Product[] = [];
      snap.forEach(d => {
        items.push(d.data() as Product);
      });
      return items;
    }
  } catch (e) {
    console.warn('fetchProductsFromFirestore fallback:', e);
  }
  return [];
}

// --- BANNERS ---
export async function syncBannerToFirestore(banner: Banner): Promise<boolean> {
  try {
    await setDoc(doc(db, 'banners', banner.id), banner, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving banner to Firestore:', e);
    return false;
  }
}

export async function deleteBannerFromFirestore(bannerId: string): Promise<boolean> {
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
    return true;
  } catch (e) {
    console.error('Error deleting banner from Firestore:', e);
    return false;
  }
}

export async function fetchBannersFromFirestore(): Promise<Banner[]> {
  try {
    const snap = await getDocs(collection(db, 'banners'));
    if (!snap.empty) {
      const items: Banner[] = [];
      snap.forEach(d => {
        items.push(d.data() as Banner);
      });
      // Sort by order ascending
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    }
  } catch (e) {
    console.warn('fetchBannersFromFirestore fallback:', e);
  }
  return [];
}

// --- ORDERS ---
export async function syncOrderToFirestore(order: Order): Promise<boolean> {
  try {
    await setDoc(doc(db, 'orders', order.id), order, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving order to Firestore:', e);
    return false;
  }
}

// --- COUPONS ---
export async function syncCouponToFirestore(coupon: Coupon): Promise<boolean> {
  try {
    await setDoc(doc(db, 'coupons', coupon.id), coupon, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving coupon to Firestore:', e);
    return false;
  }
}

// --- SETTINGS ---
export async function syncSettingsToFirestore(settings: StoreSettings): Promise<boolean> {
  try {
    await setDoc(doc(db, 'settings', 'general'), settings, { merge: true });
    return true;
  } catch (e) {
    console.error('Error saving settings to Firestore:', e);
    return false;
  }
}

// --- SEED INITIAL DATA IF EMPTY ---
export async function seedInitialDataToFirestoreIfEmpty(
  initialProducts: Product[],
  initialBanners: Banner[],
  initialSettings?: StoreSettings
): Promise<void> {
  try {
    const health = await checkFirestoreHealth();
    if (!health.connected) return;

    // If products are empty in Firestore, populate them
    if (health.collections.products === 0 && initialProducts.length > 0) {
      console.log('Seeding initial products into Firestore...');
      await Promise.all(
        initialProducts.map(p => setDoc(doc(db, 'products', p.id), p, { merge: true }))
      );
    }

    // If banners are empty in Firestore, populate them
    if (health.collections.banners === 0 && initialBanners.length > 0) {
      console.log('Seeding initial banners into Firestore...');
      await Promise.all(
        initialBanners.map(b => setDoc(doc(db, 'banners', b.id), b, { merge: true }))
      );
    }

    // If settings are empty, save
    if (!health.collections.settings && initialSettings) {
      console.log('Seeding initial settings into Firestore...');
      await setDoc(doc(db, 'settings', 'general'), initialSettings, { merge: true });
    }
  } catch (e) {
    console.warn('seedInitialDataToFirestore notice:', e);
  }
}

// Full Database Sync: Backup existing local catalog/orders/settings into Firestore
export async function syncAllDatabaseToFirestore(data: {
  products: Product[];
  banners?: Banner[];
  orders: Order[];
  coupons: Coupon[];
  settings: StoreSettings;
}): Promise<{ success: boolean; count: number; error?: string }> {
  try {
    let synced = 0;
    const promises: Promise<any>[] = [];

    // Products
    for (const prod of data.products) {
      promises.push(
        setDoc(doc(db, 'products', prod.id), prod, { merge: true }).then(() => synced++)
      );
    }

    // Banners
    if (data.banners) {
      for (const banner of data.banners) {
        promises.push(
          setDoc(doc(db, 'banners', banner.id), banner, { merge: true }).then(() => synced++)
        );
      }
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
