import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Dimensions, ImageBackground, Linking, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AdEventType, BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { IAP } from '../utils';
import { useFocusEffect } from '@react-navigation/native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import ViewShot from 'react-native-view-shot';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import RNPrint from 'react-native-print';
import { Picker } from '@react-native-picker/picker';
import { head } from 'lodash';

const width = Dimensions.get('window').width;
const cardHeight = Math.round(width / 35 * 22);
const fSize = Math.round(cardHeight * 1 / 22);

var currentYear = new Date().getFullYear();
console.log(currentYear);
const years = [];
for (var i = currentYear; i >= 1900; i--) years.push(i);

const shades = [
  { index: 0, label: 'Red' },
  { index: 1, label: 'Blue' },
  { index: 2, label: 'Green' },
  { index: 3, label: 'Yellow' },
  { index: 4, label: 'Orange' },
  { index: 5, label: 'Purple' },
  { index: 6, label: 'Brown' },
  { index: 7, label: 'Black' },
  { index: 8, label: 'Gray' },
  { index: 9, label: 'White' },
]

export default function Certificate({ navigation }) {

  const viewShotRef = React.useRef();

  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [shadeIndex, setShadeIndex] = useState(7);
  const [year, setYear] = useState(1900);
  const [denomination, setDenomination] = useState("2c");
  const [categoryNumber, setCategoryNumber] = useState("85B");
  const [certNumber, setCertNumber] = useState("0558203");
  const [description, setDescription] = useState("\"it is genuine used with small faults\".");
  const [companyName, setCompanyName] = useState("Stamp Authentication Grading INC");
  const [companyShortName, setCompanyShotName] = useState("SAG");
  const [companyAddress, setCompanyAddress] = useState("123 Linden Avenue, Orlando, Florida");
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showShadePicker, setShowShadePicker] = useState(false);


  function formatDate() {
    var d = new Date(),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2)
      month = '0' + month;
    if (day.length < 2)
      day = '0' + day;

    return [month, day, year].join('/');
  }
  const printViewShot = async () => {
    try {
      console.log("save view shot");
      const filePath = await viewShotRef.current.capture();
      var res = await RNFS.readFile(filePath, 'base64');
      const newHtml = '<!DOCTYPE html><html><head><title>certificate</title><style>@media print {img {margin-top: 50px; margin-left: 50px; width: 60%; height: 60%}}</style></head><body><img src="data:image/jpeg;base64, ' + res + '" alt="Image3"></body></html>';

      console.log("print html")
      await RNPrint.print({ html: newHtml });

    } catch (err) {
      console.log(err);
    }
  }

  const shareViewShot = async () => {
    try {
      console.log("save view shot");
      const filePath = await viewShotRef.current.capture();
      let options = {
        url: filePath
      };
      await Share.open(options);
      // await fs.unlink(filePath);
    } catch (err) {
      console.log(err);
    }
  }

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#FFFFFF', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Certificate maker</Text>
        </View>
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
    <ImageBackground source={require('../assets/mainbg.jpg')} style={styles.container}>
      <StatusBar
        backgroundColor="#333333"
        barStyle="light-content"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 1 }} style={{ backgroundColor: '#FFF', width: width, height: cardHeight, alignItems: 'center', justifyContent: 'center' }}>
          <View style={{ backgroundColor: '#FFF', width: Math.round(width * 33 / 35), height: Math.round(cardHeight / 22 * 20), borderWidth: Math.round(cardHeight / 36), borderColor: '#8f6638', borderRadius: Math.round(cardHeight / 36) }}>
            <View style={styles.lineView}>
              <Text style={{ fontSize: fSize, fontWeight: 'bold' }}>{"Cert No. " + certNumber}</Text>
              <Text style={{ fontSize: fSize, fontWeight: 'bold' }}>{"Cat. No. " + categoryNumber}</Text>
            </View>
            <View style={styles.middleView}>
              <View style={{ width: Math.round(width * 9 / 35), height: Math.round(width * 11 / 35), backgroundColor: '#383838' }} />
              <View style={{ width: Math.round(width * 19 / 35), alignItems: 'center' }}>
                <Text style={{ fontWeight: '900', fontSize: fSize * 3 }}>{companyShortName}</Text>
                <Text style={{ fontSize: Math.round(fSize * 0.7) }}>{companyName}</Text>
                <Text style={{ fontSize: Math.round(fSize * 0.7) }}>{companyAddress}</Text>

                <Text style={{ fontSize: Math.round(fSize * 0.7), fontWeight: 'bold', marginTop: fSize }}>EXPERT COMMITTEE OPINION:</Text>
                <View style={{ width: '90%', flexDirection: 'row', marginTop: fSize / 3 }}>
                  <View style={{ width: width * 4 / 35 }}>
                    <Text style={{ fontSize: Math.round(fSize * 0.7) }}>Cat#</Text>
                  </View>
                  <View style={{ width: width * 4 / 35 }}>
                    <Text style={{ fontSize: Math.round(fSize * 0.7) }}>Issue</Text>
                  </View>
                  <View style={{ width: width * 4 / 35 }}>
                    <Text style={{ fontSize: Math.round(fSize * 0.7) }}>Denom.</Text>
                  </View>
                  <View style={{ width: width * 4 / 35 }}>
                    <Text style={{ fontSize: Math.round(fSize * 0.7) }}>Shade</Text>
                  </View>
                </View>
                <View style={{ width: '90%', height: 1, backgroundColor: '#000' }} />
                <View style={{ width: '90%', flexDirection: 'row', marginTop: fSize / 5 }}>
                  <View style={{ width: width * 4 / 35 }}>
                    <Text style={{ fontSize: Math.round(fSize * 0.7) }}>{categoryNumber}</Text>
                  </View>
                  <View style={{ width: width * 4 / 35 }}>
                    <Text style={{ fontSize: Math.round(fSize * 0.7) }}>{year}</Text>
                  </View>
                  <View style={{ width: width * 4 / 35 }}>
                    <Text style={{ fontSize: Math.round(fSize * 0.7) }}>{denomination}</Text>
                  </View>
                  <View style={{ width: width * 4 / 35 }}>
                    <Text style={{ fontSize: Math.round(fSize * 0.7) }}>{shades[shadeIndex].label}</Text>
                  </View>
                </View>
                <Text style={{ width: '80%', fontSize: Math.round(fSize * 0.7), marginTop: fSize, fontStyle: 'italic', textAlign: 'center' }}>{description}</Text>
              </View>
            </View>
            <View style={styles.bottomView}>
              <View>
                <Text style={{ fontSize: Math.round(fSize * 0.8) }}></Text>
                <View style={{ width: '100%', height: 1, backgroundColor: '#000' }} />
                <Text style={{ fontSize: Math.round(fSize * 0.8) }}>{"Acting Committee Chairman"}</Text>
              </View>
              <View>
                <Text style={{ fontSize: Math.round(fSize * 0.8), textAlign: 'center' }}>{formatDate()}</Text>
                <View style={{ width: '100%', height: 1, backgroundColor: '#000' }} />
                <Text style={{ fontSize: Math.round(fSize * 0.8), textAlign: 'center' }}>Date</Text>
              </View>
            </View>
          </View>
        </ViewShot>
        {bannerError || isPurchased ?
          null :
          <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
            <BannerAd
              size={BannerAdSize.BANNER}
              unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                ios: TestIds.BANNER,
                android: 'ca-app-pub-1354543839348242/4719374630',
              })}
              onAdFailedToLoad={(error) => {
                console.log(error);
                setBannerError(true);
              }}
            />
          </View>
        }
        <Text style={{ color: '#FFF', fontWeight: 'bold', alignSelf: 'center', marginTop: 16, marginBottom: 8 }}>{"EDIT CERTIFICATE INFO"}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>{"Denomi\nnation"}</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setDenomination(text.split(0, 30))}
            value={denomination}
          />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>{"Description"}</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setDescription(text.split(0, 30))}
            value={description}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>{"Cert\nnumber"}</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setCertNumber(text.split(0, 30))}
            value={certNumber}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>{"Category\nnumber"}</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setCategoryNumber(text.split(0, 30))}
            value={categoryNumber}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>{"Company\nname"}</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setCompanyName(text.split(0, 30))}
            value={companyName}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>{"Company\n short name"}</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setCompanyShotName(text.split(0, 30))}
            value={companyShortName}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>{"Company\naddress"}</Text>
          <TextInput
            style={styles.input}
            onChangeText={text => setCompanyAddress(text.split(0, 30))}
            value={companyAddress}
          />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>{"Issue"}</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowYearPicker(true)}>
            <Text>{year}</Text>
          </TouchableOpacity>
          {/* <Picker
            selectedValue={year}
            onValueChange={(itemValue, itemIndex) => setYear(itemValue)}
            style={{ height: 50, width: width - 100 }}
          >
            {years.map(year => (
              <Picker.Item key={year + ""} label={year + ""} value={year} />
            ))}
          </Picker> */}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: '#FFF', marginLeft: 8, fontWeight: 'bold' }}>{"Shade"}</Text>
          <TouchableOpacity style={styles.input} onPress={() => setShowShadePicker(true)}>
            <Text>{shades[shadeIndex].label}</Text>
          </TouchableOpacity>
          {/* <Picker
            selectedValue={shades[shadeIndex].index}
            onValueChange={(itemValue, itemIndex) => setShadeIndex(itemValue)}
            style={{ height: 50, width: width - 100 }}
          >
            {shades.map(shade => (
              <Picker.Item key={shade.index + ""} label={shade.label} value={shade.index} />
            ))}
          </Picker> */}
        </View>
        <View style={{ height: 200 }} />
      </ScrollView>

      <View style={{ justifyContent: 'center', position: 'absolute', bottom: 20, flexDirection: 'row', alignItems: 'center', alignSelf: 'center' }}>
        <TouchableOpacity
          style={{ alignSelf: 'center', margin: 16, padding: 16, borderRadius: 16, backgroundColor: 'grey' }}
          onPress={shareViewShot}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Share Certificate</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{ alignSelf: 'center', padding: 16, borderRadius: 16, backgroundColor: 'grey' }}
          onPress={printViewShot}
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Print Certificate</Text>
        </TouchableOpacity>
      </View>

      {showYearPicker && <View style={{ height: 500, backgroundColor: '#FFF', alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, margin: 16, marginBottom: 32 }}>Select year</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {years.map(y => (
            <TouchableOpacity
              key={y + ''} style={{ padding: 8, width: width - 32 }}
              onPress={() => {
                setYear(y);
                setShowYearPicker(false);
              }}
            >
              <Text style={{ margin: 8, textAlign: 'center', color: y == year ? '#000' : 'grey' }}>{y}</Text>
              <View style={{ backgroundColor: 'grey', height: 1 }} />
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>}

      {showShadePicker && <View style={{ height: 500, backgroundColor: '#FFF', alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold', fontSize: 18, margin: 16, marginBottom: 32 }}>Select shade</Text>
        <ScrollView showsVerticalScrollIndicator={false}>
          {shades.map(grd => (
            <TouchableOpacity
              key={grd.index + ''} style={{ padding: 8, width: width - 32 }}
              onPress={() => {
                setShadeIndex(grd.index);
                setShowShadePicker(false);
              }}
            >
              <Text style={{ margin: 8, textAlign: 'center', color: grd.index == shadeIndex ? '#000' : 'grey' }}>{grd.label}</Text>
              <View style={{ backgroundColor: 'grey', height: 1 }} />
            </TouchableOpacity>
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>}

    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lineView: { marginLeft: fSize / 2, marginRight: fSize / 2, marginTop: fSize / 2, flexDirection: 'row', justifyContent: 'space-between' },
  middleView: { marginLeft: fSize, marginRight: fSize, marginTop: fSize, flexDirection: 'row', justifyContent: 'space-between' },
  bottomView: { width: Math.round(width * 30 / 35), position: 'absolute', left: fSize / 2, bottom: fSize / 2, flexDirection: 'row', justifyContent: 'space-between' },
  input: {
    width: width - 116, margin: 8, padding: 8, borderWidth: 1, backgroundColor: '#FFF'
  }
});
