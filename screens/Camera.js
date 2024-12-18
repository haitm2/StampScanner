import { useCameraPermissions, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Button, Dimensions, Image, ImageBackground, Platform, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { IAP } from '../utils';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';

const width = Dimensions.get('window').width;
// const targetPixelCount = 1080;
// const pixelRatio = PixelRatio.get();
// const pixels = targetPixelCount / pixelRatio;

export default function Camera() {
  const navigation = useNavigation();
  const [camera, setCamera] = useState(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [count, setCount] = useState(5);

  const initCount = async () => {
    try {
      var temp = await AsyncStorage.getItem("count");
      var _count = 5;
      if (temp) _count = parseInt(temp);
      setCount(_count);
    } catch (err) {
      console.log(err);
      setCount(5);
    }
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#fff', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Camera</Text>
        </View>
      )
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      // AsyncStorage.clear().then(() => console.log("clear dataa"));
      IAP.isPurchased().then(result => {
        console.log("isPurchased =", result);
        setPurchased(result);
        initCount();
      });
      return () => {
        // Do something when the screen is unfocused
        // Useful for cleanup functions
      };
    }, [])
  );

  if (!permission) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={{ width: width, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
        <StatusBar
          backgroundColor="#000"
          barStyle="light-content"
        />
        <Text style={{ textAlign: 'center', margin: 16, color: '#fff' }}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={{ backgroundColor: 'gray', borderRadius: 16, width: 200, height: 50, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ textAlign: 'center', color: '#fff' }} >{"CONTINUE"}</Text>
        </TouchableOpacity>
        {<TouchableOpacity style={{ position: 'absolute', top: 8, right: 8, padding: 10 }}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name='close-outline' size={32}
            color='#FFF'
          />
        </TouchableOpacity>}
      </View>
    );
  }

  async function captureImage() {
    // const size = await camera.getAvailablePictureSizesAsync()
    // console.log(size);
    if (count > 0 || isPurchased) {
      if (camera) {
        // const pictureSize = camera.getAvailablePictureSizes();
        // console.log(pictureSize)
        const data = await camera.takePictureAsync(null);
        console.log(data.uri);
        // setImageUri(data.uri);
        var w = data.width;
        var h = data.height;
        console.log("Img width =", w)
        console.log("Img height =", h);
        var inputImage = null;

        if (w < h) {
          inputImage = await manipulateAsync(
            data.uri,
            [
              { resize: { width: 512 } },
              {
                crop: {
                  width: 512,
                  height: 512,
                  originX: 0,
                  originY: 256 * h / w - 256
                }
              }
            ],
            { compress: 1, format: SaveFormat.JPEG }
          );
        } else {
          inputImage = await manipulateAsync(
            data.uri,
            [
              { resize: { height: 512 } },
              {
                crop: {
                  width: 512,
                  height: 512,
                  originX: 256 * w / h - 256,
                  originY: 0
                }
              }
            ],
            { compress: 1, format: SaveFormat.JPEG }
          );
        }

        var _count = count - 1;
        await AsyncStorage.setItem("count", _count + "");
        setCount(_count);

        navigation.navigate('Result', { uri: inputImage.uri })
      }
    } else {
      navigation.navigate('Premium');
    }
  }

  const pickImageFromGallery = async () => {
    // await AsyncStorage.clear();
    if (count > 0 || isPurchased) {
      ImagePicker.openPicker({
        width: 512,
        height: 512,
        cropping: true,
      }).then(async (image) => {
        console.log(image);
        // navigation.navigate('Result', { uri: 'file://' + image.path })

        var _count = count - 1;
        await AsyncStorage.setItem("count", _count + "");
        setCount(_count);

        navigation.navigate('Result', { uri: Platform.OS == 'ios' ? 'file://' + image.path : image.path })
      });
    } else {
      navigation.navigate('Premium');
    }


  };

  return (
    <View style={styles.container}>
      <StatusBar
        backgroundColor="#000"
        barStyle="light-content"
      />
      <View style={{ height: 100 }} />
      <CameraView ref={(ref) => setCamera(ref)} style={styles.camera} facing={'back'} mute={true} mode='picture'>
        <View style={{ width: '70%', height: '70%', borderWidth: 1, borderColor: '#FFFFFF', borderRadius: 4, alignItems: 'center' }}>
          <Text style={{ color: '#FFFFFF', fontSize: 12, textAlign:'center', position: 'absolute', bottom: 16 }}>{"Make sure your stamp\nfit within this box"}</Text>
        </View>
      </CameraView>
      {bannerError || isPurchased ?
        null :
        <View style={{ width: '100%', alignItems: 'center', marginTop: 8 }}>
          <BannerAd
            size={BannerAdSize.BANNER}
            unitId={__DEV__ ? TestIds.BANNER : Platform.select({
              ios: TestIds.BANNER,
              android: 'ca-app-pub-1354543839348242/4633548104',
            })}
            onAdFailedToLoad={(error) => {
              console.log(error);
              setBannerError(true);
            }}
          />
        </View>
      }
      {!isPurchased && <View style={{ marginTop: 8, padding: 4, borderRadius: 8, backgroundColor: 'gray', alignSelf: 'center' }}>
        <Text style={{ fontSize: 10, color: '#FFF' }}>{count == 1 ? "1 free scan remaining" : count == 0 ? "Free scans are gone" : count + " free scans remaining"}</Text>
      </View>}
      <View style={{ alignItems: 'center', justifyContent: 'center' }}>
        <TouchableOpacity
          style={{ backgroundColor: 'gray', width: 40, height: 40, borderRadius: 16, alignItems: 'center', justifyContent: 'center', position: 'absolute', top: 16, left: 64 }}
          onPress={pickImageFromGallery}
        >
          <Ionicons
            name='images' size={20}
            color='#FFF'
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={captureImage}>
          <Ionicons
            name='camera' size={32}
            color='#FFF'
          />
        </TouchableOpacity>
      </View>
      {<TouchableOpacity style={{ position: 'absolute', top: 50, right: 8, padding: 10 }}
        onPress={() => navigation.goBack()}
      >
        <Ionicons
          name='close-outline' size={32}
          color='#FFF'
        />
      </TouchableOpacity>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#666666'
  },
  camera: {
    marginTop: 0,
    alignSelf: 'center',
    width: width,
    height: width,
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 64,
  },
  button: {
    marginTop: 8,
    borderColor: '#FFF',
    borderWidth: 4,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'lightgray',
    width: 70,
    height: 70,
    borderRadius: 35,
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 2,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  }
});
