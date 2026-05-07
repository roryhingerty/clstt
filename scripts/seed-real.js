const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://jloomlhshhvqtzxmbbwt.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY

if (!SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_SERVICE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const products = [
  { brand: 'Motorino', name: 'Address Tee - Washed Stone', category: 'tops', price: 89.95, image_url: 'https://motorinonb.com/cdn/shop/files/Motorino_-_Address_Tee_-_Grey.jpg?v=1773271138&width=3000', retailer_url: 'https://motorinonb.com/products/address-tee-washed-stone?variant=46971414741170' },
  { brand: 'Motorino', name: 'Vintage Tee - Off White', category: 'tops', price: 89.95, image_url: 'https://motorinonb.com/cdn/shop/files/Motorino_-_Tee_3_-_Social_Club_-_Red_-_Cream.png?v=1761796984&width=3000', retailer_url: 'https://motorinonb.com/collections/tees/products/vintage-tee-off-white' },
  { brand: 'Motorino', name: 'Emblem Tee - White', category: 'tops', price: 89.95, image_url: 'https://motorinonb.com/cdn/shop/files/Screenshot_2025-12-17_at_2.39.50_pm.png?v=1765942828&width=3000', retailer_url: 'https://motorinonb.com/collections/tees/products/emblem-tee-white' },
  { brand: 'Motorino', name: 'Wavy Tee - Pastel', category: 'tops', price: 89.95, image_url: 'https://motorinonb.com/cdn/shop/files/Screenshot2025-12-17at2.55.56pm.png?v=1765943825&width=3000', retailer_url: 'https://motorinonb.com/collections/tees/products/wavey-tee-off-white-1' },
  { brand: 'Motorino', name: 'Club Heavy Tee - Sky Blue', category: 'tops', price: 89.95, image_url: 'https://motorinonb.com/cdn/shop/files/20251128-Motorino0648.jpg?v=1773294561&width=3000', retailer_url: 'https://motorinonb.com/collections/tees/products/club-heavy-tee-sky-blue' },
  { brand: 'Motorino', name: 'Address Tee - Washed Brown', category: 'tops', price: 89.95, image_url: 'https://motorinonb.com/cdn/shop/files/20251008_-_motorino0023.jpg?v=1761098635&width=3000', retailer_url: 'https://motorinonb.com/collections/tees/products/record-tee-washed-black-copy' },
  { brand: 'House of Blanks', name: '1009 Heavyweight T-Shirt - White', category: 'tops', price: 35.00, image_url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_White_01_2.jpg?v=1726516822&width=990', retailer_url: 'https://www.houseofblanks.com/products/heavyweight-t-shirt-white' },
  { brand: 'House of Blanks', name: '1009 Heavyweight T-Shirt - Black', category: 'tops', price: 35.00, image_url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_Black_01_2.jpg?v=1726510061&width=990', retailer_url: 'https://www.houseofblanks.com/products/heavyweight-t-shirt-black' },
  { brand: 'House of Blanks', name: '1009 Heavyweight T-Shirt - Heather Grey', category: 'tops', price: 35.00, image_url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_HeatherGrey_01_2.jpg?v=1726511909&width=990', retailer_url: 'https://www.houseofblanks.com/products/heavyweight-t-shirt-heather-grey' },
  { brand: 'House of Blanks', name: '1009 Heavyweight T-Shirt - Olive Drab', category: 'tops', price: 35.00, image_url: 'https://www.houseofblanks.com/cdn/shop/files/HeavyweightTshirt_OliveDrab_01_1.jpg?v=1726516633&width=990', retailer_url: 'https://www.houseofblanks.com/products/heavyweight-t-shirt-olive-drab' },
  { brand: 'House of Blanks', name: '1009 Heavyweight T-Shirt - Washed Black', category: 'tops', price: 35.00, image_url: 'https://www.houseofblanks.com/cdn/shop/files/25.10.04_1009-SS-T-ShirtOffBlack_01_1.jpg?v=1761843283&width=990', retailer_url: 'https://www.houseofblanks.com/products/1009-heavyweight-t-shirt-offblack' },
  { brand: 'LUTHER', name: 'Baggy Trackies - Black', category: 'bottoms', price: 99.99, image_url: 'https://luthermelbourne.com/cdn/shop/files/1_c1e4f505-3d3d-4af7-bc01-b1c0b496e6d3.jpg?v=1734914498&width=740', retailer_url: 'https://luthermelbourne.com/collections/bottoms/products/baggy-trackies-black' },
  { brand: 'LUTHER', name: 'Baggy Trackies - Grey', category: 'bottoms', price: 99.99, image_url: 'https://luthermelbourne.com/cdn/shop/files/5_5a00971e-bca3-4064-92cc-9e465d516b37.jpg?v=1734914588&width=740', retailer_url: 'https://luthermelbourne.com/collections/bottoms/products/baggy-trackies-grey' },
  { brand: 'LUTHER', name: 'Baggy Trackies - Marle White', category: 'bottoms', price: 99.99, image_url: 'https://luthermelbourne.com/cdn/shop/files/10_31d7e9aa-092b-470c-9a91-1853ccc3b274.jpg?v=1741849195&width=740', retailer_url: 'https://luthermelbourne.com/collections/bottoms/products/baggy-trackies-grey' },
  { brand: 'LUTHER', name: 'Super Baggy Jeans - Washed Blue', category: 'bottoms', price: 189.99, image_url: 'https://luthermelbourne.com/cdn/shop/files/1_d1ef71c2-3670-4a3e-83e0-0845d1c2bb6b.jpg?v=1773006339&width=740', retailer_url: 'https://luthermelbourne.com/collections/bottoms/products/super-baggy-jeans-washed-blue' },
  { brand: 'LUTHER', name: 'Super Baggy Jeans - Vintage Black', category: 'bottoms', price: 189.99, image_url: 'https://luthermelbourne.com/cdn/shop/files/1_ee667c8e-fc01-4e37-b30e-9486aef491cb.jpg?v=1773005928&width=740', retailer_url: 'https://luthermelbourne.com/collections/bottoms/products/super-baggy-jeans-vintage-black' },
  { brand: 'LUTHER', name: 'Trackie Shorts - Grey', category: 'bottoms', price: 89.99, image_url: 'https://luthermelbourne.com/cdn/shop/files/1_ae4e2a33-7c26-4015-b38c-49e084ea190d.jpg?v=1747627995&width=5000', retailer_url: 'https://luthermelbourne.com/collections/all/products/trackie-shorts-grey' },
  { brand: 'Uniqlo', name: 'UNIQLO:C Barrel Pants', category: 'bottoms', price: 59.90, image_url: 'https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/484875/sub/goods_484875_sub14_3x4.jpg?width=400', retailer_url: 'https://www.uniqlo.com/au/en/products/E484875-000/00?colorDisplayCode=69&sizeDisplayCode=004' },
  { brand: 'Uniqlo', name: 'Cargo Pants', category: 'bottoms', price: 59.90, image_url: 'https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/482936/sub/goods_482936_sub14_3x4.jpg?width=400', retailer_url: 'https://www.uniqlo.com/au/en/products/E482936-000/00?colorDisplayCode=08&sizeDisplayCode=004' },
  { brand: 'Uniqlo', name: 'Geared Pants', category: 'bottoms', price: 59.90, image_url: 'https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/482918/sub/goods_482918_sub14_3x4.jpg?width=400', retailer_url: 'https://www.uniqlo.com/au/en/products/E482918-000/00?colorDisplayCode=56&sizeDisplayCode=004' },
  { brand: 'Uniqlo', name: 'Seamless Down Parka', category: 'outerwear', price: 199.99, image_url: 'https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/470077/sub/goods_470077_sub14_3x4.jpg?width=400', retailer_url: 'https://www.uniqlo.com/au/en/products/E470077-000/00?colorDisplayCode=08&sizeDisplayCode=003' },
  { brand: 'Uniqlo', name: 'UNIQLO:C PUFFTECH Parka', category: 'outerwear', price: 99.99, image_url: 'https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/478286/sub/goods_478286_sub14_3x4.jpg?width=400', retailer_url: 'https://www.uniqlo.com/au/en/products/E478286-000/00?colorDisplayCode=19&sizeDisplayCode=004' },
  { brand: 'Uniqlo', name: 'Harrington Jacket', category: 'outerwear', price: 99.90, image_url: 'https://image.uniqlo.com/UQ/ST3/WesternCommon/imagesgoods/484610/sub/goods_484610_sub14_3x4.jpg?width=400', retailer_url: 'https://www.uniqlo.com/au/en/products/E484610-000/00?colorDisplayCode=09&sizeDisplayCode=003' },
  { brand: 'LUTHER', name: 'Essentials Hoodie - Black', category: 'outerwear', price: 89.99, image_url: 'https://luthermelbourne.com/cdn/shop/files/13_7e89fb0b-a069-4d54-a200-6bc88ec3ecd7.jpg?v=1734035206&width=740', retailer_url: 'https://luthermelbourne.com/collections/outerwear/products/essentials-hoodie-black' },
  { brand: 'LUTHER', name: 'Essentials Hoodie - Grey', category: 'outerwear', price: 89.99, image_url: 'https://luthermelbourne.com/cdn/shop/files/4_acebbe99-e93d-4a8b-8376-39488a3e0489.jpg?v=1734914792&width=740', retailer_url: 'https://luthermelbourne.com/collections/outerwear/products/essentials-hoodie-grey' },
  { brand: 'Motorino', name: 'Tailored Jacket', category: 'outerwear', price: 199.99, image_url: 'https://motorinonb.com/cdn/shop/files/20250618-MotorinoMotorino-TailoredJacket-Blackcopy.jpg?v=1754969404&width=3000', retailer_url: 'https://motorinonb.com/products/herringbone-jacket?variant=45574529122482' },
  { brand: 'Motorino', name: 'Track Jacket - Black', category: 'outerwear', price: 149.99, image_url: 'https://motorinonb.com/cdn/shop/files/Moto_FEB_004.jpg?v=1743556539&width=3000', retailer_url: 'https://motorinonb.com/collections/outerwear/products/motorino-track-jacket-black' },
  { brand: 'Motorino', name: 'Moto Throw Jacket - Sand', category: 'outerwear', price: 149.99, image_url: 'https://motorinonb.com/cdn/shop/files/20251001_-_motorino0014.jpg?v=1759967870&width=3000', retailer_url: 'https://motorinonb.com/collections/outerwear/products/moto-racer-jacket' },
  { brand: 'Nike', name: 'Winflo 12', category: 'footwear', price: 160.00, image_url: 'https://img1.theiconic.com.au/FjeM5yMWsoht_W-yHhhIgIN7jco=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-1037-7942272-1.jpg', retailer_url: 'https://www.theiconic.com.au/winflo-12-men-s-2722497.html' },
  { brand: 'Nike', name: 'Air Zoom Pegasus 41', category: 'footwear', price: 140.00, image_url: 'https://img1.theiconic.com.au/Bq7V2EF6bgppock0JZ3svQWKfnU=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-7164-8410802-1.jpg', retailer_url: 'https://www.theiconic.com.au/nike-air-zoom-pegasus-41-mens-2080148.html' },
  { brand: 'Nike', name: 'Vomero 18', category: 'footwear', price: 220.00, image_url: 'https://img1.theiconic.com.au/f_I-LhzLu2-kKc5Fc-a_kVgtvEE=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fnike-9276-4731242-1.jpg', retailer_url: 'https://www.theiconic.com.au/vomero-18-men-s-2421374.html' },
  { brand: 'Asics', name: 'GEL-Kayano 20 - Black', category: 'footwear', price: 280.00, image_url: 'https://img1.theiconic.com.au/e7589vDKV0H8KKVSju4gmeNtUfk=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fasics-4185-8656772-1.jpg', retailer_url: 'https://www.theiconic.com.au/gel-kayano-20-unisex-2776568.html' },
  { brand: 'Asics', name: 'GEL-Kayano 20 - White', category: 'footwear', price: 280.00, image_url: 'https://img1.theiconic.com.au/doE5QFjoYK0_z2Jxnl0FghU4r-M=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fasics-4570-5656772-1.jpg', retailer_url: 'https://www.theiconic.com.au/gel-kayano-20-unisex-2776565.html' },
  { brand: 'Asics', name: 'GEL-Kayano 32', category: 'footwear', price: 224.00, image_url: 'https://img1.theiconic.com.au/s9eWa4GUgpAVyIiAjI5TWpwcGjg=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fasics-9798-2697462-1.jpg', retailer_url: 'https://www.theiconic.com.au/gel-kayano-32-men-s-2647962.html' },
  { brand: 'Asics', name: 'GEL-Quantum 360 VIII', category: 'footwear', price: 250.00, image_url: 'https://img1.theiconic.com.au/5w5KKawOeN7V9wX-D94C7l8Wbzc=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fasics-9589-8534642-1.jpg', retailer_url: 'https://www.theiconic.com.au/gel-quantum-360-viii-unisex-2464358.html' },
  { brand: 'Salomon', name: 'XT-6 - Black', category: 'footwear', price: 300.00, image_url: 'https://img1.theiconic.com.au/uFXrK-ZR4Ic5-HBNITFhGciwJyY=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fsalomon-0684-3839072-1.jpg', retailer_url: 'https://www.theiconic.com.au/xt-6-unisex-2709383.html' },
  { brand: 'Salomon', name: 'XT-6 Nocturne Vision', category: 'footwear', price: 300.00, image_url: 'https://img1.theiconic.com.au/_KNg_XHM7qEy0gt8JroFslsWP5E=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fsalomon-4475-9093382-1.jpg', retailer_url: 'https://www.theiconic.com.au/xt-6-nocturne-vision-2833909.html' },
  { brand: 'Salomon', name: 'XT-6', category: 'footwear', price: 300.00, image_url: 'https://img1.theiconic.com.au/JmJkicX9FFFTlyHV9X-fSbrufyU=/fit-in/1000x0/filters:fill(ffffff):quality(85):format(webp)/http%3A%2F%2Fstatic.theiconic.com.au%2Fp%2Fsalomon-7974-7839072-1.jpg', retailer_url: 'https://www.theiconic.com.au/xt-6-unisex-2709387.html' },
]

async function seed() {
  // Clear existing data
  await supabase.from('swipe_events').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('closet_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('outfits').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const { data, error } = await supabase.from('products').insert(products).select()

  if (error) {
    console.error('Insert failed:', error.message)
  } else {
    console.log(`Inserted ${data.length} real products successfully`)
  }
}

seed()
