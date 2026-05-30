import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { getCategoryIcon, productApi } from '@/services/api';
import { uploadImage } from '@/services/supabase';
import { Category } from '@/types';
import { styles } from './sell-styles';

export default function SellScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    productApi.getCategories().then(data => {
      setCategories(data.map(c => ({ id: String(c.id), name: c.name, icon: getCategoryIcon(c.name) })));
    }).catch(() => {});
  }, []);

  async function handleAddPhoto() {
    if (photos.length >= 5) return;
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library to add photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets.length > 0) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  }

  function handleRemovePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }

  function validate(): string | null {
    if (!title.trim()) return 'Title is required.';
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0) return 'Enter a valid price.';
    if (!categoryId) return 'Select a category.';
    if (!location.trim()) return 'Location is required.';
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) { Alert.alert('Missing info', error); return; }
    if (!user) return;

    setSubmitting(true);
    try {
      const timestamp = Date.now();
      const imageUrls: string[] = [];
      for (let i = 0; i < photos.length; i++) {
        const path = `products/${user.id}_${timestamp}/${i}.jpg`;
        const url = await uploadImage(photos[i], path);
        imageUrls.push(url);
      }

      await productApi.createProduct({
        name: title.trim(),
        description: description.trim() || undefined,
        price: Number(price),
        categoryId: Number(categoryId),
        region: location.trim(),
        imageUrls,
      });

      Alert.alert('Listed!', 'Your item has been posted.', [
        { text: 'View Home', onPress: () => { resetForm(); router.push('/(tabs)'); } },
        { text: 'List Another', onPress: resetForm },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create listing. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setPhotos([]);
    setTitle('');
    setDescription('');
    setPrice('');
    setCategoryId(null);
    setLocation('');
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>List an Item</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Photos */}
        <View style={styles.sectionRow}>
          <Text style={styles.sectionLabel}>Photos</Text>
          <Text style={styles.photoCount}>{photos.length} / 5</Text>
        </View>
        <Text style={styles.sectionHint}>Up to 5 photos · first photo is the cover</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
          {photos.map((uri, i) => (
            <View key={i} style={styles.photoThumb}>
              <Image source={{ uri }} style={styles.photoImg} contentFit="cover" />
              {i === 0 && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>Cover</Text>
                </View>
              )}
              <TouchableOpacity style={styles.removePhoto} onPress={() => handleRemovePhoto(i)} activeOpacity={0.8}>
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
          {photos.length < 5 && (
            <TouchableOpacity style={styles.addPhoto} onPress={handleAddPhoto} activeOpacity={0.7}>
              <Ionicons name="camera-outline" size={24} color={Colors.textSecondary} />
              <Text style={styles.addPhotoText}>Add</Text>
            </TouchableOpacity>
          )}
        </ScrollView>

        {/* Details */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Details</Text>

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { marginBottom: 6 }]}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle}
            placeholder="e.g. Nike Air Max 90" placeholderTextColor="#9CA3AF" maxLength={80} />
        </View>

        <View style={styles.field}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>Description</Text>
            <Text style={styles.charCount}>{description.length} / 500</Text>
          </View>
          <TextInput style={[styles.input, styles.inputMultiline]} value={description}
            onChangeText={setDescription} placeholder="Describe the item…"
            placeholderTextColor="#9CA3AF" multiline maxLength={500} textAlignVertical="top" />
        </View>

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { marginBottom: 6 }]}>Price</Text>
          <View style={styles.priceRow}>
            <View style={styles.pricePrefix}><Text style={styles.pricePrefixText}>$</Text></View>
            <TextInput style={[styles.input, styles.priceInput]} value={price} onChangeText={setPrice}
              placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="decimal-pad" maxLength={10} />
          </View>
        </View>

        {/* Category */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesRow}>
          {categories.map(cat => {
            const active = categoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                onPress={() => setCategoryId(cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons name={cat.icon as any} size={16} color={active ? '#fff' : Colors.textSecondary} />
                <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Location */}
        <View style={[styles.field, { marginTop: 24 }]}>
          <Text style={[styles.fieldLabel, { marginBottom: 6 }]}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation}
            placeholder="e.g. Baku, Azerbaijan" placeholderTextColor="#9CA3AF" maxLength={60} />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit} activeOpacity={0.85} disabled={submitting}
        >
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>List Item</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
