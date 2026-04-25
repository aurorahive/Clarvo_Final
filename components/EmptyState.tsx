import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import ClarvoButton from './ClarvoButton';
import { Colors, Spacing, Typography } from '../constants/colors';

interface Props {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon = 'inbox', title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Feather name={icon as any} size={40} color={Colors.textFaint} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <ClarvoButton label={actionLabel} onPress={onAction} style={{ marginTop: Spacing[6] }} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[8] },
  iconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.surfaceElevated,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing[5],
  },
  title: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.semibold, color: Colors.text, textAlign: 'center', marginBottom: Spacing[2] },
  description: { fontSize: Typography.sizes.base, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 22 },
});
