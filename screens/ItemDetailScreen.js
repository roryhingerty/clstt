import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const GREEN = '#1D9E75'
const BG = '#f8f7f4'
const BORDER = '#e0ddd6'

function formatPrice(price) {
  if (price == null || price === '') return ''
  if (typeof price === 'number') {
    return price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`
  }
  return String(price)
}

export default function ItemDetailScreen({ route, navigation }) {
  const { product } = route.params
  const insets = useSafeAreaInsets()
  const uri =
    product?.image_url ??
    product?.image ??
    product?.photo_url ??
    product?.thumbnail_url ??
    null

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backText}>‹ Back</Text>
      </TouchableOpacity>

      <ScrollView
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.imageWrap}>
          {uri ? (
            <Image source={{ uri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.imageWrap, styles.imagePlaceholder]}>
              <Text style={styles.placeholderText}>No image</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          {product.brand ? (
            <Text style={styles.brand}>{product.brand.toUpperCase()}</Text>
          ) : null}
          <Text style={styles.name}>{product.name ?? 'Untitled'}</Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>

          <TouchableOpacity
            style={styles.buyBtn}
            onPress={() =>
              product.retailer_url && Linking.openURL(product.retailer_url)
            }
            activeOpacity={0.85}
          >
            <Text style={styles.buyBtnText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: BG,
  },
  backBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: {
    fontSize: 17,
    color: '#333',
    fontWeight: '500',
  },
  scrollContent: {
    paddingBottom: 48,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    color: '#888',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -24,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  brand: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 24,
  },
  buyBtn: {
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buyBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
