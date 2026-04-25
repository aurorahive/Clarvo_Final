import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useProducts } from '../../hooks/useProducts';
import { generateGuidance } from '../../lib/openai';
import ClarvoButton from '../../components/ClarvoButton';
import { Colors, Spacing, Typography, Radius } from '../../constants/colors';
import { CATEGORIES } from '../../constants/categories';
import { addMonths, format } from 'date-fns';

export default function AddProductScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { addProduct } = useProducts();
  const params = useLocalSearchParams();

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [retailer, setRetailer] = useState('');
  const [price, setPrice] = useState('');
  const [warrantyMonths, setWarrantyMonths] = useState('12');
  const [notes, setNotes] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Auto-fill from scan
  useEffect(() => {
    if (params.scannedReceipt) {
      try {
        const data = JSON.parse(params.scannedReceipt as string);
        if (data.retailer) setRetailer(data.retailer);
        if (data.date) setPurchaseDate(data.date);
      } catch {}
    }
    if (params.scannedProduct) {
      try {
        const data = JSON.parse(params.scannedProduct as string);
        if (data.logoDescription) setBrand(data.logoDescription);
        if (data.labels?.[0]) setName(data.labels[0]);
      } catch {}
    }
  }, [params]);

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0].uri);
  }

  async function handleSave() {
    if (!name.trim()) { Alert.alert('Product name required', 'Please enter a name for your product.'); return; }
    setLoading(true);
    try {
      let imageUrl: string | undefined;
      if (image && user) {
        const ext = image.split('.').pop();
        const fileName = `${user.id}/${Date.now()}.${ext}`;
        const response = await fetch(image);
        const blob = await response.blob();
        const { data: uploadData, error: uploadError } = await supabase.storage.from('product-images').upload(fileName, blob, { contentType: `image/${ext}` });
        if (!uploadError && uploadData) {
          const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(fileName);
          imageUrl = urlData.publicUrl;
        }
      }

      const category = CATEGORIES.find(c => c.id === categoryId);
      const pDate = purchaseDate ? new Date(purchaseDate) : new Date();
      const warrantyExpiry = warrantyMonths ? format(addMonths(pDate, parseInt(warrantyMonths)), 'yyyy-MM-dd') : null;

      const { data: product, error } = await addProduct({
        name: name.trim(),
        brand: brand.trim() || null,
        model: model.trim() || null,
        category_id: null,
        purchase_date: format(pDate, 'yyyy-MM-dd'),
        retailer: retailer.trim() || null,
        price: price ? parseFloat(price) : null,
        warranty_expiry: warrantyExpiry,
        notes: notes.trim() || null,
        product_image_url: imageUrl || null,
      });

      if (error) throw new Error(error.message);

      // Generate AI guidance in background
      if (product?.id && name && brand) {
        const catName = category?.name || 'Appliance';
        generateGuidance(name, brand, catName).then(async (tips: any[]) => {
          if (Array.isArray(tips) && tips.length > 0) {
            await supabase.from('guidance_items').insert(
              tips.map((t: any) => ({ product_twin_id: product.id, type: t.type || 'usage_tip', title: t.title, content: t.content, is_ai_generated: true }))
            );
          }
        }).catch(() => {});
      }

      // Auto-create warranty reminder
      if (product?.id && warrantyExpiry) {
        await supabase.from('reminders').insert({
          user_id: user!.id, product_twin_id: product.id,
          type: 'warranty_expiry', title: `${name} warranty expiring`,
          due_date: new Date(warrantyExpiry).toISOString(),
        });
      }

      router.back();
      setTimeout(() => router.push(`/product/${product.id}`), 300);
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save product. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="x" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Add Product</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Photo */}
        <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
          {image ? <Image source={{ uri: image }} style={styles.productImage} /> : (
            <View style={styles.imagePlaceholder}>
              <Feather name="camera" size={28} color={Colors.textFaint} />
              <Text style={styles.imagePlaceholderText}>Add Photo</Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Category */}
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow} contentContainerStyle={{ gap: Spacing[2] }}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat.id} style={[styles.catChip, categoryId === cat.id && styles.catChipActive]} onPress={() => setCategoryId(cat.id)}>
              <Text style={[styles.catChipText, categoryId === cat.id && styles.catChipTextActive]}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Fields */}
        {[
          { label: 'Product Name *', value: name, set: setName, placeholder: 'e.g. Dyson V15 Detect' },
          { label: 'Brand', value: brand, set: setBrand, placeholder: 'e.g. Dyson' },
          { label: 'Model', value: model, set: setModel, placeholder: 'e.g. V15 Detect Absolute' },
          { label: 'Retailer / Shop', value: retailer, set: setRetailer, placeholder: 'e.g. John Lewis' },
          { label: 'Purchase Date (YYYY-MM-DD)', value: purchaseDate, set: setPurchaseDate, placeholder: format(new Date(), 'yyyy-MM-dd') },
          { label: 'Price (£)', value: price, set: setPrice, placeholder: '0.00', keyboard: 'numeric' },
          { label: 'Warranty (months)', value: warrantyMonths, set: setWarrantyMonths, placeholder: '12', keyboard: 'numeric' },
          { label: 'Notes', value: notes, set: setNotes, placeholder: 'Any notes about this product...', multi: true },
        ].map(f => (
          <View style={styles.field} key={f.label}>
            <Text style={styles.label}>{f.label}</Text>
            <TextInput
              style={[styles.input, f.multi && styles.inputMulti]}
              value={f.value} onChangeText={f.set}
              placeholder={f.placeholder} placeholderTextColor={Colors.textFaint}
              keyboardType={f.keyboard as any || 'default'}
              multiline={f.multi} numberOfLines={f.multi ? 3 : 1}
            />
          </View>
        ))}

        <ClarvoButton label="Save Product" onPress={handleSave} loading={loading} fullWidth style={styles.saveBtn} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: Spacing[5], borderBottomWidth: 1, borderBottomColor: Colors.divider },
  title: { fontSize: Typography.sizes.lg, fontWeight: Typography.weights.semibold, color: Colors.text },
  form: { padding: Spacing[5], paddingBottom: Spacing[16] },
  imageUpload: { alignSelf: 'center', marginBottom: Spacing[6] },
  productImage: { width: 120, height: 120, borderRadius: Radius.xl },
  imagePlaceholder: { width: 120, height: 120, borderRadius: Radius.xl, backgroundColor: Colors.surface, borderWidth: 2, borderColor: Colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: Spacing[2] },
  imagePlaceholderText: { fontSize: Typography.sizes.sm, color: Colors.textFaint },
  sectionLabel: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.text, marginBottom: Spacing[3] },
  categoryRow: { marginBottom: Spacing[5] },
  catChip: { paddingVertical: Spacing[2], paddingHorizontal: Spacing[4], borderRadius: Radius.full, backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  catChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  catChipText: { fontSize: Typography.sizes.sm, color: Colors.textSecondary, fontWeight: Typography.weights.medium },
  catChipTextActive: { color: Colors.black },
  field: { marginBottom: Spacing[4] },
  label: { fontSize: Typography.sizes.sm, fontWeight: Typography.weights.semibold, color: Colors.text, marginBottom: Spacing[2] },
  input: { backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing[4], fontSize: Typography.sizes.base, color: Colors.text, borderWidth: 1, borderColor: Colors.border },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  saveBtn: { marginTop: Spacing[4] },
});
