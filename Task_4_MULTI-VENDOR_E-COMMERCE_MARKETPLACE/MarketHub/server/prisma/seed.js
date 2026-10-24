import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting MarketHub comprehensive database seed...');

  // Clean existing data in reverse order of foreign keys
  await prisma.notification.deleteMany();
  await prisma.commission.deleteMany();
  await prisma.promotionUsage.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.review.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.vendorOrder.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.wishlist.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.deliveryPartner.deleteMany();
  await prisma.vendor.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing tables.');

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const vendorPassword = await bcrypt.hash('Vendor@123', 10);
  const deliveryPassword = await bcrypt.hash('Delivery@123', 10);
  const customerPassword = await bcrypt.hash('Customer@123', 10);

  // 1. Create Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@markethub.com',
      password: adminPassword,
      name: 'MarketHub Admin',
      phone: '+91 98765 00001',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  // 2. Create Vendors (5 approved, 1 pending)
  const vendorUserData = [
    {
      email: 'vendor@markethub.com',
      name: 'Aditya Roy',
      businessName: 'TechPulse Global',
      phone: '+91 98765 11001',
      address: 'Plot 42, Electronic City Phase 1, Bengaluru, Karnataka 560100',
      logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200',
      description: 'Authorized retailer of high-performance laptops, accessories, and next-gen smart tech.',
      status: 'APPROVED',
      commissionRate: 10.0,
    },
    {
      email: 'vendor2@markethub.com',
      name: 'Kavita Verma',
      businessName: 'UrbanThread Apparel',
      phone: '+91 98765 11002',
      address: 'Level 3, Fashion Street, Bandra West, Mumbai, Maharashtra 400050',
      logo: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200',
      description: 'Contemporary fashion label crafting sustainable premium casualwear and street style.',
      status: 'APPROVED',
      commissionRate: 12.0,
    },
    {
      email: 'vendor3@markethub.com',
      name: 'Ramesh Patel',
      businessName: 'HomeSphere Living',
      phone: '+91 98765 11003',
      address: '77 Interior Avenue, Okhla Industrial Area, New Delhi, Delhi 110020',
      logo: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=200',
      description: 'Modern lifestyle furniture, ergonomic kitchenware, and minimalist home enhancements.',
      status: 'APPROVED',
      commissionRate: 8.5,
    },
    {
      email: 'vendor4@markethub.com',
      name: 'Sneha Kapoor',
      businessName: 'AuraGlow Organics',
      phone: '+91 98765 11004',
      address: '12 Blossom Boulevard, Jubilee Hills, Hyderabad, Telangana 500033',
      logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200',
      description: 'Certified cruelty-free natural skincare, organic wellness botanicals, and beauty serums.',
      status: 'APPROVED',
      commissionRate: 10.0,
    },
    {
      email: 'vendor5@markethub.com',
      name: 'Manish Rawat',
      businessName: 'ProActive Athletics',
      phone: '+91 98765 11005',
      address: '90 Olympic Road, Sector 18, Gurugram, Haryana 122002',
      logo: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=200',
      description: 'Professional sports gear, gym equipment, cardio accessories, and endurance apparel.',
      status: 'APPROVED',
      commissionRate: 9.0,
    },
    {
      email: 'vendor6@markethub.com',
      name: 'Sunil Rao',
      businessName: 'NovaCraft Studios',
      phone: '+91 98765 11006',
      address: '55 Heritage Lane, Whitefield, Bengaluru, Karnataka 560066',
      logo: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=200',
      description: 'Artisan handcrafted home accessories, custom journals, and ceramic pottery.',
      status: 'PENDING', // To test vendor approval in admin dashboard!
      commissionRate: 10.0,
    },
  ];

  const vendors = [];
  for (const v of vendorUserData) {
    const user = await prisma.user.create({
      data: {
        email: v.email,
        password: vendorPassword,
        name: v.name,
        phone: v.phone,
        role: 'VENDOR',
        avatar: v.logo,
      },
    });

    const vendor = await prisma.vendor.create({
      data: {
        userId: user.id,
        businessName: v.businessName,
        ownerName: v.name,
        email: v.email,
        phone: v.phone,
        address: v.address,
        logo: v.logo,
        description: v.description,
        status: v.status,
        commissionRate: v.commissionRate,
      },
    });
    vendors.push(vendor);
  }

  // 3. Create Delivery Partners (3)
  const deliveryData = [
    {
      email: 'delivery@markethub.com',
      name: 'Rahul Sharma',
      phone: '+91 98765 22001',
      vehicleType: 'Motorcycle',
      vehicleNumber: 'KA-05-MK-4421',
    },
    {
      email: 'delivery2@markethub.com',
      name: 'Vikram Singh',
      phone: '+91 98765 22002',
      vehicleType: 'Delivery Van',
      vehicleNumber: 'MH-02-MH-9811',
    },
    {
      email: 'delivery3@markethub.com',
      name: 'Amit Patel',
      phone: '+91 98765 22003',
      vehicleType: 'Electric Scooter',
      vehicleNumber: 'DL-01-EV-3319',
    },
  ];

  const deliveryPartners = [];
  for (const d of deliveryData) {
    const user = await prisma.user.create({
      data: {
        email: d.email,
        password: deliveryPassword,
        name: d.name,
        phone: d.phone,
        role: 'DELIVERY_PARTNER',
      },
    });

    const partner = await prisma.deliveryPartner.create({
      data: {
        userId: user.id,
        name: d.name,
        phone: d.phone,
        vehicleType: d.vehicleType,
        vehicleNumber: d.vehicleNumber,
        isAvailable: true,
      },
    });
    deliveryPartners.push(partner);
  }

  // 4. Create Customers (20)
  const customerNames = [
    'Priya Patel', 'Aarav Mehta', 'Ananya Iyer', 'Rohan Gupta', 'Neha Sharma',
    'Kabir Joshi', 'Ishaan Malhotra', 'Diya Chawla', 'Aditi Nair', 'Siddharth Rao',
    'Tara Kulkarni', 'Dev Sen', 'Meera Bansal', 'Aryan Deshmukh', 'Tanvi Singhania',
    'Kunal Nanda', 'Shreya Saxena', 'Varun Bhatia', 'Rhea Kapoor', 'Yashvardhan Jain'
  ];

  const customers = [];
  for (let i = 0; i < customerNames.length; i++) {
    const email = i === 0 ? 'customer@markethub.com' : `customer${i + 1}@markethub.com`;
    const user = await prisma.user.create({
      data: {
        email,
        password: customerPassword,
        name: customerNames[i],
        phone: `+91 98765 ${30000 + i}`,
        role: 'CUSTOMER',
        avatar: `https://images.unsplash.com/photo-${1500000000000 + i * 12345}?w=150&auto=format&fit=crop`,
      },
    });

    // Create cart and wishlist
    await prisma.cart.create({ data: { userId: user.id } });
    await prisma.wishlist.create({ data: { userId: user.id } });

    // Create address
    await prisma.address.create({
      data: {
        userId: user.id,
        fullName: customerNames[i],
        phone: `+91 98765 ${30000 + i}`,
        address: `${101 + i * 7}, Palm Heights, 5th Main`,
        city: i % 2 === 0 ? 'Bengaluru' : 'Mumbai',
        state: i % 2 === 0 ? 'Karnataka' : 'Maharashtra',
        postalCode: i % 2 === 0 ? '560034' : '400001',
        country: 'India',
        isDefault: true,
      },
    });

    customers.push(user);
  }

  // 5. Create Categories (8)
  const categoryData = [
    {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Laptops, wireless headphones, smartwatches, cameras, and mobile tech.',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Fashion',
      slug: 'fashion',
      description: 'Contemporary apparel, footwear, street wear, and tailored garments.',
      image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Modern cookware, aesthetic living room decor, and smart appliances.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Beauty',
      slug: 'beauty',
      description: 'Organic skincare, revitalizing serums, sunscreens, and personal wellness.',
      image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Sports',
      slug: 'sports',
      description: 'Athletic footwear, yoga mats, resistance gear, and outdoor activity items.',
      image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Books',
      slug: 'books',
      description: 'Bestselling fiction, technology handbooks, biographies, and mind growth.',
      image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Grocery',
      slug: 'grocery',
      description: 'Artisanal coffee beans, organic oats, gourmet spices, and pantry snacks.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop&q=80',
    },
    {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Leather backpacks, polarized sunglasses, wrist watches, and wallets.',
      image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=500&auto=format&fit=crop&q=80',
    },
  ];

  const categories = {};
  for (const cat of categoryData) {
    const created = await prisma.category.create({ data: cat });
    categories[cat.slug] = created;
  }

  // 6. Create 52 realistic Products across 5 vendors
  const productsRaw = [
    // --- Vendor 1: TechPulse Global (Electronics) ---
    {
      name: 'UltraBook Pro 15 M3 Chip Laptop',
      brand: 'AeroTech',
      price: 89999,
      discount: 10,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-LAP-001',
      rating: 4.8,
      stock: 25,
      specifications: { Processor: 'M3 10-Core', RAM: '16GB Unified', Storage: '512GB NVMe SSD', Display: '15.3" Liquid Retina', Battery: 'Up to 18 hrs' },
      images: [
        'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Supercharged performance for creative powerhouses, software engineers, and power users with long battery life.',
    },
    {
      name: 'AcousticPulse ANC Wireless Headphones',
      brand: 'SonicMaster',
      price: 14999,
      discount: 15,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-AUD-002',
      rating: 4.7,
      stock: 40,
      specifications: { Driver: '40mm Titanium', Battery: '45 Hours', NoiseCancellation: 'Hybrid Active (40dB)', Bluetooth: 'v5.3 Low Latency', Weight: '240g' },
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Industry-leading acoustic clarity and deep bass response equipped with AI-assisted active noise cancellation.',
    },
    {
      name: 'QuantumFit AMOLED Smartwatch 2.0',
      brand: 'PulseGear',
      price: 5999,
      discount: 20,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-WCH-003',
      rating: 4.5,
      stock: 60,
      specifications: { Screen: '1.43" AMOLED 60Hz', WaterResistance: '5ATM + IP68', Sensors: 'SpO2, 24/7 Heart Rate, Stress', Battery: '12 Days' },
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Track daily wellness, sports modes, and stay connected with Bluetooth calling on an ultra-crisp display.',
    },
    {
      name: 'MechMaster RGB Mechanical Gaming Keyboard',
      brand: 'HyperTactile',
      price: 4499,
      discount: 12,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-KEY-004',
      rating: 4.6,
      stock: 35,
      specifications: { Switch: 'Hot-swappable Gateron Yellow', Layout: '75% Compact', Connectivity: 'Tri-mode (2.4Ghz, BT, USB-C)', Keycaps: 'PBT Double-shot' },
      images: [
        'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Gasket-mounted mechanical keyboard tuned for creamy acoustics and rapid gaming keystrokes.',
    },
    {
      name: 'ErgoGlide Ergonomic Wireless Mouse',
      brand: 'HyperTactile',
      price: 2499,
      discount: 10,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-MOU-005',
      rating: 4.4,
      stock: 50,
      specifications: { DPI: '4000 DPI Darkfield', Connectivity: 'Bluetooth + Unifying USB', Battery: 'Rechargeable USB-C 70 Days', Ergonomics: '57° Natural Handshake' },
      images: [
        'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Sculpted shape places your hand in a natural handshake angle to eliminate forearm strain during long work days.',
    },
    {
      name: 'VividVision 4K 144Hz Gaming Monitor 27"',
      brand: 'AeroTech',
      price: 28999,
      discount: 8,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-MON-006',
      rating: 4.9,
      stock: 12,
      specifications: { Resolution: '3840 x 2160 UHD', RefreshRate: '144Hz 1ms', Panel: 'Fast IPS HDR400', Ports: 'HDMI 2.1 x2, DP 1.4, Type-C 65W' },
      images: [
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Breath-taking 4K fidelity with silky 144Hz smoothness for competitive gaming and precision video grading.',
    },
    {
      name: 'TrueSync Wireless Earbuds with ENC',
      brand: 'SonicMaster',
      price: 2999,
      discount: 25,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-EAR-007',
      rating: 4.3,
      stock: 80,
      specifications: { Battery: '36 Hours Total', Driver: '12mm Bass Boosted', Latency: '45ms Low Latency', Waterproof: 'IPX5 Sweat Resistant' },
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Crisp phone calls and thumping audio with low-latency gaming mode and fast charging case.',
    },
    {
      name: 'HyperCharge 65W GaN Fast Charger Block',
      brand: 'PulseGear',
      price: 1899,
      discount: 15,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-CHG-008',
      rating: 4.7,
      stock: 75,
      specifications: { Technology: 'Gallium Nitride (GaN III)', Ports: '2x USB-C + 1x USB-A', Output: '65W Max Power Delivery', Safety: 'Overheat & Surge Protection' },
      images: [
        'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Pocket-sized powerhouse capable of charging laptops, tablets, and smartphones simultaneously.',
    },
    {
      name: 'StudioStream 4K USB Web Camera',
      brand: 'AeroTech',
      price: 4999,
      discount: 10,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-CAM-009',
      rating: 4.5,
      stock: 30,
      specifications: { Resolution: '4K Ultra HD @ 30FPS / 1080p @ 60FPS', Mic: 'Dual Omni-directional AI Mic', Privacy: 'Built-in Physical Shutter' },
      images: [
        'https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Professional video quality for conferencing, YouTube streaming, and remote interview presentations.',
    },
    {
      name: 'ArmorShield 10,000mAh Magnetic Power Bank',
      brand: 'PulseGear',
      price: 2199,
      discount: 18,
      categorySlug: 'electronics',
      vendorIdx: 0,
      sku: 'TP-PWR-010',
      rating: 4.6,
      stock: 45,
      specifications: { Capacity: '10,000mAh', WirelessSpeed: '15W MagSafe Compatible', WiredOutput: '22.5W Fast Charge', Indicator: 'LED Battery Level' },
      images: [
        'https://images.unsplash.com/photo-1609592426861-12c85b5d8d0f?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Snaps magnetically onto your smartphone for effortless cord-free recharging anywhere on the go.',
    },

    // --- Vendor 2: UrbanThread Apparel (Fashion) ---
    {
      name: 'Signature Supima Cotton Crewneck Tee',
      brand: 'UrbanThread',
      price: 1299,
      discount: 20,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-TEE-001',
      rating: 4.7,
      stock: 100,
      specifications: { Fabric: '100% Long-staple Supima Cotton', Fit: 'Relaxed Tailored', GSM: '220 Heavyweight', Care: 'Machine wash cold' },
      images: [
        'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Silky smooth, exceptionally durable, and pre-shrunk for the ideal premium everyday silhouette.',
    },
    {
      name: 'Classic Indigo Selvedge Denim Jacket',
      brand: 'UrbanThread',
      price: 3999,
      discount: 15,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-JCK-002',
      rating: 4.8,
      stock: 30,
      specifications: { Denim: '14oz Raw Selvedge Denim', Hardware: 'Antique Brass Buttons', Pockets: '4 Functional Pockets', Origin: 'Handcrafted' },
      images: [
        'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Timeless outerwear made from artisanal shuttle-loom woven denim that shapes uniquely to your body.',
    },
    {
      name: 'All-Day Performance Stretch Chino Pants',
      brand: 'UrbanThread',
      price: 2499,
      discount: 10,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-PNT-003',
      rating: 4.5,
      stock: 65,
      specifications: { Material: '97% Twill Cotton, 3% Elastane', Waist: 'Hidden Flex Band', Rise: 'Mid-rise Slim Straight' },
      images: [
        'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Smart office elegance combined with active four-way flexibility for day-to-night versatility.',
    },
    {
      name: 'Merino Wool Knit Crewneck Sweater',
      brand: 'UrbanThread',
      price: 3299,
      discount: 25,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-SWT-004',
      rating: 4.9,
      stock: 22,
      specifications: { Yarn: '100% Australian Extra-fine Merino', Gauge: '12GG Fine Knit', Breathability: 'Naturally Temperature Regulating' },
      images: [
        'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Featherlight warmth without itchiness. Luxurious layering piece for autumn and chilly mornings.',
    },
    {
      name: 'Retro Classic White Leather Sneakers',
      brand: 'SoleCraft',
      price: 3499,
      discount: 12,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-SNK-005',
      rating: 4.6,
      stock: 45,
      specifications: { Upper: 'Full-grain Italian Nappa Leather', Insole: 'Ortholite Memory Foam', Outsole: 'Vulcanized Gum Rubber' },
      images: [
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Crisp minimalist white kicks paired effortlessly with casual jeans, trousers, or linen shorts.',
    },
    {
      name: 'Linen Blend Relaxed Resort Shirt',
      brand: 'UrbanThread',
      price: 1899,
      discount: 15,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-SHT-006',
      rating: 4.4,
      stock: 40,
      specifications: { Blend: '60% French Linen, 40% Organic Cotton', Collar: 'Camp / Cuban Collar', Fit: 'Boxy Relaxed' },
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Airy vacation-ready silhouette designed to keep you cool and stylish under warm sun.',
    },
    {
      name: 'Fleece Lined Minimalist Hoodie',
      brand: 'UrbanThread',
      price: 2199,
      discount: 18,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-HOD-007',
      rating: 4.6,
      stock: 55,
      specifications: { Fabric: '380 GSM Cotton Terry Fleece', Hood: 'Double-layered Structured', Pocket: 'Kangaroo Front Pouch' },
      images: [
        'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Cozy structured streetwear hoodie built with substantial heavyweight cotton fleece.',
    },
    {
      name: 'Breathable Running Athletic Shorts',
      brand: 'SoleCraft',
      price: 999,
      discount: 20,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-SHT-008',
      rating: 4.3,
      stock: 70,
      specifications: { Inseam: '7 Inch', Liner: 'Compression Brief Liner', Pockets: 'Zippered Phone Pocket' },
      images: [
        'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Designed for jogging, weightlifting, and training with zero chafing and secure storage.',
    },
    {
      name: 'Aviator Waterproof Windbreaker Jacket',
      brand: 'UrbanThread',
      price: 2799,
      discount: 10,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-WND-009',
      rating: 4.7,
      stock: 28,
      specifications: { Shell: 'Hydrophobic Ripstop Nylon', Lining: 'Breathable Mesh', Weight: '280g Ultra-packable' },
      images: [
        'https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Shields against wind gusts and unexpected rain showers while packing neatly into its own pocket.',
    },
    {
      name: 'Ribbed Knit Beanie & Scarf Winter Set',
      brand: 'UrbanThread',
      price: 1199,
      discount: 30,
      categorySlug: 'fashion',
      vendorIdx: 1,
      sku: 'UT-ACC-010',
      rating: 4.5,
      stock: 50,
      specifications: { Knit: 'Soft Acrylic Cashmere Feel', Size: 'One Size Elastic Fit', Unisex: 'Yes' },
      images: [
        'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Warm, cozy, and textured winter set to elevate any cold-weather outfit.',
    },

    // --- Vendor 3: HomeSphere Living (Home & Kitchen) ---
    {
      name: 'Nordic Cast Iron Dutch Oven Pot 5.5Qt',
      brand: 'Culinaria',
      price: 4999,
      discount: 15,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-KIT-001',
      rating: 4.9,
      stock: 18,
      specifications: { Capacity: '5.5 Quarts (5.2L)', Coating: 'Vibrant Triple Enameled', HeatResistance: 'Oven Safe up to 260°C (500°F)', Base: 'Induction Compatible' },
      images: [
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Exceptional heat retention and braising power for artisan sourdough bread, stews, and slow roasts.',
    },
    {
      name: 'Smart Barista Espresso & Cappuccino Machine',
      brand: 'BrewMaster',
      price: 18499,
      discount: 12,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-ESP-002',
      rating: 4.8,
      stock: 15,
      specifications: { Pump: '19-Bar Italian ULKA Pump', Thermoblock: 'Fast 25s Heating', SteamWand: 'Commercial Micro-foam Wand', Tank: '1.8L Removable' },
      images: [
        'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Café-grade extraction at home with rich crema and velvety micro-foam for artistic lattes.',
    },
    {
      name: 'Aesthetic Ceramic Japanese Dinnerware Set',
      brand: 'ZenHome',
      price: 3699,
      discount: 10,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-DSH-003',
      rating: 4.7,
      stock: 25,
      specifications: { Pieces: '16-Piece Service for 4', Material: 'High-fire Stoneware Ceramic', Finish: 'Matte Reactive Glaze', DishwasherSafe: 'Yes' },
      images: [
        'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Artisanal stoneware plates and bowls showcasing organic textures and durable everyday resilience.',
    },
    {
      name: 'Cold-Press Slow Masticating Juicer',
      brand: 'Culinaria',
      price: 6499,
      discount: 20,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-JCR-004',
      rating: 4.6,
      stock: 20,
      specifications: { RPM: '55 RPM Cold Extraction', Motor: '200W Ultra Quiet Copper', Chute: '3-inch Wide Feed Chute', BPAFree: '100% Certified' },
      images: [
        'https://images.unsplash.com/photo-1622597467836-f3285f2131b7?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Maximum nutrient retention and enzyme yield with minimal oxidation for fresh green and fruit juices.',
    },
    {
      name: 'Ergonomic Memory Foam Contour Pillow',
      brand: 'ZenHome',
      price: 1799,
      discount: 25,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-PLW-005',
      rating: 4.5,
      stock: 45,
      specifications: { Core: 'High-density Ventilated Memory Foam', Cover: 'Cooling Bamboo Fiber', Shape: 'Orthopedic Cervical Contour' },
      images: [
        'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Provides therapeutic neck alignment and pressure-relief for side, back, and stomach sleepers.',
    },
    {
      name: 'Minimalist Walnut Wood Desk Lamp with Wireless Pad',
      brand: 'ZenHome',
      price: 2999,
      discount: 15,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-LMP-006',
      rating: 4.8,
      stock: 30,
      specifications: { Lumens: '800 Lumens Dimmable', ColorTemp: '3000K - 6000K 5 Modes', WirelessCharger: '10W Qi Base', Material: 'Solid Natural Walnut + Aluminum' },
      images: [
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Combines elegant solid timber design with flicker-free task lighting and integrated wireless device charging.',
    },
    {
      name: 'Professional 8-Piece Damascus Kitchen Knife Set',
      brand: 'Culinaria',
      price: 8999,
      discount: 18,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-KNF-007',
      rating: 4.9,
      stock: 14,
      specifications: { Steel: 'VG-10 Core 67-Layer Damascus', Handle: 'Ergonomic Pakkawood', Hardness: '60±2 HRC', Block: 'Magnetic Acacia Wood Block' },
      images: [
        'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Razor-sharp cutting edge engineered for culinary precision slicing, chopping, and effortless prep work.',
    },
    {
      name: 'Essential Oil Ultrasonic Aromatherapy Diffuser',
      brand: 'ZenHome',
      price: 1599,
      discount: 20,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-DIF-008',
      rating: 4.4,
      stock: 50,
      specifications: { Capacity: '500ml', RunTime: 'Up to 14 Hours', LED: '7 Mood Calming Lights', Noise: '<23dB Whisper Quiet' },
      images: [
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Infuse your bedroom or study with calming natural scents and humidifying gentle mist.',
    },
    {
      name: 'Non-Stick Granite Wok & Sauté Pan 30cm',
      brand: 'Culinaria',
      price: 2299,
      discount: 15,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-PAN-009',
      rating: 4.6,
      stock: 35,
      specifications: { Coating: 'Swiss 5-Layer Granite Non-stick', PFOAFree: '100% Non-toxic', Handle: 'Stay-cool Wood Grain Bakelite' },
      images: [
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'High-heat stir fry mastery with minimal cooking oil and breezy sponge-wipe cleanup.',
    },
    {
      name: 'Double-Walled Borosilicate Glass Coffee Mugs (Set of 4)',
      brand: 'BrewMaster',
      price: 1299,
      discount: 22,
      categorySlug: 'home-kitchen',
      vendorIdx: 2,
      sku: 'HS-MUG-010',
      rating: 4.7,
      stock: 60,
      specifications: { Capacity: '350ml each', Material: 'Thermal Borosilicate Glass', Temperature: '-20°C to 150°C' },
      images: [
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Suspended beverage look keeping espresso and iced brew at optimal temperature without condensation.',
    },

    // --- Vendor 4: AuraGlow Organics (Beauty) ---
    {
      name: 'Radiance Vitamin C + Hyaluronic Face Serum',
      brand: 'AuraGlow',
      price: 1499,
      discount: 20,
      categorySlug: 'beauty',
      vendorIdx: 3,
      sku: 'AG-SRM-001',
      rating: 4.8,
      stock: 75,
      specifications: { Volume: '30ml Glass Dropper', ActiveConcentration: '15% L-Ascorbic Acid + 1% Ferulic', Benefits: 'Brightening, Collagen synthesis, Sun damage repair' },
      images: [
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Potent antioxidant therapy that fades dark spots, restores firmness, and delivers an undeniable glass-skin glow.',
    },
    {
      name: 'Botanical Ceramide Barrier Repair Cream',
      brand: 'AuraGlow',
      price: 1199,
      discount: 15,
      categorySlug: 'beauty',
      vendorIdx: 3,
      sku: 'AG-CRM-002',
      rating: 4.7,
      stock: 60,
      specifications: { Volume: '50ml', KeyActives: '3 Essential Ceramides, Centella Asiatica, Niacinamide', SkinType: 'Sensitive, Dry & Compromised' },
      images: [
        'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Replenishes the moisture barrier, eliminates flakiness, and soothes irritation with plant-derived lipids.',
    },
    {
      name: 'Mineral SPF 50+ Invisible Sunscreen Gel',
      brand: 'AuraGlow',
      price: 899,
      discount: 10,
      categorySlug: 'beauty',
      vendorIdx: 3,
      sku: 'AG-SPF-003',
      rating: 4.6,
      stock: 90,
      specifications: { Protection: 'Broad Spectrum UVA/UVB PA++++', Texture: 'Water-light Zero White Cast', Finish: 'Matte Invisible' },
      images: [
        'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Featherlight non-comedogenic sunscreen that absorbs seamlessly under cosmetics without grease.',
    },
    {
      name: 'Rosemary & Biotin Scalp Strengthening Hair Oil',
      brand: 'AuraGlow',
      price: 799,
      discount: 25,
      categorySlug: 'beauty',
      vendorIdx: 3,
      sku: 'AG-OIL-004',
      rating: 4.5,
      stock: 80,
      specifications: { Volume: '100ml', Ingredients: 'Pure Rosemary Extract, Cold-Pressed Castor Oil, Biotin', Purpose: 'Scalp circulation, Hair density growth' },
      images: [
        'https://images.unsplash.com/photo-1608248597359-54876b5a3717?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Targeted root nutrition formulated to stimulate dormant follicles and thicken fragile strands.',
    },
    {
      name: 'Gentle Amino Acid Foaming Facial Cleanser',
      brand: 'AuraGlow',
      price: 699,
      discount: 15,
      categorySlug: 'beauty',
      vendorIdx: 3,
      sku: 'AG-CLN-005',
      rating: 4.6,
      stock: 85,
      specifications: { Volume: '150ml Pump', pH: '5.5 Skin Balanced', CleansingAgents: 'Apple Amino Acids, Green Tea' },
      images: [
        'https://images.unsplash.com/photo-1556228722-d0b5de70d774?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Lifts away impurities, pollution, and excess sebum without stripping delicate natural oils.',
    },
    {
      name: 'Moroccan Argan Deep Conditioning Hair Mask',
      brand: 'AuraGlow',
      price: 1299,
      discount: 20,
      categorySlug: 'beauty',
      vendorIdx: 3,
      sku: 'AG-MSK-006',
      rating: 4.8,
      stock: 40,
      specifications: { Volume: '250g Jar', Nourishment: '100% Organic Argan Oil, Shea Butter, Keratin', TreatmentTime: '10 Minutes' },
      images: [
        'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Intense hydration restorative therapy for heat-styled, color-treated, or frizz-prone hair.',
    },
    {
      name: 'Organic Shea Butter Lip Treatment Balm (Pack of 3)',
      brand: 'AuraGlow',
      price: 499,
      discount: 10,
      categorySlug: 'beauty',
      vendorIdx: 3,
      sku: 'AG-LIP-007',
      rating: 4.4,
      stock: 120,
      specifications: { Flavors: 'Vanilla Mint, Sweet Berry, Citrus Honey', Formula: 'Beeswax, Raw Shea, Vitamin E' },
      images: [
        'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Lock in lasting hydration and protect cracked lips from harsh winds and dehydration.',
    },
    {
      name: 'Rose Quartz Facial Roller & Gua Sha Sculpting Set',
      brand: 'AuraGlow',
      price: 999,
      discount: 30,
      categorySlug: 'beauty',
      vendorIdx: 3,
      sku: 'AG-GUA-008',
      rating: 4.7,
      stock: 50,
      specifications: { Stone: '100% Authentic Brazilian Rose Quartz', Benefits: 'Lymphatic drainage, Jawline sculpting, Cooling relief' },
      images: [
        'https://images.unsplash.com/photo-1590159763121-7c9ff3149e0a?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'De-puff under-eyes and enhance lymphatic circulation while working your favorite facial oils deep into skin.',
    },

    // --- Vendor 5: ProActive Athletics (Sports & Accessories) ---
    {
      name: 'ProGrip Non-Slip Eco Rubber Yoga Mat 6mm',
      brand: 'ProActive',
      price: 2499,
      discount: 15,
      categorySlug: 'sports',
      vendorIdx: 4,
      sku: 'PA-YOG-001',
      rating: 4.8,
      stock: 40,
      specifications: { Thickness: '6mm Joint Cushioning', Material: 'Natural Tree Rubber + PU Top Layer', Dimensions: '183cm x 68cm Extended' },
      images: [
        'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Laser-etched body alignment lines and sweat-activated ultra traction for flawless poses.',
    },
    {
      name: 'Adjustable Quick-Select Dumbbell Pair (24kg Each)',
      brand: 'ProActive',
      price: 15999,
      discount: 18,
      categorySlug: 'sports',
      vendorIdx: 4,
      sku: 'PA-DBL-002',
      rating: 4.9,
      stock: 10,
      specifications: { WeightRange: '2.5kg to 24kg per dumbbell (15 weight options)', Mechanism: 'Rapid Dial Twist', Tray: 'Heavy-duty Storage Trays Included' },
      images: [
        'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Replaces an entire rack of 15 dumbbell pairs. The ultimate space-saving home gym equipment.',
    },
    {
      name: 'Deep-Tissue Percussion Massage Gun',
      brand: 'PulseGear',
      price: 3999,
      discount: 22,
      categorySlug: 'sports',
      vendorIdx: 4,
      sku: 'PA-MSG-003',
      rating: 4.7,
      stock: 35,
      specifications: { Speeds: '30 Adjustable Percussion Levels', Amplitude: '12mm Deep Penetration', Heads: '6 Interchangeable Attachments', Battery: '6 Hours' },
      images: [
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Rapidly relieves muscle tightness, lactic acid buildup, and post-workout soreness.',
    },
    {
      name: 'Insulated Stainless Steel Sport Flask 1000ml',
      brand: 'ProActive',
      price: 1199,
      discount: 15,
      categorySlug: 'sports',
      vendorIdx: 4,
      sku: 'PA-BOT-004',
      rating: 4.6,
      stock: 90,
      specifications: { Insulation: '24h Cold / 12h Hot TempShield', Steel: '18/8 Pro-grade Stainless', Cap: 'Leakproof Chug Straw Lid' },
      images: [
        'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Keep your pre-workout, ice water, or hot tea perfectly chilled throughout intense workout sessions.',
    },
    {
      name: 'Heavy Duty Fabric Resistance Booty Bands (Set of 3)',
      brand: 'ProActive',
      price: 799,
      discount: 20,
      categorySlug: 'sports',
      vendorIdx: 4,
      sku: 'PA-BND-005',
      rating: 4.5,
      stock: 110,
      specifications: { Resistance: 'Light (15-25 lbs), Medium (25-35 lbs), Heavy (40-50 lbs)', Grip: 'Anti-slip Inner Latex Strip' },
      images: [
        'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Non-rolling cloth resistance bands for glute activation, squats, hip thrusts, and warm-ups.',
    },
    {
      name: 'Aerobic High-Speed Steel Cable Jump Rope',
      brand: 'ProActive',
      price: 499,
      discount: 10,
      categorySlug: 'sports',
      vendorIdx: 4,
      sku: 'PA-ROP-006',
      rating: 4.4,
      stock: 80,
      specifications: { Bearings: '360° Double Ball Bearing Swivel', Cable: 'Kink-free Coated Steel Wire', Length: 'Fully Adjustable 3m' },
      images: [
        'https://images.unsplash.com/photo-1599058917212-d750089bc07e?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Engineered for smooth double-unders, boxing footwork drills, and intense HIIT calorie burning.',
    },

    // --- Books, Grocery & Accessories products ---
    {
      name: 'Designing Data-Intensive Applications',
      brand: 'O’Reilly Media',
      price: 1899,
      discount: 10,
      categorySlug: 'books',
      vendorIdx: 0,
      sku: 'BK-TECH-001',
      rating: 4.9,
      stock: 45,
      specifications: { Author: 'Martin Kleppmann', Format: 'Paperback, 616 pages', Topics: 'Distributed systems, Transactions, Replication, Scalability' },
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'The definitive architectural guide to reliable, scalable, and maintainable systems.',
    },
    {
      name: 'Atomic Habits: Tiny Changes, Remarkable Results',
      brand: 'Penguin Books',
      price: 599,
      discount: 25,
      categorySlug: 'books',
      vendorIdx: 0,
      sku: 'BK-SELF-002',
      rating: 4.9,
      stock: 120,
      specifications: { Author: 'James Clear', Format: 'Hardcover', Language: 'English' },
      images: [
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Proven framework for improving every day, breaking bad habits, and mastering small behaviors.',
    },
    {
      name: 'Single-Origin Ethiopian Yirgacheffe Coffee Beans 500g',
      brand: 'ArtisanRoast',
      price: 899,
      discount: 15,
      categorySlug: 'grocery',
      vendorIdx: 2,
      sku: 'GC-COF-001',
      rating: 4.8,
      stock: 60,
      specifications: { Roast: 'Medium Light Roast', Notes: 'Jasmine, Bergamot, Blueberry, Honey', Altitude: '1900-2200m' },
      images: [
        'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Specialty grade freshly roasted 100% Arabica whole beans with distinctive floral brightness.',
    },
    {
      name: 'Pure Himalayan Raw Organic Wildflower Honey 500g',
      brand: 'NatureHarvest',
      price: 649,
      discount: 12,
      categorySlug: 'grocery',
      vendorIdx: 2,
      sku: 'GC-HNY-002',
      rating: 4.7,
      stock: 50,
      specifications: { Processing: 'Unprocessed, Unheated, Unfiltered', Source: 'High Altitude Flora', Certification: '100% Organic' },
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Harvested from pristine alpine meadows. Rich in natural bee pollen, enzymes, and antioxidants.',
    },
    {
      name: 'Handcrafted Full-Grain Leather Commuter Backpack',
      brand: 'UrbanCraft',
      price: 5499,
      discount: 15,
      categorySlug: 'accessories',
      vendorIdx: 1,
      sku: 'AC-BAG-001',
      rating: 4.8,
      stock: 25,
      specifications: { Material: 'Vegetable-Tanned Full-Grain Leather', LaptopSleeve: 'Padded 16" Compartment', Lining: 'Heavy Cotton Canvas' },
      images: [
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Sophisticated professional daily carry that develops a rich, distinct patina over decades of use.',
    },
    {
      name: 'Polarized Titanium Minimalist Sunglasses',
      brand: 'VividVision',
      price: 2999,
      discount: 20,
      categorySlug: 'accessories',
      vendorIdx: 1,
      sku: 'AC-SUN-002',
      rating: 4.6,
      stock: 45,
      specifications: { Frame: 'Aerospace Grade Titanium', Lenses: 'TAC Polarized UV400 Protection', Weight: '18g Ultralight' },
      images: [
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Anti-glare optical precision with featherlight strength for driving, travel, and sunny escapes.',
    },
    {
      name: 'Slim RFID-Blocking Carbon Fiber Wallet',
      brand: 'PulseGear',
      price: 1499,
      discount: 15,
      categorySlug: 'accessories',
      vendorIdx: 0,
      sku: 'AC-WLT-003',
      rating: 4.7,
      stock: 70,
      specifications: { Material: '3K Real Carbon Fiber + Aluminum', Capacity: '1-12 Cards + Cash Clip', Protection: 'RFID / NFC Anti-theft' },
      images: [
        'https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Eliminate pocket bulge with sleek aerospace-grade card protection and integrated money clip.',
    },
    {
      name: 'Classic Automatic Mechanical Dress Watch',
      brand: 'Horology',
      price: 12499,
      discount: 10,
      categorySlug: 'accessories',
      vendorIdx: 0,
      sku: 'AC-WCH-004',
      rating: 4.9,
      stock: 15,
      specifications: { Movement: 'Japanese 24-Jewel Self-winding Automatic', Glass: 'Scratch-proof Sapphire Crystal', WaterResistance: '100m' },
      images: [
        'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800&auto=format&fit=crop&q=80',
      ],
      description: 'Mesmerizing exhibition caseback showcasing precision gears and sweeping second hand.',
    },
  ];

  console.log(`📦 Seeding ${productsRaw.length} products with inventories and image galleries...`);

  const createdProducts = [];
  for (const p of productsRaw) {
    const slug = `${p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')}`;
    const vendor = vendors[p.vendorIdx];
    const category = categories[p.categorySlug];

    const product = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        discount: p.discount,
        rating: p.rating,
        numReviews: Math.floor(10 + Math.random() * 40),
        brand: p.brand,
        sku: p.sku,
        status: 'ACTIVE',
        specifications: p.specifications,
        categoryId: category.id,
        vendorId: vendor.id,
        images: {
          create: p.images.map((url, idx) => ({
            url,
            altText: p.name,
            isPrimary: idx === 0,
          })),
        },
        inventory: {
          create: {
            currentStock: p.stock,
            reservedStock: 2,
            availableStock: p.stock - 2,
            lowStockThreshold: 5,
            status: p.stock <= 5 ? 'LOW_STOCK' : 'IN_STOCK',
          },
        },
      },
    });

    createdProducts.push(product);
  }

  // 7. Create Promotions
  const promotionsData = [
    {
      code: 'MARKET10',
      description: 'Get 10% off your entire marketplace cart on orders above Rs. 1,000!',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minOrder: 1000,
      maxDiscount: 500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      usageLimit: 500,
      isActive: true,
    },
    {
      code: 'WELCOME500',
      description: 'Flat Rs. 500 discount for new shoppers on orders above Rs. 2,500!',
      discountType: 'FIXED',
      discountValue: 500,
      minOrder: 2500,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      usageLimit: 200,
      isActive: true,
    },
    {
      code: 'TECHFEST20',
      description: '20% off high-end electronics and audio accessories!',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minOrder: 3000,
      maxDiscount: 2000,
      vendorId: vendors[0].id,
      startDate: new Date(),
      endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      usageLimit: 100,
      isActive: true,
    },
  ];

  for (const promo of promotionsData) {
    await prisma.promotion.create({ data: promo });
  }

  // 8. Create realistic Orders with Multi-Vendor grouping, Commissions, and Payments
  console.log('🛍️ Generating realistic multi-vendor orders and commissions...');

  const orderStatuses = ['DELIVERED', 'SHIPPED', 'PROCESSING', 'CONFIRMED', 'DELIVERED'];
  const sampleCustomer = customers[0]; // Priya Patel (customer@markethub.com)

  for (let i = 0; i < 6; i++) {
    const orderNumber = `MH-2026-${100001 + i}`;
    const cust = i < 3 ? sampleCustomer : customers[i % customers.length];
    const status = orderStatuses[i % orderStatuses.length];

    // Pick 2 items from DIFFERENT vendors to test multi-vendor parent/child order structure
    const prod1 = createdProducts[i * 2 % createdProducts.length];
    const prod2 = createdProducts[(i * 2 + 1) % createdProducts.length];

    const qty1 = 1;
    const qty2 = 2;
    const subtotal = prod1.price * qty1 + prod2.price * qty2;
    const tax = +(subtotal * 0.05).toFixed(2);
    const shippingFee = subtotal > 1000 ? 0 : 50;
    const discount = i % 2 === 0 ? 200 : 0;
    const grandTotal = +(subtotal - discount + tax + shippingFee).toFixed(2);

    const address = await prisma.address.findFirst({ where: { userId: cust.id } });

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: cust.id,
        addressId: address?.id,
        shippingAddress: {
          fullName: cust.name,
          phone: cust.phone || '+91 98765 00000',
          address: address?.address || '101 Palm Heights',
          city: address?.city || 'Bengaluru',
          state: address?.state || 'Karnataka',
          postalCode: address?.postalCode || '560034',
          country: 'India',
        },
        subtotal,
        tax,
        shippingFee,
        discount,
        grandTotal,
        status,
        createdAt: new Date(Date.now() - (6 - i) * 2 * 24 * 60 * 60 * 1000),
      },
    });

    // Sub-order 1 (Vendor A)
    const comm1 = +(prod1.price * qty1 * 0.1).toFixed(2);
    const vendorOrder1 = await prisma.vendorOrder.create({
      data: {
        orderId: order.id,
        vendorId: prod1.vendorId,
        subtotal: prod1.price * qty1,
        commissionAmount: comm1,
        netEarnings: +(prod1.price * qty1 - comm1).toFixed(2),
        status,
        createdAt: order.createdAt,
      },
    });

    await prisma.commission.create({
      data: {
        vendorId: prod1.vendorId,
        vendorOrderId: vendorOrder1.id,
        ratePercent: 10.0,
        orderTotal: prod1.price * qty1,
        commissionFee: comm1,
        netPayout: +(prod1.price * qty1 - comm1).toFixed(2),
        isSettled: status === 'DELIVERED',
        settledAt: status === 'DELIVERED' ? new Date() : null,
      },
    });

    await prisma.orderItem.create({
      data: {
        orderId: order.id,
        vendorOrderId: vendorOrder1.id,
        productId: prod1.id,
        vendorId: prod1.vendorId,
        quantity: qty1,
        unitPrice: prod1.price,
        totalPrice: prod1.price * qty1,
      },
    });

    // Sub-order 2 (Vendor B)
    if (prod2.vendorId !== prod1.vendorId) {
      const comm2 = +(prod2.price * qty2 * 0.1).toFixed(2);
      const vendorOrder2 = await prisma.vendorOrder.create({
        data: {
          orderId: order.id,
          vendorId: prod2.vendorId,
          subtotal: prod2.price * qty2,
          commissionAmount: comm2,
          netEarnings: +(prod2.price * qty2 - comm2).toFixed(2),
          status,
          createdAt: order.createdAt,
        },
      });

      await prisma.commission.create({
        data: {
          vendorId: prod2.vendorId,
          vendorOrderId: vendorOrder2.id,
          ratePercent: 10.0,
          orderTotal: prod2.price * qty2,
          commissionFee: comm2,
          netPayout: +(prod2.price * qty2 - comm2).toFixed(2),
          isSettled: status === 'DELIVERED',
          settledAt: status === 'DELIVERED' ? new Date() : null,
        },
      });

      await prisma.orderItem.create({
        data: {
          orderId: order.id,
          vendorOrderId: vendorOrder2.id,
          productId: prod2.id,
          vendorId: prod2.vendorId,
          quantity: qty2,
          unitPrice: prod2.price,
          totalPrice: prod2.price * qty2,
        },
      });
    }

    // Payment
    await prisma.payment.create({
      data: {
        orderId: order.id,
        transactionId: `TXN-${Date.now()}-${i}`,
        amount: grandTotal,
        method: i % 2 === 0 ? 'CARD' : 'COD',
        status: status === 'CANCELLED' ? 'REFUNDED' : status === 'DELIVERED' ? 'PAID' : 'PAID',
        paymentDetails: {
          gateway: 'MarketHub Sandbox Simulator',
          cardLast4: '4242',
        },
      },
    });

    // Delivery assignment
    const partner = deliveryPartners[i % deliveryPartners.length];
    let dStatus = 'ASSIGNED';
    if (status === 'DELIVERED') dStatus = 'DELIVERED';
    else if (status === 'SHIPPED') dStatus = 'OUT_FOR_DELIVERY';
    else if (status === 'PROCESSING') dStatus = 'PICKED_UP';

    await prisma.delivery.create({
      data: {
        orderId: order.id,
        deliveryPartnerId: partner.id,
        status: dStatus,
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        deliveredAt: status === 'DELIVERED' ? new Date() : null,
      },
    });
  }

  // 9. Add Customer Reviews
  console.log('⭐ Adding verified customer reviews...');
  const sampleReviews = [
    { rating: 5, comment: 'Phenomenal build quality! Easily outclasses everything in its price bracket. Arrived safely packaged.' },
    { rating: 5, comment: 'Exceeded my expectations. Fast delivery by the MarketHub partner and works like a dream.' },
    { rating: 4, comment: 'Very high quality, aesthetic finishing. Only minor critique is the outer box had a small scuff, but product was flawless.' },
    { rating: 5, comment: 'Authentic product from an approved vendor. Will definitely purchase again.' },
    { rating: 4, comment: 'Worth every rupee. The battery performance and comfort are exceptional.' },
  ];

  for (let i = 0; i < Math.min(15, createdProducts.length); i++) {
    const prod = createdProducts[i];
    const rev = sampleReviews[i % sampleReviews.length];
    const cust = customers[(i + 1) % customers.length];

    await prisma.review.create({
      data: {
        productId: prod.id,
        userId: cust.id,
        rating: rev.rating,
        comment: rev.comment,
      },
    });
  }

  // 10. Notifications
  console.log('🔔 Generating notification feed...');
  await prisma.notification.create({
    data: {
      userId: sampleCustomer.id,
      title: 'Welcome to MarketHub',
      message: 'Discover premier certified multi-vendors across electronics, fashion, and home goods.',
      type: 'INFO',
    },
  });

  await prisma.notification.create({
    data: {
      userId: vendors[0].userId,
      title: 'Store Performance Notice',
      message: 'Your store TechPulse Global has 10 active products listed. Maintain quick fulfillment for badges.',
      type: 'VENDOR',
    },
  });

  await prisma.notification.create({
    data: {
      userId: admin.id,
      title: 'Pending Vendor Application',
      message: 'NovaCraft Studios has registered and is awaiting admin approval.',
      type: 'VENDOR',
      link: '/admin/vendors',
    },
  });

  console.log('🎉 Database seeding completed successfully!');
  console.log('----------------------------------------------------');
  console.log('DEMO ACCOUNTS READY:');
  console.log('Admin:    admin@markethub.com     / Admin@123');
  console.log('Vendor:   vendor@markethub.com    / Vendor@123');
  console.log('Delivery: delivery@markethub.com  / Delivery@123');
  console.log('Customer: customer@markethub.com  / Customer@123');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
