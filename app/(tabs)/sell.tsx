import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { MOCK_CATEGORIES } from '@/mocks/categories';
import { ProductCondition } from '@/types';

const CONDITIONS: { value: ProductCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
];

const PLACEHOLDER_SEEDS = [101, 202, 303, 404, 505];

export default function SellScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [photos, setPhotos] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState<ProductCondition | null>(null);
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleAddPhoto() {
    if (photos.length >= 5) return;
    // TODO: replace with expo-image-picker — ImagePicker.launchImageLibraryAsync(...)
    const seed = PLACEHOLDER_SEEDS[photos.length];
    setPhotos(prev => [...prev, `https://picsum.photos/seed/${seed}/400/400`]);
  }

  function handleRemovePhoto(index: number) {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  }

  function validate(): string | null {
    if (photos.length === 0) return 'Add at least one photo.';
    if (!title.trim()) return 'Title is required.';
    if (!price.trim() || isNaN(Number(price)) || Number(price) <= 0)
      return 'Enter a valid price.';
    if (!condition) return 'Select a condition.';
    if (!categoryId) return 'Select a category.';
    if (!location.trim()) return 'Location is required.';
    return null;
  }

  async function handleSubmit() {
    const error = validate();
    if (error) {
      Alert.alert('Missing info', error);
      return;
    }

    setSubmitting(true);

    // TODO: replace with POST /api/products
    // Body: { title, description, price: Number(price), images: photos,
    //         categoryId, condition, location, sellerId: user?.id }
    await new Promise(r => setTimeout(r, 900));

    setSubmitting(false);

    Alert.alert('Listed!', 'Your item has been posted.', [
      {
        text: 'View Home',
        onPress: () => {
          resetForm();
          router.push('/(tabs)');
        },
      },
      { text: 'List Another', onPress: resetForm },
    ]);
  }

  function resetForm() {
    setPhotos([]);
    setTitle('');
    setDescription('');
    setPrice('');
    setCondition(null);
    setCategoryId(null);
    setLocation('');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* Header */}
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
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosRow}
        >
          {photos.map((uri, i) => (
            <View key={i} style={styles.photoThumb}>
              <Image source={{ uri }} style={styles.photoImg} contentFit="cover" />
              {i === 0 && (
                <View style={styles.coverBadge}>
                  <Text style={styles.coverBadgeText}>Cover</Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.removePhoto}
                onPress={() => handleRemovePhoto(i)}
                activeOpacity={0.8}
              >
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
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Nike Air Max 90"
            placeholderTextColor="#9CA3AF"
            maxLength={80}
          />
        </View>

        <View style={styles.field}>
          <View style={styles.fieldLabelRow}>
            <Text style={styles.fieldLabel}>Description</Text>
            <Text style={styles.charCount}>{description.length} / 500</Text>
          </View>
          <TextInput
            style={[styles.input, styles.inputMultiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe the item — size, colour, any defects…"
            placeholderTextColor="#9CA3AF"
            multiline
            maxLength={500}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.fieldLabel, { marginBottom: 6 }]}>Price</Text>
          <View style={styles.priceRow}>
            <View style={styles.pricePrefix}>
              <Text style={styles.pricePrefixText}>$</Text>
            </View>
            <TextInput
              style={[styles.input, styles.priceInput]}
              value={price}
              onChangeText={setPrice}
              placeholder="0.00"
              placeholderTextColor="#9CA3AF"
              keyboardType="decimal-pad"
              maxLength={10}
            />
          </View>
        </View>

        {/* Condition */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Condition</Text>
        <View style={styles.pillsRow}>
          {CONDITIONS.map(c => {
            const active = condition === c.value;
            return (
              <TouchableOpacity
                key={c.value}
                style={[styles.pill, active && styles.pillActive]}
                onPress={() => setCondition(c.value)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>
                  {c.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Category */}
        <Text style={[styles.sectionLabel, { marginTop: 24 }]}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesRow}
        >
          {MOCK_CATEGORIES.map(cat => {
            const active = categoryId === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryPill, active && styles.categoryPillActive]}
                onPress={() => setCategoryId(cat.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={active ? '#fff' : Colors.textSecondary}
                />
                <Text style={[styles.categoryPillText, active && styles.categoryPillTextActive]}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Location */}
        <View style={[styles.field, { marginTop: 24 }]}>
          <Text style={[styles.fieldLabel, { marginBottom: 6 }]}>Location</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Baku, Azerbaijan"
            placeholderTextColor="#9CA3AF"
            maxLength={60}
          />
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>List Item</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  photoCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  sectionHint: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  photosRow: {
    gap: 10,
    paddingVertical: 4,
  },
  photoThumb: {
    width: 90,
    height: 90,
    borderRadius: 10,
    overflow: 'hidden',
  },
  photoImg: {
    width: '100%',
    height: '100%',
  },
  coverBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 3,
    alignItems: 'center',
  },
  coverBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#fff',
  },
  removePhoto: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPhoto: {
    width: 90,
    height: 90,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: Colors.secondary,
  },
  addPhotoText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pricePrefix: {
    height: 46,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRightWidth: 0,
    borderColor: Colors.border,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pricePrefixText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  priceInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.secondary,
  },
  inputMultiline: {
    height: 100,
    paddingTop: 11,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  pillActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  categoriesRow: {
    gap: 8,
    paddingVertical: 4,
    marginTop: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: '#fff',
  },
  categoryPillActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryPillTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 28,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});
