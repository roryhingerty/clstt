import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { StyleSheet } from 'react-native'
import { supabase } from './lib/supabase'
import DiscoverScreen from './screens/DiscoverScreen'
import ClosetScreen from './screens/ClosetScreen'
console.log('Supabase connected:', !!supabase)

const Tab = createBottomTabNavigator()

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#1D9E75',
          tabBarInactiveTintColor: '#aaa',
          tabBarStyle: {
            borderTopWidth: 0.5,
            borderTopColor: '#e0ddd6',
            backgroundColor: '#fff',
          },
          headerShown: false,
        }}
      >
        <Tab.Screen name="Discover" component={DiscoverScreen} />
        <Tab.Screen name="Closet" component={ClosetScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  // kept for potential future app-level styles
})