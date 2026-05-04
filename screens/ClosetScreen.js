import { useCallback, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'

const GREEN = '#1D9E75'
const BG = '#f8f7f4'
const BORDER = '#e0ddd6'

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

  useEffect(() => {
    async function fetchCloset() {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          setLoading(false)
          return
        }
        const { data, error } = await supabase
          .from('closet_items')
          .select('*, products(*)')
          .eq('user_id', session.user.id)
        if (error) throw error
        setItems(data ?? [])
      } catch {
        setItems([])
      } finally {
        setLoading(false)
      }
    }
    fetchCloset()
  }, [])

  const filtered =
    activeCategory === 'All'
      ? items
      : items.filter(
          (item) =>
            item.products?.category?.toLowerCase() ===
            activeCategory.toLowerCase()
        )

  const renderItem = useCallback(
    ({ item }) => {
      const product = item.products
      if (!product) return null
      const uri = product.image_url ?? product.image ?? null
      return (
        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate('ItemDetail', { product })}
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
    [navigation]
  )

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    )
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>My Closet</Text>

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

      {filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>
            {activeCategory === 'All'
              ? 'Your closet is empty'
              : `No ${activeCategory} yet`}
          </Text>
          <Text style={styles.emptySubtitle}>
            Swipe right on items you love
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          renderItem={renderItem}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
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
})
