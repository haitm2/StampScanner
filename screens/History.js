import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, Text, View, ScrollView, Image, Alert, FlatList, Dimensions, ImageBackground, Linking } from 'react-native';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'lodash';
import { IAP } from '../utils';
import { AdEventType, BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

const width = Dimensions.get('window').width;

export default function History({ navigation, route }) {

  const [items, setItems] = useState([]);
  const [images, setImages] = useState([]);
  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);

  const showDeleteAlert = async (name, key, image) => {
    Alert.alert(
      'Delete ' + name + ' card',
      'Are you sure you want to remove this card from history?',
      [
        {
          text: "Cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            await AsyncStorage.removeItem(key);
            await AsyncStorage.removeItem(image);
            await getHistoryItems();
          }
        }
      ]
    );
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#FFF', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>History</Text>
        </View>
      )
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      getHistoryItems();
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

  const getHistoryItems = async () => {
    console.log("Getting history");
    setItems([]);
    setImages([]);
    // await AsyncStorage.clear();
    const keys = await AsyncStorage.getAllKeys();
    const historyDatas = [];
    const imageDatas = [];
    for (const key of keys) {
      if (key.includes("history_")) {
        const value = await AsyncStorage.getItem(key);
        // console.log("key =", key, ", value =", value);
        const fav = JSON.parse(value);
        // console.log(fav);
        set(fav, 'id', key);
        historyDatas.push(fav);
      } else if (key.includes("image_")) {
        const value = await AsyncStorage.getItem(key);
        // console.log(value.substring(0, 50) + '...');
        imageDatas.push({ key, value });
      }
    }
    console.log('=====> historyDatas:', historyDatas);
    setItems(historyDatas);
    setImages(imageDatas);
  }

  const getImage = (key) => {
    console.log("Getting image in storage with key", key.substring(0, 100));
    for (var image of images) {
      if (image.key == key) {
        // console.log(image.value.substring(0, 100) + '...');
        return "data:image/jpeg;base64," + image.value;
      }
    }

    return null;
  }

  return (
    <ImageBackground source={require('../assets/mainbg.jpg')} style={styles.container}>
      <StatusBar
        backgroundColor="#333333"
        barStyle="light-content"
      />
      {items.length === 0 && <Text style={{ color: 'gray', alignSelf: 'center', fontSize: 16, marginTop: 20 }}>Empty</Text>}

      <ScrollView showsVerticalScrollIndicator={false}>
        {items && items.length > 0 && items.map(item => (
          <View key={item.id}>
            <TouchableOpacity
              style={styles.card}
              onPress={() => {
                navigation.navigate('Detail', { stampId: item.result._id })
              }}
            >
              <ImageBackground source={{ uri: getImage(item.image) }} style={{ width: 90, height: 90, margin: 8 }} imageStyle={{ borderRadius: 4 }} resizeMode='cover' />
              <View style={{ padding: 8, width: width - 132 }}>
                <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{item.result.title}</Text>
                <Text style={{ marginTop: 8, color: '#78909C', fontStyle: 'italic' }}>{"Condition: " + item.result.condition}</Text>
                <Text style={{ marginTop: 4, color: '#FFFFFF' }}>{"Value: " + item.result.price}</Text>
                <View style={{ position: 'absolute', right: 16, bottom: 8, backgroundColor: 'gray', padding: 4, borderRadius: 8 }}>
                  <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => showDeleteAlert(item.result.name, item.id, item.image)}>
                    <Ionicons
                      name='trash' size={24}
                      color='#FFF'
                    />
                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Remove</Text>
                  </TouchableOpacity>
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
  }
});
