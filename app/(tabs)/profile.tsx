import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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
import { MOCK_PRODUCTS } from '@/mocks/products';
import { Product } from '@/types';
import { styles } from './profile-styles';

type Tab = 'listings' | 'favourites' | 'orders' | 'edit';

type Order = {
  id: string;
  product: Product;
  purchasedAt: string;
  status: 'Delivered' | 'In Transit' | 'Pending';
};

// TODO: replace with GET /api/orders?buyerId={user.id}
const MOCK_ORDERS: Order[] = [
  { id: 'o1', product: MOCK_PRODUCTS[1], purchasedAt: '2024-05-10', status: 'Delivered' },
  { id: 'o2', product: MOCK_PRODUCTS[4], purchasedAt: '2024-05-14', status: 'In Transit' },
];

const ORDER_STATUS_COLOR: Record<Order['status'], string> = {
  Delivered: Colors.success,
  'In Transit': Colors.warning,
  Pending: Colors.textSecondary,
};

const TABS: { key: Tab; label: string; icon: string }[] = [
  { key: 'listings',   label: 'Listings',    icon: 'grid-outline' },
  { key: 'favourites', label: 'Favourites',  icon: 'heart-outline' },
  { key: 'orders',     label: 'Orders',      icon: 'bag-outline' },
  { key: 'edit',       label: 'Edit Profile', icon: 'pencil-outline' },
];

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  const [activeTab, setActiveTab] = useState<Tab>('listings');
  const { likedIds } = useLikes();

  useFocusEffect(
    useCallback(() => {
      scrollRef.current?.scrollTo({ y: 0, animated: false });
      setActiveTab('listings');
    }, [])
  );

  // Edit profile form state
  const [editName, setEditName] = useState(user?.name ?? '');
  const [editLocation, setEditLocation] = useState(user?.location ?? '');
  const [saving, setSaving] = useState(false);

  // TODO: replace with GET /api/products?sellerId={user.id}
  const myListings = MOCK_PRODUCTS.filter(p => p.seller.id === user?.id);

  // TODO: replace with GET /api/products/liked?userId={user.id}
  const favourites = MOCK_PRODUCTS.filter(p => likedIds.has(p.id));

  const stats = [
    { label: 'Listings', value: myListings.length },
    { label: 'Sales',    value: user?.totalSales ?? 0 },
    { label: 'Rating',   value: user?.rating.toFixed(1) ?? '—' },
  ];

  async function handleSaveProfile() {
    if (!editName.trim()) {
      Alert.alert('Name is required');
      return;
    }
    setSaving(true);
    // TODO: replace with PUT /api/users/{user.id}  body: { name: editName, location: editLocation }
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
    Alert.alert('Saved', 'Your profile has been updated.');
  }

  function renderProductGrid(products: Product[]) {
    if (products.length === 0) return null;
    const rows: Product[][] = [];
    for (let i = 0; i < products.length; i += 2) {
      rows.push(products.slice(i, i + 2));
    }
    return rows.map((row, i) => (
      <View key={i} style={styles.gridRow}>
        {row.map(item => (
          <View key={item.id} style={styles.gridItem}>
            <ProductCard
              product={item}
              onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id } })}
            />
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
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.locationText}>{user?.location}</Text>
          </View>
          <Text style={styles.joinedText}>
            Member since {new Date(user?.joinedAt ?? '').getFullYear()}
          </Text>
        </View>

        {/* ── Stats ── */}
        <View style={styles.statsRow}>
          {stats.map((s, i) => (
            <View key={s.label} style={[styles.statItem, i < stats.length - 1 && styles.statDivider]}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Tab bar ── */}
        <View style={styles.tabBar}>
          {TABS.map(tab => {
            const active = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tab, active && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={18}
                  color={active ? Colors.primary : Colors.textSecondary}
                />
                <Text style={[styles.tabText, active && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Tab content ── */}

        {/* Listings */}
        {activeTab === 'listings' && (
          <View style={styles.tabContent}>
            {myListings.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="pricetag-outline" size={40} color={Colors.border} />
                <Text style={styles.emptyTitle}>No listings yet</Text>
                <Text style={styles.emptySubtext}>Tap the + button to list your first item.</Text>
                <TouchableOpacity
                  style={styles.ctaBtn}
                  onPress={() => router.push('/(tabs)/sell')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.ctaBtnText}>List an Item</Text>
                </TouchableOpacity>
              </View>
            ) : (
              renderProductGrid(myListings)
            )}
          </View>
        )}

        {/* Favourites */}
        {activeTab === 'favourites' && (
          <View style={styles.tabContent}>
            {favourites.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="heart-outline" size={40} color={Colors.border} />
                <Text style={styles.emptyTitle}>No favourites yet</Text>
                <Text style={styles.emptySubtext}>
                  Tap the heart on any item to save it here.
                </Text>
              </View>
            ) : (
              renderProductGrid(favourites)
            )}
          </View>
        )}

        {/* Orders */}
        {activeTab === 'orders' && (
          <View style={styles.tabContent}>
            {MOCK_ORDERS.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="bag-outline" size={40} color={Colors.border} />
                <Text style={styles.emptyTitle}>No orders yet</Text>
                <Text style={styles.emptySubtext}>Items you buy will appear here.</Text>
              </View>
            ) : (
              MOCK_ORDERS.map(order => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderRow}
                  activeOpacity={0.75}
                  onPress={() =>
                    router.push({ pathname: '/product/[id]', params: { id: order.product.id } })
                  }
                >
                  <Image
                    source={{ uri: order.product.images[0] }}
                    style={styles.orderThumb}
                    contentFit="cover"
                  />
                  <View style={styles.orderInfo}>
                    <Text style={styles.orderTitle} numberOfLines={2}>
                      {order.product.title}
                    </Text>
                    <Text style={styles.orderPrice}>${order.product.price}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.purchasedAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { borderColor: ORDER_STATUS_COLOR[order.status] }]}>
                    <Text style={[styles.statusText, { color: ORDER_STATUS_COLOR[order.status] }]}>
                      {order.status}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>
        )}

        {/* Edit Profile */}
        {activeTab === 'edit' && (
          <View style={styles.tabContent}>

            {/* Change avatar */}
            <View style={styles.changeAvatarRow}>
              <View style={styles.changeAvatarWrap}>
                <Image source={{ uri: user?.avatar }} style={styles.changeAvatar} contentFit="cover" />
              </View>
              <TouchableOpacity
                style={styles.changeAvatarBtn}
                activeOpacity={0.8}
                onPress={() => {
                  // TODO: replace with expo-image-picker
                  // const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: 'images', allowsEditing: true, aspect: [1,1] });
                  // if (!result.canceled) uploadAvatar(result.assets[0].uri);
                  Alert.alert('Coming soon', 'Avatar upload will be available once the backend is connected.');
                }}
              >
                <Ionicons name="camera-outline" size={16} color={Colors.primary} />
                <Text style={styles.changeAvatarText}>Change Photo</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Name</Text>
              <TextInput
                style={styles.input}
                value={editName}
                onChangeText={setEditName}
                placeholder="Your name"
                placeholderTextColor="#9CA3AF"
                maxLength={60}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={editLocation}
                onChangeText={setEditLocation}
                placeholder="City, Country"
                placeholderTextColor="#9CA3AF"
                maxLength={60}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user?.email}
                editable={false}
              />
              <Text style={styles.fieldHint}>Email cannot be changed here.</Text>
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
              onPress={handleSaveProfile}
              activeOpacity={0.85}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}
