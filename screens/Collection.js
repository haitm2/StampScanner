import React, { useState, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { StyleSheet, TouchableOpacity, Text, View, ScrollView, Image, Alert, FlatList, Dimensions, ImageBackground, Linking } from 'react-native';
import { StatusBar } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { set } from 'lodash';
import DialogInput from 'react-native-dialog-input';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { IAP } from '../utils';

const width = Dimensions.get('window').width;

export default function Collection({ navigation, route }) {

  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [collections, setCollections] = useState([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getCombinedTotalStamps = () => {
    var rs = 0;
    for (var col of collections) rs += col.total;
    return rs;
  }

  const createCollection = async (name) => {
    var id = new Date().getTime() + '';
    console.log(id);
    await AsyncStorage.setItem('collection_' + id, JSON.stringify({
      id,
      name,
      total: 0,
    }))
    await getAllCollections();
    setShowAddDialog(false);
  }

  const editCollectionName = async (id, name) => {
    var collectionText = await AsyncStorage.getItem('collection_' + id);
    var collection = JSON.parse(collectionText);
    await AsyncStorage.setItem('collection_' + id, JSON.stringify({
      id,
      name,
      total: collection.total,
    }))
    await getAllCollections();
    setShowEditDialog(false);
  }

  const showDeleteAlert = async (id) => {
    var collectionText = await AsyncStorage.getItem('collection_' + id);
    var collection = JSON.parse(collectionText);
    Alert.alert(
      'Delete collection "' + collection.name + '"',
      'Are you sure you want to remove this collection?',
      [
        {
          text: "Cancel",
        },
        {
          text: "OK",
          onPress: async () => {
            await AsyncStorage.removeItem("collection_" + id);
            const keys = await AsyncStorage.getAllKeys();
            for (const key of keys) {
              if (key.includes("stampcol_" + collection.id + "_")) {
                await AsyncStorage.removeItem(key);
              }
            }
            await getAllCollections();
          }
        }
      ]
    );
  }

  const getAllCollections = async () => {
    const keys = await AsyncStorage.getAllKeys();
    // console.log(keys);
    const collectionsDatas = [];
    for (const key of keys) {
      if (key.includes("collection_")) {
        const value = await AsyncStorage.getItem(key);
        // console.log("key =", key, ", value =", value);
        const col = JSON.parse(value);
        collectionsDatas.push(col);
      }
    }

    for (const col of collectionsDatas) {
      var total = 0;
      for (const key of keys) {
        if (key.includes("stampcol_" + col.id + "_")) {
          total = total + 1;
        }
      }
      set(col, "total", total);
    }


    console.log('=====> collectionsDatas:', collectionsDatas);
    setCollections(collectionsDatas);
  }


  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#FFFFFF', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Collections</Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ position: 'absolute', right: 16 }}
          onPress={() => navigation.navigate('History')}
        >
          <Ionicons
            name='timer-outline' size={24}
            color='#FFFFFF'
            margin={8}
          />
        </TouchableOpacity>
      )
    });
  }, [navigation]);

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

  return (
    <ImageBackground source={require('../assets/mainbg.jpg')} style={styles.main}>
      <StatusBar
        backgroundColor="#333333"
        barStyle="light-content"
      />
      <DialogInput isDialogVisible={showAddDialog}
        title={"Add collection"}
        message={"Enter name of your collection, then press the Submit button."}
        submitInput={async (inputText) => {
          console.log("Create collection", inputText);
          await createCollection(inputText);
        }}
        closeDialog={() => { setShowAddDialog(false) }}>
      </DialogInput>
      <DialogInput isDialogVisible={showEditDialog}
        title={"Edit collection name"}
        message={"Enter new name for your collection, then press the Submit button."}
        submitInput={async (inputText) => {
          console.log("Edit collection", inputText);
          await editCollectionName(selectedCollection, inputText);
        }}
        closeDialog={() => { setShowEditDialog(false) }}>
      </DialogInput>
      <View style={{ width: '100%', height: 48 }}>
        <TouchableOpacity style={{ position: 'absolute', top: 16, right: 16, flexDirection: 'row', alignItems: 'center' }}
          onPress={() => setShowAddDialog(true)}
        >
          <Ionicons
            name='add' size={24}
            color='#FFFFFF'
            margin={8}
          />
          <Text style={{ color: '#FFFFFF' }}>Add collection</Text>
        </TouchableOpacity>
      </View>
      <ScrollView>
        {bannerError || isPurchased || collections.length == 0 ?
          null :
          <View style={{ width: '100%', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
            <BannerAd
              size={BannerAdSize.BANNER}
              unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                ios: TestIds.BANNER,
                android: 'ca-app-pub-1354543839348242/9305658341',
              })}
              onAdFailedToLoad={(error) => {
                console.log(error);
                setBannerError(true);
              }}
            />
          </View>
        }
        <View style={styles.collection}>
          {collections.map(collection => (
            <View key={collection.id} style={{ marginBottom: 16 }}>
              <TouchableOpacity
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
                onPress={() => navigation.navigate('CollectionDetail', { collectionId: collection.id })}
              >
                <View style={{ width: width - 180 }}>
                  <TouchableOpacity style={{ flexDirection: 'row' }} onPress={() => {
                    setSelectedCollection(collection.id);
                    setShowEditDialog(true);
                  }}>
                    <Text style={{ color: '#FFFFFF', fontWeight: 'bold' }}>{collection.name}</Text>
                    <Ionicons
                      name='pencil' size={14}
                      color='#000'
                      margin={4}
                    />
                  </TouchableOpacity>
                  <Text style={{ color: '#FFFFFF' }}>{"Stamps: " + collection.total}</Text>
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => {
                      setSelectedCollection(collection.id);
                      showDeleteAlert(collection.id);
                    }}
                  >
                    <Ionicons
                      name='trash' size={14}
                      color='#FFF'
                      marginRight={8}
                    />
                    <Text style={{ color: '#FFFFFF' }}>Remove collection</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flexDirection: 'row-reverse' }}>
                  <View style={{ width: 50, height: 70, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#CFD8DC', backgroundColor: '#ECEFF1', borderRadius: 8 }}>
                    <Ionicons
                      name='arrow-forward' size={20}
                      color='#000000'
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <View style={{ backgroundColor: '#CFD8DC', height: 1, marginTop: 16 }} />
            </View>
          ))}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View />
            <View>
              <Text style={{ color: '#FFFFFF' }}>Total stamps</Text>
              <Text style={{ color: '#FFFFFF' }}>{getCombinedTotalStamps()}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  main: {
    flex: 1,
    backgroundColor: '#333333',
  },
  collection: {
    margin: 16, backgroundColor: '#FFF', borderRadius: 16, padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderWidth: 1,
    borderColor: '#666666'
  },
  removeBtn: {
    marginTop: 4, padding: 2, backgroundColor: '#000', borderRadius: 8, width: 120, justifyContent: 'center', alignItems: 'center', flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#666666'
  }
});
