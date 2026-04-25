import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Colors, Typography } from '../../constants/colors';
import { Platform } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.textFaint,
      tabBarStyle: {
        backgroundColor: Colors.surface,
        borderTopColor: Colors.border,
        height: Platform.OS === 'android' ? 64 : 80,
        paddingBottom: Platform.OS === 'android' ? 8 : 24,
      },
      tabBarLabelStyle: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.medium },
    }}>
      <Tabs.Screen name="index" options={{ title: 'My Wallet', tabBarIcon: ({ color }) => <Feather name="grid" size={22} color={color} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color }) => <Feather name="camera" size={22} color={color} /> }} />
      <Tabs.Screen name="reminders" options={{ title: 'Reminders', tabBarIcon: ({ color }) => <Feather name="bell" size={22} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color }) => <Feather name="user" size={22} color={color} /> }} />
    </Tabs>
  );
}
