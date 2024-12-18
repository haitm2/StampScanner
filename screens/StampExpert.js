import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Alert, Dimensions, ImageBackground, Linking, Platform, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AES, IAP } from '../utils';
import { useFocusEffect } from '@react-navigation/native';
import DialogInput from 'react-native-dialog-input';
import { Picker } from '@react-native-picker/picker';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import ImagePicker from 'react-native-image-crop-picker';
import InAppReview from 'react-native-in-app-review';
import axios from 'axios';
import LottieView from 'lottie-react-native';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export default function StampExpert({ navigation }) {
  const [uri, setUri] = useState(null);
  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [showAnalyz, setShowAnalyz] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState(null);


  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  const initQuest = async () => {
    await sleep(1000);
    setShowColorQuest(true);
  }

  const getFinalAnswer = async (uri) => {
    console.log("Getting final answer...");
    const detectBody = new FormData();
    detectBody.append('picture_upload', {
      uri,
      name: 'stamp.jpg',
      type: 'image/jpeg'
    });
    const data = await fetch('https://antique-api.thedudeapp.win/api/vcxHUI16aA7cznkv6z/valuingStamp', {
      method: 'POST',
      body: detectBody,
    });
    console.log("Detecting...")

    const rsEncrypted = await data.text();
    console.log(rsEncrypted.substring(0, 100));
    const rsText = await AES.decrypt2(rsEncrypted);
    // console.log(rsText);
    setFinalAnswer(rsText);
  }

  const pickImageFromGallery = async () => {
    ImagePicker.openPicker({
      width: 512,
      height: 512,
      cropping: true,
    }).then(async (image) => {
      console.log(image);
      var imageUri = Platform.OS == 'ios' ? 'file://' + image.path : image.path;
      setUri(imageUri);
      setShowAnalyz(true);
      await getFinalAnswer(imageUri);
      setShowAnalyz(false);
    });
  };

  const pickImageFromCamera = async () => {
    ImagePicker.openCamera({
      width: 512,
      height: 512,
      cropping: true,
    }).then(async (image) => {
      console.log(image);
      var imageUri = Platform.OS == 'ios' ? 'file://' + image.path : image.path;
      setUri(imageUri);
      setShowAnalyz(true);
      await getFinalAnswer(imageUri);
      setShowAnalyz(false);
    });
  };

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#FFF', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Ask the Stamp Expert</Text>
        </View>
      )
    });
  }, [navigation]);

  useEffect(() => {
    initQuest();
  }, []);

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

  return (
    <View style={styles.container}>
      <ScrollView
        ref={ref => scrollView = ref}
        onContentSizeChange={() => scrollView.scrollToEnd()}
      >
        {bannerError || isPurchased ?
          null :
          <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
            <BannerAd
              size={BannerAdSize.LARGE_BANNER}
              unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                ios: TestIds.BANNER,
                android: 'ca-app-pub-1354543839348242/2093211299',
              })}
              onAdFailedToLoad={(error) => {
                console.log(error);
                setBannerError(true);
              }}
            />
          </View>
        }
        <LottieView source={require('../assets/expert.json')} autoPlay loop style={{ width: '100%', height: 100, marginTop: 20 }} />
        <View style={styles.questionBox}>
          <Text style={styles.question}>Hi, I am a stamp expert</Text>
        </View>
        {<View style={styles.questionBox}>
          <Text style={styles.question}>Send me any stamp, I will give you the information, condition and value of that stamp.</Text>
        </View>}

        {!uri && <View style={styles.actionBox}>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImageFromCamera}>
            <Ionicons
              name='camera' size={14}
              marginRight={8}
              color='#FFF'
            />
            <Text style={{ color: '#FFF' }}>Take a photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={pickImageFromGallery}>
            <Ionicons
              name='images' size={14}
              marginRight={8}
              color='#FFF'
            />
            <Text style={{ color: '#FFF' }}>Select from photo album</Text>
          </TouchableOpacity>
        </View>}

        {uri && <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View></View>
          <ImageBackground source={{ uri }} style={{ width: width * 0.3, height: width * 0.3, margin: 8 }} />
        </View>}

        {!finalAnswer && showAnalyz && <View style={styles.questionBox}>
          <Text style={styles.question}><ActivityIndicator />Please wait a moment, I am analyzing your stamp </Text>
        </View>}

        {isPurchased && finalAnswer && <View style={styles.finalAnswerBox}>
          <Text style={styles.question}>{finalAnswer.replace(/\*\*/g, '').replace(/\*/g, '•')}</Text>
        </View>}

        {!isPurchased && finalAnswer && <TouchableOpacity style={styles.finalAnswerBox} onPress={() => navigation.navigate('Premium')}>
          <Text style={styles.question}>{finalAnswer.replace(/\*\*/g, '').replace(/\*/g, '•').substring(0, 200) + '...'}</Text>
          <Text style={{ marginBottom: 16, textDecorationLine: 'underline', color: 'blue' }}> Read more</Text>
        </TouchableOpacity>}

      </ScrollView>



    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333'
  },
  question: { margin: 4 },
  questionBox: {
    marginTop: 8, marginLeft: 8, padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '70%',
    borderColor: '#666666',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  actionBox: {
    marginTop: 8, marginRight: 8, padding: 4,
    alignSelf: 'flex-end'
  },
  actionBtn: {
    backgroundColor: 'grey',
    padding: 16, margin: 4,
    borderRadius: 16,
    flexDirection: 'row',
    borderColor: '#666666',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  answerBox: {
    marginTop: 8, marginRight: 8, padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignSelf: 'flex-end'
  },
  answer: { alignSelf: 'flex-end', margin: 4 },
  finalAnswerBox: {
    margin: 8, padding: 8,
    backgroundColor: '#FFF',
    borderRadius: 16
  },
});
