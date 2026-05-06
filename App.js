import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { Text } from 'react-native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import OutfitScreen from './screens/OutfitScreen'
import DiscoverScreen from './screens/DiscoverScreen'
import ClosetScreen from './screens/ClosetScreen'
import ItemDetailScreen from './screens/ItemDetailScreen'

const Tab = createBottomTabNavigator()
const ClosetStack = createNativeStackNavigator()

function ClosetNavigator() {
  return (
    <ClosetStack.Navigator screenOptions={{ headerShown: false }}>
      <ClosetStack.Screen name="ClosetHome" component={ClosetScreen} />
      <ClosetStack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </ClosetStack.Navigator>
  )
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#fff',
              borderTopColor: '#e0ddd6',
              borderTopWidth: 1,
            },
            tabBarActiveTintColor: '#1D9E75',
            tabBarInactiveTintColor: '#999',
            tabBarLabelStyle: { fontSize: 12, fontWeight: '600' },
          }}
        >
          <Tab.Screen
            name="Outfit"
            component={OutfitScreen}
            options={{
              tabBarLabel: 'Outfit',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 18, color }}>✂</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Discover"
            component={DiscoverScreen}
            options={{
              tabBarLabel: 'Discover',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 18, color }}>✦</Text>
              ),
            }}
          />
          <Tab.Screen
            name="Closet"
            component={ClosetNavigator}
            options={{
              tabBarLabel: 'Closet',
              tabBarIcon: ({ color }) => (
                <Text style={{ fontSize: 18, color }}>♡</Text>
              ),
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}
