import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting DineDesk database seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.cartItem.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.reservation.deleteMany({});
  await prisma.menuItem.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.restaurantTable.deleteMany({});
  await prisma.restaurantSetting.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing data.');

  // Password hashes
  const adminPassword = await bcrypt.hash('admin123', 10);
  const staffPassword = await bcrypt.hash('staff123', 10);
  const kitchenPassword = await bcrypt.hash('kitchen123', 10);
  const customerPassword = await bcrypt.hash('customer123', 10);

  // 1. Users
  console.log('👤 Seeding users...');
  const admin = await prisma.user.create({
    data: {
      name: 'Restaurant Admin',
      email: 'admin@dinedesk.com',
      password: adminPassword,
      phone: '+91 98765 00001',
      role: 'ADMIN',
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: 'James Reynolds',
      email: 'staff@dinedesk.com',
      password: staffPassword,
      phone: '+91 98765 00002',
      role: 'STAFF',
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.staff@dinedesk.com',
      password: staffPassword,
      phone: '+91 98765 00003',
      role: 'STAFF',
    },
  });

  const kitchen1 = await prisma.user.create({
    data: {
      name: 'Chef Gordon Rivera',
      email: 'kitchen@dinedesk.com',
      password: kitchenPassword,
      phone: '+91 98765 00004',
      role: 'KITCHEN',
    },
  });

  const kitchen2 = await prisma.user.create({
    data: {
      name: 'Marco Rossi',
      email: 'chef.marco@dinedesk.com',
      password: kitchenPassword,
      phone: '+91 98765 00005',
      role: 'KITCHEN',
    },
  });

  const customersData = [
    { name: 'Alex Johnson', email: 'customer@dinedesk.com', phone: '+91 98765 10001' },
    { name: 'Emily Davis', email: 'emily.d@example.com', phone: '+91 98765 10002' },
    { name: 'Michael Brown', email: 'michael.b@example.com', phone: '+91 98765 10003' },
    { name: 'Sophia Martinez', email: 'sophia.m@example.com', phone: '+91 98765 10004' },
    { name: 'Daniel Wilson', email: 'daniel.w@example.com', phone: '+91 98765 10005' },
    { name: 'Olivia Taylor', email: 'olivia.t@example.com', phone: '+91 98765 10006' },
    { name: 'David Anderson', email: 'david.a@example.com', phone: '+91 98765 10007' },
    { name: 'Emma Thomas', email: 'emma.t@example.com', phone: '+91 98765 10008' },
    { name: 'Lucas White', email: 'lucas.w@example.com', phone: '+91 98765 10009' },
    { name: 'Ava Harris', email: 'ava.h@example.com', phone: '+91 98765 10010' },
  ];

  const customers = [];
  for (const c of customersData) {
    const cust = await prisma.user.create({
      data: {
        name: c.name,
        email: c.email,
        password: customerPassword,
        phone: c.phone,
        role: 'CUSTOMER',
      },
    });
    customers.push(cust);
  }

  // 2. Categories
  console.log('📂 Seeding categories...');
  const categoriesData = [
    {
      name: 'Starters',
      slug: 'starters',
      description: 'Appetizing starters & finger foods to awaken your palate',
      image: 'https://images.unsplash.com/photo-1541529086526-db283c563270?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Main Course',
      slug: 'main-course',
      description: 'Gourmet handcrafted entrees prepared to absolute perfection',
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Pizza',
      slug: 'pizza',
      description: 'Authentic wood-fired Neapolitan sourdough crust pizzas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Burgers',
      slug: 'burgers',
      description: 'Artisan brioche buns packed with prime patties & house sauces',
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Indian',
      slug: 'indian',
      description: 'Rich heritage curries, fragrant biryanis & clay-oven tandoor delights',
      image: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Chinese',
      slug: 'chinese',
      description: 'Wok-tossed delicacies, dim sums & sizzling oriental noodles',
      image: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Desserts',
      slug: 'desserts',
      description: 'Decadent sweet creations, patisserie cakes and artisan gelatos',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    },
    {
      name: 'Beverages',
      slug: 'beverages',
      description: 'Signature mocktails, fresh press juices, shakes & specialty coffees',
      image: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=600&auto=format&fit=crop&q=80',
    },
  ];

  const categoryMap = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({ data: cat });
    categoryMap[cat.slug] = created;
  }

  // 3. Menu Items (32+ items)
  console.log('🍽️ Seeding menu items...');
  const menuItemsData = [
    // Starters
    {
      name: 'Crispy Truffle Fries',
      description: 'Golden shoestring fries tossed in white truffle oil, grated aged parmesan, and fresh chives. Served with garlic aioli.',
      price: 249,
      categoryId: categoryMap['starters'].id,
      ingredients: 'Russet potatoes, white truffle oil, Parmigiano-Reggiano, sea salt, garlic aioli',
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.8,
      prepTime: 12,
    },
    {
      name: 'Bruschetta al Pomodoro',
      description: 'Charred sourdough crostini topped with heirloom tomatoes, buffalo mozzarella, fresh basil, and aged balsamic glaze.',
      price: 299,
      categoryId: categoryMap['starters'].id,
      ingredients: 'Artisan sourdough, heirloom tomatoes, buffalo mozzarella, basil, EVOO, balsamic',
      imageUrl: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.6,
      prepTime: 10,
    },
    {
      name: 'BBQ Glazed Chicken Wings',
      description: 'Smoked and crispy chicken wings tossed in our hickory house barbecue glaze. Garnished with toasted sesame and ranch dip.',
      price: 389,
      categoryId: categoryMap['starters'].id,
      ingredients: 'Chicken wings, house BBQ glaze, smoked paprika, ranch dressing, celery sticks',
      imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.9,
      prepTime: 18,
    },
    {
      name: 'Loaded Nachos Grande',
      description: 'Crisp corn tortilla chips piled high with melted cheddar, black beans, jalapeños, pico de gallo, guacamole, and sour cream.',
      price: 349,
      categoryId: categoryMap['starters'].id,
      ingredients: 'Tortilla chips, cheddar sauce, refried beans, pickled jalapenos, salsa, guacamole',
      imageUrl: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.7,
      prepTime: 15,
    },

    // Main Course
    {
      name: 'Pan-Seared Herb Salmon',
      description: 'Norwegian salmon fillet seared to flaky perfection, served over garlic butter asparagus, mashed potatoes, and lemon caper emulsion.',
      price: 699,
      categoryId: categoryMap['main-course'].id,
      ingredients: 'Atlantic salmon, asparagus, Yukon gold potatoes, butter, capers, Meyer lemon',
      imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.9,
      prepTime: 25,
    },
    {
      name: 'Grilled Tenderloin Steak',
      description: 'Prime 8oz Angus ribeye steak grilled to medium rare, with caramelized rosemary baby carrots and rich red wine jus.',
      price: 849,
      categoryId: categoryMap['main-course'].id,
      ingredients: 'Angus tenderloin, rosemary, garlic butter, sea salt, red wine reduction',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.9,
      prepTime: 25,
    },
    {
      name: 'Creamy Mushroom Risotto',
      description: 'Slow-simmered arborio rice with wild porcini, shiitake mushrooms, white truffle oil, and aged parmesan crisp.',
      price: 499,
      categoryId: categoryMap['main-course'].id,
      ingredients: 'Arborio rice, porcini mushrooms, vegetable stock, parmesan cheese, thyme',
      imageUrl: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.7,
      prepTime: 20,
    },
    {
      name: 'Stuffed Tuscan Chicken Breast',
      description: 'Free-range chicken breast filled with sun-dried tomatoes, wilted spinach, and ricotta. Served over herb fettuccine.',
      price: 549,
      categoryId: categoryMap['main-course'].id,
      ingredients: 'Chicken breast, sun-dried tomatoes, baby spinach, ricotta, tagliatelle pasta',
      imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.8,
      prepTime: 22,
    },

    // Pizza
    {
      name: 'Margherita Classica',
      description: 'San Marzano tomato coulis, fresh fior di latte mozzarella, fragrant sweet basil, and extra virgin cold-pressed olive oil.',
      price: 399,
      categoryId: categoryMap['pizza'].id,
      ingredients: '00 flour dough, San Marzano tomatoes, fresh mozzarella, fresh basil, EVOO',
      imageUrl: 'https://images.unsplash.com/photo-1604382355076-af4b0eb60143?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.8,
      prepTime: 15,
    },
    {
      name: 'Pepperoni Rustica',
      description: 'Artisanal spicy pepperoni slices, roasted red bell peppers, smoked scamorza, mozzarella, and chili-infused organic honey.',
      price: 499,
      categoryId: categoryMap['pizza'].id,
      ingredients: 'Sourdough crust, pepperoni, mozzarella, hot honey, crushed oregano',
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.9,
      prepTime: 16,
    },
    {
      name: 'Quattro Formaggi Bianca',
      description: 'White base pizza layered with gorgonzola dolce, fontina, fresh mozzarella, aged parmesan, caramelized onions, and walnuts.',
      price: 529,
      categoryId: categoryMap['pizza'].id,
      ingredients: 'Fontina, gorgonzola, parmesan, mozzarella, toasted walnuts, caramelized onion',
      imageUrl: 'https://images.unsplash.com/photo-1573821663912-569905455b1c?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.7,
      prepTime: 16,
    },
    {
      name: 'Smoked BBQ Chicken Pizza',
      description: 'Tender pulled chicken tossed in smoky bourbon BBQ sauce, red onions, cilantro, and smoked gouda cheese.',
      price: 489,
      categoryId: categoryMap['pizza'].id,
      ingredients: 'BBQ shredded chicken, red onion rings, fresh cilantro, gouda, mozzarella',
      imageUrl: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.8,
      prepTime: 16,
    },

    // Burgers
    {
      name: 'The DineDesk Signature Burger',
      description: 'Double smashed Angus beef patties, aged Vermont white cheddar, crisp lettuce, heirloom tomato, caramelized onions, and secret bistro spread on brioche.',
      price: 449,
      categoryId: categoryMap['burgers'].id,
      ingredients: 'Angus beef chuck, brioche bun, aged white cheddar, secret bistro sauce, pickles',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.9,
      prepTime: 15,
    },
    {
      name: 'Crispy Buttermilk Chicken Burger',
      description: 'Marinated fried chicken thigh, spicy house slaw, dill pickles, and chipotle ranch in a toasted sesame brioche bun.',
      price: 399,
      categoryId: categoryMap['burgers'].id,
      ingredients: 'Buttermilk chicken, purple cabbage slaw, chipotle ranch, pickled cucumbers',
      imageUrl: 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.8,
      prepTime: 15,
    },
    {
      name: 'Avocado Portobello Veggie Burger',
      description: 'Grilled balsamic portobello mushroom cap, smashed Hass avocado, arugula, goat cheese, and sun-dried tomato pesto.',
      price: 379,
      categoryId: categoryMap['burgers'].id,
      ingredients: 'Portobello mushroom, ripe avocado, goat cheese, wild arugula, pesto',
      imageUrl: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.6,
      prepTime: 14,
    },
    {
      name: 'Smoky Bacon & Blue Cheese Burger',
      description: 'Angus patty topped with melted Danish blue cheese crumble, applewood smoked bacon strips, and fig jam on potato bun.',
      price: 479,
      categoryId: categoryMap['burgers'].id,
      ingredients: 'Beef patty, Danish blue cheese, bacon rashers, fig preserve, arugula',
      imageUrl: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.8,
      prepTime: 16,
    },

    // Indian
    {
      name: 'Royal Butter Chicken (Murgh Makhani)',
      description: 'Tandoor-charred chicken morsels simmered in velvety tomato, butter, and cashew gravy infused with dried fenugreek leaves (kasoori methi).',
      price: 499,
      categoryId: categoryMap['indian'].id,
      ingredients: 'Chicken tikka, butter, fresh cream, ripe tomatoes, cashew paste, kasoori methi',
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.9,
      prepTime: 20,
    },
    {
      name: 'Paneer Tikka Masala',
      description: 'Cottage cheese cubes charred in tandoor with bell peppers and onions, cooked in a spiced rich onion-tomato masala.',
      price: 429,
      categoryId: categoryMap['indian'].id,
      ingredients: 'Fresh paneer, bell peppers, ginger-garlic paste, garam masala, cream',
      imageUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.7,
      prepTime: 18,
    },
    {
      name: 'Hyderabadi Dum Gosht Biryani',
      description: 'Long grain aged basmati rice layered with tender mutton marinated in curd and royal aromatic spices, slow-cooked in sealed clay handi.',
      price: 599,
      categoryId: categoryMap['indian'].id,
      ingredients: 'Basmati rice, tender mutton, saffron milk, fried onions (birista), mint leaves, ghee',
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.9,
      prepTime: 25,
    },
    {
      name: 'Dal Makhani Bukhara',
      description: 'Whole black lentils and kidney beans simmered overnight on slow charcoal fire with butter, churned cream, and mild Kashmiri spices.',
      price: 369,
      categoryId: categoryMap['indian'].id,
      ingredients: 'Black urad dal, rajma, white butter, heavy cream, ginger juliennes',
      imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.8,
      prepTime: 15,
    },

    // Chinese
    {
      name: 'Kung Pao Chicken',
      description: 'Wok-seared diced chicken tossed with Sichuan peppercorns, dried red chilies, spring onions, and roasted crunchy peanuts in tangy sauce.',
      price: 449,
      categoryId: categoryMap['chinese'].id,
      ingredients: 'Chicken cubes, Sichuan peppers, roasted peanuts, dried chilies, scallions, soy',
      imageUrl: 'https://images.unsplash.com/photo-1525755662778-989d0524087e?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.8,
      prepTime: 16,
    },
    {
      name: 'Crispy Veg Dim Sums (6 Pcs)',
      description: 'Translucent steamed crystal dumplings packed with water chestnuts, shiitake mushrooms, and bok choy. Served with chili-garlic oil.',
      price: 329,
      categoryId: categoryMap['chinese'].id,
      ingredients: 'Shiitake mushrooms, water chestnuts, bok choy, scallions, chili crisp dip',
      imageUrl: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.7,
      prepTime: 14,
    },
    {
      name: 'Szechuan Chili Garlic Noodles',
      description: 'Handmade wheat noodles stir-fried in smoking wok with julienned vegetables, crushed red chilies, garlic, and dark soy.',
      price: 349,
      categoryId: categoryMap['chinese'].id,
      ingredients: 'Egg noodles, cabbage, carrots, bell peppers, Szechuan sauce, garlic flakes',
      imageUrl: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.6,
      prepTime: 14,
    },
    {
      name: 'Crispy Honey Chili Lotus Stem',
      description: 'Sliced lotus root crisped to a golden crunch, tossed in hot sesame honey glaze with toasted scallions and sesame seeds.',
      price: 339,
      categoryId: categoryMap['chinese'].id,
      ingredients: 'Lotus root, organic honey, red chili paste, toasted white sesame, scallions',
      imageUrl: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.7,
      prepTime: 14,
    },

    // Desserts
    {
      name: 'Warm Belgian Chocolate Lava Cake',
      description: 'Rich dark Callebaut chocolate fondant cake with a molten warm center. Accompanied by Tahitian vanilla bean gelato.',
      price: 299,
      categoryId: categoryMap['desserts'].id,
      ingredients: 'Belgian dark chocolate 70%, butter, eggs, Madagascar vanilla gelato, mint sprig',
      imageUrl: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=600&auto=format&fit=crop&q=80',
      isVegetarian: false,
      rating: 4.9,
      prepTime: 12,
    },
    {
      name: 'Classic Venetian Tiramisu',
      description: 'Savoiardi ladyfingers soaked in espresso and coffee liqueur, layered with fluffy mascarpone cream and dusted with Dutch cocoa.',
      price: 329,
      categoryId: categoryMap['desserts'].id,
      ingredients: 'Mascarpone cheese, espresso coffee, Savoiardi biscuits, Dutch cocoa powder',
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.9,
      prepTime: 10,
    },
    {
      name: 'New York Baked Berry Cheesecake',
      description: 'Creamy Philadelphia cream cheese on a buttery graham cracker crust, topped with wild forest berry compote.',
      price: 349,
      categoryId: categoryMap['desserts'].id,
      ingredients: 'Cream cheese, graham crackers, butter, raspberries, blackberries, sugar',
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.8,
      prepTime: 10,
    },
    {
      name: 'Gulab Jamun with Rabri Brulee',
      description: 'Soft saffron mawa dumplings soaked in cardamom rose syrup, nestled on thick caramelized saffron rabri.',
      price: 279,
      categoryId: categoryMap['desserts'].id,
      ingredients: 'Khoya, saffron, green cardamom, rose water, reduced milk rabri, pistachio slivers',
      imageUrl: 'https://images.unsplash.com/photo-1593701461250-d7b22dfd3a77?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.9,
      prepTime: 10,
    },

    // Beverages
    {
      name: 'Passionfruit Mint Cooler',
      description: 'Sparkling tropical mocktail infused with fresh passionfruit pulp, crushed mint leaves, lime juice, and club soda.',
      price: 199,
      categoryId: categoryMap['beverages'].id,
      ingredients: 'Passionfruit puree, fresh mint, freshly squeezed lime, crushed ice, soda',
      imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.7,
      prepTime: 5,
    },
    {
      name: 'Iced Spanish Latte',
      description: 'Double shot of signature espresso shaken over ice with condensed milk, whole milk, and a dash of cinnamon powder.',
      price: 229,
      categoryId: categoryMap['beverages'].id,
      ingredients: 'Arabica espresso, sweetened condensed milk, fresh milk, ground cinnamon, ice',
      imageUrl: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.8,
      prepTime: 5,
    },
    {
      name: 'Blueberry Basil Lemonade',
      description: 'Muddled wild blueberries, fragrant sweet Italian basil, freshly pressed lemonade, and agave nectar.',
      price: 209,
      categoryId: categoryMap['beverages'].id,
      ingredients: 'Blueberries, Italian sweet basil, lemon juice, organic agave nectar, sparkling water',
      imageUrl: 'https://images.unsplash.com/photo-1536935338788-846bb9981813?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.6,
      prepTime: 5,
    },
    {
      name: 'Nutella Hazelnut Thickshake',
      description: 'Decadent shake blended with roasted Italian hazelnuts, creamy vanilla bean ice cream, milk, and chocolate fudge drizzle.',
      price: 249,
      categoryId: categoryMap['beverages'].id,
      ingredients: 'Nutella spread, roasted hazelnuts, vanilla ice cream, whipped cream, chocolate syrup',
      imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=600&auto=format&fit=crop&q=80',
      isVegetarian: true,
      rating: 4.9,
      prepTime: 8,
    },
  ];

  const createdMenuItems = [];
  for (const item of menuItemsData) {
    const created = await prisma.menuItem.create({ data: item });
    createdMenuItems.push(created);
  }

  // 4. Restaurant Tables (12 tables)
  console.log('🪑 Seeding restaurant tables...');
  const tablesData = [
    { tableNumber: 1, capacity: 2, location: 'Indoor', status: 'AVAILABLE' },
    { tableNumber: 2, capacity: 2, location: 'Indoor', status: 'AVAILABLE' },
    { tableNumber: 3, capacity: 4, location: 'Indoor', status: 'OCCUPIED' },
    { tableNumber: 4, capacity: 4, location: 'Indoor', status: 'AVAILABLE' },
    { tableNumber: 5, capacity: 6, location: 'Indoor', status: 'RESERVED' },
    { tableNumber: 6, capacity: 2, location: 'Patio', status: 'AVAILABLE' },
    { tableNumber: 7, capacity: 4, location: 'Patio', status: 'AVAILABLE' },
    { tableNumber: 8, capacity: 6, location: 'Patio', status: 'CLEANING' },
    { tableNumber: 9, capacity: 4, location: 'Rooftop', status: 'OCCUPIED' },
    { tableNumber: 10, capacity: 4, location: 'Rooftop', status: 'AVAILABLE' },
    { tableNumber: 11, capacity: 8, location: 'VIP', status: 'AVAILABLE' },
    { tableNumber: 12, capacity: 10, location: 'VIP', status: 'RESERVED' },
  ];

  const createdTables = [];
  for (const t of tablesData) {
    const created = await prisma.restaurantTable.create({ data: t });
    createdTables.push(created);
  }

  // 5. Reservations
  console.log('📅 Seeding reservations...');
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sampleReservations = [
    {
      customerId: customers[0].id,
      customerName: customers[0].name,
      customerEmail: customers[0].email,
      customerPhone: customers[0].phone,
      tableId: createdTables[4].id, // Table 5
      guestsCount: 4,
      reservationDate: today,
      reservationTime: '19:30',
      specialRequest: 'Corner booth requested for anniversary dinner',
      status: 'CONFIRMED',
    },
    {
      customerId: customers[1].id,
      customerName: customers[1].name,
      customerEmail: customers[1].email,
      customerPhone: customers[1].phone,
      tableId: createdTables[11].id, // Table 12
      guestsCount: 8,
      reservationDate: today,
      reservationTime: '20:00',
      specialRequest: 'Corporate dinner, quiet corner preferred',
      status: 'CONFIRMED',
    },
    {
      customerId: customers[2].id,
      customerName: customers[2].name,
      customerEmail: customers[2].email,
      customerPhone: customers[2].phone,
      tableId: createdTables[0].id, // Table 1
      guestsCount: 2,
      reservationDate: tomorrow,
      reservationTime: '18:30',
      specialRequest: 'First time visiting, excited to try chef specials',
      status: 'PENDING',
    },
    {
      customerId: customers[3].id,
      customerName: customers[3].name,
      customerEmail: customers[3].email,
      customerPhone: customers[3].phone,
      tableId: createdTables[9].id, // Table 10
      guestsCount: 4,
      reservationDate: tomorrow,
      reservationTime: '21:00',
      specialRequest: 'Window/Rooftop view seating please',
      status: 'PENDING',
    },
    {
      customerId: customers[4].id,
      customerName: customers[4].name,
      customerEmail: customers[4].email,
      customerPhone: customers[4].phone,
      tableId: createdTables[6].id, // Table 7
      guestsCount: 3,
      reservationDate: today,
      reservationTime: '13:00',
      specialRequest: 'High chair needed for toddler',
      status: 'COMPLETED',
    },
  ];

  for (const r of sampleReservations) {
    await prisma.reservation.create({ data: r });
  }

  // 6. Orders and OrderItems
  console.log('📦 Seeding sample orders...');
  const ordersSeed = [
    {
      orderNumber: 'ORD-1001',
      customer: customers[0],
      orderType: 'DINE_IN',
      tableId: createdTables[2].id, // Table 3
      status: 'PREPARING',
      items: [
        { menuItem: createdMenuItems[0], quantity: 2, instructions: 'Extra crispy' },
        { menuItem: createdMenuItems[12], quantity: 2, instructions: 'Well done patties' },
        { menuItem: createdMenuItems[28], quantity: 2, instructions: 'Less ice' },
      ],
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
    },
    {
      orderNumber: 'ORD-1002',
      customer: customers[1],
      orderType: 'DELIVERY',
      deliveryAddress: 'Apt 4B, Emerald Residency, Sector 62',
      instructions: 'Ring doorbell twice and leave at doorstep',
      status: 'PLACED',
      items: [
        { menuItem: createdMenuItems[8], quantity: 1, instructions: 'Thin crust' },
        { menuItem: createdMenuItems[9], quantity: 1, instructions: 'Extra hot honey' },
        { menuItem: createdMenuItems[25], quantity: 1, instructions: '' },
      ],
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
    },
    {
      orderNumber: 'ORD-1003',
      customer: customers[2],
      orderType: 'DINE_IN',
      tableId: createdTables[8].id, // Table 9
      status: 'READY',
      items: [
        { menuItem: createdMenuItems[16], quantity: 1, instructions: 'Medium spice' },
        { menuItem: createdMenuItems[18], quantity: 1, instructions: 'Extra raita' },
        { menuItem: createdMenuItems[27], quantity: 2, instructions: 'Served warm' },
      ],
      paymentStatus: 'PAID',
      paymentMethod: 'CASH',
    },
    {
      orderNumber: 'ORD-1004',
      customer: customers[3],
      orderType: 'TAKEAWAY',
      instructions: 'Customer will pick up by 8:15 PM',
      status: 'CONFIRMED',
      items: [
        { menuItem: createdMenuItems[13], quantity: 2, instructions: 'Extra chipotle ranch' },
        { menuItem: createdMenuItems[31], quantity: 2, instructions: 'Extra whipped cream' },
      ],
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
    },
    {
      orderNumber: 'ORD-1005',
      customer: customers[4],
      orderType: 'DELIVERY',
      deliveryAddress: 'Villa 12, Palm Meadows, Tech Park Road',
      instructions: 'Gate code #9021',
      status: 'DELIVERED',
      items: [
        { menuItem: createdMenuItems[4], quantity: 1, instructions: 'Extra lemon' },
        { menuItem: createdMenuItems[6], quantity: 1, instructions: '' },
        { menuItem: createdMenuItems[24], quantity: 2, instructions: 'Warm lava cake' },
      ],
      paymentStatus: 'PAID',
      paymentMethod: 'CARD',
    },
    {
      orderNumber: 'ORD-1006',
      customer: customers[5],
      orderType: 'DELIVERY',
      deliveryAddress: 'Block C-102, Silver Oak Towers',
      instructions: 'Call upon arrival',
      status: 'DELIVERED',
      items: [
        { menuItem: createdMenuItems[20], quantity: 2, instructions: 'Extra spicy' },
        { menuItem: createdMenuItems[22], quantity: 2, instructions: '' },
      ],
      paymentStatus: 'PAID',
      paymentMethod: 'ONLINE',
    },
  ];

  for (const o of ordersSeed) {
    let subtotal = 0;
    for (const it of o.items) {
      subtotal += it.menuItem.price * it.quantity;
    }
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const deliveryFee = o.orderType === 'DELIVERY' ? 40 : 0;
    const totalAmount = subtotal + tax + deliveryFee;

    const createdOrder = await prisma.order.create({
      data: {
        orderNumber: o.orderNumber,
        customerId: o.customer.id,
        customerName: o.customer.name,
        customerEmail: o.customer.email,
        customerPhone: o.customer.phone,
        orderType: o.orderType,
        tableId: o.tableId || null,
        deliveryAddress: o.deliveryAddress || null,
        instructions: o.instructions || null,
        subtotal,
        tax,
        deliveryFee,
        totalAmount,
        status: o.status,
      },
    });

    for (const it of o.items) {
      await prisma.orderItem.create({
        data: {
          orderId: createdOrder.id,
          menuItemId: it.menuItem.id,
          name: it.menuItem.name,
          price: it.menuItem.price,
          quantity: it.quantity,
          specialInstructions: it.instructions || null,
        },
      });
    }

    await prisma.payment.create({
      data: {
        orderId: createdOrder.id,
        amount: totalAmount,
        paymentMethod: o.paymentMethod,
        status: o.paymentStatus,
        transactionId: `TXN-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
        paidAt: o.paymentStatus === 'PAID' ? new Date() : null,
      },
    });
  }

  // 7. Restaurant Settings
  console.log('⚙️ Seeding restaurant settings...');
  await prisma.restaurantSetting.create({
    data: {
      name: 'DineDesk Luxury Bistro & Bar',
      tagline: 'Culinary Artistry, Flawless Hospitality & Immersive Dining',
      email: 'contact@dinedesk.com',
      phone: '+91 98765 43210',
      address: '42 Gourmet Boulevard, Connaught Circle, Metropolis - 110001',
      taxRate: 5.0,
      deliveryFee: 40.0,
      openingHours: 'Mon - Sun: 11:00 AM - 11:30 PM',
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('--------------------------------------------------');
  console.log('Demo Credentials:');
  console.log('👑 Admin:    admin@dinedesk.com     / admin123');
  console.log('👔 Staff:    staff@dinedesk.com     / staff123');
  console.log('🍳 Kitchen:  kitchen@dinedesk.com   / kitchen123');
  console.log('🛒 Customer: customer@dinedesk.com  / customer123');
  console.log('--------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
