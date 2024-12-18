import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, Text, View, ScrollView, Image, Alert, FlatList, Dimensions, ImageBackground, Linking } from 'react-native';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'lodash';
import { IAP } from '../utils';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const width = Dimensions.get('window').width;

export default function CollectionDetail({ navigation, route }) {

  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [stamps, setStamps] = useState([]);

  const getAllStampsOfCollection = async () => {
    var collectionId = route.params.collectionId;
    console.log("collectionId:", collectionId);
    const keys = await AsyncStorage.getAllKeys();
    var temp = [];
    for (const key of keys) {
      if (key.includes("stampcol_" + collectionId + "_")) {
        var stampText = await AsyncStorage.getItem(key);
        temp.push(JSON.parse(stampText));
      }
    }
    console.log(temp);
    setStamps(temp);
  }

  useFocusEffect(
    React.useCallback(() => {
      getAllStampsOfCollection();
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );


  const getTotalStamps = () => {
    return stamps.length;
  }

  const getTotalValue = () => {
    var rs = 0;
    for (var c of stamps) rs += c.price;
    return rs;
  }



  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#FFFFFF', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Collection Detail</Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ position: 'absolute', top: 8, right: 16 }}
          onPress={() => navigation.navigate('Camera')}
        >
          <Ionicons
            name='add' size={24}
            color='#FFF'
            margin={8}
          />
        </TouchableOpacity>
      )
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

  return (
    <View style={styles.main}>
      <StatusBar
        backgroundColor="#333333"
        barStyle="light-content"
      />
      <ScrollView>
        {bannerError || isPurchased || stamps.length == 0 ?
          null :
          <View style={{ width: '100%', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
            <BannerAd
              size={BannerAdSize.BANNER}
              unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                ios: TestIds.BANNER,
                android: 'ca-app-pub-1354543839348242/2211162188',
              })}
              onAdFailedToLoad={(error) => {
                console.log(error);
                setBannerError(true);
              }}
            />
          </View>
        }
        {stamps.map(item => (
          <TouchableOpacity
            style={styles.card} key={item.id}
            onPress={() => {
              navigation.navigate('Detail', { stampId: item.id });
            }}
          >
            <ImageBackground source={{ uri: item.image }} style={{ width: 90, height: 120, margin: 8 }} imageStyle={{ borderRadius: 4 }} resizeMode='cover' />
            <View style={{ padding: 8, width: width - 132 }}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>{item.title}</Text>
              <Text style={{ marginTop: 4, color: '#FFF' }}>{"$" + item.price}</Text>
              <View style={{ position: 'absolute', right: 16, bottom: 8, backgroundColor: 'gray', padding: 4, borderRadius: 8 }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center' }}
                  onPress={async () => {
                    await AsyncStorage.removeItem("stampcol_" + route.params.collectionId + "_" + item.id);
                    await getAllStampsOfCollection();
                    alert("Removed stamp " + item.name + " from this collection");
                  }}
                >
                  <Ionicons
                    name='trash' size={24}
                    color='#FFF'
                  />
                  <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>

          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
      <View style={{ flexDirection: 'row', backgroundColor: '#000', padding: 16, position: 'absolute', bottom: 0, left: 0, width: '100%' }}>
        <View style={{ width: width - 150 }}>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Combined Total Value:</Text>
          <Text style={{ color: '#FFF' }}>{'$' + getTotalValue()}</Text>
        </View>
        <View>
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Total stamps</Text>
          <Text style={{ color: '#FFF', textAlign: 'center' }}>{getTotalStamps()}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#333333',
  },
  card: {
    flexDirection: 'row', padding: 8, borderRadius: 16, backgroundColor: 'rgba(0, 0, 0, 0.5)',
    marginTop: 8, marginLeft: 8, marginRight: 8,
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
  stamp: {
    flexDirection: 'row', padding: 8, borderRadius: 16, backgroundColor: '#E0F2F1',
    marginTop: 8, marginLeft: 8, marginRight: 8,
    borderWidth: 1,
    borderColor: '#FFF',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  }
});
