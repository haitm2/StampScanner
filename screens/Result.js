import React, { useState, useEffect, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { StyleSheet, TouchableOpacity, Text, View, ScrollView, ActivityIndicator, Image, Animated, FlatList, Dimensions, ImageBackground, Platform, Linking, Alert } from 'react-native';
import { StatusBar } from 'react-native';
import icon from '../assets/icon.png';
import InAppReview from 'react-native-in-app-review';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { AES, IAP } from '../utils';
import AsyncStorage from '@react-native-async-storage/async-storage';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.select({
  ios: TestIds.INTERSTITIAL,
  android: 'ca-app-pub-1354543839348242/2156430713',
});
const interstitial = InterstitialAd.createForAdRequest(adUnitId);

const width = Dimensions.get('window').width;

export default function Result({ navigation, route }) {

  const animatedMove = useRef(new Animated.Value(100)).current;
  const [x0, setX0] = useState(0);
  const [y0, setY0] = useState(0);
  const [x1, setX1] = useState(512);
  const [y1, setY1] = useState(512);
  const [uri, setUri] = useState(null);
  const [items, setItems] = useState([]);
  const [isIdentifying, setIdenfying] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const showRateDialog = () => {
    const isAvailable = InAppReview.isAvailable();

    if (isAvailable) {
      InAppReview.RequestInAppReview()
        .then((hasFlowFinishedSuccessfully) => {
          // when return true in android it means user finished or close review flow
          console.log('InAppReview in android', hasFlowFinishedSuccessfully);

          // 3- another option:
          if (hasFlowFinishedSuccessfully) {
            console.log('rated!');
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  }

  const showPremiumAlert = async (stampId) => {
    Alert.alert(
      'Premium feature',
      'You need to buy pro to use this feature',
      [
        {
          text: "Cancel",
        },
        {
          text: "OK",
          onPress: () => navigation.navigate('Premium')
        }
      ]
    );
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#FFFFFF', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Results</Text>
        </View>
      ),
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      IAP.isPurchased().then(result => {
        console.log("isPurchased =", result);
        setPurchased(result)
      });
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  useEffect(() => {
    const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log("Da load xong ad")
      setLoaded(true);
    });

    // Start loading the interstitial straight away
    interstitial.load();

    // Unsubscribe from events on unmount
    return unsubscribe;
  }, []);

  const detect = async () => {
    await sleep(1000);
    const inputImage = await manipulateAsync(
      route.params.uri,
      [
        { resize: { width: 512 } },
      ],
      { compress: 1, format: SaveFormat.JPEG, base64: true }
    );

    try {
      setIdenfying(true);
      const detectBody = new FormData();
      detectBody.append('stamp_image', {
        uri: inputImage.uri || inputImage.localUri,
        name: 'stamp.jpg',
        type: 'image/jpeg'
      });
      const detectResult = await fetch('https://aitools.thedudeapp.win/api/philately/findByImage', {
        method: 'POST',
        body: detectBody,
      });
      console.log("Detecting...")

      const detectResultText = await detectResult.text();
      const decryptedDetectResultText = await AES.decrypt(detectResultText);

      // const detectResultObj = await detectResult.json();
      const detectResultObj = await JSON.parse(decryptedDetectResultText);
      const cropData = detectResultObj.crop;
      // const cropData = {"x0":91,"y0":60,"x1":387,"y1":462}

      // console.log(">>>>>> cropData: " + cropData);
      if (cropData && cropData.x0 !== null) {
        setX0(cropData.x0 || 0);
        setX1(cropData.x1 || 512);
        setY0(cropData.y0 || 0);
        setY1(cropData.y1 || 512);
      }
      // console.log(detectResultText);
      // const decryptedDetectData = await AES.decrypt(detectResultText);

      setIdenfying(false);
      Animated.timing(animatedMove, {
        toValue: 10,
        duration: 1000,
        useNativeDriver: true
      }).start(async () => {
        // console.log("detectResultObj.data =", detectResultObj.data)
        setItems(detectResultObj.data);

        try {
          console.log("Saving history...");
          var key = new Date().getTime();
          var itempKey = "history_" + key;
          var imageKey = "image_" + key;
          var result = detectResultObj.data[0];
          console.log(result);
          var value = {
            image: imageKey,
            result
          }
          await AsyncStorage.setItem(itempKey, JSON.stringify(value));
          await AsyncStorage.setItem(imageKey, inputImage.base64);
          console.log("Save history done");
        } catch (err) {
          console.log("Save history error:", err);
        }

        showRateDialog();
      })
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    setUri(route.params.uri);
    detect();
  }, [])

  return (
    <ImageBackground source={require('../assets/mainbg.jpg')} style={styles.container}>
      <StatusBar
        backgroundColor="#333333"
        barStyle="light-content"
      />

      <View style={{ width: '100%', backgroundColor: '#000' }}>
        <ImageBackground source={uri ? { uri } : icon} style={styles.inputImage} resizeMode='contain'>
          {x0 !== 0 && <View style={{
            width: Math.round((x1 - x0) * width / 1024),
            height: Math.round((y1 - y0) * width / 1024),
            marginTop: Math.round(y0 * width / 1024),
            marginLeft: Math.round(x0 * width / 1024),
            borderWidth: 1,
            borderColor: 'red'
          }} />}
          {isIdentifying && <View style={{ position: 'absolute', top: width / 4, alignSelf: 'center' }}>
            <ActivityIndicator color={"#FFF"} />
            <Text style={{ marginTop: 4, color: '#FFF' }}>Identifying stamp...</Text>
          </View>}
        </ImageBackground>
      </View>

      {bannerError || isPurchased || items.length == 0 ?
        null :
        <View style={{ width: '100%', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
          <BannerAd
            size={BannerAdSize.BANNER}
            unitId={__DEV__ ? TestIds.BANNER : Platform.select({
              ios: TestIds.BANNER,
              android: 'ca-app-pub-1354543839348242/9309519666',
            })}
            onAdFailedToLoad={(error) => {
              console.log(error);
              setBannerError(true);
            }}
          />
        </View>
      }

      <ScrollView style={{ width: '100%', padding: 10 }}>
        {items.length === 0 && <ActivityIndicator size='large' color="#000" />}
        {items.length > 0 && items.map(stamp => (
          <View key={stamp._id} style={styles.card}>
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={() => {
                if (!isPurchased) {
                  if (loaded) {
                    interstitial.show();
                    setLoaded(false);
                    interstitial.load();
                  } else {
                    interstitial.load();
                  }
                }
                navigation.navigate('Detail', { stampId: stamp._id })
              }}
            >
              <ImageBackground source={{ uri: stamp.image }} style={{ width: 100, height: 100, margin: 8 }} resizeMode='contain' />
              <View style={{ padding: 8, width: width - 152 }}>
                <Text style={{ fontSize: 12, color: '#FFF', fontWeight: 'bold' }}>{stamp.title}</Text>
                <Text style={{ fontSize: 12, color: 'grey' }}>{"Condition: " + stamp.condition}</Text>
                <View style={{ flexDirection: 'row', position: 'absolute', right: 8, bottom: 8 }}>
                  <TouchableOpacity onPress={() => {
                    isPurchased ?
                      navigation.navigate('Similars', { stampId: stamp._id }) :
                      showPremiumAlert()
                  }}>
                    <Text style={{ color: '#cfde49', fontWeight: 'bold', fontSize: 12 }}>Find similars</Text>
                  </TouchableOpacity>
                  <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 12 }}> | </Text>
                  {isPurchased || stamp._id === items[0]._id ?
                    <Text style={{ color: '#cfde49', fontWeight: 'bold', fontSize: 12 }}>{"Value: $" + stamp.price}</Text> :
                    <TouchableOpacity onPress={() => {
                      isPurchased ?
                        Alert.alert(
                          "Value",
                          "$" + stamp.price,
                          [
                            {
                              text: "OK",
                              // onPress: () => setImage(null)
                            }
                          ]
                        ) :
                        showPremiumAlert()
                    }}>
                      <Text style={{ color: '#FF5722', fontSize: 12 }}>Estimate value</Text>
                    </TouchableOpacity>}
                </View>
              </View>

            </TouchableOpacity>
          </View>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1'
  },
  card: {
    flexDirection: 'row', padding: 4, borderRadius: 16, backgroundColor: 'rgba(0, 0, 0, 0.5)',
    margin: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FFF',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  inputImage: {
    width: width / 2,
    height: width / 2,
    alignSelf: 'center'
  },
  loading: {
    position: 'absolute',
    alignSelf: 'center',
    top: 60,
    opacity: 0.75
  }
});
