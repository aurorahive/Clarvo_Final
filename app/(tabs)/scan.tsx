import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { scanReceiptImage, detectProductLabel } from '../../lib/vision';
import { Colors, Spacing, Typography, Radius } from '../../constants/colors';

type ScanMode = 'product' | 'receipt';

export default function ScanScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScanMode>('product');
  const [scanning, setScanning] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) return <View style={styles.container}><ActivityIndicator color={Colors.primary} /></View>;
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permContainer}>
        <Feather name="camera-off" size={48} color={Colors.textFaint} />
        <Text style={styles.permTitle}>Camera Access Needed</Text>
        <Text style={styles.permText}>Clarvo uses your camera to scan products and receipts.</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Access</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  async function handleCapture() {
    if (!cameraRef.current || scanning) return;
    setScanning(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.8 });
      if (!photo?.base64) throw new Error('No image captured');
      
      if (mode === 'receipt') {
        const result = await scanReceiptImage(photo.base64);
        router.push({ pathname: '/product/add', params: { scannedReceipt: JSON.stringify(result) } });
      } else {
        const result = await detectProductLabel(photo.base64);
        router.push({ pathname: '/product/add', params: { scannedProduct: JSON.stringify(result) } });
      }
    } catch (e: any) {
      Alert.alert('Scan failed', e.message || 'Could not process image. Try again.');
    } finally {
      setScanning(false);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <SafeAreaView style={styles.overlay}>
          <View style={styles.topBar}>
            <Text style={styles.scanTitle}>Scan {mode === 'product' ? 'Product' : 'Receipt'}</Text>
          </View>

          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            {scanning && <ActivityIndicator size="large" color={Colors.primary} />}
          </View>

          <View style={styles.bottomBar}>
            <View style={styles.modeSwitch}>
              {(['product', 'receipt'] as ScanMode[]).map(m => (
                <TouchableOpacity key={m} style={[styles.modeBtn, mode === m && styles.modeBtnActive]} onPress={() => setMode(m)}>
                  <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]}>{m === 'product' ? '📦 Product' : '🧾 Receipt'}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.captureBtn} onPress={handleCapture} disabled={scanning}>
              <View style={styles.captureBtnInner} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.manualBtn} onPress={() => router.push('/product/add')}>
              <Text style={styles.manualBtnText}>Add manually</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.black },
  camera: { flex: 1 },
  overlay: { flex: 1 },
  topBar: { alignItems: 'center', paddingTop: Spacing[4] },
  scanTitle: { color: Colors.white, fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold },
  viewfinder: { flex: 1, alignItems: 'center', justifyContent: 'center', marginHorizontal: Spacing[8] },
  corner: { position: 'absolute', width: 30, height: 30, borderColor: Colors.primary, borderWidth: 3 },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0 },
  bottomBar: { padding: Spacing[6], alignItems: 'center', gap: Spacing[5] },
  modeSwitch: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: Radius.full, padding: 4, gap: 4 },
  modeBtn: { paddingVertical: Spacing[2], paddingHorizontal: Spacing[4], borderRadius: Radius.full },
  modeBtnActive: { backgroundColor: Colors.primary },
  modeBtnText: { color: Colors.white, fontSize: Typography.sizes.sm, fontWeight: Typography.weights.medium },
  modeBtnTextActive: { color: Colors.black },
  captureBtn: { width: 72, height: 72, borderRadius: 36, borderWidth: 4, borderColor: Colors.white, padding: 4, alignItems: 'center', justifyContent: 'center' },
  captureBtnInner: { width: '100%', height: '100%', borderRadius: 36, backgroundColor: Colors.white },
  manualBtn: { padding: Spacing[3] },
  manualBtnText: { color: Colors.white, fontSize: Typography.sizes.sm, textDecorationLine: 'underline' },
  permContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing[8], backgroundColor: Colors.background, gap: Spacing[4] },
  permTitle: { fontSize: Typography.sizes.xl, fontWeight: Typography.weights.bold, color: Colors.text },
  permText: { fontSize: Typography.sizes.base, color: Colors.textSecondary, textAlign: 'center' },
  permBtn: { backgroundColor: Colors.primary, paddingVertical: Spacing[3], paddingHorizontal: Spacing[8], borderRadius: Radius.full, marginTop: Spacing[2] },
  permBtnText: { fontSize: Typography.sizes.base, fontWeight: Typography.weights.semibold, color: Colors.black },
});
