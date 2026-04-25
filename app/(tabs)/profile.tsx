import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { Colors, Spacing, Typography, Radius } from '../../constants/colors';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const { products } = useProducts();

  const warrantyActive = products.filter(p => p.warranty_expiry && new Date(p.warranty_expiry) > new Date()).length;

  function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  }

  const stats = [
    { label: 'Products', value: products.length, icon: 'package' },
    { label: 'Active Warranties', value: warrantyActive, icon: 'shield' },
    { label: 'Plan', value: profile?.plan === 'premium' ? 'Premium' : 'Free', icon: 'star' },
  ];

  const menuItems = [
    { icon: 'bell', label: 'Notification Settings', onPress: () => {} },
    { icon: 'help-circle', label: 'Help & Support', onPress: () => {} },
    { icon: 'file-text', label: 'Privacy Policy', onPress: () => {} },
    { icon: 'info', label: 'About Clarvo', onPress: () => {} },
  ];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{profile?.full_name?.[0]?.toUpperCase() || 'C'}</Text>
          </View>
          <Text style={styles.name}>{profile?.full_name || 'Clarvo User'}</Text>
          <Text style={styles.email}>{profile?.email}</Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map(s => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {profile?.plan !== 'premium' && (
          <TouchableOpacity style={styles.premiumBanner}>
            <View>
              <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              <Text style={styles.premiumText}>Unlimited products, advanced reminders & more</Text>
            </View>
            <Feather name="arrow-right" size={20} color={Colors.black} />
          </TouchableOpacity>
        )}

        <View style={styles.menu}>
          {menuItems.map(item => (
            <TouchableOpacity key={item.label} style={styles.menuItem} onPress={item.onPress}>
              <View style={styles.menuIconWrap}>
                <Feather name={item.icon as any} size={18} color={Colors.text} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Feather name="chevron-right" size={16} color={Colors.textFaint} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
          <Feather name="log-out" size={18} color={Colors.error} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.version}>Clarvo v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { alignItems: 'center', padding: Spacing[8], paddingBottom: Spacing[5] },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[4] },
  avatarText: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: Colors.black },
  name: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.text },
  email: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 4 },
  statsRow: { flexDirection: 'row', paddingHorizontal: Spacing[5], gap: Spacing[3], marginBottom: Spacing[5] },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing[4], alignItems: 'center', shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  statValue: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.text },
  statLabel: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, marginTop: 2, textAlign: 'center' },
  premiumBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.primary, marginHorizontal: Spacing[5], borderRadius: Radius.lg, padding: Spacing[5], marginBottom: Spacing[5] },
  premiumTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.bold, color: Colors.black },
  premiumText: { fontSize: Typography.sizes.sm, color: 'rgba(0,0,0,0.7)', marginTop: 2 },
  menu: { marginHorizontal: Spacing[5], backgroundColor: Colors.surface, borderRadius: Radius.lg, marginBottom: Spacing[5], overflow: 'hidden' },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: Spacing[4], gap: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  menuIconWrap: { width: 36, height: 36, borderRadius: Radius.md, backgroundColor: Colors.surfaceElevated, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: Typography.sizes.base, color: Colors.text },
  signOutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing[2], padding: Spacing[5] },
  signOutText: { fontSize: Typography.sizes.base, color: Colors.error, fontWeight: Typography.weights.medium },
  version: { textAlign: 'center', fontSize: Typography.sizes.xs, color: Colors.textFaint, paddingBottom: Spacing[8] },
});
