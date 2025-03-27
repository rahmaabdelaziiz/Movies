import React, {useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {NavigationContainer} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getAuth, onAuthStateChanged} from 'firebase/auth';
import {app} from './FirebaseConfig';
import SignInScreen from './SignIn';
import SignUpScreen from './SignUp';
import HomeNavigation from '../Home/Navigation';
import {ActivityIndicator, View} from 'react-native';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const [initialRoute, setInitialRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async user => {
      try {
        if (user) {
          await AsyncStorage.setItem('userToken', user.uid);
          setInitialRoute('HomeNavigation');
        } else {
          await AsyncStorage.removeItem('userToken');
          setInitialRoute('SignIn');
        }
      } catch (error) {
        console.error('Auth state change error:', error);
        setInitialRoute('SignIn');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  if (loading || initialRoute === null) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <ActivityIndicator size="large" color="#d7201b" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen
          name="HomeNavigation"
          component={HomeNavigation}
          options={{headerLeft: () => null}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
