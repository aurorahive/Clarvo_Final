import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Colors, Radius, Spacing, Typography } from '../constants/colors';
import { differenceInDays, parseISO, format } from 'date-fns';

export default function WarrantyBanner({ warrantyExpiry }: { warrantyExpiry: string | null }) {
  if (!warrantyExpiry) return null;
  const daysLeft = differenceInDays(parseISO(warrantyExpiry), new Date());
  const expired = daysLeft < 0;
  const expiring = daysLeft >= 0 && daysLeft <= 30;

  if (!expired && !expiring) return null;

  return (
    <View style={[styles.banner, expired ? styles.expired : styles.expiring]}>
      <Feather name="alert-circle" size={16} color={expired ? Colors.error : Colors.warning} />
      <Text style={[styles.text, { color: expired ? Colors.error : Colors.warning }]}>
        {expired
          ? `Warranty expired on ${format(parseISO(warrantyExpiry), 'dd MMM yyyy')}`
          : `Warranty expires in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { flexDirection: 'row', alignItems: 'center', gap: Spacing[2], padding: Spacing[3], borderRadius: Radius.md, marginBottom: Spacing[3] },
  expired: { backgroundColor: Colors.errorLight },
  expiring: { backgroundColor: Colors.warningLight },
  text: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium, flex: 1 },
});
