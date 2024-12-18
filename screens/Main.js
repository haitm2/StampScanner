import { useCameraPermissions, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Button, Dimensions, Image, ImageBackground, Linking, PixelRatio, Platform, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdEventType, BannerAd, BannerAdSize, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';
import { IAP } from '../utils';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.select({
  ios: TestIds.INTERSTITIAL,
  android: 'ca-app-pub-1354543839348242/5639508019'
});

const APP_ON_STORE = Platform.OS == 'ios' ? "https://apps.apple.com/app/id6504858531" : "https://play.google.com/store/apps/details?id=com.thedudeapp.stamp.identifier";

const interstitial = InterstitialAd.createForAdRequest(adUnitId);

const tips = [
  {
    image: require('../assets/tips/tip1.jpg'),
    title: 'How To Identify A Stamp',
    contents: [
      { text: 'Here are some tips on how to identify a stamp:', type: 'title' },
      { text: '1. Look for the country name', type: 'title' },
      { text: 'Most stamps have the name of the country of origin printed on them. This can be in the local language or in English.', type: 'normal' },
      { text: '2. Check the stamp\'s design', type: 'title' },
      { text: 'Stamps often feature images or designs that are unique to the country of origin. These can be historical figures, landmarks, animals, or other cultural symbols.', type: 'normal' },
      { text: '3. Look for the stamp\'s denomination', type: 'title' },
      { text: 'The denomination of the stamp is usually printed on it. This will tell you how much postage the stamp was worth.', type: 'normal' },
      { text: '4. Examine the stamp\'s perforation', type: 'title' },
      { text: 'Perforation is the pattern of small holes around the edges of a stamp that allow it to be easily separated from other stamps. The perforation pattern can vary from country to country.', type: 'normal' },
      { text: '5. Check for watermarks', type: 'title' },
      { text: 'Some stamps have watermarks, which are designs or patterns that are visible when the stamp is held up to the light. Watermarks can help to identify the stamp and prevent counterfeiting.', type: 'normal' },
      { text: '6. Use a stamp catalog', type: 'title' },
      { text: 'A stamp catalog is a book that lists and describes stamps from all over the world. It can be a valuable tool for identifying stamps.', type: 'normal' },
      { text: '7. Consult a stamp expert', type: 'title' },
      { text: 'If you are having trouble identifying a stamp, you can consult a stamp expert. They will be able to help you identify the stamp and determine its value.', type: 'normal' },
    ]
  },
  {
    image: require('../assets/tips/tip2.jpg'),
    title: 'Top Tips to Buying and Selling Stamps',
    contents: [
      { text: 'Stamp collecting, or philately, is a fascinating hobby with a rich history. Whether you\'re a seasoned collector or just starting, here are some top tips for buying and selling stamps:', type: 'title' },
      { text: '\nBuying Stamps\n', type: 'title' },
      { text: '1. Do Your Research', type: 'title' },
      { text: '- Understand the different types of stamps: mint, used, souvenir sheets, etc.\n- Research the value of stamps using reputable catalogs like Scott or Stanley Gibbons.\n- Familiarize yourself with stamp grading systems, which assess a stamp\'s condition.', type: 'normal' },
      { text: '2. Choose Reputable Dealers', type: 'title' },
      { text: '- Buy from trusted stamp dealers or online auction houses.\n- Check their reputation and customer reviews.\n- Consider joining a philatelic society to connect with other collectors and dealers.', type: 'normal' },
      { text: '3. Inspect Stamps Carefully', type: 'title' },
      { text: '- Examine stamps for any damage, such as tears, creases, or stains.\n- Check for proper cancellation marks and perforations.\n- Use a magnifying glass to inspect details like paper quality and printing.', type: 'normal' },
      { text: '4. Consider the Future Value', type: 'title' },
      { text: '- Invest in stamps with potential for future appreciation.\n- Look for rare or historically significant stamps.\n- Consider the overall condition and rarity of the stamp.', type: 'normal' },
      { text: '5. Diversify Your Collection', type: 'title' },
      { text: '- Don\'t focus on just one type of stamp.\n- Collect stamps from different countries, time periods, and themes.\n- This will make your collection more interesting and valuable.', type: 'normal' },

      { text: '\nSelling Stamps\n', type: 'title' },
      { text: '1. Appraise Your Collection', type: 'title' },
      { text: '- Get a professional appraisal to determine the fair market value of your stamps.\n- Consider consulting with a reputable stamp dealer or auction house.', type: 'normal' },
      { text: '2. Choose the Right Selling Platform', type: 'title' },
      { text: 'Online auction houses like eBay or specialized philatelic auction houses can reach a wider audience.\n- Consider selling directly to a stamp dealer for a quick and hassle-free transaction.\n- Join online forums and social media groups to connect with potential buyers.', type: 'normal' },
      { text: '3. Present Your Stamps Professionally', type: 'title' },
      { text: '- Use high-quality stamp albums or stock books to protect your stamps.\n- Take clear photos of your stamps, highlighting their condition and details.\n- Write detailed descriptions, including any special features or historical significance.', type: 'normal' },
      { text: '4. Be Patient and Negotiate', type: 'title' },
      { text: '- Selling stamps can take time, so be patient.\n- Be open to negotiation and consider offers from potential buyers.\n- Don\'t be afraid to walk away if you\'re not satisfied with the offer.', type: 'normal' },
      { text: '5. Consider Tax Implications', type: 'title' },
      { text: '- Be aware of any taxes or fees associated with buying or selling stamps, especially if you\'re dealing with valuable collections.\n- Consult with a tax professional to understand your specific obligations.', type: 'normal' },
    ]
  },
  {
    image: require('../assets/tips/tip3.jpg'),
    title: 'How To Spot Fake Stamps',
    contents: [
      { text: 'Here are some tips on how to spot fake stamps\n', type: 'normal' },

      { text: '\nPhysical Characteristics\n', type: 'title' },
      { text: '1. Paper Quality', type: 'title' },
      { text: 'Genuine stamps are printed on high-quality paper with a distinct feel. Fake stamps often use lower-quality paper that feels flimsy or rough.', type: 'normal' },
      { text: '2. Printing Quality', type: 'title' },
      { text: 'Real stamps have sharp, well-defined images and text. Counterfeit stamps may have blurry or pixelated details.', type: 'normal' },
      { text: '3. Color Accuracy', type: 'title' },
      { text: 'The colors on genuine stamps are consistent and vibrant. Fake stamps may have slightly off colors or faded hues.', type: 'normal' },
      { text: '4. Perforations', type: 'title' },
      { text: 'Genuine stamps have evenly spaced perforations around the edges. Fake stamps may have uneven or poorly cut perforations.', type: 'normal' },
      { text: '5. Gum', type: 'title' },
      { text: 'The gum on genuine stamps is sticky and adheres well to envelopes. Fake stamps may have weak or non-existent gum.', type: 'normal' },

      { text: '\nSecurity Features\n', type: 'title' },
      { text: '1. Watermark', type: 'title' },
      { text: 'Many stamps have watermarks visible when held up to the light. Counterfeit stamps may lack watermarks or have poorly reproduced ones.', type: 'normal' },
      { text: '2. Security Thread', type: 'title' },
      { text: 'Some stamps have embedded security threads that appear as lines or patterns when held up to the light. Fake stamps may lack security threads or have poorly replicated ones.', type: 'normal' },
      { text: '3. Microprinting', type: 'title' },
      { text: 'Genuine stamps often have tiny text or designs that are difficult to see with the naked eye. Counterfeit stamps may lack microprinting or have poorly reproduced versions.', type: 'normal' },
      { text: '4. Phosphorescent Ink', type: 'title' },
      { text: 'Some stamps have ink that glows under ultraviolet light. Fake stamps may lack this feature or have a weak glow', type: 'normal' },
    ]
  },
  {
    image: require('../assets/tips/tip4.jpg'),
    title: 'Top Stamps Every New Collector Should Own',
    contents: [
      { text: 'Here are some stamps that every new collector should consider adding to their collection', type: 'normal' },
      { text: '1. The Penny Black (1840):', type: 'title' },
      {
        text: 'https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/colnect/stamp_new_wwww/stamp1.jpeg',
        type: 'image',
      },
      { text: '- It\'s the world\'s first adhesive postage stamp, a true icon of philately.\n- Its simple design and historical significance make it a must-have for any collector.', type: 'normal' },
      { text: '2. The Great Britain 1901 Penny Red:', type: 'title' },
      {
        text: 'https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/colnect/stamp_new_wwww/stamp2.jpeg',
        type: 'image',
      },
      { text: 'It\'s another iconic British stamp, known for its vibrant color and detailed design.\n- It\'s also a relatively affordable option for new collectors.', type: 'normal' },
      { text: '3. The United States 2-Cent Pan-American Exposition Stamp (1901):', type: 'title' },
      {
        text: 'https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/colnect/stamp_new_wwww/stamp3.jpeg',
        type: 'image',
      },
      { text: 'It commemorates the Pan-American Exposition in Buffalo, New York, and features a beautiful design of the Exposition\'s Electric Tower.\n- It\'s a popular choice for collectors due to its historical significance and attractive design.', type: 'normal' },
      { text: '4. The Swedish 3-Skilling Banco Note (1855):', type: 'title' },
      {
        text: 'https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/colnect/stamp_new_wwww/stamp4.jpeg',
        type: 'image',
      },
      { text: '- It\'s the world\'s first postage stamp printed on paper currency.\n- Its unique history and design make it a fascinating addition to any collection.', type: 'normal' },
      { text: '5. The German Zeppelin Hindenburg Stamp (1936):', type: 'title' },
      {
        text: 'https://storage.bhs.cloud.ovh.net/v1/AUTH_948ebf6d457f4ea4802e51b22bfce599/colnect/stamp_new_wwww/stamp5.jpeg',
        type: 'image',
      },
      { text: '- It commemorates the Hindenburg airship, a tragic but iconic symbol of the 1930s.\n- The stamp\'s design is striking and historically significant.', type: 'normal' },
      { text: 'These are just a few suggestions, and there are countless other stamps that would make valuable additions to any collection. The best way to find stamps that interest you is to explore different eras, countries, and themes. You can also join a stamp club or attend stamp shows to learn more about collecting and find rare and interesting stamps.', type: 'normal' },
    ]
  }
]

const width = Dimensions.get('window').width;

export default function Main() {
  const navigation = useNavigation();
  const [bannerError, setBannerError] = useState(false);
  const [isPurchased, setPurchased] = useState(false);
  const [loaded, setLoaded] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View>
          <Text style={{ color: '#FFFFFF', alignSelf: 'center', fontSize: 20, fontWeight: 'bold' }}>Stamp Scanner</Text>
        </View>
      ),
      headerRight: () => (
        <TouchableOpacity style={{ position: 'absolute', right: 16 }}
          onPress={() => Linking.openURL(APP_ON_STORE)}
        >
          <View style={[styles.smallViewIcon, { backgroundColor: '#000000' }]}>
            <Ionicons
              name='star' size={20}
              color='#FFCC80'
            />
          </View>
        </TouchableOpacity>
      )
    });
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      // AsyncStorage.clear().then(() => console.log("clear dataa"));
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

  useEffect(() => {
    const unsubscribe = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      console.log("Da load xong ad")
      setLoaded(true);
    });

    // Start loading the interstitial straight away
    IAP.isPurchased().then(result => {
      if (result == true) interstitial.load();
    });

    // Unsubscribe from events on unmount
    return unsubscribe;
  }, []);

  useEffect(() => {
    IAP.isPurchased().then(async (result) => {
      if (result == false) {
        navigation.navigate('Premium');
      }
    });
    // AsyncStorage.clear();
  }, []);

  return (
    <ImageBackground source={require('../assets/mainbg.jpg')} style={styles.container}>
      <StatusBar
        backgroundColor="#333333"
        barStyle="light-content"
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.topView}>
          <View style={{ height: width * 0.6 - 100 }} />
          <Text style={{ color: '#FFF', textAlign: 'center', fontWeight: 'bold', fontSize: 16, margin: 4 }}>What's this stamp?</Text>
          <Text style={{ color: '#FFF', textAlign: 'center', marginTop: 4, marginBottom: 12, fontSize: 14 }}>Tap button to identify a stamp</Text>
          <TouchableOpacity
            style={{ width: width * 0.4, padding: 12, backgroundColor: '#666666', marginBottom: 16, borderRadius: 24 }}
            onPress={() => {
              try {
                if (!isPurchased) {
                  if (loaded) {
                    interstitial.show();
                    setLoaded(false);
                    interstitial.load();
                  } else {
                    interstitial.load();
                  }
                }
              } catch (err) {
                interstitial.load();
              }
              navigation.navigate('Camera');
            }}
          >
            <Text style={{ color: '#FFF', alignSelf: 'center', fontWeight: 'bold' }}>Identify</Text>
          </TouchableOpacity>
          <ImageBackground source={require('../assets/black_lotus.png')} style={styles.lotusImg} />
        </View>
        <View style={{ alignSelf: 'center', marginTop: 16, flexDirection: 'row', width: width - 32 }}>
          <TouchableOpacity
            style={styles.smallView}
            onPress={() => {
              try {
                if (!isPurchased) {
                  if (loaded) {
                    interstitial.show();
                    setLoaded(false);
                    interstitial.load();
                  } else {
                    interstitial.load();
                  }
                }
              } catch (err) {
                interstitial.load();
              }
              if (isPurchased) {
                navigation.navigate('StampExpert');
              } else {
                navigation.navigate('StampExpertTutorial');
              }
            }}
          >
            <View style={styles.smallViewIcon}>
              <Ionicons
                name='chatbubble' size={24}
                color='#FFF'
              />
            </View>
            <Text style={{ color: '#FFF', fontWeight: '600', marginLeft: 12 }}>{"Ask the\nExpert"}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.smallView, { marginLeft: 16 }]}
            onPress={() => {
              try {
                if (!isPurchased) {
                  if (loaded) {
                    interstitial.show();
                    setLoaded(false);
                    interstitial.load();
                  } else {
                    interstitial.load();
                  }
                }
              } catch (err) {
                interstitial.load();
              }
              if (isPurchased) {
                navigation.navigate('Certificate');
              } else {
                navigation.navigate('CertificateTutorial');
              }
            }}
          >
            <View style={styles.smallViewIcon}>
              <Ionicons
                name='barcode' size={24}
                color='#FFF'
              />
            </View>
            <Text style={{ color: '#FFF', fontWeight: '600', marginLeft: 12 }}>{"Certificate\nMaker"}</Text>
          </TouchableOpacity>
        </View>
        {bannerError || isPurchased ?
          null :
          <View style={{ width: '100%', alignItems: 'center', marginTop: 16 }}>
            <BannerAd
              size={BannerAdSize.BANNER}
              unitId={__DEV__ ? TestIds.BANNER : Platform.select({
                ios: TestIds.BANNER,
                android: 'ca-app-pub-1354543839348242/1622601330',
              })}
              onAdFailedToLoad={(error) => {
                console.log(error);
                setBannerError(true);
              }}
            />
          </View>
        }
        {!isPurchased && <TouchableOpacity
          style={styles.premiumBanner}
          onPress={async () => {
            navigation.navigate('Premium');
          }}
        >
          <View>
            <View style={{ borderRadius: 12, padding: 4, paddingLeft: 8, marginBottom: 8, backgroundColor: '#263238' }}>
              <Text style={{ fontWeight: 'bold', color: '#FFF' }}>Go PREMIUM</Text>
            </View>
            <Text style={{ fontWeight: 'bold', color: '#FFF' }}>Enjoy all features for free</Text>
            <Text style={{ fontSize: 10, color: '#FFF' }}>Claim your offer now.</Text>
          </View>
          <ImageBackground source={require('../assets/giftbox.png')} style={{ width: 60, height: 60 }} />
        </TouchableOpacity>}
        <Text style={{ color: '#FFF', fontWeight: 'bold', margin: 8, marginLeft: 16, marginTop: 24 }}>Tips</Text>
        {tips.map(item => (
          <TouchableOpacity
            style={{ padding: 8, margin: 4, flexDirection: 'row', justifyContent: 'space-between' }} key={item.title}
            onPress={() => {
              try {
                if (!isPurchased) {
                  if (loaded) {
                    interstitial.show();
                    setLoaded(false);
                    interstitial.load();
                  } else {
                    interstitial.load();
                  }
                }
              } catch (err) {
                interstitial.load();
              }
              navigation.navigate('Article', { title: item.title.split('\n')[0], image: item.image, contents: item.contents })
            }}
          >
            <ImageBackground source={item.image} style={{ width: 100, height: 100 }} imageStyle={{ borderRadius: 16, borderWidth: 1, borderColor: '#666666' }} />
            <View style={{ width: width - 140 }}>
              <Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>{item.title}</Text>
              <Text style={{ marginTop: 8, fontSize: 10, color: '#ebebeb' }}>{item.contents[0].text.substring(0, 90) + '...'}</Text>
            </View>
          </TouchableOpacity>
        ))}
        <View style={{ height: 100 }} />
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333333'
  },
  topView: {
    alignSelf: 'center', width: width - 32, alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 16, marginTop: 70,
    borderWidth: 1,
    borderColor: '#666666',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  smallView: {
    flexDirection: 'row', width: width / 2 - 24, padding: 12, backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: 16,
    borderWidth: 1,
    borderColor: '#666666',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  smallViewIcon: {
    width: 36, height: 36, backgroundColor: '#333333', borderRadius: 18, alignItems: 'center', justifyContent: 'center'
  },
  lotusImg: {
    position: 'absolute', top: -70, alignSelf: 'center', width: width * 0.5, height: width * 0.5
  },
  premiumBanner: {
    backgroundColor: '#000', borderRadius: 16, marginTop: 16, width: width - 32, alignSelf: 'center', flexDirection: 'row', justifyContent: 'space-between',
    shadowOffset: {
      width: 1,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
    padding: 16
  }
});
