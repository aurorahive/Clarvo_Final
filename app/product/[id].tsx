import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useProduct } from '../../hooks/useProducts';
import { useProducts } from '../../hooks/useProducts';
import WarrantyBanner from '../../components/WarrantyBanner';
import { Colors, Spacing, Typography, Radius } from '../../constants/colors';
import { format, parseISO } from 'date-fns';

type Tab = 'identity' | 'guidance' | 'decisions';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { product, guidance, reminders, decisions, serviceRecords, loading } = useProduct(id);
  const { deleteProduct } = useProducts();
  const [tab, setTab] = useState<Tab>('identity');

  if (loading || !product) {
    return <View style={styles.loading}><Text style={styles.loadingText}>Loading...</Text></View>;
  }

  async function handleDelete() {
    Alert.alert('Remove Product', 'Remove this product from your wallet?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await deleteProduct(id); router.back(); } },
    ]);
  }

  const guidanceIcons: Record<string, string> = { cleaning: 'droplet', maintenance: 'tool', usage_tip: 'zap', troubleshooting: 'help-circle', safety: 'shield', resource: 'link' };
  const guidanceColors: Record<string, string> = { cleaning: Colors.primary, maintenance: Colors.success, usage_tip: '#6B5CE7', troubleshooting: Colors.warning, safety: Colors.error, resource: Colors.textSecondary };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="arrow-left" size={22} color={Colors.text} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
          <Feather name="trash-2" size={18} color={Colors.error} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          {product.product_image_url ? (
            <Image source={{ uri: product.product_image_url }} style={styles.heroImage} />
          ) : (
            <View style={styles.heroPlaceholder}>
              <Feather name="box" size={48} color={Colors.textFaint} />
            </View>
          )}
          <View style={styles.heroText}>
            <Text style={styles.productName}>{product.name}</Text>
            {product.brand && <Text style={styles.productBrand}>{product.brand}{product.model ? ` · ${product.model}` : ''}</Text>}
            {product.categories?.name && (
              <View style={styles.categoryChip}>
                <Text style={styles.categoryChipText}>{product.categories.name}</Text>
              </View>
            )}
          </View>
        </View>

        <WarrantyBanner warrantyExpiry={product.warranty_expiry} />

        {/* Quick Stats */}
        <View style={styles.statsRow}>
          {[
            { label: 'Purchased', value: product.purchase_date ? format(parseISO(product.purchase_date), 'dd MMM yy') : '—', icon: 'calendar' },
            { label: 'Retailer', value: product.retailer || '—', icon: 'shopping-bag' },
            { label: 'Price', value: product.price ? `£${product.price}` : '—', icon: 'pound-sign' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <Feather name={s.icon as any} size={14} color={Colors.textSecondary} />
              <Text style={styles.statValue} numberOfLines={1}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab Nav */}
        <View style={styles.tabs}>
          {([['identity', '📋 Identity'], ['guidance', '🔧 Care'], ['decisions', '⚡ Actions']] as [Tab, string][]).map(([t, l]) => (
            <TouchableOpacity key={t} style={[styles.tab, tab === t && styles.tabActive]} onPress={() => setTab(t)}>
              <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabContent}>
          {/* IDENTITY TAB */}
          {tab === 'identity' && (
            <View>
              {[
                { label: 'Product Name', value: product.name },
                { label: 'Brand', value: product.brand },
                { label: 'Model', value: product.model },
                { label: 'Purchase Date', value: product.purchase_date ? format(parseISO(product.purchase_date), 'dd MMMM yyyy') : null },
                { label: 'Warranty Expires', value: product.warranty_expiry ? format(parseISO(product.warranty_expiry), 'dd MMMM yyyy') : null },
                { label: 'Notes', value: product.notes },
              ].filter(f => f.value).map(f => (
                <View key={f.label} style={styles.identityRow}>
                  <Text style={styles.identityLabel}>{f.label}</Text>
                  <Text style={styles.identityValue}>{f.value}</Text>
                </View>
              ))}
              {serviceRecords.length > 0 && (
                <View style={{ marginTop: Spacing[5] }}>
                  <Text style={styles.subheading}>Service History</Text>
                  {serviceRecords.map(s => (
                    <View key={s.id} style={styles.serviceRow}>
                      <Text style={styles.serviceDate}>{format(parseISO(s.service_date), 'dd MMM yyyy')}</Text>
                      <Text style={styles.serviceDesc}>{s.description}</Text>
                      {s.cost && <Text style={styles.serviceCost}>£{s.cost}</Text>}
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* GUIDANCE TAB */}
          {tab === 'guidance' && (
            <View>
              {guidance.length === 0 ? (
                <View style={styles.emptyTab}>
                  <Feather name="zap" size={32} color={Colors.textFaint} />
                  <Text style={styles.emptyTabText}>AI care guidance will appear here once generated for this product.</Text>
                </View>
              ) : guidance.map(g => (
                <View key={g.id} style={styles.guidanceCard}>
                  <View style={[styles.guidanceIcon, { backgroundColor: (guidanceColors[g.type] || Colors.primary) + '20' }]}>
                    <Feather name={guidanceIcons[g.type] as any || 'info'} size={16} color={guidanceColors[g.type] || Colors.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.guidanceTitle}>{g.title}</Text>
                    {g.content && <Text style={styles.guidanceContent}>{g.content}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* DECISIONS TAB */}
          {tab === 'decisions' && (
            <View>
              <View style={styles.decisionCard}>
                <Feather name="tool" size={20} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.decisionTitle}>Repair vs Replace</Text>
                  <Text style={styles.decisionText}>Generally, repair is worth it if the cost is less than 50% of replacement value and the product is under 5 years old.</Text>
                </View>
              </View>
              <View style={styles.decisionCard}>
                <Feather name="shield" size={20} color={Colors.primary} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.decisionTitle}>Warranty Claim</Text>
                  <Text style={styles.decisionText}>{product.warranty_expiry && new Date(product.warranty_expiry) > new Date() ? 'Your warranty is active. Contact the retailer or manufacturer directly.' : 'Warranty has expired. Consider extended warranty or repair options.'}</Text>
                </View>
              </View>
              <View style={styles.decisionCard}>
                <Feather name="refresh-cw" size={20} color={Colors.success} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.decisionTitle}>Recycle</Text>
                  <Text style={styles.decisionText}>Find your nearest WEEE recycling centre at recyclenow.com. Many retailers also offer free take-back schemes.</Text>
                </View>
              </View>
              {decisions.map(d => (
                <View key={d.id} style={styles.decisionCard}>
                  <Feather name="arrow-right-circle" size={20} color={Colors.primary} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.decisionTitle}>{d.title}</Text>
                    {d.description && <Text style={styles.decisionText}>{d.description}</Text>}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.background },
  loadingText: { color: Colors.textSecondary },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: Spacing[5] },
  backBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  deleteBtn: { width: 40, height: 40, borderRadius: Radius.full, backgroundColor: Colors.errorLight, alignItems: 'center', justifyContent: 'center' },
  hero: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[5], paddingBottom: Spacing[5], gap: Spacing[4] },
  heroImage: { width: 80, height: 80, borderRadius: Radius.lg },
  heroPlaceholder: { width: 80, height: 80, borderRadius: Radius.lg, backgroundColor: Colors.surface, alignItems: 'center', justifyContent: 'center' },
  heroText: { flex: 1 },
  productName: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.text },
  productBrand: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  categoryChip: { marginTop: Spacing[2], alignSelf: 'flex-start', backgroundColor: Colors.primaryLight + '30', paddingVertical: 3, paddingHorizontal: Spacing[3], borderRadius: Radius.full },
  categoryChipText: { fontSize: Typography.sizes.xs, color: Colors.primaryDark, fontWeight: Typography.weights.medium },
  statsRow: { flexDirection: 'row', marginHorizontal: Spacing[5], gap: Spacing[3], marginBottom: Spacing[5] },
  statCard: { flex: 1, backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing[3], alignItems: 'center', gap: 3 },
  statValue: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.text },
  statLabel: { fontSize: Typography.sizes.xs, color: Colors.textFaint },
  tabs: { flexDirection: 'row', marginHorizontal: Spacing[5], backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: 4, marginBottom: Spacing[4] },
  tab: { flex: 1, paddingVertical: Spacing[2], alignItems: 'center', borderRadius: Radius.md },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: Typography.sizes.xs, color: Colors.textSecondary, fontWeight: Typography.weights.medium },
  tabTextActive: { color: Colors.black, fontWeight: Typography.weights.bold },
  tabContent: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[16] },
  identityRow: { paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  identityLabel: { fontSize: Typography.sizes.xs, color: Colors.textFaint, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  identityValue: { fontSize: Typography.sizes.base, color: Colors.text },
  subheading: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.text, marginBottom: Spacing[3] },
  serviceRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing[3], paddingVertical: Spacing[3], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  serviceDate: { fontSize: Typography.sizes.xs, color: Colors.textFaint, width: 70 },
  serviceDesc: { flex: 1, fontSize: Typography.sizes.sm, color: Colors.text },
  serviceCost: { fontSize: Typography.sizes.sm, color: Colors.success, fontWeight: Typography.weights.semibold },
  guidanceCard: { flexDirection: 'row', gap: Spacing[3], backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing[4], marginBottom: Spacing[3], alignItems: 'flex-start' },
  guidanceIcon: { width: 36, height: 36, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  guidanceTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.text, marginBottom: 4 },
  guidanceContent: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  decisionCard: { flexDirection: 'row', gap: Spacing[3], backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing[4], marginBottom: Spacing[3], alignItems: 'flex-start' },
  decisionTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.text, marginBottom: 4 },
  decisionText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, lineHeight: 20 },
  emptyTab: { alignItems: 'center', padding: Spacing[10], gap: Spacing[3] },
  emptyTabText: { fontSize: Typography.sizes.base, color: Colors.textSecondary, textAlign: 'center' },
});
