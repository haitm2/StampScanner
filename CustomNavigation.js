import React from "react";

import { createStackNavigator } from "@react-navigation/stack";

import Main from "./screens/Main";
import Camera from "./screens/Camera";
import Collection from "./screens/Collection";

const Stack = createStackNavigator();

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: true,
      // headerTransparent: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#333333',
      },
      // headerTintColor: '#fff',
      // headerTitleAlign: 'center',
    }}>
      <Stack.Screen
        name="Main"
        component={Main}
      />
    </Stack.Navigator>
  );
}

export { MainNavigator };

const CameraNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: true,
      // headerTransparent: true,
      headerShadowVisible: false,
      headerStyle: {
        backgroundColor: '#FAFAFA',
      },
      // headerTintColor: '#fff',
      // headerTitleAlign: 'center',
    }}>
      <Stack.Screen
        name="Camera"
        component={Camera}
      />
    </Stack.Navigator>
  );
}

export { CameraNavigator };

const CollectionNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{
      headerShown: true,
      headerShadowVisible: false,
      // headerTransparent: true,
      headerStyle: {
        backgroundColor: '#333333',
      },
      // headerTintColor: '#fff',
      // headerTitleAlign: 'center',
    }}>
      <Stack.Screen
        name="Collection"
        component={Collection}
      />
    </Stack.Navigator>
  );
}

export { CollectionNavigator };