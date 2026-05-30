import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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

import { ProductCard } from '@/components/product-card';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { useLikes } from '@/context/likes';
import { productApi, authApi } from '@/services/api';
import { uploadImage } from '@/services/supabase';
import { ApiOrder, ApiProductSummary } from '@/types/api';
import { Product } from '@/types';
import { styles } from './profile-styles';

type Tab = 'listings' | 'favourites' | 'orders' | 'edit';

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'listings',   label: 'Listings',    icon: 'grid-outline' },
  { key: 'favourites', label: 'Favourites',  icon: 'heart-outline' },
  { key: 'orders',     label: 'Orders',      icon: 'bag-outline' },
  { key: 'edit',       label: 'Edit Profile', icon: 'pencil-outline' },
];

function summaryToProduct(p: ApiProductSummary): Product {
  return {
    id: String(p.id),
    title: p.name,
    description: '',
    price: Number(p.price),
    images: p.thumbnailUrl ? [p.thumbnailUrl] : [],
    category: { id: String(p.categoryId), name: '', icon: 'grid-outline' },
    seller: { id: '', name: '', email: '' },
    location: p.region ?? '',
    createdAt: new Date().toISOString(),
    isLiked: false,
    views: 0,
  };
}

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const { likedIds } = useLikes();

  const [myListings, setMyListings] = useState<Product[]>([]);
  const [favourites, setFavourites] = useState<Product[]>([]);
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingFavourites, setLoadingFavourites] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [editName, setEditName] = useState(user?.name ?? '');
  const [editLocation, setEditLocation] = useState(user?.location ?? '');
  const [saving, setSaving] = useState(false);

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      setActiveTab('listings');
    }, [])
  );

  useEffect(() => {
    if (!user) return;
    const userId = Number(user.id);
    productApi.getListedProducts(userId).then(data => setMyListings(data.map(summaryToProduct))).catch(() => {}).finally(() => setLoadingListings(false));
    productApi.getFavorites(userId).then(data => setFavourites(data.map(summaryToProduct))).catch(() => {}).finally(() => setLoadingFavourites(false));
    productApi.getOrders(userId).then(setOrders).catch(() => {}).finally(() => setLoadingOrders(false));
  }, [user?.id]);

  useEffect(() => {
    setEditName(user?.name ?? '');
    setEditLocation(user?.location ?? '');
  }, [user]);

  async function handleSaveProfile() {
    if (!editName.trim()) { Alert.alert('Name is required'); return; }
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        name: editName.trim(),
        location: editLocation.trim() || undefined,
      });
      updateUser({ name: updated.name, location: updated.location ?? undefined });
      Alert.alert('Saved', 'Your profile has been updated.');
    } catch {
      Alert.alert('Error', 'Failed to save profile.');
    } finally {
      setSaving(false);
    }
  }

  async function handleChangeAvatar() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets.length || !user) return;
    setSaving(true);
    try {
      const path = `avatars/${user.id}.jpg`;
      const url = await uploadImage(result.assets[0].uri, path);
      const updated = await authApi.updateProfile({ avatarUrl: url });
      updateUser({ avatar: updated.avatarUrl ?? undefined });
    } catch {
      Alert.alert('Error', 'Failed to update avatar.');
    } finally {
      setSaving(false);
    }
  }

  function renderProductGrid(products: Product[]) {
    if (products.length === 0) return null;
    const rows: Product[][] = [];
    for (let i = 0; i < products.length; i += 2) rows.push(products.slice(i, i + 2));
    return rows.map((row, i) => (
      <View key={i} style={styles.gridRow}>
        {row.map(item => (
          <View key={item.id} style={styles.gridItem}>
            <ProductCard product={item} onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })} />
          </View>
        ))}
        {row.length === 1 && <View style={styles.gridItem} />}
      </View>
    ));
  }

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        {/* ── Top bar ── */}
        <View style={styles.topBar}>
          <Text style={styles.screenTitle}>Profile</Text>
          <TouchableOpacity style={styles.logoutBtn} onPress={logout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={18} color={Colors.accent} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* ── Avatar + name ── */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            <Image source={{ uri: user?.avatar }} style={styles.avatar} contentFit="cover" />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          {user?.location ? (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.locationText}>{user.location}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={styles.statValue}>{myListings.length}</Text>
            <Text style={styles.statLabel}>Listings</Text>
          </View>
          <View style={[styles.statItem, styles.statDivider]}>
            <Text style={styles.statValue}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{favourites.length}</Text>
            <Text style={styles.statLabel}>Saved</Text>
          </View>
        </View>

        {/* ── Tab bar ── */}
        <View style={styles.tabBar}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity key={tab.key} style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)} activeOpacity={0.7}>
                <Ionicons name={tab.icon as any} size={18} color={active ? Colors.primary : Colors.textSecondary} />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Listings */}
        {activeTab === 'listings' && (
          <View style={styles.tabContent}>
            {loadingListings ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
            ) : myListings.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="pricetag-outline" size={40} color={Colors.border} />
                <Text style={styles.emptyTitle}>No listings yet</Text>
                <Text style={styles.emptySubtext}>Tap the + button to list your first item.</Text>
                <TouchableOpacity style={styles.ctaBtn} onPress={() => router.push('/(tabs)/sell')} activeOpacity={0.85}>
                  <Text style={styles.ctaBtnText}>List an Item</Text>
                </TouchableOpacity>
              </View>
            ) : renderProductGrid(myListings)}
          </View>
        )}

        {/* Favourites */}
        {activeTab === 'favourites' && (
          <View style={styles.tabContent}>
            {loadingFavourites ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
            ) : favourites.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="heart-outline" size={40} color={Colors.border} />
                <Text style={styles.emptyTitle}>No favourites yet</Text>
                <Text style={styles.emptySubtext}>Tap the heart on any item to save it here.</Text>
              </View>
            ) : renderProductGrid(favourites)}
          </View>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            {loadingOrders ? (
              <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 32 }} />
            ) : orders.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="bag-outline" size={40} color={Colors.border} />
                <Text style={styles.emptyTitle}>No orders yet</Text>
                <Text style={styles.emptySubtext}>Items you buy will appear here.</Text>
              </View>
            ) : orders.map(order => (
              <TouchableOpacity key={order.id} style={styles.orderRow} activeOpacity={0.75}
                onPress={() => router.push({ pathname: '/product/[id]', params: { id: String(order.productId) } })}>
                <View style={[styles.orderThumb, { backgroundColor: Colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="bag-outline" size={24} color={Colors.textSecondary} />
                </View>
                <View style={styles.orderInfo}>
                  <Text style={styles.orderTitle} numberOfLines={2}>{order.productName}</Text>
                  <Text style={styles.orderDate}>
                    {new Date(order.orderedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    Alert.alert('Cancel Order', 'Are you sure?', [
                      { text: 'No' },
                      { text: 'Yes', style: 'destructive', onPress: () => {
                        productApi.cancelOrder(order.id)
                          .then(() => setOrders(prev => prev.filter(o => o.id !== order.id)))
                          .catch(() => Alert.alert('Error', 'Could not cancel order.'));
                      }},
                    ]);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle-outline" size={22} color={Colors.accent} />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Edit Profile */}
        {activeTab === 'edit' && (
          <View style={styles.tabContent}>
            <View style={styles.changeAvatarRow}>
              <View style={styles.changeAvatarWrap}>
                <Image source={{ uri: user?.avatar }} style={styles.changeAvatar} contentFit="cover" />
              </View>
              <TouchableOpacity style={styles.changeAvatarBtn} activeOpacity={0.8} onPress={handleChangeAvatar}>
                <Ionicons name="camera-outline" size={16} color={Colors.primary} />
                <Text style={styles.changeAvatarText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput style={styles.input} value={editName} onChangeText={setEditName}
                placeholder="Your name" placeholderTextColor="#9CA3AF" maxLength={60} />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput style={styles.input} value={editLocation} onChangeText={setEditLocation}
                placeholder="City, Country" placeholderTextColor="#9CA3AF" maxLength={60} />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput style={[styles.input, styles.inputDisabled]} value={user?.email} editable={false} />
              <Text style={styles.fieldHint}>Email cannot be changed here.</Text>
            </View>

            <TouchableOpacity style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSaveProfile} activeOpacity={0.85} disabled={saving}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Save Changes</Text>}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
