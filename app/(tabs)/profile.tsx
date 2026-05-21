import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
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

import { ProductCard } from '@/components/product-card';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/auth';
import { MOCK_PRODUCTS } from '@/mocks/products';
import { Product } from '@/types';

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
  const favourites = MOCK_PRODUCTS.filter(p => p.isLiked);

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

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.accent,
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 8,
    gap: 5,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 3,
    borderColor: Colors.primary,
    overflow: 'hidden',
    marginBottom: 4,
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  joinedText: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginVertical: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    gap: 2,
  },
  statDivider: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 0,
  },
  gridItem: {
    flex: 1,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 40,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 11,
    borderRadius: 10,
  },
  ctaBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  orderThumb: {
    width: 64,
    height: 64,
    borderRadius: 10,
    flexShrink: 0,
  },
  orderInfo: {
    flex: 1,
    gap: 3,
  },
  orderTitle: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text,
    lineHeight: 18,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
  },
  orderDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  statusBadge: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexShrink: 0,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  changeAvatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  changeAvatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.border,
  },
  changeAvatar: {
    width: '100%',
    height: '100%',
  },
  changeAvatarBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  changeAvatarText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  fieldHint: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 4,
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
  inputDisabled: {
    color: Colors.textSecondary,
  },
  saveBtn: {
    marginTop: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});
