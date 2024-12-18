import { ActivityIndicator, ImageBackground, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestTrackingPermissionsAsync
} from 'expo-tracking-transparency';

export default function ATT({ navigation }) {
  async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  let requestATT = async () => {
    // await AsyncStorage.clear();
    // if (isShowATT) {
    console.log("Requesting ATT");
    try {
      const { status } = await requestTrackingPermissionsAsync();
      if (status === 'granted') {
        console.log('Yay! I have user permission to track data');
      } else {
        console.log("ATT status =", status);
      }
    } catch (err) {
      console.log("ATT error:", err);
    }
    await AsyncStorage.setItem("skip", "1")
    navigation.reset({
      index: 0,
      routes: [{ name: 'StampScanner' }]
    });
  }

  return (
    <View style={{ width: '100%', height: '100%', backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ margin: 16, textAlign: 'center', color: '#F1F8E9', fontSize: 18 }}>{"Our app want to free for you"}</Text>
      <Text style={{ marginBottom: 16, textAlign: 'center', color: '#F1F8E9', fontSize: 14 }}>{"Ads help support our bussiness.\nTap \"Allow\" on the dialog to give\npermission to show ads that are\nmore relevant to you."}</Text>
      <TouchableOpacity onPress={requestATT} style={{ backgroundColor: 'gray' }}>
        <Text style={{ textAlign: 'center', margin: 16, color: '#fff' }} >{"Continue"}</Text>
      </TouchableOpacity>
    </View>
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
