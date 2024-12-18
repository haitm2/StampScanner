import { ActivityIndicator, ImageBackground, Platform, StyleSheet, Text, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppOpenAd, TestIds, AdEventType } from 'react-native-google-mobile-ads';
import { IAP } from '../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const adUnitId = __DEV__ ? TestIds.APP_OPEN : Platform.select({
  ios: TestIds.APP_OPEN,
  android: 'ca-app-pub-1354543839348242/2937323052'
});

const appOpenAd = AppOpenAd.createForAdRequest(adUnitId);

export default function Splash({ navigation }) {
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    const unsubscribe = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      console.log("Da load xong open ad");
    });
    return unsubscribe;
  }, [])

  useEffect(() => {
    initData();
  }, [])

  async function initData() {
    // await AsyncStorage.clear();
    await IAP.connect();
    await IAP.restore();
    const result = await IAP.isPurchased();
    console.log("isPurchased =", result);
    // Start loading the interstitial straight away
    appOpenAd.load();
    await sleep(6000);
    console.log(">>>>>>>> SHOW OPEN ADS");
    if (result === false) {
      try {
        console.log("Show open ads")
        appOpenAd.show();
      } catch (err) {
        console.log(err)
      }
    }

    // navigation.reset({
    //   index: 0,
    //   routes: [{ name: 'StampScanner' }]
    // });

    const value = await AsyncStorage.getItem('skip');
    // const value = false;
    if (value) {
      navigation.reset({
        index: 0,
        routes: [{ name: 'StampScanner' }]
      });
    } else {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Walkthrough' }],
      });
    }
  }

  return (
    // <View style={{ width: '100%', height: '100%', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
    //   <Text style={{ margin: 32, textAlign: 'center', color: '#F1F8E9', fontSize: 32 }}>{"TCG\nIDENTIFIER"}</Text>
    //   <ActivityIndicator style={{ alignSelf: 'center', marginTop: 20 }} size={"large"} color={"#FFF"} />
    // </View>
    <ImageBackground source={require('../assets/splash_bg.jpg')} style={{ width: '100%', height: '100%', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator style={{ position: 'absolute', alignSelf: 'center', bottom: 30 }} size={"large"} color={"#FFF"} />
      <View style={{ width: '90%', position: 'absolute', bottom: 80, }}>
        <Text style={{ fontWeight: 'bold', alignSelf: 'center', textAlign: 'center', color: '#FFF' }}>This action can contain ads.</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
