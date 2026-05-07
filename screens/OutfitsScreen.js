import { useCallback, useState } from 'react'
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'

const GREEN = '#1D9E75'
const BG = '#f8f7f4'
const BORDER = '#e0ddd6'
const CARD_BG = '#ffffff'

const SLOT_KEYS = [
  { key: 'top_product', label: 'Top' },
  { key: 'bottom_product', label: 'Bottom' },
  { key: 'shoes_product', label: 'Shoes' },
  { key: 'accessory_product', label: 'Accessory' },
]

function formatPrice(price) {
  if (price == null || price === '') return ''
  if (typeof price === 'number') {
    return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`
  }
  return String(price)
}

function OutfitCanvas({ outfit }) {
  const products = [
    outfit.top_product,
    outfit.bottom_product,
    outfit.shoes_product,
    outfit.accessory_product,
  ]
  return (
    <View style={styles.canvas}>
      <View style={styles.canvasRow}>
        {products.slice(0, 2).map((p, i) => (
          <View key={i} style={styles.canvasThumb}>
            {p?.image_url ? (
              <Image source={{ uri: p.image_url }} style={styles.canvasThumbImg} resizeMode="cover" />
            ) : (
              <View style={[styles.canvasThumbImg, styles.canvasThumbEmpty]} />
            )}
          </View>
        ))}
      </View>
      <View style={styles.canvasRow}>
        {products.slice(2, 4).map((p, i) => (
          <View key={i} style={styles.canvasThumb}>
            {p?.image_url ? (
              <Image source={{ uri: p.image_url }} style={styles.canvasThumbImg} resizeMode="cover" />
            ) : (
              <View style={[styles.canvasThumbImg, styles.canvasThumbEmpty]} />
            )}
          </View>
        ))}
      </View>
    </View>
  )
}

export default function OutfitsScreen({ navigation }) {
  const insets = useSafeAreaInsets()
  const [outfits, setOutfits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useFocusEffect(
    useCallback(() => {
      async function load() {
        setLoading(true)
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (!session?.user?.id) { setLoading(false); return }

          const { data: outfitsData } = await supabase
            .from('outfits')
            .select('*')
            .eq('user_id', session.user.id)
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
        } finally {
          setLoading(false)
        }
      }
      load()
    }, [])
  )

  if (loading) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    )
  }

  if (outfits.length === 0) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.emptyTitle}>No outfits yet</Text>
        <Text style={styles.emptySubtitle}>Build your first outfit in the Outfit tab</Text>
        <TouchableOpacity
          style={styles.buildBtn}
          onPress={() => navigation.navigate('Outfit')}
          activeOpacity={0.85}
        >
          <Text style={styles.buildBtnText}>Build Outfit</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <Text style={styles.title}>My Outfits</Text>

      <FlatList
        data={outfits}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.outfitCard}
            onPress={() => setSelected(item)}
            activeOpacity={0.88}
          >
            <OutfitCanvas outfit={item} />
          </TouchableOpacity>
        )}
      />

      <Modal
        visible={selected != null}
        transparent
        animationType="slide"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Outfit</Text>
              <TouchableOpacity
                onPress={() => setSelected(null)}
                style={styles.modalClose}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={styles.detailContent}
              showsVerticalScrollIndicator={false}
            >
              {SLOT_KEYS.map(({ key, label }) => {
                const product = selected?.[key]
                if (!product) return null
                return (
                  <View key={key} style={styles.detailItem}>
                    {product.image_url ? (
                      <Image
                        source={{ uri: product.image_url }}
                        style={styles.detailImg}
                        resizeMode="cover"
                      />
                    ) : (
                      <View style={[styles.detailImg, { backgroundColor: '#f0eeea' }]} />
                    )}
                    <View style={styles.detailMeta}>
                      <Text style={styles.detailSlotLabel}>{label}</Text>
                      {product.brand ? (
                        <Text style={styles.detailBrand}>{product.brand}</Text>
                      ) : null}
                      <Text style={styles.detailName} numberOfLines={2}>{product.name}</Text>
                      <Text style={styles.detailPrice}>{formatPrice(product.price)}</Text>
                    </View>
                  </View>
                )
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.loadBtn}
              onPress={() => {
                const outfit = selected
                setSelected(null)
                navigation.navigate('Outfit', { outfit })
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.loadBtnText}>Load into Builder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: BG, paddingHorizontal: 32 },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 16,
    paddingBottom: 12,
  },

  grid: { paddingHorizontal: 12, paddingBottom: 32 },
  row: { gap: 10, marginBottom: 10 },

  outfitCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },

  canvas: { padding: 6, gap: 4 },
  canvasRow: { flexDirection: 'row', gap: 4, marginBottom: 0 },
  canvasThumb: { flex: 1, aspectRatio: 3 / 4, borderRadius: 8, overflow: 'hidden' },
  canvasThumbImg: { width: '100%', height: '100%' },
  canvasThumbEmpty: { backgroundColor: '#f0eeea' },

  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#222', textAlign: 'center', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24 },
  buildBtn: { backgroundColor: GREEN, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 28 },
  buildBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 36,
  },
  modalHandle: {
    width: 36,
    height: 4,
    backgroundColor: BORDER,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalClose: {
    width: 32, height: 32, borderRadius: 16,
    borderWidth: 1, borderColor: BORDER,
    alignItems: 'center', justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: '#444', fontWeight: '700', marginTop: -1 },

  detailContent: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  detailItem: {
    flexDirection: 'row',
    backgroundColor: BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  detailImg: { width: 90, height: 110 },
  detailMeta: { flex: 1, padding: 12, justifyContent: 'center' },
  detailSlotLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  detailBrand: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 2 },
  detailName: { fontSize: 14, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  detailPrice: { fontSize: 13, fontWeight: '500', color: '#555' },

  loadBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  loadBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
})
