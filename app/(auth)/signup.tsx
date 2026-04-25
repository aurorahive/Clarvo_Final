import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import ClarvoButton from '../../components/ClarvoButton';
import { Colors, Spacing, Typography, Radius } from '../../constants/colors';

export default function SignupScreen() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!fullName || !email || !password) { Alert.alert('Missing fields', 'Please fill in all fields.'); return; }
    if (password.length < 8) { Alert.alert('Weak password', 'Password must be at least 8 characters.'); return; }
    setLoading(true);
    const { error } = await signUp(email.trim().toLowerCase(), password, fullName.trim());
    setLoading(false);
    if (error) Alert.alert('Signup failed', error.message);
    else { Alert.alert('Check your email', 'We sent you a confirmation link.', [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]); }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <TouchableOpacity onPress={() => router.back()} style={styles.back}>
            <Feather name="arrow-left" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>Start building your product wallet</Text>

          <View style={styles.form}>
            {[
              { label: 'Full Name', value: fullName, set: setFullName, placeholder: 'Your name', type: 'default' },
              { label: 'Email', value: email, set: setEmail, placeholder: 'you@example.com', type: 'email-address' },
              { label: 'Password', value: password, set: setPassword, placeholder: 'Min. 8 characters', type: 'default', secure: true },
            ].map(f => (
              <View style={styles.field} key={f.label}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  style={styles.input} value={f.value} onChangeText={f.set}
                  placeholder={f.placeholder} keyboardType={f.type as any}
                  autoCapitalize={f.type === 'email-address' ? 'none' : 'words'}
                  secureTextEntry={f.secure} placeholderTextColor={Colors.textFaint}
                />
              </View>
            ))}
          </View>

          <ClarvoButton label="Create Account" onPress={handleSignup} loading={loading} fullWidth style={styles.btn} />
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.switchText}>Already have an account? <Text style={styles.switchLink}>Sign in</Text></Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  container: { flexGrow: 1, padding: Spacing[6] },
  back: { marginBottom: Spacing[8] },
  title: { fontSize: Typography.sizes['2xl'], fontWeight: Typography.weights.bold, color: Colors.text, marginBottom: Spacing[2] },
  subtitle: { fontSize: Typography.sizes.base, color: Colors.textSecondary, marginBottom: Spacing[8] },
  form: { marginBottom: Spacing[6] },
  field: { marginBottom: Spacing[5] },
  label: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.text, marginBottom: Spacing[2] },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing[4], fontSize: Typography.sizes.base, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  btn: { marginBottom: Spacing[5] },
  switchText: { textAlign: 'center', fontSize: Typography.sizes.sm, color: Colors.textSecondary },
  switchLink: { color: Colors.primary, fontWeight: Typography.weights.semibold },
});
