import React from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClarvoButton from '../../components/ClarvoButton';
import { Colors, Spacing, Typography, Radius } from '../../constants/colors';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();
  return (
    <View style={styles.container}>
      <LinearGradient colors={[Colors.primary, '#F5CC4A']} style={styles.hero}>
        <SafeAreaView style={styles.heroContent}>
          <View style={styles.logoArea}>
            <View style={styles.logoBox}>
              <Text style={styles.logoMark}>C</Text>
            </View>
            <Text style={styles.logoText}>CLARVO</Text>
            <Text style={styles.tagline}>Product Wallet & Care Hub</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.bottom}>
        <Text style={styles.headline}>Own your products.{'\n'}Really own them.</Text>
        <Text style={styles.subtext}>
          Every receipt, warranty, manual, and care guide — in one place. Always there when you need it.
        </Text>
        <View style={styles.features}>
          {['📦 Digital Product Twins', '🛡️ Warranty Tracker', '🔧 Care & Repair Guides'].map(f => (
            <Text key={f} style={styles.featureItem}>{f}</Text>
          ))}
        </View>
        <ClarvoButton label="Get Started" onPress={() => router.push('/(auth)/signup')} fullWidth style={styles.ctaBtn} />
        <ClarvoButton label="I already have an account" onPress={() => router.push('/(auth)/login')} variant="ghost" fullWidth />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  hero: { height: height * 0.42, justifyContent: 'center', alignItems: 'center' },
  heroContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logoArea: { alignItems: 'center' },
  logoBox: {
    width: 80, height: 80, borderRadius: Radius.xl,
    backgroundColor: Colors.black,
    alignItems: 'center', justifyContent: 'center', marginBottom: Spacing[3],
  },
  logoMark: { fontSize: 40, fontWeight: '900', color: Colors.primary },
  logoText: { fontSize: 32, fontWeight: '900', color: Colors.black, letterSpacing: 8 },
  tagline: { fontSize: Typography.sizes.sm, color: 'rgba(0,0,0,0.6)', marginTop: Spacing[1], letterSpacing: 1 },
  bottom: { flex: 1, padding: Spacing[6], paddingTop: Spacing[8] },
  headline: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: Spacing[3], lineHeight: 34 },
  subtext: { fontSize: Typography.sizes.base, color: Colors.textSecondary, lineHeight: 24, marginBottom: Spacing[5] },
  features: { marginBottom: Spacing[8] },
  featureItem: { fontSize: Typography.sizes.base, color: Colors.text, marginBottom: Spacing[2], fontWeight: Typography.weights.medium },
  ctaBtn: { marginBottom: Spacing[3] },
});
