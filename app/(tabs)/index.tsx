import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from '../../components/ProductCard';
import EmptyState from '../../components/EmptyState';
import { Colors, Spacing, Typography, Radius } from '../../constants/colors';

export default function WalletScreen() {
  const router = useRouter();
  const { profile } = useAuth();
  const { products, loading, fetchProducts } = useProducts();
  const [search, setSearch] = useState('');

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.brand?.toLowerCase().includes(search.toLowerCase())
  );

  const expiringCount = products.filter(p => {
    if (!p.warranty_expiry) return false;
    const days = Math.ceil((new Date(p.warranty_expiry).getTime() - Date.now()) / 86400000);
    return days >= 0 && days <= 30;
  }).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hey {profile?.full_name?.split(' ')[0] || 'there'} 👋</Text>
          <Text style={styles.subtitle}>{products.length} product{products.length !== 1 ? 's' : ''} in your wallet</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/product/add')}>
          <Feather name="plus" size={22} color={Colors.black} />
        </TouchableOpacity>
      </View>

      {expiringCount > 0 && (
        <TouchableOpacity style={styles.alertBanner} onPress={() => router.push('/(tabs)/reminders')}>
          <Feather name="alert-triangle" size={16} color={Colors.warning} />
          <Text style={styles.alertText}>{expiringCount} warranty{expiringCount > 1 ? 'ies' : ''} expiring soon</Text>
          <Feather name="chevron-right" size={14} color={Colors.warning} />
        </TouchableOpacity>
      )}

      <View style={styles.searchWrap}>
        <Feather name="search" size={16} color={Colors.textFaint} style={styles.searchIcon} />
        <TextInput style={styles.searchInput} value={search} onChangeText={setSearch} placeholder="Search products..." placeholderTextColor={Colors.textFaint} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Feather name="x" size={16} color={Colors.textFaint} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ProductCard product={item} onPress={() => router.push(`/product/${item.id}`)} />
        )}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchProducts} tintColor={Colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="package"
            title={search ? 'No results' : 'Your wallet is empty'}
            description={search ? 'Try a different search term.' : 'Add your first product to start tracking warranties and care guides.'}
            actionLabel={search ? undefined : 'Add Product'}
            onAction={search ? undefined : () => router.push('/product/add')}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing[5], paddingVertical: Spacing[4] },
  greeting: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.text },
  subtitle: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  addBtn: { width: 44, height: 44, borderRadius: Radius.full, backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  alertBanner: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], marginHorizontal: Spacing[5], marginBottom: Spacing[3], backgroundColor: Colors.warningLight, padding: Spacing[3], borderRadius: Radius.md },
  alertText: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.warning, fontWeight: Typography.weights.medium },
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: Spacing[5], marginBottom: Spacing[4], backgroundColor: Colors.surface, borderRadius: Radius.full, paddingHorizontal: Spacing[4], paddingVertical: Spacing[3], borderWidth: 1, borderColor: Colors.border },
  searchIcon: { marginRight: Spacing[2] },
  searchInput: { flex: 1, fontSize: Typography.sizes.base, color: Colors.text },
  list: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[16] },
});
