import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { StyleSheet, TouchableOpacity, Text, View, ScrollView, ActivityIndicator, Image, Animated, FlatList, Dimensions, ImageBackground, Platform, Linking, Alert } from 'react-native';
import { StatusBar } from 'react-native';
import axios from 'axios';
import { AES, IAP } from '../utils';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const width = Dimensions.get('window').width;

export default function Similars({ navigation, route }) {

  const [similarStamps, setSimilarStamps] = useState([]);
  const [isPurchased, setPurchased] = useState(false);
  const [bannerError, setBannerError] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#FFFFFF', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Similar Stamps</Text>
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
    getSimilarStamps();
  }, [])

  return (
    <ImageBackground source={require('../assets/mainbg.jpg')} style={styles.container}>
      <StatusBar
        backgroundColor="#333333"
        barStyle="light-content"
      />
      <ScrollView style={{ width: '100%' }}>
        {bannerError || isPurchased || stamps.length == 0 ?
          null :
          <View style={{ width: '100%', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
            <BannerAd
              size={BannerAdSize.BANNER}
              unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                ios: TestIds.BANNER,
                android: 'ca-app-pub-1354543839348242/7992576678',
              })}
              onAdFailedToLoad={(error) => {
                console.log(error);
                setBannerError(true);
              }}
            />
          </View>
        }
        {similarStamps.length > 0 && similarStamps.map(stamp => (
          <View key={stamp._id} style={styles.card}>
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={() => {
                navigation.navigate('Detail', { stampId: stamp._id })
              }}
            >
              <ImageBackground source={{ uri: stamp.image }} style={{ width: 100, height: 100, margin: 8 }} resizeMode='contain' />
              <View style={{ padding: 8, width: width - 152 }}>
                <Text style={{ fontSize: 12, color: '#FFF', fontWeight: 'bold' }}>{stamp.title}</Text>
                <Text style={{ fontSize: 12, color: 'grey' }}>{"Condition: " + stamp.condition}</Text>
                <View style={{ flexDirection: 'row', position: 'absolute', right: 8, bottom: 8 }}>
                  <Text style={{ color: '#cfde49', fontSize: 12, fontWeight: 'bold' }}>{"$" + stamp.price}</Text>
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
