import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  Dimensions,
  ImageBackground,
  ScrollView,
  Platform,
} from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import InAppReview from 'react-native-in-app-review';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

const data = [
  {
    image: require('../assets/onboard/onboard0.png'),
    key: '1',
  },
  {
    image: require('../assets/onboard/onboard1.png'),
    key: '2',
  },
  {
    image: require('../assets/onboard/onboard2.png'),
    key: '3',
  },
  {
    image: require('../assets/onboard/onboard3.png'),
    key: '4',
  },
];

export default function Walkthrough({ navigation }) {

  _keyExtractor = (item) => item.key;
  const [bannerError, setBannerError] = useState(false);

  _renderItem = ({ item }) => {
    return (
      <ImageBackground
        source={item.image}
        key={item.key}
        style={{
          flex: 1,
          backgroundColor: '#000',
        }}
        imageStyle={{ resizeMode: 'contain' }}>
      </ImageBackground>
    );
  };

  _onDone = async () => {
    // User finished the introduction. Show real app through
    // navigation or simply by controlling state
    await AsyncStorage.setItem("skip", '1');
    console.log('Move to StampScanner');
    navigation.reset({
      index: 0,
      routes: [{ name: Platform.OS == 'android' ? 'StampScanner' : 'ATT' }]
    });
  }

  _renderNextButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon
          name="arrow-forward"
          color="#000"
          size={24}
        />
      </View>
    );
  };
  _renderDoneButton = () => {
    return (
      <View style={styles.buttonCircle}>
        <Icon
          name="checkmark"
          color="#000"
          size={24}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <StatusBar translucent backgroundColor="#000" />
      <View style={{ width: '100%', height: width + 60 }}>
        <AppIntroSlider
          keyExtractor={this._keyExtractor}
          renderItem={this._renderItem}
          data={data}
          onDone={this._onDone}
          onSkip={this._onDone}
          renderDoneButton={this._renderDoneButton}
          renderNextButton={this._renderNextButton}
        />
      </View>
      <View style={{ backgroundColor: '#000', width: '100%', height: height - width - 100, alignItems: 'center', paddingTop: 8 }}>
        {!bannerError && <BannerAd
          size={BannerAdSize.MEDIUM_RECTANGLE}
          unitId={__DEV__ ? TestIds.BANNER : Platform.select({
            ios: TestIds.BANNER,
            android: 'ca-app-pub-1354543839348242/2696009857',
          })}
          onAdFailedToLoad={(error) => {
            console.log(error);
            setBannerError(true);
          }}
        />}
        {bannerError && <Text style={{ color: '#FFF', marginTop: 110 }}>This position contains ad</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 96, // Add padding to offset large buttons and pagination in bottom of page
  },
  image: {
    width: 320,
    height: 320,
    marginTop: 32,
  },
  title: {
    fontSize: 22,
    color: 'white',
    textAlign: 'center',
  },
  buttonCircle: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
