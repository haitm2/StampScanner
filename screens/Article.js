import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dimensions, ImageBackground, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { IAP } from '../utils';
import { useFocusEffect } from '@react-navigation/native';
import { Button } from 'react-native-elements';

const width = Dimensions.get('window').width;

export default function Article({ navigation, route }) {

  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ fontSize: 18, color: '#FFF', alignSelf: 'center', textAlign: 'center', fontWeight: 'bold' }}>{route.params.title}</Text>
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

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#333333"
        barStyle="light-content"
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <ImageBackground source={route.params.image} style={{ width: width, height: width }} />
        <View style={{ backgroundColor: '#333333', borderTopLeftRadius: 16, borderTopRightRadius: 16, marginTop: -16, paddingTop: 16 }}>
          <Text
            style={{
              marginTop: 8,
              marginBottom: 8,
              marginLeft: 16,
              marginRight: 16,
              fontSize: route.params.contents[0].type == 'title' ? 16 : null,
              fontWeight: route.params.contents[0].type == 'title' ? 'bold' : null,
              color: route.params.contents[0].type == 'title' ? '#f4fca7' : '#FFF'
            }}
          >{route.params.contents[0].text}</Text>
          {bannerError || isPurchased ?
            null :
            <View style={{ width: '100%', alignItems: 'center', marginTop: 8, marginBottom: 8 }}>
              <BannerAd
                size={BannerAdSize.MEDIUM_RECTANGLE}
                unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                  ios: TestIds.BANNER,
                  android: 'ca-app-pub-1354543839348242/6739204752',
                })}
                onAdFailedToLoad={(error) => {
                  console.log(error);
                  setBannerError(true);
                }}
              />
            </View>
          }
          {route.params.contents.slice(1).map(content => (
            <View key={content.text.substring(0, 200)}>
              {(content.type == 'title' || content.type == 'normal') && <Text
                style={{
                  marginTop: 8,
                  marginBottom: 8,
                  fontSize: content.type == 'title' ? 16 : null,
                  fontWeight: content.type == 'title' ? 'bold' : null,
                  color: content.type == 'title' ? '#f4fca7' : '#FFF',
                  marginLeft: 16,
                  marginRight: 16,
                }}>
                {content.text}
              </Text>}
              {content.type == 'image' && <ImageBackground source={{ uri: content.text }} style={{ width: width * 0.4, height: width * 0.4, alignSelf: 'center' }} imageStyle={{ resizeMode: 'contain' }} />}
            </View>
          ))}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333'
  },
});
