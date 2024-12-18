import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import StampScanner from './screens/StampScanner';
import React from 'react';
import "./ignoreWarnings";
import Result from './screens/Result';
import Premium from './screens/Premium';
import Splash from './screens/Splash';
import ATT from './screens/ATT';
import Detail from './screens/Detail';
import Article from './screens/Article';
import Walkthrough from './screens/Walkthrough';
import Camera from './screens/Camera';
import StampExpert from './screens/StampExpert';
import History from './screens/History';
import Certificate from './screens/Certificate';
import CollectionDetail from './screens/CollectionDetail';
import Collection from './screens/Collection';
import StampExpertTutorial from './screens/StampExpertTutorial';
import CertificateTutorial from './screens/CertificateTutorial';
import Similars from './screens/Similars';

const Stack = createStackNavigator();

export default function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerShown: false,
        headerBackTitle: "",
        headerTintColor: '#FFF',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: '#333333',
        },
      }}>
        <Stack.Group>
          <Stack.Screen
            name="Splash"
            component={Splash}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Walkthrough"
            component={Walkthrough}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ATT"
            component={ATT}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StampScanner"
            component={StampScanner}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Result"
            component={Result}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Similars"
            component={Similars}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Detail"
            component={Detail}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="CollectionDetail"
            component={CollectionDetail}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Article"
            component={Article}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Camera"
            component={Camera}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="StampExpert"
            component={StampExpert}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="StampExpertTutorial"
            component={StampExpertTutorial}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="CertificateTutorial"
            component={CertificateTutorial}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Certificate"
            component={Certificate}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="History"
            component={History}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name="Collection"
            component={Collection}
            options={{ headerShown: true }}
          />
        </Stack.Group>
        <Stack.Group
          screenOptions={{ presentation: 'modal', headerShown: false, gestureEnabled: false }}
        >
          <Stack.Screen
            name="Premium"
            component={Premium}
          />
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
