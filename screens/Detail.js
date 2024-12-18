import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { StyleSheet, TouchableOpacity, Text, View, ScrollView, ActivityIndicator, Image, Platform, Linking, Dimensions, ImageBackground, useWindowDimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { AES, IAP } from '../utils';
import { useFocusEffect } from '@react-navigation/native';

const URL = "https://aitools.thedudeapp.win/api/philately/stamps/";
const width = Dimensions.get('window').width;

export default function Detail({ navigation, route }) {
  const [stamp, setStamp] = useState(null);
  const [isBookMark, setIsBookMark] = useState(false);
  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [similarStamps, setSimilarStamps] = useState([]);
  const [collections, setCollections] = useState([]);
  const [ebayItems, setEbayItems] = useState([]);
  const [showAdd, setShowAdd] = useState(false);

  const showRateDialog = () => {
    if (route.params.isShowReview === true) {
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
  }

  useEffect(() => {
    showRateDialog();
  }, [])

  const getAllCollections = async () => {
    const keys = await AsyncStorage.getAllKeys();
    const collectionsDatas = [];
    for (const key of keys) {
      if (key.includes("collection_")) {
        const value = await AsyncStorage.getItem(key);
        // console.log("key =", key, ", value =", value);
        const col = JSON.parse(value);
        collectionsDatas.push({
          id: col.id,
          name: col.name
        });
      }
    }
    console.log('=====> collectionsDatas:', collectionsDatas);
    setCollections(collectionsDatas);
  }

  useFocusEffect(
    React.useCallback(() => {
      getAllCollections();
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

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#FFFFFF', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Detail</Text>
        </View>
      ),
    });
  }, [navigation]);

  const getDetail = async () => {
    const url = `${URL}${route.params.stampId}`;
    const stampData = await axios.get(url);
    const stampDataStr = await AES.decrypt(stampData.data);
    const stampDataObj = JSON.parse(stampDataStr);
    console.log(JSON.stringify(stampDataObj));
    setStamp(stampDataObj.data);
  }

  const getSimilarStamps = async () => {
    try {
      console.log("route.params.stampId =", route.params.stampId);
      const data = await axios.get('https://aitools.thedudeapp.win/api/philately/similarStamps/' + route.params.stampId);
      const dataStr = await AES.decrypt(data.data);
      const dataObj = JSON.parse(dataStr);
      setSimilarStamps(dataObj.data);
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    getDetail();
    getSimilarStamps();
  }, [])

  return (
    <ImageBackground source={require('../assets/mainbg.jpg')} style={styles.container}>
      <StatusBar
        backgroundColor="#333333"
        barStyle="light-content"
      />
      <ScrollView>
        <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
          {stamp && <Image source={{ uri: stamp.image }} style={styles.inputImage} />}
        </View>

        {bannerError || isPurchased ?
          null :
          <View style={{ width: '100%', alignItems: 'center' }}>
            <BannerAd
              size={BannerAdSize.LARGE_BANNER}
              unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                ios: TestIds.BANNER,
                android: 'ca-app-pub-1354543839348242/4327298482',
              })}
              onAdFailedToLoad={(error) => {
                console.log(error);
                setBannerError(true);
              }}
            />
          </View>
        }

        <View style={styles.generalInfoBoard}>
          <View style={{ padding: 8, backgroundColor: '#000', borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            {stamp && <Text style={{ fontWeight: 'bold', fontSize: 18, color: '#FFF' }}>{stamp.title}</Text>}
          </View>
          {stamp && <TouchableOpacity
            style={{ margin: 16, alignSelf: 'center' }}
            onPress={() => {
              isPurchased ? Linking.openURL(stamp.url) : navigation.navigate('Premium');
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 20 }}>{isPurchased ? "Price: $" + stamp.price : "Price: *** 👁"}</Text>
          </TouchableOpacity>}
          {stamp && stamp.details.map(item => (
            <View key={item.key} style={{ flexDirection: 'row' }}>
              <Text style={{ fontWeight: 'bold', color: '#FFF', width: '50%', padding: 5, textAlign: 'right' }}>{item.key + " : "}</Text>
              <Text style={{ color: '#FFF', flex: 1, padding: 5 }}>{item.value}</Text>
            </View>
          ))}
        </View>
        <Text style={{ margin: 8, fontWeight: 'bold', color: '#FFF' }}>Values</Text>
        {similarStamps.length > 0 && similarStamps.map(stamp => (
          <View key={stamp._id}>
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={() => {
                if (!isPurchased) navigation.navigate('Premium');
                else Linking.openURL(stamp.url)
              }}
            >
              <ImageBackground source={{ uri: stamp.image }} style={{ width: 100, height: 100, margin: 8 }} resizeMode='contain' />
              <View style={{ padding: 8, width: width - 132 }}>
                <Text style={{ fontSize: 12, color: '#FFF' }}>{stamp.title}</Text>
                <Text style={{ fontSize: 12, color: 'grey' }}>{"Condition: " + stamp.condition}</Text>
                <View style={{ flexDirection: 'row', position: 'absolute', right: 8, bottom: 8 }}>
                  <Text style={{ color: '#cfde49', fontWeight: 'bold', fontSize: 12 }}>{!isPurchased ? "Value in the market: $ **.*\n\(Sign up for a premium plan\nto see the value\)" : "$" + stamp.price}</Text>
                </View>
              </View>

            </TouchableOpacity>
            <View style={{ width: width - 16, height: 1, backgroundColor: '#B0BEC5' }} />
          </View>
        ))}
        <View style={{ height: 200 }} />
      </ScrollView >
      {stamp && <View style={{ position: 'absolute', bottom: 0, left: 0 }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ padding: 16, paddingBottom: 32, alignItems: 'center', justifyContent: 'center', width: width, backgroundColor: '#000' }}
          onPress={() => setShowAdd(prevState => !prevState)}
        >
          {!showAdd && <Text style={{ color: '#FFF', fontWeight: 'bold' }}>+ ADD TO COLLECTIONS</Text>}
          {showAdd && <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
            <View />
            <Text style={{ fontWeight: 'bold', color: '#FFF' }}>×</Text>
          </View>}
        </TouchableOpacity>
        {showAdd && <View style={{ height: 300, width: width, backgroundColor: '#FFF', paddingTop: 16 }}>
          {collections.length > 0 && <ScrollView>
            {collections.map(collection => (
              <View key={collection.id} style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text>{collection.name}</Text>
                  <TouchableOpacity
                    onPress={async () => {
                      var idInCollection = "stampcol_" + collection.id + "_" + route.params.stampId;
                      var savedStamp = await AsyncStorage.getItem(idInCollection);
                      setShowAdd(prevState => !prevState)
                      if (!savedStamp) {
                        var stampToSave = {
                          id: route.params.stampId,
                          title: stamp.title,
                          image: stamp.image,
                          price: stamp.price == 'NaN' ? 0 : stamp.price
                        };

                        await AsyncStorage.setItem(idInCollection, JSON.stringify(stampToSave));


                        console.log("saved stamp", JSON.stringify(stampToSave), "to collection", collection.id, collection.name, "with id", idInCollection);
                        alert("Saved stamp \"" + stamp.title + "\" to collection " + collection.name);
                      } else {
                        console.log("card", stamp.id, stamp.title, "existed in collection", collection.id, collection.name);
                        alert("Card \"" + stamp.title + "\" existed in collection " + collection.name);
                      }
                    }}
                  >
                    <Ionicons
                      name='add-circle-outline' size={20}
                      color='#006064'
                    />
                  </TouchableOpacity>
                </View>
                <View style={{ height: 1, backgroundColor: '#CFD8DC', marginTop: 16 }} />
              </View>
            ))}
            <TouchableOpacity
              style={{ margin: 16, padding: 16, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}
              onPress={() => navigation.navigate('Collection')}
            >
              <Text style={{ color: '#FFF' }}>+ CREATE OTHER COLLECTION</Text>
            </TouchableOpacity>
          </ScrollView>}
          {collections.length == 0 && <TouchableOpacity
            style={{ padding: 16 }}
            onPress={() => navigation.navigate('Collection')}
          >
            <Text style={{ textAlign: 'center', fontStyle: 'italic' }}>{"There is no collection yet.\nCreate your own collection and add cards to it."}</Text>
            <View style={{ margin: 16, padding: 16, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
              <Text style={{ color: '#FFF' }}>CREATE COLLECTION</Text>
            </View>
          </TouchableOpacity>}
        </View>}
      </View>}
    </ImageBackground >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECEFF1'
  },
  generalInfoBoard: {
    margin: 8, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 16,
    borderWidth: 1,
    borderColor: '#666666',
  },
  priceCard: {
    flexDirection: 'row', backgroundColor: '#fff', margin: 10, borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  },
  inputImage: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    resizeMode: 'contain',
    margin: 10
  },
  buyBtn: {
    position: 'absolute', bottom: 20,
    width: width - 16,
    backgroundColor: '#3279b6', margin: 8, padding: 16, flexDirection: 'row', justifyContent: 'space-between',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 2,
    elevation: 2,
  }
});
