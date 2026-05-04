import { useEffect, useMemo, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { supabase } from '../lib/supabase'

const BG = '#f8f7f4'
const GREEN = '#1D9E75'
const BORDER = '#e0ddd6'
const CARD_BG = '#ffffff'

const TABS = [
  { key: 'Tops', label: 'Tops' },
  { key: 'Bottoms', label: 'Bottoms' },
  { key: 'Outerwear', label: 'Outerwear' },
  { key: 'Footwear', label: 'Footwear' },
]

function productImageUri(product) {
  return (
    product?.image_url ??
    product?.image ??
    product?.photo_url ??
    product?.thumbnail_url ??
    null
  )
}

function formatPrice(price) {
  if (price == null || price === '') return ''
  if (typeof price === 'number') {
    return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`
  }
  return String(price)
}

function productCategory(product) {
  const raw =
    product?.category ??
    product?.product_category ??
    product?.type ??
    product?.product_type ??
    product?.category_name ??
    null
  return raw ? String(raw).trim() : ''
}

export default function ClosetScreen() {
  const [activeTab, setActiveTab] = useState(TABS[0].key)
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])

  useEffect(() => {
    let cancelled = false

    async function fetchCloset() {
      setLoading(true)
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        const userId = session?.user?.id

        if (!userId) {
          if (!cancelled) setItems([])
          return
        }

        const { data, error } = await supabase
          .from('closet_items')
          .select('*, products(*)')
          .eq('user_id', userId)

        if (error) throw error

        const normalized = (data ?? [])
          .map((row) => ({
            closetItem: row,
            product: row?.products ?? null,
          }))
          .filter((x) => x.product)

        if (!cancelled) setItems(normalized)
      } catch (e) {
        if (!cancelled) setItems([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchCloset()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    const tab = String(activeTab).toLowerCase()
    return items.filter(({ product }) => {
      const cat = productCategory(product).toLowerCase()
      return cat === tab
    })
  }, [items, activeTab])

  const renderItem = ({ item }) => {
    const product = item.product
    const uri = productImageUri(product)
    return (
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
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
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <View style={styles.tabsRow}>
        {TABS.map((tab) => {
          const active = tab.key === activeTab
          return (
            <Pressable
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={styles.tabBtn}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextInactive]}>
                {tab.label}
              </Text>
              <View style={[styles.tabUnderline, active ? styles.tabUnderlineActive : null]} />
            </Pressable>
          )
        })}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={GREEN} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No {activeTab} saved yet</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(x) => String(x.closetItem?.id ?? x.product?.id)}
          renderItem={renderItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrap}
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
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 14,
    gap: 10,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#222',
  },
  tabTextInactive: {
    color: '#888',
  },
  tabUnderline: {
    marginTop: 8,
    height: 2,
    width: '100%',
    backgroundColor: 'transparent',
  },
  tabUnderlineActive: {
    backgroundColor: GREEN,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 18,
  },
  columnWrap: {
    gap: 12,
  },
  card: {
    flex: 1,
    height: 260,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  imageWrap: {
    flex: 2,
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
    fontSize: 15,
  },
  cardMeta: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
})

