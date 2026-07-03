import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';

import FeedScreen from '../screens/FeedScreen';
import MaintenanceListScreen from '../screens/MaintenanceListScreen';
import MaintenanceDetailScreen from '../screens/MaintenanceDetailScreen';
import PaymentsScreen from '../screens/PaymentsScreen';
import MessagesScreen from '../screens/MessagesScreen';
import LeaseScreen from '../screens/LeaseScreen';

// ── Param lists ──

export type MaintenanceStackParamList = {
  MaintenanceList: undefined;
  MaintenanceDetail: { id: string };
};

export type RootTabParamList = {
  Feed: undefined;
  Maintenance: undefined; // nested stack
  Payments: undefined;
  Messages: undefined;
  Lease: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();
const MaintenanceStack = createNativeStackNavigator<MaintenanceStackParamList>();

function MaintenanceNavigator() {
  return (
    <MaintenanceStack.Navigator>
      <MaintenanceStack.Screen
        name="MaintenanceList"
        component={MaintenanceListScreen}
        options={{ title: 'Maintenance' }}
      />
      <MaintenanceStack.Screen
        name="MaintenanceDetail"
        component={MaintenanceDetailScreen}
        options={{ title: 'Request Detail' }}
      />
    </MaintenanceStack.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen
          name="Feed"
          component={FeedScreen}
          options={{ headerShown: false }}
        />
        <Tab.Screen
          name="Maintenance"
          component={MaintenanceNavigator}
          options={{ headerShown: false }}
        />
        <Tab.Screen name="Payments" component={PaymentsScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Lease" component={LeaseScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
