import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TextInput,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'

const GREEN = '#1D9E75'
const BG = '#f8f7f4'
const BORDER = '#e0ddd6'

const SLOT_KEYS = [
  { key: 'top_product', label: 'Top' },
  { key: 'bottom_product', label: 'Bottom' },
  { key: 'shoes_product', label: 'Shoes' },
  { key: 'accessory_product', label: 'Accessory' },
]

const CATEGORIES = [
  'All',
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
]

function formatPrice(price) {
  if (price == null || price === '') return ''
  if (typeof price === 'number') {
    return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`
  }
  return String(price)
}

export default function ClosetScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [user, setUser] = useState(null)
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [outfits, setOutfits] = useState([])
  const [selectedOutfit, setSelectedOutfit] = useState(null)

  const [signupOpen, setSignupOpen] = useState(false)
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupError, setSignupError] = useState('')
  const [signupSubmitting, setSignupSubmitting] = useState(false)

  const [loginOpen, setLoginOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginSubmitting, setLoginSubmitting] = useState(false)

  async function fetchCloset() {
    setLoading(true)
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session?.user?.id) {
        setLoading(false)
        return
      }
      setUser(session.user)
      fetchOutfits(session.user.id)
      const { data, error } = await supabase
        .from('closet_items')
        .select('*, products(*)')
        .eq('user_id', session.user.id)
      if (error) throw error
      setItems(data ?? [])
    } catch (e) {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  async function fetchOutfits(uid) {
    try {
      const { data: outfitsData } = await supabase
        .from('outfits')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })

      const list = outfitsData ?? []
      const ids = [...new Set(
        list.flatMap(o => [o.top_product_id, o.bottom_product_id, o.shoes_product_id, o.accessory_product_id])
          .filter(Boolean)
      )]
      let productMap = {}
      if (ids.length > 0) {
        const { data: products } = await supabase.from('products').select('*').in('id', ids)
        productMap = Object.fromEntries((products ?? []).map(p => [p.id, p]))
      }
      setOutfits(list.map(o => ({
        ...o,
        top_product: o.top_product_id ? productMap[o.top_product_id] ?? null : null,
        bottom_product: o.bottom_product_id ? productMap[o.bottom_product_id] ?? null : null,
        shoes_product: o.shoes_product_id ? productMap[o.shoes_product_id] ?? null : null,
        accessory_product: o.accessory_product_id ? productMap[o.accessory_product_id] ?? null : null,
      })))
    } catch {
      setOutfits([])
    }
  }

  const removeItem = useCallback((itemId) => {
    Alert.alert(
      'Remove Item',
      'Remove this item from your closet?',
      [
        {
          text: 'Remove from Closet',
          style: 'destructive',
          onPress: async () => {
            await supabase.from('closet_items').delete().eq('id', itemId)
            setItems(prev => prev.filter(i => i.id !== itemId))
          },
        },
        { text: 'Cancel', style: 'cancel' },
      ]
    )
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchCloset()
    }, [])
  )

  const filtered =
    activeCategory === 'All'
      ? items
      : items.filter(
          (item) =>
            item.products?.category?.toLowerCase() ===
            activeCategory.toLowerCase()
        )

  const showAccountBanner = user != null && !user.email && !bannerDismissed

  const openSignup = useCallback(() => {
    setSignupError('')
    setSignupEmail('')
    setSignupPassword('')
    setSignupOpen(true)
  }, [])

  const openLogin = useCallback(() => {
    setLoginError('')
    setLoginEmail('')
    setLoginPassword('')
    setLoginOpen(true)
  }, [])

  const submitSignup = useCallback(async () => {
    const email = signupEmail.trim()
    const password = signupPassword
    setSignupError('')

    if (!email || !password) {
      setSignupError('Email and password are required.')
      return
    }

    setSignupSubmitting(true)
    try {
      const { error } = await supabase.auth.updateUser({ email, password })
      if (error) throw error
      setSignupOpen(false)
      Alert.alert('Account created!', 'Your closet is saved.')
      fetchCloset()
    } catch (e) {
      setSignupError(e?.message ?? 'Could not create account.')
    } finally {
      setSignupSubmitting(false)
    }
  }, [signupEmail, signupPassword])

  const submitLogin = useCallback(async () => {
    const email = loginEmail.trim()
    const password = loginPassword
    setLoginError('')

    if (!email || !password) {
      setLoginError('Email and password are required.')
      return
    }

    setLoginSubmitting(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      await fetchCloset()
      setLoginOpen(false)
    } catch (e) {
      setLoginError(e?.message ?? 'Could not log in.')
    } finally {
      setLoginSubmitting(false)
    }
  }, [loginEmail, loginPassword])

  const renderItem = useCallback(
    ({ item }) => {
      const product = item.products
      if (!product) return null
      const uri = product.image_url ?? product.image ?? null
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ItemDetail', { product })}
          onLongPress={() => removeItem(item.id)}
          activeOpacity={0.85}
        >
          <View style={styles.imageWrap}>
            {uri ? (
              <Image
                source={{ uri }}
                style={styles.image}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.placeholderText}>No image</Text>
              </View>
            )}
          </View>
          <Text style={styles.holdHint}>hold to remove</Text>
          <View style={styles.cardMeta}>
            {product.brand ? (
              <Text style={styles.brand} numberOfLines={1}>
                {product.brand}
              </Text>
            ) : null}
            <Text style={styles.name} numberOfLines={2}>
              {product.name ?? 'Untitled'}
            </Text>
            <Text style={styles.price}>{formatPrice(product.price)}</Text>
          </View>
        </TouchableOpacity>
      )
    },
    [navigation, removeItem]
  )

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    )
  }

  const listHeader = (
    <View style={{ paddingTop: insets.top + 16 }}>
      <Text style={styles.title}>My Closet</Text>

      {showAccountBanner ? (
        <View style={styles.banner}>
          <View style={styles.bannerTopRow}>
            <Text style={styles.bannerText}>
              Create an account to save your closet
            </Text>
            <TouchableOpacity
              onPress={() => setBannerDismissed(true)}
              style={styles.bannerClose}
              accessibilityLabel="Dismiss banner"
              activeOpacity={0.85}
            >
              <Text style={styles.bannerCloseText}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.bannerActions}>
            <TouchableOpacity
              onPress={openSignup}
              style={[styles.bannerBtn, styles.bannerBtnPrimary]}
              activeOpacity={0.85}
            >
              <Text style={styles.bannerBtnPrimaryText}>Sign Up</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={openLogin}
              style={[styles.bannerBtn, styles.bannerBtnSecondary]}
              activeOpacity={0.85}
            >
              <Text style={styles.bannerBtnSecondaryText}>Log In</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {outfits.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>My Outfits</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.outfitsRow}
            style={styles.outfitsScroll}
          >
            {outfits.map(outfit => (
              <TouchableOpacity
                key={outfit.id}
                style={styles.outfitCard}
                onPress={() => setSelectedOutfit(outfit)}
                activeOpacity={0.85}
              >
                <View style={styles.outfitCanvas}>
                  <View style={styles.outfitCanvasRow}>
                    {[outfit.top_product, outfit.bottom_product].map((p, i) => (
                      <View key={i} style={styles.outfitThumb}>
                        {p?.image_url
                          ? <Image source={{ uri: p.image_url }} style={styles.outfitThumbImg} resizeMode="cover" />
                          : <View style={[styles.outfitThumbImg, { backgroundColor: '#f0eeea' }]} />}
                      </View>
                    ))}
                  </View>
                  <View style={styles.outfitCanvasRow}>
                    {[outfit.shoes_product, outfit.accessory_product].map((p, i) => (
                      <View key={i} style={styles.outfitThumb}>
                        {p?.image_url
                          ? <Image source={{ uri: p.image_url }} style={styles.outfitThumbImg} resizeMode="cover" />
                          : <View style={[styles.outfitThumbImg, { backgroundColor: '#f0eeea' }]} />}
                      </View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
        style={styles.tabsRow}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.tab, activeCategory === cat && styles.activeTab]}
          >
            <Text
              style={[
                styles.tabText,
                activeCategory === cat && styles.activeTabText,
              ]}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  )

  return (
    <View style={styles.screen}>
      <FlatList
        data={filtered}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        key={activeCategory}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {activeCategory === 'All' ? 'Your closet is empty' : `No ${activeCategory} yet`}
            </Text>
            <Text style={styles.emptySubtitle}>Swipe right on items you love</Text>
          </View>
        }
      />

      <Modal
        visible={selectedOutfit != null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedOutfit(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Outfit</Text>
              <TouchableOpacity
                onPress={() => setSelectedOutfit(null)}
                style={styles.modalClose}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.outfitDetailContent} showsVerticalScrollIndicator={false}>
              {SLOT_KEYS.map(({ key, label }) => {
                const product = selectedOutfit?.[key]
                if (!product) return null
                return (
                  <View key={key} style={styles.outfitDetailItem}>
                    {product.image_url
                      ? <Image source={{ uri: product.image_url }} style={styles.outfitDetailImg} resizeMode="cover" />
                      : <View style={[styles.outfitDetailImg, { backgroundColor: '#f0eeea' }]} />}
                    <View style={styles.outfitDetailMeta}>
                      <Text style={styles.outfitDetailSlotLabel}>{label}</Text>
                      {product.brand ? <Text style={styles.outfitDetailBrand}>{product.brand}</Text> : null}
                      <Text style={styles.outfitDetailName} numberOfLines={2}>{product.name}</Text>
                      <Text style={styles.outfitDetailPrice}>{formatPrice(product.price)}</Text>
                    </View>
                  </View>
                )
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.loadBtn}
              onPress={() => {
                const outfit = selectedOutfit
                setSelectedOutfit(null)
                navigation.navigate('Outfit', { outfit })
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.loadBtnText}>Load into Builder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={signupOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSignupOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sign Up</Text>
              <TouchableOpacity
                onPress={() => setSignupOpen(false)}
                style={styles.modalClose}
                accessibilityLabel="Close sign up"
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={signupEmail}
              onChangeText={setSignupEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#888"
              style={styles.input}
            />
            <TextInput
              value={signupPassword}
              onChangeText={setSignupPassword}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              style={styles.input}
            />
            {signupError ? (
              <Text style={styles.inlineError}>{signupError}</Text>
            ) : null}

            <TouchableOpacity
              onPress={submitSignup}
              disabled={signupSubmitting}
              style={[
                styles.submitBtn,
                signupSubmitting && styles.submitBtnDisabled,
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {signupSubmitting ? 'Creating…' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={loginOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setLoginOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Log In</Text>
              <TouchableOpacity
                onPress={() => setLoginOpen(false)}
                style={styles.modalClose}
                accessibilityLabel="Close login"
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={loginEmail}
              onChangeText={setLoginEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="Email"
              placeholderTextColor="#888"
              style={styles.input}
            />
            <TextInput
              value={loginPassword}
              onChangeText={setLoginPassword}
              placeholder="Password"
              placeholderTextColor="#888"
              secureTextEntry
              style={styles.input}
            />
            {loginError ? (
              <Text style={styles.inlineError}>{loginError}</Text>
            ) : null}

            <TouchableOpacity
              onPress={submitLogin}
              disabled={loginSubmitting}
              style={[
                styles.submitBtn,
                loginSubmitting && styles.submitBtnDisabled,
              ]}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>
                {loginSubmitting ? 'Logging in…' : 'Log In'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 64,
    paddingHorizontal: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  banner: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 14,
    padding: 12,
  },
  bannerTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
    lineHeight: 20,
  },
  bannerClose: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  bannerCloseText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '700',
    marginTop: -1,
  },
  bannerActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  bannerBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerBtnPrimary: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  bannerBtnPrimaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  bannerBtnSecondary: {
    backgroundColor: '#fff',
    borderColor: BORDER,
  },
  bannerBtnSecondaryText: {
    color: '#1a1a1a',
    fontWeight: '700',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  outfitsScroll: { marginBottom: 12 },
  outfitsRow: { paddingHorizontal: 16, gap: 10 },
  outfitCard: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  outfitCanvas: { flex: 1, padding: 5, gap: 4 },
  outfitCanvasRow: { flex: 1, flexDirection: 'row', gap: 4 },
  outfitThumb: { flex: 1, borderRadius: 6, overflow: 'hidden' },
  outfitThumbImg: { width: '100%', height: '100%' },
  outfitDetailContent: { paddingHorizontal: 16, paddingTop: 12, gap: 10 },
  outfitDetailItem: {
    flexDirection: 'row',
    backgroundColor: BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  outfitDetailImg: { width: 90, height: 110 },
  outfitDetailMeta: { flex: 1, padding: 10, justifyContent: 'center' },
  outfitDetailSlotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  outfitDetailBrand: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 2 },
  outfitDetailName: { fontSize: 13, fontWeight: '600', color: '#1a1a1a', marginBottom: 3 },
  outfitDetailPrice: { fontSize: 12, fontWeight: '500', color: '#555' },
  loadBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
  },
  loadBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  tabsRow: {
    flexGrow: 0,
  },
  tabs: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#fff',
  },
  activeTab: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  tabText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#fff',
  },
  grid: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
  row: {
    gap: 12,
    marginBottom: 12,
  },
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: BORDER,
  },
  imageWrap: {
    width: '100%',
    aspectRatio: 3 / 4,
    backgroundColor: '#f0eeea',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 13,
  },
  holdHint: {
    fontSize: 10,
    color: '#aaa',
    textAlign: 'center',
    paddingVertical: 3,
  },
  cardMeta: {
    padding: 10,
  },
  brand: {
    fontSize: 11,
    color: GREEN,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  name: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  price: {
    fontSize: 13,
    fontWeight: '500',
    color: '#555',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    padding: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  modalCloseText: {
    fontSize: 14,
    color: '#444',
    fontWeight: '700',
    marginTop: -1,
  },
  input: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#1a1a1a',
    backgroundColor: '#fff',
    marginTop: 10,
  },
  inlineError: {
    marginTop: 10,
    color: '#b00020',
    fontSize: 13,
    fontWeight: '600',
  },
  submitBtn: {
    marginTop: 14,
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
})
