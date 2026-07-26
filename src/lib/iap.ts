import AsyncStorage from '@react-native-async-storage/async-storage';

export const PREMIUM_PRODUCT_ID = 'guido_esami_unlimitati';
const IS_PREMIUM_KEY = 'is_premium_v1';
const EXAM_COUNT_KEY = 'exam_count';

export async function getExamCount(): Promise<number> {
  const val = await AsyncStorage.getItem(EXAM_COUNT_KEY);
  return val ? parseInt(val, 10) : 0;
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
}

async function getIAPModule(): Promise<any | null> {
  try {
    return await import('react-native-iap');
  } catch {
    return null;
  }
}

export async function purchasePremium(): Promise<{ success: boolean; error?: string }> {
  const iap = await getIAPModule();
  if (!iap) return { success: false, error: 'Acquisti in-app non disponibili su questo dispositivo.' };

  try {
    await iap.initConnection();

    const products = await iap.getProducts({ skus: [PREMIUM_PRODUCT_ID] });
    if (!products || products.length === 0) {
      return { success: false, error: 'Prodotto non disponibile sul negozio.' };
    }

    const purchase = await iap.requestPurchase({
      sku: PREMIUM_PRODUCT_ID,
      andDangerouslyFinishTransactionAutomaticallyIOS: false,
    });

    if (purchase) {
      await iap.finishTransaction({ purchase, isConsumable: false });
      await setPremium(true);
      return { success: true };
    }

    return { success: false };
  } catch (e: any) {
    if (e?.code === 'E_USER_CANCELLED') return { success: false };
    return { success: false, error: e?.message || 'Errore sconosciuto.' };
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
