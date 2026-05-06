import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Swiper from 'react-native-deck-swiper'
import { supabase } from '../lib/supabase'

const GREEN = '#1D9E75'
const CORAL = '#D85A30'
const BG = '#f8f7f4'
const CARD_BG = '#ffffff'
const BORDER = '#e0ddd6'

const overlayLabels = {
  left: {
    title: 'NOPE',
    style: {
      label: {
        backgroundColor: CORAL,
        borderColor: CORAL,
        color: '#fff',
        borderWidth: 2,
      },
      wrapper: {
        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'flex-start',
        marginTop: 36,
        marginRight: 24,
      },
    },
  },
  right: {
    title: 'LIKE',
    style: {
      label: {
        backgroundColor: GREEN,
        borderColor: GREEN,
        color: '#fff',
        borderWidth: 2,
      },
      wrapper: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        marginTop: 36,
        marginLeft: 24,
      },
    },
  },
}

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

export default function DiscoverScreen({ navigation }) {
  const swiperRef = useRef(null)
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [products, setProducts] = useState([])
  const [allSwiped, setAllSwiped] = useState(false)

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true)
      try {
        const { data, error } = await supabase.from('products').select('*')
        if (error) throw error
        setProducts(data ?? [])
      } catch (e) {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    async function initAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user?.id) {
          setUserId(session.user.id)
          fetchProducts()
          return
        }

        const { data, error } = await supabase.auth.signInAnonymously()

        if (error) {
          fetchProducts()
          return
        }

        setUserId(data.user.id)
        fetchProducts()
      } catch (e) {
        fetchProducts()
      }
    }
    initAuth()
  }, [])

  const recordSwipe = useCallback(async (product, liked) => {
    const uid = userId

    if (!uid || !product?.id) {
      return
    }

    const { data: swipeData, error: swipeError } = await supabase
      .from('swipe_events')
      .insert({
        user_id: uid,
        product_id: product.id,
        direction: liked ? 'like' : 'dislike',
      })
      .select()

    if (liked) {
      const { data: closetData, error: closetError } = await supabase
        .from('closet_items')
        .insert({
          user_id: uid,
          product_id: product.id,
        })
        .select()
    }
  }, [userId])

  const onSwipedLeft = useCallback(
    (cardIndex) => {
      const product = products[cardIndex]
      if (product) recordSwipe(product, false)
    },
    [products, recordSwipe]
  )

  const onSwipedRight = useCallback(
    (cardIndex) => {
      const product = products[cardIndex]
      if (product) recordSwipe(product, true)
    },
    [products, recordSwipe]
  )

  const onSwipedAll = useCallback(() => {
    setAllSwiped(true)
  }, [])

  const renderCard = useCallback((product) => {
    if (!product) {
      return (
        <View style={styles.card}>
          <View style={styles.cardBodyEmpty} />
        </View>
      )
    }
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
  }, [])

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={GREEN} />
      </View>
    )
  }

  if (!products.length) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Nothing to discover yet</Text>
        <Text style={styles.emptySubtitle}>
          Check back soon for new pieces.
        </Text>
      </View>
    )
  }

  if (allSwiped) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>You're all caught up</Text>
        <Text style={styles.emptySubtitle}>
          Check back soon for new arrivals
        </Text>
        <TouchableOpacity
          style={styles.viewClosetBtn}
          onPress={() => navigation.navigate('Closet')}
          activeOpacity={0.85}
        >
          <Text style={styles.viewClosetText}>View Closet</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.screen}>
      <Text>Clstt</Text>
      <View style={styles.swiperWrap}>
        <Swiper
          ref={swiperRef}
          cards={products}
          renderCard={renderCard}
          onSwipedLeft={onSwipedLeft}
          onSwipedRight={onSwipedRight}
          onSwipedAll={onSwipedAll}
          cardIndex={0}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={14}
          stackScale={10}
          marginBottom={120}
          marginTop={16}
          cardVerticalMargin={16}
          cardHorizontalMargin={20}
          animateOverlayLabelsOpacity
          overlayLabels={overlayLabels}
          verticalSwipe={false}
          disableTopSwipe
          disableBottomSwipe
          overlayLabelStyle={styles.overlayLabelBase}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.circleBtn, styles.nopeBtn]}
          onPress={() => swiperRef.current?.swipeLeft()}
          activeOpacity={0.85}
          accessibilityLabel="Dislike"
        >
          <Text style={styles.nopeIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.circleBtn, styles.likeBtn]}
          onPress={() => swiperRef.current?.swipeRight()}
          activeOpacity={0.85}
          accessibilityLabel="Like"
        >
          <Text style={styles.likeIcon}>♥</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  swiperWrap: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BG,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
  },
  viewClosetBtn: {
    marginTop: 24,
    backgroundColor: GREEN,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 28,
  },
  viewClosetText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: BORDER,
    overflow: 'hidden',
    justifyContent: 'flex-start',
  },
  cardBodyEmpty: {
    flex: 1,
    backgroundColor: '#f3f2ef',
  },
  imageWrap: {
    flex: 1,
    minHeight: 280,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  brand: {
    fontSize: 13,
    fontWeight: '600',
    color: GREEN,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  price: {
    fontSize: 17,
    fontWeight: '500',
    color: '#333',
  },
  overlayLabelBase: {
    fontSize: 42,
    fontWeight: '800',
    borderRadius: 12,
    paddingHorizontal: 18,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 48,
    paddingBottom: 28,
    paddingTop: 8,
    backgroundColor: BG,
  },
  circleBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    backgroundColor: CARD_BG,
  },
  nopeBtn: {
    borderColor: CORAL,
  },
  likeBtn: {
    borderColor: GREEN,
  },
  nopeIcon: {
    fontSize: 28,
    color: CORAL,
    fontWeight: '700',
  },
  likeIcon: {
    fontSize: 30,
    color: GREEN,
    fontWeight: '700',
  },
})
