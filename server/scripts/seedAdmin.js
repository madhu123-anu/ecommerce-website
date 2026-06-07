const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ Database Connected for seeding: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Seeding connection error: ${error.message}`);
    process.exit(1);
  }
};

const categoriesData = [
  { name: 'Electronics', slug: 'electronics', icon: '💻', description: 'Gadgets, devices, and accessories' },
  { name: 'Fashion', slug: 'fashion', icon: '👗', description: 'Clothing, footwear, and apparel' },
  { name: 'Home & Living', slug: 'home-living', icon: '🏠', description: 'Furniture, decor, and home essentials' },
  { name: 'Beauty', slug: 'beauty', icon: '💄', description: 'Cosmetics, makeup, and skincare' },
  { name: 'Sports', slug: 'sports', icon: '🏋️', description: 'Fitness gear, sportswear, and equipment' },
  { name: 'Books', slug: 'books', icon: '📚', description: 'Books, novels, and stationery' },
  { name: 'Toys & Games', slug: 'toys', icon: '🎮', description: 'Toys, board games, and puzzles' },
  { name: 'Food & Grocery', slug: 'food', icon: '🛒', description: 'Gourmet foods, coffee, and daily groceries' },
];

const seedData = async () => {
  try {
    await connectDB();

    // 1. Clean collections
    console.log('🧹 Cleaning collections...');
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    console.log('✅ Collections cleaned.');

    // 2. Create Admin and Customer Users
    console.log('👤 Creating default users...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const adminUser = await User.create({
      name: process.env.ADMIN_NAME || 'Super Admin',
      email: process.env.ADMIN_EMAIL || 'admin@modernshoppro.com',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
    });

    const customerUser = await User.create({
      name: 'John Doe',
      email: 'customer@modernshoppro.com',
      password: 'Password@123',
      role: 'customer',
      isVerified: true,
    });

    const customerUser2 = await User.create({
      name: 'Madhuri Mallipudi',
      email: 'madhurimallipudi6@gmail.com',
      password: 'Password@123',
      role: 'customer',
      isVerified: true,
    });
    console.log('✅ Users created.');

    // 3. Create Categories
    console.log('🏷️ Seeding categories...');
    const categories = await Category.insertMany(categoriesData);
    console.log('✅ Categories seeded.');

    // Map categories to IDs
    const categoryMap = {};
    categories.forEach((cat) => {
      categoryMap[cat.slug] = cat._id;
    });

    // 4. Create Products
    console.log('📦 Seeding products...');
    const productsData = [
      {
        title: 'Sony WH-1000XM4 Wireless Headphones',
        description: 'Industry-leading noise-canceling wireless overhead headphones with smart listening technology, built-in mic for phone calls, and Alexa voice control.',
        brand: 'Sony',
        category: categoryMap['electronics'],
        price: 348.0,
        discountPrice: 298.0,
        images: [
          {
            public_id: 'sony_headphones_1',
            url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 25,
        SKU: 'SONY-WH1000XM4-B',
        ratings: 4.8,
        numReviews: 120,
        specifications: {
          color: 'Black',
          connectivity: 'Bluetooth 5.0, NFC',
          battery_life: 'Up to 30 hours',
        },
        tags: ['headphones', 'wireless', 'sony', 'audio', 'electronics'],
        isFeatured: true,
      },
      {
        title: 'Apple iPhone 15 Pro (128GB)',
        description: 'Titanium design, A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.',
        brand: 'Apple',
        category: categoryMap['electronics'],
        price: 999.0,
        discountPrice: 949.0,
        images: [
          {
            public_id: 'iphone_15_pro',
            url: 'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 15,
        SKU: 'APL-IP15P-128-G',
        ratings: 4.9,
        numReviews: 48,
        specifications: {
          color: 'Natural Titanium',
          storage: '128GB',
          screen_size: '6.1 inches',
        },
        tags: ['iphone', 'apple', 'smartphone', 'mobile', 'electronics'],
        isFeatured: true,
      },
      {
        title: 'Floral Summer Maxi Dress',
        description: 'Lightweight, breathable floral print maxi dress featuring an elegant v-neck, adjustable spaghetti straps, and flowing high-low ruffle hem.',
        brand: 'H&M',
        category: categoryMap['fashion'],
        price: 59.99,
        discountPrice: 45.0,
        images: [
          {
            public_id: 'floral_dress_1',
            url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 40,
        SKU: 'HM-FLORAL-DRESS-S',
        ratings: 4.5,
        numReviews: 32,
        specifications: {
          material: '100% Polyester chiffon',
          color: 'Floral / Pink',
        },
        tags: ['dress', 'summer', 'fashion', 'floral', 'clothing'],
        isFeatured: true,
      },
      {
        title: 'Classic Leather Motorcycle Jacket',
        description: 'Timeless asymmetrical black leather motorcycle jacket crafted from genuine lambskin leather. Features heavy-duty silver hardware, zipper cuffs, and quilted lining.',
        brand: 'Zara',
        category: categoryMap['fashion'],
        price: 189.0,
        discountPrice: 159.0,
        images: [
          {
            public_id: 'leather_jacket_1',
            url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 12,
        SKU: 'ZARA-LEATHER-JKT-M',
        ratings: 4.7,
        numReviews: 18,
        specifications: {
          material: 'Genuine Lambskin Leather',
          color: 'Black',
        },
        tags: ['jacket', 'leather', 'fashion', 'clothing', 'outerwear'],
        isFeatured: false,
      },
      {
        title: 'Nike Air Max Running Shoes',
        description: 'Revolutionary cushioning and engineered mesh construct makes these Nike sneakers incredibly comfortable for long-distance runs and everyday walking.',
        brand: 'Nike',
        category: categoryMap['fashion'],
        price: 129.99,
        discountPrice: 109.99,
        images: [
          {
            public_id: 'nike_air_max_1',
            url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 30,
        SKU: 'NIKE-AM-RUN-10',
        ratings: 4.6,
        numReviews: 89,
        specifications: {
          size: '10 US',
          color: 'Red/Black',
          sole_material: 'Rubber',
        },
        tags: ['shoes', 'sneakers', 'nike', 'running', 'fashion', 'footwear'],
        isFeatured: true,
      },
      {
        title: 'Minimalist Ceramic Vase Set',
        description: 'Set of 3 hand-crafted matte finished ceramic vases. These modern decorative bud vases are perfect for pampas grass or standalone decor.',
        brand: 'IKEA',
        category: categoryMap['home-living'],
        price: 34.99,
        discountPrice: 29.99,
        images: [
          {
            public_id: 'ceramic_vase_1',
            url: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 50,
        SKU: 'IKEA-CERAMIC-VASE-3',
        ratings: 4.6,
        numReviews: 45,
        specifications: {
          material: 'Stoneware',
          pieces: '3 vases',
        },
        tags: ['vase', 'home decor', 'ceramic', 'living room', 'minimalist'],
        isFeatured: true,
      },
      {
        title: 'Velvet Matte Lipstick - Ruby Woo',
        description: 'An iconic retro matte lipstick formula that delivers intense color payoff and a complete matte finish. Long-wearing and smudge-proof.',
        brand: 'MAC',
        category: categoryMap['beauty'],
        price: 22.0,
        discountPrice: 18.5,
        images: [
          {
            public_id: 'mac_lipstick_1',
            url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 100,
        SKU: 'MAC-MATTE-LIPSTICK-RW',
        ratings: 4.9,
        numReviews: 215,
        specifications: {
          shade: 'Ruby Woo Red',
          finish: 'Retro Matte',
        },
        tags: ['lipstick', 'makeup', 'beauty', 'cosmetics', 'mac'],
        isFeatured: false,
      },
      {
        title: 'Non-Slip TPE Yoga Mat',
        description: 'Eco-friendly double-sided non-slip yoga mat made from premium TPE material. Includes alignment lines and carrying strap.',
        brand: 'Lululemon',
        category: categoryMap['sports'],
        price: 49.99,
        discountPrice: 39.99,
        images: [
          {
            public_id: 'yoga_mat_1',
            url: 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 30,
        SKU: 'LULU-YOGA-MAT-ALIGN',
        ratings: 4.4,
        numReviews: 15,
        specifications: {
          material: 'TPE (Latex-free)',
          dimensions: '183cm x 61cm',
        },
        tags: ['yoga mat', 'fitness', 'exercise', 'sports', 'lululemon'],
        isFeatured: true,
      },
      {
        title: 'Atomic Habits by James Clear',
        description: 'The instant New York Times bestseller. Tiny Changes, Remarkable Results. Learn how to build good habits and break bad ones.',
        brand: 'Penguin Books',
        category: categoryMap['books'],
        price: 16.99,
        discountPrice: 12.99,
        images: [
          {
            public_id: 'atomic_habits_book',
            url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 120,
        SKU: 'BOOK-ATOMIC-HABITS',
        ratings: 4.9,
        numReviews: 350,
        specifications: {
          format: 'Paperback',
          pages: '320',
          language: 'English',
        },
        tags: ['book', 'atomic habits', 'self-help', 'non-fiction', 'reading'],
        isFeatured: true,
      },
      {
        title: 'LEGO Star Wars Millennium Falcon',
        description: 'Build and play with the iconic LEGO Star Wars Millennium Falcon starship. Features cockpit, detailed interior, and 7 minifigures.',
        brand: 'LEGO',
        category: categoryMap['toys'],
        price: 169.99,
        discountPrice: 149.99,
        images: [
          {
            public_id: 'lego_millennium_falcon',
            url: 'https://images.unsplash.com/photo-1585366119957-e773c453b1c6?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 8,
        SKU: 'TOY-LEGO-SW-FALCON',
        ratings: 4.8,
        numReviews: 54,
        specifications: {
          pieces: '1351',
          age_range: '9+',
        },
        tags: ['lego', 'star wars', 'toys', 'building blocks', 'games'],
        isFeatured: true,
      },
      {
        title: 'Monopoly Ultimate Banking Board Game',
        description: 'Monopoly game with an all-in-one Ultimate Banking unit that uses touch technology for fast, cashless gameplay.',
        brand: 'Hasbro',
        category: categoryMap['toys'],
        price: 29.99,
        discountPrice: 24.99,
        images: [
          {
            public_id: 'monopoly_board_game',
            url: 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 45,
        SKU: 'TOY-MONOPOLY-ULT',
        ratings: 4.5,
        numReviews: 22,
        specifications: {
          players: '2-4 players',
          battery_required: '3 AAA batteries',
        },
        tags: ['board game', 'monopoly', 'toys', 'games', 'hasbro'],
        isFeatured: false,
      },
      {
        title: 'Organic Ethiopian Whole Bean Coffee (1kg)',
        description: '100% Arabica organic coffee beans sourced from the Yirgacheffe region. Medium roast with floral notes and citrus acidity.',
        brand: 'GourmetRoast',
        category: categoryMap['food'],
        price: 26.0,
        discountPrice: 21.99,
        images: [
          {
            public_id: 'ethiopian_coffee_beans',
            url: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 75,
        SKU: 'FOOD-ETHIO-COFFEE-1KG',
        ratings: 4.7,
        numReviews: 64,
        specifications: {
          weight: '1kg',
          roast: 'Medium Roast',
        },
        tags: ['coffee', 'grocery', 'organic', 'whole beans', 'food'],
        isFeatured: true,
      },
      {
        title: 'Adidas Ultraboost Running Shoes',
        description: 'Experience ultimate comfort and responsive cushioning with these premium Adidas Ultraboost running shoes, featuring a Primeknit upper and Boost midsole.',
        brand: 'Adidas',
        category: categoryMap['fashion'],
        price: 180.0,
        discountPrice: 139.99,
        images: [
          {
            public_id: 'adidas_ultraboot_1',
            url: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 22,
        SKU: 'ADI-UB-RUN-9',
        ratings: 4.8,
        numReviews: 95,
        specifications: {
          color: 'Cloud White',
          size: '9 US',
        },
        tags: ['shoes', 'sneakers', 'adidas', 'running', 'fashion'],
        isFeatured: true,
      },
      {
        title: 'Puma Classic Suede Sneakers',
        description: 'The classic 1968 Puma Suede sneakers. An iconic street style shoe crafted with rich suede leather and contrasting Puma formstrip.',
        brand: 'Puma',
        category: categoryMap['fashion'],
        price: 65.0,
        discountPrice: 49.99,
        images: [
          {
            public_id: 'puma_suede_1',
            url: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 18,
        SKU: 'PUMA-SUEDE-BLK',
        ratings: 4.5,
        numReviews: 42,
        specifications: {
          color: 'Puma Black / White',
          material: 'Suede Leather',
        },
        tags: ['shoes', 'sneakers', 'puma', 'classic', 'fashion'],
        isFeatured: false,
      },
      {
        title: 'Apple iPad Air (M1, 64GB)',
        description: 'iPad Air with the Apple M1 chip. 10.9-inch Liquid Retina display, 12MP Ultra Wide front camera with Center Stage, and superfast Wi-Fi.',
        brand: 'Apple',
        category: categoryMap['electronics'],
        price: 599.0,
        discountPrice: 539.99,
        images: [
          {
            public_id: 'ipad_air_m1',
            url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 14,
        SKU: 'APL-IPAD-AIR-M1',
        ratings: 4.8,
        numReviews: 67,
        specifications: {
          storage: '64GB',
          color: 'Space Gray',
          screen_size: '10.9 inches',
        },
        tags: ['ipad', 'apple', 'tablet', 'electronics'],
        isFeatured: true,
      },
      {
        title: 'The Alchemist by Paulo Coelho',
        description: "A global phenomenon. Paulo Coelho's masterpiece tells the mystical story of Santiago, an Andalusian shepherd boy who yearns to travel in search of a worldly treasure.",
        brand: 'HarperOne',
        category: categoryMap['books'],
        price: 14.99,
        discountPrice: 9.99,
        images: [
          {
            public_id: 'alchemist_book',
            url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 85,
        SKU: 'BOOK-ALCHEMIST',
        ratings: 4.9,
        numReviews: 290,
        specifications: {
          format: 'Paperback',
          language: 'English',
        },
        tags: ['book', 'fiction', 'novel', 'reading', 'alchemist'],
        isFeatured: false,
      },
      {
        title: 'LEGO Statue of Liberty (Architecture)',
        description: 'Celebrate a monumental blend of architecture and sculpture with this LEGO Architecture Statue of Liberty set. Features a detailed pedestal, shield & brick detailing.',
        brand: 'LEGO',
        category: categoryMap['toys'],
        price: 119.99,
        discountPrice: 99.99,
        images: [
          {
            public_id: 'lego_statue_liberty',
            url: 'https://images.unsplash.com/photo-1560963718-d7681368565c?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 10,
        SKU: 'TOY-LEGO-STATUE-LIB',
        ratings: 4.7,
        numReviews: 31,
        specifications: {
          pieces: '1685',
          height: '44 cm',
        },
        tags: ['lego', 'toys', 'building blocks', 'architecture'],
        isFeatured: true,
      },
      {
        title: 'Organic Uji Matcha Green Tea Powder (100g)',
        description: '100% Ceremonial grade stone-ground Uji Matcha green tea powder from Kyoto, Japan. High in antioxidants and rich in L-theanine.',
        brand: 'MatchaBoutique',
        category: categoryMap['food'],
        price: 24.99,
        discountPrice: 18.99,
        images: [
          {
            public_id: 'matcha_powder_1',
            url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 60,
        SKU: 'FOOD-MATCHA-100G',
        ratings: 4.6,
        numReviews: 48,
        specifications: {
          weight: '100g',
          origin: 'Kyoto, Japan',
        },
        tags: ['matcha', 'tea', 'grocery', 'organic', 'food'],
        isFeatured: false,
      },
      {
        title: 'Fitbit Charge 6 Smartwatch',
        description: 'Premium fitness tracker with built-in GPS, heart rate monitor, sleep tracking, and Google apps compatibility.',
        brand: 'Fitbit',
        category: categoryMap['electronics'],
        price: 159.99,
        discountPrice: 129.99,
        images: [
          {
            public_id: 'fitbit_charge_6',
            url: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 35,
        SKU: 'ELEC-FITBIT-C6',
        ratings: 4.6,
        numReviews: 42,
        specifications: {
          color: 'Obsidian Black',
          battery: 'Up to 7 days',
        },
        tags: ['watch', 'smartwatch', 'fitness', 'tracker', 'electronics'],
        isFeatured: true,
      },
      {
        title: 'Canon EOS Rebel T7 DSLR Camera',
        description: 'Ideal for mobile device users wanting to take the next step in their photography, the EOS Rebel T7 camera combines fantastic features with easy-to-use operation.',
        brand: 'Canon',
        category: categoryMap['electronics'],
        price: 479.99,
        discountPrice: 429.99,
        images: [
          {
            public_id: 'canon_rebel_t7',
            url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 14,
        SKU: 'ELEC-CANON-T7',
        ratings: 4.7,
        numReviews: 38,
        specifications: {
          resolution: '24.1 Megapixels',
          lens: '18-55mm IS II Kit',
        },
        tags: ['camera', 'dslr', 'photography', 'electronics'],
        isFeatured: true,
      },
      {
        title: 'Ray-Ban Aviator Classic Sunglasses',
        description: 'Currently one of the most iconic sunglass models in the world, Ray-Ban Aviator Classic sunglasses were originally designed for U.S. aviators in 1937.',
        brand: 'Ray-Ban',
        category: categoryMap['fashion'],
        price: 163.00,
        discountPrice: 143.00,
        images: [
          {
            public_id: 'rayban_aviator_classic',
            url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 28,
        SKU: 'FASH-RAYBAN-AV',
        ratings: 4.8,
        numReviews: 75,
        specifications: {
          frame_material: 'Metal',
          lens_color: 'Green Classic G-15',
        },
        tags: ['sunglasses', 'glasses', 'fashion', 'accessories'],
        isFeatured: false,
      },
      {
        title: 'Keychron K2 Mechanical Keyboard',
        description: 'A 75% layout wireless mechanical keyboard designed for Mac and Windows. Hot-swappable options with beautiful RGB backlight.',
        brand: 'Keychron',
        category: categoryMap['electronics'],
        price: 89.99,
        discountPrice: 79.99,
        images: [
          {
            public_id: 'keychron_k2_keyboard',
            url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
          },
        ],
        stock: 20,
        SKU: 'ELEC-KEYCHRON-K2',
        ratings: 4.8,
        numReviews: 92,
        specifications: {
          layout: '75%',
          connectivity: 'Bluetooth / Wired',
          switches: 'Gateron G Pro Brown',
        },
        tags: ['keyboard', 'mechanical', 'keychron', 'typing', 'electronics'],
        isFeatured: true,
      },
    ];

    await Product.insertMany(productsData);
    console.log('✅ Products seeded successfully.');

    mongoose.connection.close();
    console.log('🔌 DB connection closed.');
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
