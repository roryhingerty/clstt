import { useCallback, useEffect, useState } from 'react'
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
  View,
} from 'react-native'
import Svg, { Circle, Path } from 'react-native-svg'
import { useFocusEffect } from '@react-navigation/native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { supabase } from '../lib/supabase'

const GREEN = '#1D9E75'
const BG = '#f8f7f4'
const BORDER = '#e0ddd6'
const CARD_BG = '#ffffff'

const CATEGORY_MAP = {
  Top: 'tops',
  Bottom: 'bottoms',
  Shoes: 'footwear',
  Accessory: 'accessories',
}

function Mannequin() {
  return (
    <Svg width={200} height={320} viewBox="0 0 200 320">
      <Circle cx="100" cy="32" r="22" fill="none" stroke={BORDER} strokeWidth="2.5" />
      <Path
        d="M 93 54 L 91 67 L 109 67 L 107 54"
        fill="none" stroke={BORDER} strokeWidth="2.5" strokeLinejoin="round"
      />
      <Path
        d="M 63 158 L 59 72 Q 76 68 91 67 M 109 67 Q 124 68 141 72 L 137 158 M 63 158 L 137 158"
        fill="none" stroke={BORDER} strokeWidth="2.5" strokeLinejoin="round"
      />
      <Path
        d="M 59 72 L 26 76 L 20 148 L 46 148 L 60 86"
        fill="none" stroke={BORDER} strokeWidth="2.5" strokeLinejoin="round"
      />
      <Path
        d="M 141 72 L 174 76 L 180 148 L 154 148 L 140 86"
        fill="none" stroke={BORDER} strokeWidth="2.5" strokeLinejoin="round"
      />
      <Path
        d="M 76 158 L 68 172 L 60 308 L 82 308 L 92 172"
        fill="none" stroke={BORDER} strokeWidth="2.5" strokeLinejoin="round"
      />
      <Path
        d="M 124 158 L 132 172 L 140 308 L 118 308 L 108 172"
        fill="none" stroke={BORDER} strokeWidth="2.5" strokeLinejoin="round"
      />
    </Svg>
  )
}

export default function OutfitScreen({ navigation, route }) {
  const insets = useSafeAreaInsets()
  const [userId, setUserId] = useState(null)
  const [slots, setSlots] = useState({ Top: null, Bottom: null, Shoes: null, Accessory: null })
  const [saving, setSaving] = useState(false)

  const [modalCategory, setModalCategory] = useState(null)
  const [modalItems, setModalItems] = useState([])
  const [modalLoading, setModalLoading] = useState(false)
  const [modalFromCloset, setModalFromCloset] = useState(true)

  const [viewOutfit, setViewOutfit] = useState(null)

  useEffect(() => {
    if (route.params?.outfit) {
      loadOutfit(route.params.outfit)
      navigation.setParams({ outfit: undefined })
    }
  }, [route.params?.outfit])

  useFocusEffect(
    useCallback(() => {
      async function init() {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          setUserId(session.user.id)
        }
      }
      init()
    }, [])
  )

  async function openSlotPicker(category) {
    setModalCategory(category)
    setModalLoading(true)
    setModalItems([])

    const dbCategory = CATEGORY_MAP[category]

    try {
      const { data: closetData } = await supabase
        .from('closet_items')
        .select('*, products(*)')
        .eq('user_id', userId)

      const closetFiltered = (closetData ?? [])
        .map(item => item.products)
        .filter(p => p?.category === dbCategory)

      if (closetFiltered.length > 0) {
        setModalItems(closetFiltered)
        setModalFromCloset(true)
      } else {
        const { data: suggestions } = await supabase
          .from('products')
          .select('*')
          .eq('category', dbCategory)
          .limit(3)
        setModalItems(suggestions ?? [])
        setModalFromCloset(false)
      }
    } catch {
      setModalItems([])
    } finally {
      setModalLoading(false)
    }
  }

  function selectItem(product) {
    setSlots(prev => ({ ...prev, [modalCategory]: product }))
    setModalCategory(null)
  }

  async function saveOutfit() {
    if (!userId) return
    setSaving(true)
    try {
      const { error } = await supabase.from('outfits').insert({
        user_id: userId,
        top_product_id: slots.Top?.id ?? null,
        bottom_product_id: slots.Bottom?.id ?? null,
        shoes_product_id: slots.Shoes?.id ?? null,
        accessory_product_id: slots.Accessory?.id ?? null,
      })
      if (error) throw error
      Alert.alert('Outfit saved!')
    } catch (e) {
      Alert.alert('Error', e?.message ?? 'Could not save outfit.')
    } finally {
      setSaving(false)
    }
  }

  function loadOutfit(outfit) {
    setSlots({
      Top: outfit.top_product ?? null,
      Bottom: outfit.bottom_product ?? null,
      Shoes: outfit.shoes_product ?? null,
      Accessory: outfit.accessory_product ?? null,
    })
  }

  function renderSlot(category) {
    const product = slots[category]
    return (
      <TouchableOpacity
        key={category}
        style={styles.slot}
        onPress={() => openSlotPicker(category)}
        activeOpacity={0.85}
      >
        {product ? (
          <>
            {product.image_url ? (
              <Image source={{ uri: product.image_url }} style={styles.slotImage} resizeMode="cover" />
            ) : (
              <View style={styles.slotImagePlaceholder} />
            )}
            <Text style={styles.slotName} numberOfLines={2}>{product.name}</Text>
          </>
        ) : (
          <View style={styles.slotEmpty}>
            <Text style={styles.slotPlus}>+</Text>
            <Text style={styles.slotLabel}>{category}</Text>
          </View>
        )}
      </TouchableOpacity>
    )
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>My Outfit</Text>

      <View style={styles.mannequinWrap}>
        <Mannequin />
      </View>

      <View style={styles.slotRow}>
        {renderSlot('Top')}
        {renderSlot('Bottom')}
      </View>
      <View style={styles.slotRow}>
        {renderSlot('Shoes')}
        {renderSlot('Accessory')}
      </View>

      <TouchableOpacity
        style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
        onPress={saveOutfit}
        disabled={saving}
        activeOpacity={0.85}
      >
        <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Save Outfit'}</Text>
      </TouchableOpacity>

      <Modal
        visible={viewOutfit != null}
        transparent
        animationType="slide"
        onRequestClose={() => setViewOutfit(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Saved Outfit</Text>
              <TouchableOpacity
                onPress={() => setViewOutfit(null)}
                style={styles.modalClose}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={styles.viewOutfitGrid}>
              {['Top', 'Bottom', 'Shoes', 'Accessory'].map(label => {
                const key = `${label.toLowerCase()}_product`
                const product = viewOutfit?.[key]
                return (
                  <View key={label} style={styles.viewOutfitSlot}>
                    {product?.image_url ? (
                      <Image source={{ uri: product.image_url }} style={styles.viewOutfitImg} resizeMode="cover" />
                    ) : (
                      <View style={[styles.viewOutfitImg, { backgroundColor: '#f0eeea' }]} />
                    )}
                    <Text style={styles.viewOutfitLabel}>{label}</Text>
                    <Text style={styles.viewOutfitName} numberOfLines={2}>
                      {product?.name ?? '—'}
                    </Text>
                  </View>
                )
              })}
            </ScrollView>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => {
                loadOutfit(viewOutfit)
                setViewOutfit(null)
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Load into Builder</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={modalCategory != null}
        transparent
        animationType="slide"
        onRequestClose={() => setModalCategory(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose {modalCategory}</Text>
              <TouchableOpacity
                onPress={() => setModalCategory(null)}
                style={styles.modalClose}
                activeOpacity={0.85}
              >
                <Text style={styles.modalCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            {!modalFromCloset && modalItems.length > 0 && (
              <Text style={styles.suggestionLabel}>Nothing saved yet — try these</Text>
            )}

            {modalLoading ? (
              <ActivityIndicator size="large" color={GREEN} style={styles.modalSpinner} />
            ) : modalItems.length === 0 ? (
              <Text style={styles.modalEmpty}>No items found</Text>
            ) : (
              <FlatList
                data={modalItems}
                keyExtractor={item => String(item.id)}
                numColumns={2}
                columnWrapperStyle={styles.modalRow}
                contentContainerStyle={styles.modalGrid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => selectItem(item)}
                    activeOpacity={0.85}
                  >
                    {item.image_url ? (
                      <Image source={{ uri: item.image_url }} style={styles.modalItemImg} resizeMode="cover" />
                    ) : (
                      <View style={[styles.modalItemImg, { backgroundColor: '#f0eeea' }]} />
                    )}
                    <Text style={styles.modalItemName} numberOfLines={2}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            )}

            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => {
                setModalCategory(null)
                navigation.navigate('Discover')
              }}
              activeOpacity={0.85}
            >
              <Text style={styles.exploreBtnText}>Explore {modalCategory}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: BG },
  content: { paddingBottom: 40 },

  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    paddingBottom: 12,
  },

  mannequinWrap: { alignItems: 'center', marginBottom: 16 },

  slotRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    gap: 10,
    marginBottom: 10,
  },
  slot: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    minHeight: 120,
  },
  slotEmpty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  slotPlus: { fontSize: 28, color: '#bbb', fontWeight: '300' },
  slotLabel: { fontSize: 13, color: '#888', fontWeight: '500', marginTop: 4 },
  slotImage: { width: '100%', height: 90 },
  slotImagePlaceholder: { width: '100%', height: 90, backgroundColor: '#f0eeea' },
  slotName: { fontSize: 12, color: '#1a1a1a', fontWeight: '500', padding: 8 },

  saveBtn: {
    marginHorizontal: 20,
    marginTop: 10,
    backgroundColor: GREEN,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '75%',
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a' },
  modalClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseText: { fontSize: 14, color: '#444', fontWeight: '700', marginTop: -1 },
  suggestionLabel: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  modalSpinner: { marginVertical: 32 },
  modalEmpty: { textAlign: 'center', color: '#888', marginVertical: 32, fontSize: 14 },
  modalGrid: { paddingHorizontal: 12, paddingTop: 12 },
  modalRow: { gap: 10, marginBottom: 10 },
  modalItem: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  modalItemImg: { width: '100%', height: 120 },
  modalItemName: { fontSize: 12, color: '#1a1a1a', fontWeight: '500', padding: 8 },
  viewOutfitGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    gap: 10,
  },
  viewOutfitSlot: {
    width: '47%',
    backgroundColor: CARD_BG,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
  },
  viewOutfitImg: { width: '100%', height: 120 },
  viewOutfitLabel: {
    fontSize: 11,
    color: GREEN,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  viewOutfitName: {
    fontSize: 12,
    color: '#1a1a1a',
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingBottom: 8,
    paddingTop: 2,
  },
  exploreBtn: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exploreBtnText: { fontSize: 15, color: '#1a1a1a', fontWeight: '600' },
})
