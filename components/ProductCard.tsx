import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/colors';
import { differenceInDays, parseISO } from 'date-fns';

interface Props {
  product: any;
  onPress: () => void;
}

export default function ProductCard({ product, onPress }: Props) {
  const warrantyDaysLeft = product.warranty_expiry
    ? differenceInDays(parseISO(product.warranty_expiry), new Date())
    : null;

  const warrantyStatus = warrantyDaysLeft === null ? 'unknown'
    : warrantyDaysLeft < 0 ? 'expired'
    : warrantyDaysLeft <= 30 ? 'expiring'
    : 'active';

  const warrantyColor = { unknown: Colors.textFaint, expired: Colors.error, expiring: Colors.warning, active: Colors.success }[warrantyStatus];
  const warrantyLabel = {
    unknown: 'No warranty info',
    expired: 'Warranty expired',
    expiring: `Expires in ${warrantyDaysLeft} days`,
    active: `${warrantyDaysLeft} days left`,
  }[warrantyStatus];

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        {product.product_image_url ? (
          <Image source={{ uri: product.product_image_url }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Feather name="box" size={28} color={Colors.textFaint} />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{product.name}</Text>
          <Feather name="chevron-right" size={16} color={Colors.textFaint} />
        </View>
        {product.brand && <Text style={styles.brand}>{product.brand}</Text>}
        <View style={styles.footer}>
          <View style={[styles.warrantyBadge, { backgroundColor: warrantyColor + '20' }]}>
            <View style={[styles.warrantyDot, { backgroundColor: warrantyColor }]} />
            <Text style={[styles.warrantyText, { color: warrantyColor }]}>{warrantyLabel}</Text>
          </View>
          {product.categories?.name && (
            <Text style={styles.category}>{product.categories.name}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing[4],
    marginBottom: Spacing[3],
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageContainer: { marginRight: Spacing[3] },
  image: { width: 64, height: 64, borderRadius: Radius.md, backgroundColor: Colors.surfaceElevated },
  imagePlaceholder: {
    width: 64, height: 64, borderRadius: Radius.md,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1, justifyContent: 'space-between' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  name: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.text, flex: 1, marginRight: Spacing[2] },
  brand: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing[2] },
  warrantyBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing[2], paddingVertical: 4, borderRadius: Radius.full },
  warrantyDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  warrantyText: { fontSize: Typography.sizes.xs, fontWeight: Typography.weights.medium },
  category: { fontSize: Typography.sizes.xs, color: Colors.textFaint },
});
