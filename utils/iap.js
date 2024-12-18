import {
    initConnection,
    getProducts,
    getSubscriptions,
    requestPurchase,
    requestSubscription,
    purchaseErrorListener,
    purchaseUpdatedListener,
    flushFailedPurchasesCachedAsPendingAndroid,
    getPurchaseHistory,
    getAvailablePurchases,
    acknowledgePurchaseAndroid
} from 'react-native-iap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

var isConnected = false;
const productIds = Platform.select({
    ios: [
        'com.ducdm.tcgscanner.onetime',
    ],
    android: [
        'com.thedudeapp.stamp.identifier.onetime',
    ],
});

const subscriptionIds = Platform.select({
    ios: [
        'com.ducdm.tcgscanner.weekly'
    ],
    android: [
        'com.thedudeapp.stamp.identifier.weekly'
    ],
});

const freetrialSubscriptionIds = Platform.select({
    ios: [
        'com.ducdm.tcgscanner.yearly'
    ],
    android: [
        'com.thedudeapp.stamp.identifier.yearly'
    ],
});


var products = [];
var subscriptions = [];
var freetrialSubscriptions = [];

var purchaseUpdateSubscription = null;
var purchaseErrorSubscription = null;

export async function connect() {
    if (!isConnected) {
        try {
            console.log(">>>> connecting....");
            await initConnection();
            if (Platform.OS == 'android') await flushFailedPurchasesCachedAsPendingAndroid();

            this.purchaseUpdateSubscription = purchaseUpdatedListener(
                async (purchase) => {
                    console.log('purchaseUpdatedListener', purchase);
                    const receipt = purchase.transactionReceipt;

                    if (Platform.OS == 'android') {
                        try {
                            await acknowledgePurchaseAndroid({ token: JSON.parse(receipt).purchaseToken });
                        } catch (err) {
                            console.log("acknowledgePurchaseAndroid error:", err);
                        }
                    }

                    await AsyncStorage.setItem("purchased", "ok");
                },
            );

            this.purchaseErrorSubscription = purchaseErrorListener(
                (error) => {
                    console.warn('purchaseErrorListener', error);
                },
            );

            console.log("Getting products");
            products = await getProducts({ skus: productIds });
            console.log("Getting subscriptions");
            subscriptions = await getSubscriptions({ skus: subscriptionIds });
            freetrialSubscriptions = await getSubscriptions({ skus: freetrialSubscriptionIds })

            // console.log(JSON.stringify(products));
            // console.log(JSON.stringify(subscriptions));
            // console.log("FREE TRIAL >>>>>", JSON.stringify(freetrialSubscriptions));
        } catch (err) {
            console.log('ERROR:', err);
        }
    }
}

export async function isPurchased() {
    const value = await AsyncStorage.getItem("purchased");
    if (value == 'ok') {
        return true;
    }
    return false;
    // return true;
}

export async function getIAPItems() {
    var items = [...subscriptions, ...products] || []
    return items;
}

export async function getFreetrialIAPItems() {
    var items = [...freetrialSubscriptions] || []
    return items;
}

export async function purchase(productId) {
    try {
        await requestPurchase({ skus: [productId] });
    } catch (err) {
        console.warn(err.code, err.message);
    }
};

export async function subscribe(sku, offerToken) {
    try {
        await requestSubscription({
            sku,
            ...(offerToken && { subscriptionOffers: [{ sku, offerToken }] }),
        });
    } catch (err) {
        console.warn(err.code, err.message);
    }
};

export async function restore() {
    try {
        console.log("DMM");
        const purchase = await getAvailablePurchases();
        console.log("Available purchase:", purchase);
        if (purchase && purchase.length > 0) {
            console.log("Check purchase da mua nen set purchased=ok");
            await AsyncStorage.setItem("purchased", "ok");
        } else {
            await AsyncStorage.removeItem("purchased");
        }
    } catch (err) {
        console.log(err);
    }
}