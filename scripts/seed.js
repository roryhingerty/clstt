/**
 * One-off seed script — run with Node (not Expo).
 * Uses the same project URL as lib/supabase.js; auth uses SUPABASE_SERVICE_KEY.
 */
const { createClient } = require('@supabase/supabase-js');

// Matches lib/supabase.js (do not import that file in Node — AsyncStorage is RN-only).
const SUPABASE_URL = 'https://jloomlhshhvqtzxmbbwt.supabase.co';

const brands = [
  { name: 'Nike', url: 'https://www.nike.com/au/' },
  { name: 'Adidas', url: 'https://www.adidas.com.au/' },
  { name: 'New Balance', url: 'https://www.newbalance.com.au/' },
  { name: 'Carhartt WIP', url: 'https://www.carhartt-wip.com/en-au' },
  { name: 'Stussy', url: 'https://www.stussy.com/' },
  { name: 'Dickies', url: 'https://www.dickies.com.au/' },
  { name: 'Patagonia', url: 'https://www.patagonia.com.au/' },
  { name: 'The North Face', url: 'https://www.thenorthface.com.au/' },
  { name: "Levi's", url: 'https://www.levi.com.au/' },
  { name: 'Nudie Jeans', url: 'https://www.nudiejeans.com/' },
  { name: 'Represent', url: 'https://www.representclo.com/' },
  { name: 'Acne Studios', url: 'https://www.acnestudios.com/' },
  { name: 'Stone Island', url: 'https://www.stoneisland.com/' },
  { name: 'CP Company', url: 'https://www.cpcompany.com/' },
  { name: 'Salomon', url: 'https://www.salomon.com.au/' },
  { name: 'On Running', url: 'https://www.on-running.com/en-au' },
  { name: 'Vans', url: 'https://www.vans.com.au/' },
  { name: 'Converse', url: 'https://www.converse.com.au/' },
  { name: 'Dr Martens', url: 'https://www.drmartens.com.au/' },
  { name: 'Timberland', url: 'https://www.timberland.com.au/' },
  { name: 'UGG', url: 'https://www.ugg.com/au/en/' },
  { name: 'Assembly Label', url: 'https://assemblylabel.com/' },
  { name: 'Country Road', url: 'https://www.countryroad.com.au/' },
  { name: 'Rodd & Gunn', url: 'https://www.roddandgunn.com/' },
];

function imageUrlForBrand(brandName) {
  const text = brandName.replace(/&/g, '%26').replace(/ /g, '+');
  return `https://placehold.co/400x500/e8e5de/888888?text=${text}`;
}

const topNames = [
  'Essential Cotton Tee',
  'Oversized Logo T-Shirt',
  'Heavyweight Box Fit Tee',
  'Oxford Short Sleeve Shirt',
  'Linen Vacation Shirt',
  'Striped Rugby Shirt',
  'Mock Neck Long Sleeve',
  'Thermal Waffle Top',
  'Zip Polo Shirt',
  'Dri-FIT Training Top',
  'Relaxed Fit Pocket Tee',
  'Archive Print Long Sleeve',
  'Premium Jersey Tank',
  'Cuban Collar Camp Shirt',
  'Brushed Flannel Shirt',
  'Minimal Merino Knit Tee',
  'Garment Dyed Pocket Tee',
  'Contrast Stitch Tee',
  'Base Layer Long Sleeve',
  'Signature Cap Sleeve Tee',
  'Textured Knit Polo',
  'Vintage Wash Tee',
  'Panelled Football Shirt',
  'Utility Work Shirt',
  'Breathable Running Tee',
  'Overshirt in Cotton Twill',
  'Fine Stripe Boat Neck Tee',
  'Relaxed Henley Top',
  'Slim Fit Dress Shirt',
  'Loopback Sweat Tee',
  'Graphic Back Print Tee',
  'Pique Polo Shirt',
  'Washed Jersey Long Sleeve',
  'Seersucker Short Sleeve Shirt',
  'Ribbed Tank Top',
  'Boxy Fit Stripe Tee',
  'Stretch Performance Tee',
  'Cord Trim Resort Shirt',
  'Faded Logo Long Sleeve',
  'Patch Pocket Overshirt',
];

const bottomNames = [
  'Slim Taper Jeans',
  'Relaxed Straight Jeans',
  '501 Original Fit Jeans',
  'Cargo Trousers',
  'Tailored Chino',
  'Fleece Joggers',
  'Denim Shorts',
  'Painter Work Pant',
  'Carpenter Jeans',
  'Tech Twill Trouser',
  'Pleated Wide Leg Pant',
  'Drawstring Linen Short',
  'Tapered Work Pant',
  'Vintage Wash Jean',
  'Ripstop Cargo Short',
  'Elastic Waist Trouser',
  'Selvedge Slim Jean',
  'Corduroy Trouser',
  'Swim Short',
  'Double Knee Pant',
  'Relaxed Fit Short',
  'Twill Utility Pant',
  'Stacked Skinny Jean',
  'Bermuda Chino Short',
  'Heavyweight Sweatpant',
  'Straight Leg Jean',
  'Cropped Wide Trouser',
  'Hiking Zip-Off Pant',
  'Linen Blend Short',
  'Track Pant with Taping',
  'Rigid Denim Jean',
  'Pleated Short',
  'Stretch Chino',
  'Baggy Skate Jean',
  'Panelled Track Pant',
  'Classic Fit Short',
  'Workwear Double Knee',
  'Tapered Cargo Pant',
  'Raw Hem Jean Short',
  'Reflector Stripe Track Pant',
];

const outerwearNames = [
  'Fleece Zip Hoodie',
  'Denim Trucker Jacket',
  'Gore-Tex Shell Jacket',
  'Down Puffer Jacket',
  'Sherpa Lined Jacket',
  'Nylon Coach Jacket',
  'Wool Blend Overcoat',
  'Ripstop Windbreaker',
  'Reversible Vest',
  'Corduroy Shacket',
  'Heavyweight Parka',
  'Softshell Hooded Jacket',
  'Quilted Liner Jacket',
  'Bomber Jacket',
  'Fleece Pullover Hoodie',
  'Trench Coat',
  'Anorak Half-Zip',
  'Waxed Cotton Jacket',
  'Technical Rain Jacket',
  'Varsity Jacket',
  'Padded Gilet',
  'Fleece Lined Flannel Shirt',
  'Mountain Light Jacket',
  'Oversized Hoodie',
  'Track Jacket',
  'Wool Peacoat',
  'Utility Field Jacket',
  'Hybrid Down Hoodie',
  'Retro Windrunner',
  'Canvas Work Jacket',
  'Polar Fleece Jacket',
  'Lightweight Packable Jacket',
  'Harrington Jacket',
  'Heavy Hooded Parka',
  'Zip Fleece Jacket',
];

const footwearNames = [
  'Retro Runner Sneaker',
  'Recovery Slide',
  'Skate Low Pro',
  'Trail Running Shoe',
  'Heritage 6-Inch Boot',
  'Canvas High Top',
  'Weatherproof Hiker',
  'Chunky Lifestyle Sneaker',
  'Classic Chelsea Boot',
  'Suede Mule Clog',
  'Court Vintage Sneaker',
  'Gore-Tex Trail Shoe',
  'Platform Sneaker',
  'Moc Toe Boot',
  'Minimalist Road Runner',
  'Pool Slide',
  'Skate Mid Shoe',
  'Winter Lined Boot',
  'Mesh Trainer',
  'Lug Sole Derby',
  'Basketball Low',
  'Speed Lace Trail Shoe',
  'Classic Slip-On',
  'Hiking Mid Boot',
  'Lifestyle Dad Sneaker',
  'Suede Desert Boot',
  'Technical Sandal',
  'Court Leather Sneaker',
  'Waterproof Boot',
  'Foam Runner Slide',
  'Old Skool Pro',
  'XT-6 Trail Sneaker',
  'Chuck 70 High',
  '1460 Smooth Leather Boot',
  'Field Boot Waterproof',
];

function audPrice(category, index) {
  const bases = { tops: 65, bottoms: 119, outerwear: 259, footwear: 179 };
  const spreads = { tops: 95, bottoms: 180, outerwear: 320, footwear: 220 };
  const base = bases[category];
  const spread = spreads[category];
  const step = ((index * 17) % 100) / 100;
  const cents = [0.95, 0.0, 0.5][index % 3];
  return Math.round((base + spread * step + cents) * 100) / 100;
}

function buildRows() {
  const rows = [];

  for (let i = 0; i < 40; i++) {
    const b = brands[i % brands.length];
    rows.push({
      brand: b.name,
      name: `${b.name} ${topNames[i]}`,
      category: 'tops',
      price: audPrice('tops', i),
      image_url: imageUrlForBrand(b.name),
      retailer_url: b.url,
    });
  }

  for (let i = 0; i < 40; i++) {
    const b = brands[(i + 3) % brands.length];
    rows.push({
      brand: b.name,
      name: `${b.name} ${bottomNames[i]}`,
      category: 'bottoms',
      price: audPrice('bottoms', i),
      image_url: imageUrlForBrand(b.name),
      retailer_url: b.url,
    });
  }

  for (let i = 0; i < 35; i++) {
    const b = brands[(i + 7) % brands.length];
    rows.push({
      brand: b.name,
      name: `${b.name} ${outerwearNames[i]}`,
      category: 'outerwear',
      price: audPrice('outerwear', i),
      image_url: imageUrlForBrand(b.name),
      retailer_url: b.url,
    });
  }

  for (let i = 0; i < 35; i++) {
    const b = brands[(i + 11) % brands.length];
    rows.push({
      brand: b.name,
      name: `${b.name} ${footwearNames[i]}`,
      category: 'footwear',
      price: audPrice('footwear', i),
      image_url: imageUrlForBrand(b.name),
      retailer_url: b.url,
    });
  }

  return rows;
}

async function main() {
  const serviceKey = process.env.SUPABASE_SERVICE_KEY;
  if (!serviceKey || !serviceKey.trim()) {
    console.error('Missing SUPABASE_SERVICE_KEY. Set it in your environment and run again.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const rows = buildRows();
  if (rows.length !== 150) {
    console.error(`Expected 150 rows, got ${rows.length}`);
    process.exit(1);
  }

  const { data, error } = await supabase.from('products').insert(rows).select('id');

  if (error) {
    console.error('Insert failed:', error.message, error);
    process.exit(1);
  }

  const inserted = Array.isArray(data) ? data.length : 0;
  console.log(`Inserted ${inserted} row(s) into products (batch of ${rows.length}).`);
}

main();
