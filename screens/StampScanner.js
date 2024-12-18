import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { MainNavigator, CameraNavigator, CollectionNavigator } from '../CustomNavigation';
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { IAP } from '../utils';
import { AdEventType, InterstitialAd, TestIds } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.INTERSTITIAL : Platform.select({
    ios: TestIds.INTERSTITIAL,
    android: 'ca-app-pub-1354543839348242/5639508019'
});

const interstitial = InterstitialAd.createForAdRequest(adUnitId);

const Tab = createBottomTabNavigator();

export default function StampScanner({ route, navigation }) {

    const [isPurchased, setPurchased] = useState(false);
    const [loaded, setLoaded] = useState(false);

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

    return (
        // <NavigationContainer>
        <Tab.Navigator
            screenOptions={{
                tabBarShowLabel: false,
                tabBarStyle: {
                    backgroundColor: '#2e2e2e'
                },
                // tabBarActiveBackgroundColor: '#fff'
            }}
        >
            <Tab.Screen
                name="MainTab" component={MainNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ size, focused, color }) => {
                        return (
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons
                                    name='home' size={20}
                                    marginTop={8}
                                    color={focused ? "#FFFFFF" : "#bababa"}
                                />
                                {/* <Text style={{ color: focused ? "#263238" : "#546E7A", fontSize: 10 }}>Home</Text> */}
                            </View>
                        );
                    }
                }}
            />
            <Tab.Screen
                name="SnapTab" component={CameraNavigator}
                options={{
                    title: "Snap",
                    headerShown: false,
                    tabBarIcon: ({ size, focused, color }) => {
                        return (
                            <View style={{ width: 70, height: 70, borderRadius: 35, marginTop: -20, backgroundColor: '#8c8c8c', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#CFD8DC' }}>
                                <Ionicons
                                    name='camera' size={24}
                                    color='#FFF'
                                />
                            </View>
                        );
                    }
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        // Prevent default action
                        e.preventDefault();
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
                        navigation.navigate('Camera')
                    },
                })}
            />
            <Tab.Screen
                name="CollectionTab" component={CollectionNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ size, focused, color }) => {
                        return (
                            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                                <Ionicons
                                    name='folder' size={20}
                                    marginTop={8}
                                    color={focused ? "#FFFFFF" : "#bababa"}
                                />
                                {/* <Text style={{ color: focused ? "#263238" : "#546E7A", fontSize: 10 }}>Collection</Text> */}
                            </View>
                        );
                    }
                }}
            />
        </Tab.Navigator>
    );
}
