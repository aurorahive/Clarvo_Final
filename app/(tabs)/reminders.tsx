import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Colors, Spacing, Typography, Radius } from '../../constants/colors';
import { format, parseISO, isPast, isWithinInterval, addDays } from 'date-fns';

export default function RemindersScreen() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('reminders')
      .select('*, product_twins(name)')
      .eq('user_id', user.id)
      .eq('is_completed', false)
      .order('due_date')
      .then(({ data }) => { setReminders(data || []); setLoading(false); });
  }, [user]);

  async function markDone(id: string) {
    await supabase.from('reminders').update({ is_completed: true }).eq('id', id);
    setReminders(prev => prev.filter(r => r.id !== id));
  }

  const overdue = reminders.filter(r => isPast(parseISO(r.due_date)));
  const upcoming = reminders.filter(r => !isPast(parseISO(r.due_date)) && isWithinInterval(parseISO(r.due_date), { start: new Date(), end: addDays(new Date(), 30) }));
  const later = reminders.filter(r => !isPast(parseISO(r.due_date)) && !isWithinInterval(parseISO(r.due_date), { start: new Date(), end: addDays(new Date(), 30) }));

  const sections = [
    { title: '🔴 Overdue', data: overdue, color: Colors.error },
    { title: '🟡 Next 30 Days', data: upcoming, color: Colors.warning },
    { title: '📅 Later', data: later, color: Colors.textSecondary },
  ].filter(s => s.data.length > 0);

  const iconMap: Record<string, string> = { warranty_expiry: 'shield', maintenance: 'tool', filter_replacement: 'filter', service: 'settings', custom: 'bell' };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Text style={styles.title}>Reminders</Text>
      {reminders.length === 0 && !loading ? (
        <View style={styles.empty}>
          <Feather name="bell-off" size={40} color={Colors.textFaint} />
          <Text style={styles.emptyTitle}>All clear!</Text>
          <Text style={styles.emptyText}>No reminders right now. Add products to start tracking warranties and maintenance.</Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={s => s.title}
          contentContainerStyle={styles.list}
          renderItem={({ item: section }) => (
            <View>
              <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
              {section.data.map(r => (
                <View key={r.id} style={styles.card}>
                  <View style={[styles.iconWrap, { backgroundColor: section.color + '20' }]}>
                    <Feather name={iconMap[r.type] as any || 'bell'} size={18} color={section.color} />
                  </View>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{r.title}</Text>
                    <Text style={styles.cardProduct}>{r.product_twins?.name}</Text>
                    <Text style={[styles.cardDate, { color: section.color }]}>{format(parseISO(r.due_date), 'dd MMM yyyy')}</Text>
                  </View>
                  <TouchableOpacity onPress={() => markDone(r.id)} style={styles.doneBtn}>
                    <Feather name="check" size={16} color={Colors.success} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  title: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: Colors.text, padding: Spacing[5], paddingBottom: Spacing[3] },
  list: { paddingHorizontal: Spacing[5], paddingBottom: Spacing[16] },
  sectionTitle: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.bold, marginBottom: Spacing[3], marginTop: Spacing[4], textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.lg, padding: Spacing[4], marginBottom: Spacing[3], gap: Spacing[3], shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1 },
  cardTitle: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.text },
  cardProduct: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, marginTop: 2 },
  cardDate: { fontSize: Typography.sizes.xs, marginTop: 4, fontWeight: Typography.weights.medium },
  doneBtn: { width: 36, height: 36, borderRadius: Radius.full, backgroundColor: Colors.successLight, alignItems: 'center', justifyContent: 'center' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[8], gap: Spacing[4] },
  emptyTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.text },
  emptyText: { fontSize: Typography.sizes.base, color: Colors.textSecondary, textAlign: 'center', maxWidth: 280, lineHeight: 22 },
});
