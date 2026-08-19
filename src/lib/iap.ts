import AsyncStorage from '@react-native-async-storage/async-storage';

export const PREMIUM_PRODUCT_ID = 'guido_premium';
const IS_PREMIUM_KEY = 'is_premium_v1';
const EXAM_COUNT_KEY = 'exam_count';

export const GUIDO_PRODUCT_ID = 'guido_richieste_extra';
const GUIDO_REQUESTS_KEY = 'guido_requests_remaining';

export async function getExamCount(): Promise<number> {
  const val = await AsyncStorage.getItem(EXAM_COUNT_KEY);
  if (!val || val === '0') return 0;

  // Migration: if exam_count survived a progress wipe (macro_progress_ keys gone),
  // reset it — the user effectively has no history.
  const allKeys = await AsyncStorage.getAllKeys();
  const hasProgress = allKeys.some((k) => k.startsWith('macro_progress_'));
  if (!hasProgress) {
    await AsyncStorage.removeItem(EXAM_COUNT_KEY);
    return 0;
  }

  return parseInt(val, 10);
}

export async function incrementExamCount(): Promise<void> {
  const count = await getExamCount();
  await AsyncStorage.setItem(EXAM_COUNT_KEY, String(count + 1));
}

export async function isPremium(): Promise<boolean> {
  const val = await AsyncStorage.getItem(IS_PREMIUM_KEY);
  return val === 'true';
}

export async function setPremium(value: boolean): Promise<void> {
  await AsyncStorage.setItem(IS_PREMIUM_KEY, value ? 'true' : 'false');
  if (value) {
    // Grant 50 Chiedi a Guido requests with premium purchase
    await grantGuidoRequests(50);
  }
}

async function getIAPModule(): Promise<any | null> {
  try {
    return await import('react-native-iap');
  } catch {
    return null;
  }
}

export async function fetchProductPrice(): Promise<string | null> {
  const iap = await getIAPModule();
  if (!iap) return null;
  try {
    await iap.initConnection();
    const products = await iap.fetchProducts({ skus: [PREMIUM_PRODUCT_ID], type: 'in-app' });
    if (!products || products.length === 0) return null;
    const product = products[0];
    return product.localizedPrice ?? product.displayPrice ?? null;
  } catch {
    return null;
  } finally {
    try {
      const iap2 = await getIAPModule();
      if (iap2) await iap2.endConnection();
    } catch {}
  }
}

export async function purchasePremium(): Promise<{ success: boolean; error?: string }> {
  const iap = await getIAPModule();
  if (!iap) return { success: false, error: 'Acquisti in-app non disponibili su questo dispositivo.' };

  try {
    await iap.initConnection();

    // Try 'in-app' first; fallback to 'all' in case the native layer maps the type differently
    let products = await iap.fetchProducts({ skus: [PREMIUM_PRODUCT_ID], type: 'in-app' });
    if (!products || products.length === 0) {
      products = await iap.fetchProducts({ skus: [PREMIUM_PRODUCT_ID], type: 'all' });
    }
    if (!products || products.length === 0) {
      return {
        success: false,
        error: `Prodotto non disponibile (SKU: ${PREMIUM_PRODUCT_ID}). Verifica connessione e accordi App Store.`,
      };
    }

    const purchase = await iap.requestPurchase({
      request: {
        apple: { sku: PREMIUM_PRODUCT_ID, andDangerouslyFinishTransactionAutomatically: false },
        google: { skus: [PREMIUM_PRODUCT_ID] },
      },
      type: 'in-app',
    });

    if (purchase) {
      await iap.finishTransaction({ purchase, isConsumable: false });
      await setPremium(true);
      return { success: true };
    }

    return { success: false };
  } catch (e: any) {
    if (e?.code === 'E_USER_CANCELLED') return { success: false };
    const detail = e?.message ?? e?.code ?? 'Errore sconosciuto';
    return { success: false, error: `Acquisto non riuscito: ${detail}` };
  } finally {
    try {
      const iap2 = await getIAPModule();
      if (iap2) await iap2.endConnection();
    } catch {}
  }
}

// ─── Chiedi a Guido ───────────────────────────────────────────────────

export async function getGuidoRequests(): Promise<number> {
  const val = await AsyncStorage.getItem(GUIDO_REQUESTS_KEY);
  return val ? parseInt(val, 10) : 0;
}

export async function grantGuidoRequests(count: number): Promise<void> {
  const current = await getGuidoRequests();
  await AsyncStorage.setItem(GUIDO_REQUESTS_KEY, String(current + count));
}

export async function consumeGuidoRequest(): Promise<boolean> {
  const current = await getGuidoRequests();
  if (current <= 0) return false;
  await AsyncStorage.setItem(GUIDO_REQUESTS_KEY, String(current - 1));
  return true;
}

export async function purchaseGuidoRequests(): Promise<{ success: boolean; error?: string }> {
  const iap = await getIAPModule();
  if (!iap) return { success: false, error: 'Acquisti in-app non disponibili su questo dispositivo.' };

  try {
    await iap.initConnection();

    let products = await iap.fetchProducts({ skus: [GUIDO_PRODUCT_ID], type: 'in-app' });
    if (!products || products.length === 0) {
      products = await iap.fetchProducts({ skus: [GUIDO_PRODUCT_ID], type: 'all' });
    }
    if (!products || products.length === 0) {
      return {
        success: false,
        error: `Prodotto non disponibile (SKU: ${GUIDO_PRODUCT_ID}). Verifica connessione e accordi App Store.`,
      };
    }

    const purchase = await iap.requestPurchase({
      request: {
        apple: { sku: GUIDO_PRODUCT_ID, andDangerouslyFinishTransactionAutomatically: false },
        google: { skus: [GUIDO_PRODUCT_ID] },
      },
      type: 'in-app',
    });

    if (purchase) {
      await iap.finishTransaction({ purchase, isConsumable: true });
      await grantGuidoRequests(200);
      return { success: true };
    }

    return { success: false };
  } catch (e: any) {
    if (e?.code === 'E_USER_CANCELLED') return { success: false };
    const detail = e?.message ?? e?.code ?? 'Errore sconosciuto';
    return { success: false, error: `Acquisto non riuscito: ${detail}` };
  } finally {
    try {
      const iap2 = await getIAPModule();
      if (iap2) await iap2.endConnection();
    } catch {}
  }
}

export async function restorePurchases(): Promise<{ success: boolean; hasPremium: boolean; error?: string }> {
  const iap = await getIAPModule();
  if (!iap) return { success: false, hasPremium: false, error: 'Acquisti in-app non disponibili.' };

  try {
    await iap.initConnection();
    const purchases = await iap.getAvailablePurchases();
    const hasPremium = purchases.some((p: any) => p.productId === PREMIUM_PRODUCT_ID);

    if (hasPremium) await setPremium(true);

    return { success: true, hasPremium };
  } catch (e: any) {
    return { success: false, hasPremium: false, error: e?.message || 'Errore nel ripristino.' };
  } finally {
    try {
      const iap2 = await getIAPModule();
      if (iap2) await iap2.endConnection();
    } catch {}
  }
}
