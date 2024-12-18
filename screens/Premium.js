import React, { useState, useEffect } from 'react'
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  StyleSheet, Text, View, Image, ImageBackground, TouchableOpacity, Linking, ActivityIndicator, ScrollView, Platform, Dimensions, ToastAndroid
} from 'react-native';
import { IAP } from '../utils';
import { Button } from 'react-native-elements';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import axios from 'axios';

const width = Dimensions.get('window').width;

const POLICY_URL = Platform.OS == 'android' ? 'https://thedudeapp.win/privacy' : 'https://megatechlab.com/privacy';

const TERMS_URL = Platform.OS == 'android' ? 'https://thedudeapp.win/terms' : 'https://megatechlab.com/terms';

var IAP_URL = 'https://analytics.thedudeapp.win/logging';

const appId = Platform.select({
  ios: 'com.ducdm.tcgscanner',
  android: 'ANDROID TCG - packageName: com.thedudeapp.stamp.identifier',
});

const Premium = ({ navigation, route }) => {

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [isPurchased, setPurchased] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isShowClose, setShowClose] = useState(false);

  function timeout(delay) {
    return new Promise(res => setTimeout(res, delay));
  }

  useEffect(() => {
    initIAP();
    delayToShowClose();
  }, [])

  const delayToShowClose = async () => {
    await timeout(3000);
    setShowClose(true);
  }

  useFocusEffect(
    React.useCallback(() => {
      IAP.isPurchased().then(result => {
        console.log("isPurchased =", result);
        setPurchased(result);
      });
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  const initIAP = async () => {
    const purchased = await IAP.isPurchased();

    if (!purchased) {
      console.log("init iap");
      await IAP.connect();
      const products = await IAP.getIAPItems();
      // console.log("products:", products);
      if (products.length > 0) {
        setSelected(products[0])
        setProducts(products);
        setPurchased(purchased);
      } else {
        if (Platform.OS == 'android') ToastAndroid.show('Cannot load IAP items!', ToastAndroid.LONG);
        await sleep(3000);
        navigation.goBack();
      }
    } else {
      setProducts([]);
      setPurchased(true);
    }

    setLoading(false);
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  return (
    <View style={{ flex: 1, resizeMode: 'cover', backgroundColor: '#333333' }}>
      <ScrollView>
        <ImageBackground source={require('../assets/tcg_bg.jpg')} style={{ width: width, height: width / 2 }} />
        <View style={{ flex: 1, backgroundColor: '#333333', marginTop: -16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Text style={{ marginTop: 20, alignSelf: 'center', fontSize: 24, color: '#f0fa5f', fontWeight: 'bold' }}>P R E M I U M</Text>
          <Text style={{ marginLeft: 16, fontSize: 18, color: '#f0dc78', marginTop: 32, fontWeight: 'bold' }}>PRO Features</Text>
          <View style={{ margin: 16 }}>
            <Text style={{ fontSize: 12, color: '#FFF' }}>⚠ No popup ads and banners</Text>
            <Text style={{ fontSize: 12, color: '#FFF' }}>♾ Unlimited number of identifications per week</Text>
            <Text style={{ fontSize: 12, color: '#FFF' }}>{"🏺 Stamp data updated weekly with\nover 100,000 stamps"}</Text>
            <Text style={{ fontSize: 12, color: '#FFF' }}>📈 Estimated value of stamps on the market</Text>
          </View>
          {isPurchased ?
            <Button
              title="You purchased"
              buttonStyle={styles.unlockBtn}
              onPress={() => alert("You purchased!")} /> :
            products.map(product => (
              <Button
                disabled={loading}
                key={product.productId}
                title={
                  <View style={{ width: '90%', padding: 4, flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <Text style={{ fontSize: 14, color: product.productId === selected.productId ? '#FFF' : '#004D40', fontWeight: product.productId === selected.productId ? 'bold' : '300' }}>
                        {products.length == 0 ? '---' : product.productId.includes('week') ? 'W E E K L Y' : 'O N E T I M E'}
                      </Text>
                      <Text style={{ fontSize: 10, color: product.productId === selected.productId ? '#FFF' : '#004D40', fontWeight: product.productId === selected.productId ? 'bold' : '300' }}>
                        {products.length == 0 ? '---' : product.productId.includes('week') ? 'auto-renewing' : 'for a lifetime'}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', padding: 4, backgroundColor: '#ECEFF1', borderRadius: 8 }}>
                      <Text style={{ fontWeight: product.productId === selected.productId ? 'bold' : null, color: '#004D40', fontSize: 16 }}>
                        {products.length == 0 ? '---' : product.productType === 'inapp' || Platform.OS !== 'android' ? product.localizedPrice : product.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0].formattedPrice}
                      </Text>
                      {product.productId.includes('week') && <Text> / week</Text>}
                    </View>
                  </View>
                }
                buttonStyle={[
                  styles.unlockBtn,
                  {
                    backgroundColor: product.productId === selected.productId ? '#7bdb95' : '#639972',
                    borderWidth: 1,
                    borderColor: '#4E342E',
                    borderRadius: 16
                  }
                ]}
                onPress={() => setSelected(product)}
              />
            ))
          }
        </View>
        {!isPurchased && <Button
          title={<Text style={{ color: '#ffffff', margin: 16, fontSize: 16, fontWeight: 'bold' }}>  C O N T I N U E  </Text>}
          buttonStyle={styles.continue}
          onPress={async () => {
            if (products.length > 0 && !loading) {
              setLoading(true);
              // await IAP.purchase(selected);
              if (selected.productType === 'inapp') {
                await IAP.purchase(selected.productId);
              } else {
                if (Platform.OS == 'android') {
                  var offerToken = selected.subscriptionOfferDetails[0].offerToken || null;
                  await IAP.subscribe(selected.productId, offerToken);
                } else {
                  await IAP.subscribe(selected.productId, null);
                }
              }
              await sleep(1000);
              setLoading(false);
              const purchased = await IAP.isPurchased();
              if (purchased) {
                console.log("da charge, dang gui");
                try {
                  await axios({
                    method: 'post',
                    url: IAP_URL,
                    data: {
                      appId,
                      iapPack: selected.productId.includes('week') ? 'WEEKLY v1.0' : 'ONETIME v1.0'
                    }
                  });
                } catch (err) {
                  console.log(err);
                }
              }
              setPurchased(purchased);
            }
            navigation.goBack();
          }}
        />}
        <View style={{ margin: 16, padding: 8 }}>
          <Text style={{ color: '#FFF', fontSize: 10, textAlign: 'justify' }}>{"With the weekly plan and the One-time plan you will need to pay immediately, then you will use the app with full access and no ads. You can unsubscribe from these packages at any time."}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignSelf: 'center', width: '80%', alignItems: 'center', justifyContent: 'center' }}>
          <TouchableOpacity style={{ margin: 4 }} onPress={() => Linking.openURL(POLICY_URL)}>
            <Text style={{ fontSize: 10, color: '#FFF', textDecorationLine: 'underline' }}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ margin: 4 }} onPress={() => Linking.openURL(TERMS_URL)}>
            <Text style={{ fontSize: 10, color: '#FFF', textDecorationLine: 'underline' }}>Terms of use</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ margin: 4 }}
            onPress={async () => {
              setLoading(true);
              await IAP.restore(products)
              await sleep(1000);
              setLoading(false);
              const purchased = await IAP.isPurchased();
              setPurchased(purchased);
              alert("Restore Successful");
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 10, textDecorationLine: 'underline' }}>Restore purchase</Text>
          </TouchableOpacity>
        </View>
        <View style={{ height: 200 }} />
      </ScrollView>
      {(loading || products.length == 0) && !isPurchased && <View style={{ position: 'absolute', width: 50, height: 50, backgroundColor: '#fff', alignSelf: 'center', top: '50%', borderRadius: 25, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#000" />
      </View>}
      {isShowClose && <TouchableOpacity
        style={{ position: 'absolute', top: 40, right: 20, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
        onPress={() => navigation.goBack()}
        disabled={loading}
      >
        <Ionicons
          name='close-circle' size={40}
          color='rgba(0, 0, 0, 0.8)'
        />
      </TouchableOpacity>}
    </View>
  )
}

const styles = StyleSheet.create({
  step: { alignSelf: 'center', fontSize: 18, justifyContent: 'center', marginTop: 30, fontWeight: 'bold' },
  bonus: { fontSize: 20, margin: 5, color: '#fff' },
  unlockBtn: {
    alignSelf: 'center', marginTop: 8, marginLeft: 16, marginRight: 16, padding: 8
  },
  continue: { alignSelf: 'center', backgroundColor: '#7bdb95', margin: 16, marginTop: 16, borderRadius: 32, padding: 4 }
});

export default Premium
