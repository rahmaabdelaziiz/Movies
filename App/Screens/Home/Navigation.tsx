import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import HomeScreen from './HomeScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';
import SearchScreen from './SearchScreen';
import DetailScreen from './DetailScreen';

const Tab = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const SearchStack = createStackNavigator();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator screenOptions={{headerShown: false}}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen
        name="Detail"
        component={DetailScreen}
        options={({route}) => ({
          title:
            route.params.mediaType === 'movie' ? 'Détail Film' : 'Détail Série',
        })}
      />
    </HomeStack.Navigator>
  );
}

function SearchStackScreen() {
  return (
    <SearchStack.Navigator screenOptions={{headerShown: false}}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen
        name="Detail"
        component={DetailScreen}
        options={({route}) => ({
          title:
            route.params.mediaType === 'movie' ? 'Détail Film' : 'Détail Série',
        })}
      />
    </SearchStack.Navigator>
  );
}

const HomeNavigation = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#121212',
          borderTopColor: '#333',
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#d7201b',
        tabBarInactiveTintColor: '#888',
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,
        },
      }}>
      <Tab.Screen
        name="Accueil"
        component={HomeStackScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Recherche"
        component={SearchStackScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Ionicons name="search" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default HomeNavigation;
