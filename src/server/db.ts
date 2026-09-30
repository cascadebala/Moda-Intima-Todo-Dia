import fs from 'fs';
import path from 'path';
import { Product, Category, Order, Coupon, Banner, Review, StoreSettings, CustomerUser } from '../types/index.ts';

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'store_db.json');

export interface DatabaseSchema {
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  reviews: Review[];
  settings: StoreSettings;
  customers: CustomerUser[];
}

const initialCategories: Category[] = [
  {
    id: 'cat-lingeries',
    name: 'Lingeries',
    slug: 'lingeries',
    description: 'Bralettes e peças delicadas com rendas nobres e toque macio.',
    image: '/src/assets/images/cat_lingerie_renda_1790726076080.jpg',
    itemCount: 8
  },
  {
    id: 'cat-conjuntos',
    name: 'Conjuntos',
    slug: 'conjuntos',
    description: 'Combinações sofisticadas de sutiã e calcinha com modelagem perfeita.',
    image: '/src/assets/images/cat_conjuntos_luxo_1790726102214.jpg',
    itemCount: 6
  },
  {
    id: 'cat-sutias',
    name: 'Sutiãs',
    slug: 'sutias',
    description: 'Sustentação, conforto sem aro, push-up e modelos para o dia a dia.',
    image: '/src/assets/images/cat_lingerie_renda_1790726076080.jpg',
    itemCount: 7
  },
  {
    id: 'cat-calcinhas',
    name: 'Calcinhas',
    slug: 'calcinhas',
    description: 'Fio dental, caleçon, tanga e calcinhas sem costura ultraconfortáveis.',
    image: '/src/assets/images/cat_conjuntos_luxo_1790726102214.jpg',
    itemCount: 9
  },
  {
    id: 'cat-pijamas',
    name: 'Pijamas',
    slug: 'pijamas',
    description: 'Pijamas acetinados, algodão nobre e sleepwear com elegância ímpar.',
    image: '/src/assets/images/cat_sleepwear_satin_1790726084222.jpg',
    itemCount: 5
  },
  {
    id: 'cat-babydoll',
    name: 'Baby Doll',
    slug: 'baby-doll',
    description: 'Sensualidade e frescor com tecidos fluidos e detalhes em tule e renda.',
    image: '/src/assets/images/cat_sleepwear_satin_1790726084222.jpg',
    itemCount: 4
  },
  {
    id: 'cat-masculino',
    name: 'Moda Masculina',
    slug: 'masculino',
    description: 'Cuecas boxer e slip em microfibra e modal com toque macio e respiração.',
    image: '/src/assets/images/cat_mens_underwear_1790726093399.jpg',
    itemCount: 6
  },
  {
    id: 'cat-kits',
    name: 'Kits',
    slug: 'kits',
    description: 'Kits promocionais com ótimo custo-benefício para renovar suas gavetas.',
    image: '/src/assets/images/cat_lingerie_renda_1790726076080.jpg',
    itemCount: 5
  }
];

const initialProducts: Product[] = [
  {
    id: 'prod-001',
    name: 'Conjunto Renda Chantilly Floratta',
    slug: 'conjunto-renda-chantilly-floratta',
    sku: 'MITD-CJ-001',
    category: 'Conjuntos',
    subcategory: 'Lingerie Fina',
    price: 189.90,
    promoPrice: 149.90,
    discountPercent: 21,
    stock: 28,
    minStockAlert: 5,
    isFeatured: true,
    isNew: true,
    isOnSale: true,
    rating: 4.9,
    reviewCount: 42,
    images: [
      '/src/assets/images/cat_conjuntos_luxo_1790726102214.jpg',
      '/src/assets/images/cat_lingerie_renda_1790726076080.jpg'
    ],
    colors: [
      { name: 'Vinho Bordô', hex: '#5B1525' },
      { name: 'Rosa Blush', hex: '#C87D85' },
      { name: 'Preto Clássico', hex: '#1C1917' }
    ],
    sizes: ['P (40)', 'M (42)', 'G (44)', 'GG (46)'],
    description: 'O Conjunto Renda Chantilly Floratta foi confeccionado para unir sofisticação e conforto inigualável. Sutiã com bojo suave removível, aro flexível anatômico e calcinha caleçon de renda nobre que não marca sob as roupas.',
    material: '88% Poliamida, 12% Elastano. Forro 100% Algodão antibacteriano.',
    careInstructions: 'Lavar à mão em água fria. Usar sabão neutro. Secar à sombra sem torcer. Não alvejar e não passar a ferro.',
    dimensions: '30x20x5 cm',
    weightGrams: 160,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-002',
    name: 'Pijama Longo Cetim Silk Serena',
    slug: 'pijama-longo-cetim-silk-serena',
    sku: 'MITD-PJ-002',
    category: 'Pijamas',
    subcategory: 'Sleepwear Premium',
    price: 269.00,
    promoPrice: 219.00,
    discountPercent: 19,
    stock: 18,
    minStockAlert: 4,
    isFeatured: true,
    isNew: false,
    isOnSale: true,
    rating: 5.0,
    reviewCount: 38,
    images: [
      '/src/assets/images/cat_sleepwear_satin_1790726084222.jpg'
    ],
    colors: [
      { name: 'Champagne Rosé', hex: '#EFE6E1' },
      { name: 'Rosa Nude', hex: '#C87D85' },
      { name: 'Azul Meia-Noite', hex: '#1E293B' }
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    description: 'Pijama de luxo confeccionado em cetim com elastano de toque sedoso e caimento impecável. Camisa com gola lapela, botões forrados e calça com elástico macio na cintura. Ideal para noites de puro bem-estar e noites aconchegantes.',
    material: '95% Poliéster Acetinado com toque de seda, 5% Elastano.',
    careInstructions: 'Lavagem delicada à máquina ou à mão. Não usar alvejante. Secagem em varal à sombra.',
    dimensions: '35x25x6 cm',
    weightGrams: 280,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-003',
    name: 'Bralette Renda Romance sem Aro',
    slug: 'bralette-renda-romance-sem-aro',
    sku: 'MITD-ST-003',
    category: 'Sutiãs',
    subcategory: 'Bralettes',
    price: 119.90,
    promoPrice: 89.90,
    discountPercent: 25,
    stock: 40,
    minStockAlert: 8,
    isFeatured: true,
    isNew: true,
    isOnSale: true,
    rating: 4.8,
    reviewCount: 56,
    images: [
      '/src/assets/images/cat_lingerie_renda_1790726076080.jpg'
    ],
    colors: [
      { name: 'Blush Nude', hex: '#D7C4BA' },
      { name: 'Off-White Silk', hex: '#FAF8F6' },
      { name: 'Bordô Glamour', hex: '#5B1525' }
    ],
    sizes: ['P (40)', 'M (42)', 'G (44)', 'GG (46)'],
    description: 'O Bralette Romance sem aro proporciona liberdade total de movimentos sem abrir mão da sustentação suave. Feito com renda elástica hipoalergênica e detalhes de alças duplas delicadas.',
    material: '90% Poliamida, 10% Elastano. Forro em microtule macio.',
    careInstructions: 'Lavar à mão. Não torcer. Secar na horizontal à sombra.',
    dimensions: '25x20x3 cm',
    weightGrams: 90,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-004',
    name: 'Kit 3 Cuecas Boxer Modal Ultra Comfort',
    slug: 'kit-3-cuecas-boxer-modal-ultra-comfort',
    sku: 'MITD-MS-004',
    category: 'Moda Masculina',
    subcategory: 'Boxer',
    price: 159.90,
    promoPrice: 129.90,
    discountPercent: 18,
    stock: 35,
    minStockAlert: 10,
    isFeatured: true,
    isNew: false,
    isOnSale: true,
    rating: 4.9,
    reviewCount: 64,
    images: [
      '/src/assets/images/cat_mens_underwear_1790726093399.jpg'
    ],
    colors: [
      { name: 'Kit Neutro (Preto/Cinza/Marinho)', hex: '#334155' },
      { name: 'Preto Total', hex: '#18181B' }
    ],
    sizes: ['P', 'M', 'G', 'GG', 'XG'],
    description: 'Desenvolvidas com a nobre fibra de modal, essas cuecas boxer masculinas oferecem conforto térmico inigualável, toque extremamente macio e elástico personalizado que não aperta a cintura nem enrola nas pernas.',
    material: '92% Modal Nobre, 8% Elastano. Forro frontal anatômico 100% Algodão.',
    careInstructions: 'Lavável em máquina. Evitar secadora para maior durabilidade da fibra.',
    dimensions: '28x18x5 cm',
    weightGrams: 320,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-005',
    name: 'Calcinha Fio Duplo Invisível Confort',
    slug: 'calcinha-fio-duplo-invisivel-confort',
    sku: 'MITD-CL-005',
    category: 'Calcinhas',
    subcategory: 'Sem Costura',
    price: 39.90,
    promoPrice: 29.90,
    discountPercent: 25,
    stock: 95,
    minStockAlert: 20,
    isFeatured: false,
    isNew: true,
    isOnSale: true,
    rating: 4.9,
    reviewCount: 88,
    images: [
      '/src/assets/images/cat_conjuntos_luxo_1790726102214.jpg'
    ],
    colors: [
      { name: 'Nude Areia', hex: '#EFE6E1' },
      { name: 'Preto', hex: '#1C1917' },
      { name: 'Vinho', hex: '#5B1525' }
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    description: 'A calcinha essencial para o dia a dia. Corte a laser e tecido ultrafino que não marca absolutamente nada, mesmo sob vestidos justos, calças de alfaiataria ou leggings de academia.',
    material: '85% Microfibra Poliamida, 15% Elastano. Fundo 100% Algodão.',
    careInstructions: 'Lavar à mão ou saquinho protetor. Secar à sombra.',
    dimensions: '18x15x1 cm',
    weightGrams: 45,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-006',
    name: 'Baby Doll Renda e Tule Glamour',
    slug: 'baby-doll-renda-e-tule-glamour',
    sku: 'MITD-BD-006',
    category: 'Baby Doll',
    subcategory: 'Sleepwear Sensual',
    price: 179.90,
    promoPrice: 139.90,
    discountPercent: 22,
    stock: 22,
    minStockAlert: 5,
    isFeatured: true,
    isNew: false,
    isOnSale: true,
    rating: 4.8,
    reviewCount: 31,
    images: [
      '/src/assets/images/cat_sleepwear_satin_1790726084222.jpg'
    ],
    colors: [
      { name: 'Rosa Vintage', hex: '#C87D85' },
      { name: 'Preto Nobre', hex: '#1C1917' },
      { name: 'Bordô Intenso', hex: '#5B1525' }
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    description: 'Baby doll confeccionado em tule elástico leve e renda floral macia com bojo anatômico forrado. Acompanha calcinha regulável em fita de cetim.',
    material: '90% Poliamida, 10% Elastano.',
    careInstructions: 'Lavar exclusivamente à mão com sabão neutro. Não torcer.',
    dimensions: '25x20x4 cm',
    weightGrams: 140,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-007',
    name: 'Kit 5 Calcinhas Algodão Todo Dia',
    slug: 'kit-5-calcinhas-algodao-todo-dia',
    sku: 'MITD-KT-007',
    category: 'Kits',
    subcategory: 'Kits Básicos',
    price: 149.90,
    promoPrice: 99.90,
    discountPercent: 33,
    stock: 45,
    minStockAlert: 12,
    isFeatured: true,
    isNew: true,
    isOnSale: true,
    rating: 4.9,
    reviewCount: 112,
    images: [
      '/src/assets/images/cat_lingerie_renda_1790726076080.jpg'
    ],
    colors: [
      { name: 'Cores Sortidas Pastéis', hex: '#EFE6E1' }
    ],
    sizes: ['P', 'M', 'G', 'GG'],
    description: 'O kit mais querido para a rotina diária! Composto por 5 calcinhas em puro algodão nobre respirável com elástico macio que não machuca. Saúde íntima e conforto máximo.',
    material: '96% Algodão Penteado Antialérgico, 4% Elastano.',
    careInstructions: 'Lavagem normal até 40°C. Não alvejar.',
    dimensions: '26x18x6 cm',
    weightGrams: 240,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-008',
    name: 'Sutiã Sustentação com Bojo Anatômico',
    slug: 'sutia-sustentacao-bojo-anatomico',
    sku: 'MITD-ST-008',
    category: 'Sutiãs',
    subcategory: 'Sustentação',
    price: 139.90,
    promoPrice: 119.90,
    discountPercent: 14,
    stock: 30,
    minStockAlert: 6,
    isFeatured: false,
    isNew: false,
    isOnSale: true,
    rating: 4.7,
    reviewCount: 45,
    images: [
      '/src/assets/images/cat_conjuntos_luxo_1790726102214.jpg'
    ],
    colors: [
      { name: 'Nude Pele', hex: '#D7C4BA' },
      { name: 'Preto', hex: '#18181B' },
      { name: 'Bordô', hex: '#5B1525' }
    ],
    sizes: ['40', '42', '44', '46', '48'],
    description: 'Sutiã com laterais largas redutoras que abraçam a silhueta, alças almofadadas que aliviam a pressão nos ombros e bojo ergonômico com suporte firme.',
    material: '82% Poliamida, 18% Elastano.',
    careInstructions: 'Lavar à mão para não deformar o bojo.',
    dimensions: '30x20x6 cm',
    weightGrams: 150,
    createdAt: new Date().toISOString()
  }
];

const initialBanners: Banner[] = [
  {
    id: 'ban-001',
    type: 'hero',
    title: 'Moda íntima para todos os dias',
    subtitle: 'Conforto, beleza e estilo para você se sentir incrível todos os dias.',
    buttonText: 'COMPRAR AGORA',
    buttonLink: '/produtos',
    image: '/src/assets/images/hero_lingerie_campaign_1790726065057.jpg',
    order: 1,
    isActive: true
  },
  {
    id: 'ban-002',
    type: 'secondary',
    title: 'Nova Coleção Seda & Renda',
    subtitle: 'Texturas nobres com toque macio para elevar sua autoestima.',
    buttonText: 'VER LANÇAMENTOS',
    buttonLink: '/novidades',
    image: '/src/assets/images/cat_lingerie_renda_1790726076080.jpg',
    order: 2,
    isActive: true
  },
  {
    id: 'ban-003',
    type: 'secondary',
    title: 'Ofertas Especiais de Estação',
    subtitle: 'Descontos de até 35% nos conjuntos e pijamas favoritos.',
    buttonText: 'VER OFERTAS',
    buttonLink: '/ofertas',
    image: '/src/assets/images/cat_conjuntos_luxo_1790726102214.jpg',
    order: 3,
    isActive: true
  }
];

const initialCoupons: Coupon[] = [
  {
    id: 'coup-001',
    code: 'BEMVINDA10',
    type: 'percentage',
    value: 10,
    minPurchaseValue: 100,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 500,
    usageCount: 42,
    isActive: true
  },
  {
    id: 'coup-002',
    code: 'TODO15',
    type: 'percentage',
    value: 15,
    minPurchaseValue: 200,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 300,
    usageCount: 19,
    isActive: true
  },
  {
    id: 'coup-003',
    code: 'PRIMEIRACOMPRA',
    type: 'fixed',
    value: 20,
    minPurchaseValue: 150,
    startDate: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: 1000,
    usageCount: 88,
    isActive: true
  }
];

const initialReviews: Review[] = [
  {
    id: 'rev-001',
    productId: 'prod-001',
    productName: 'Conjunto Renda Chantilly Floratta',
    authorName: 'Camila Duarte',
    rating: 5,
    title: 'Perfeição em forma de lingerie!',
    comment: 'A renda é inacreditavelmente macia! Não pinica em nada e veste como uma luva. O bordô é deslumbrante e o acabamento é de altíssimo padrão.',
    date: '2026-09-15',
    status: 'approved'
  },
  {
    id: 'rev-002',
    productId: 'prod-002',
    productName: 'Pijama Longo Cetim Silk Serena',
    authorName: 'Mariana Vasconcelos',
    rating: 5,
    title: 'Melhor compra do ano',
    comment: 'O toque desse cetim é maravilhoso, fresco e sofisticado. A embalagem veio perfumada e com um carinho que me conquistou. Já pedi mais um!',
    date: '2026-09-18',
    status: 'approved'
  },
  {
    id: 'rev-003',
    productId: 'prod-004',
    productName: 'Kit 3 Cuecas Boxer Modal Ultra Comfort',
    authorName: 'Rodrigo Siqueira',
    rating: 5,
    title: 'Conforto sem igual',
    comment: 'O tecido modal é outro nível comparado com algodão tradicional. Não enrola na perna nem aperta. Muito top.',
    date: '2026-09-21',
    status: 'approved'
  }
];

const initialOrders: Order[] = [
  {
    id: 'ord-1001',
    orderNumber: 'MITD-9482',
    customerName: 'Beatriz Silveira',
    customerEmail: 'beatriz.silveira@email.com',
    customerPhone: '(11) 98765-4321',
    customerCpf: '123.456.789-00',
    shippingAddress: {
      cep: '04538-132',
      street: 'Rua Amauri',
      number: '280',
      complement: 'Apto 81',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP'
    },
    shippingMethod: 'Sedex Express',
    shippingCost: 0,
    items: [
      {
        productId: 'prod-001',
        name: 'Conjunto Renda Chantilly Floratta',
        price: 149.90,
        selectedColor: 'Vinho Bordô',
        selectedSize: 'M (42)',
        quantity: 1,
        image: '/src/assets/images/cat_conjuntos_luxo_1790726102214.jpg'
      },
      {
        productId: 'prod-005',
        name: 'Calcinha Fio Duplo Invisível Confort',
        price: 29.90,
        selectedColor: 'Nude Areia',
        selectedSize: 'M',
        quantity: 2,
        image: '/src/assets/images/cat_conjuntos_luxo_1790726102214.jpg'
      }
    ],
    subtotal: 209.70,
    discount: 20.97,
    couponCode: 'BEMVINDA10',
    total: 188.73,
    paymentMethod: 'Pix',
    status: 'Preparando pedido',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'ord-1002',
    orderNumber: 'MITD-9483',
    customerName: 'Lucas Ferreira',
    customerEmail: 'lucas.ferreira@email.com',
    customerPhone: '(21) 99123-8877',
    customerCpf: '321.654.987-11',
    shippingAddress: {
      cep: '22410-003',
      street: 'Rua Garcia d\'Avila',
      number: '145',
      neighborhood: 'Ipanema',
      city: 'Rio de Janeiro',
      state: 'RJ'
    },
    shippingMethod: 'PAC Econômico',
    shippingCost: 15.00,
    items: [
      {
        productId: 'prod-004',
        name: 'Kit 3 Cuecas Boxer Modal Ultra Comfort',
        price: 129.90,
        selectedColor: 'Kit Neutro',
        selectedSize: 'G',
        quantity: 1,
        image: '/src/assets/images/cat_mens_underwear_1790726093399.jpg'
      }
    ],
    subtotal: 129.90,
    discount: 0,
    total: 144.90,
    paymentMethod: 'Cartão de Crédito',
    paymentDetails: {
      installments: 3,
      cardLast4: '4242'
    },
    status: 'Enviado',
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  }
];

const initialSettings: StoreSettings = {
  storeName: 'Moda Intima Todo Dia',
  tagline: 'Conforto, beleza e sofisticação para todos os seus dias.',
  logoUrl: '',
  whatsappNumber: '5511999998888',
  whatsappMessage: 'Olá! Gostaria de mais informações sobre as peças da Moda Intima Todo Dia.',
  email: 'modaintimatododia@gmail.com',
  phone: '(11) 3456-7890',
  instagram: '@modaintimatododia',
  facebook: 'modaintimatododia',
  tiktok: '@modaintimatododia',
  address: 'Av. Paulista, 1500 - Bela Vista, São Paulo - SP',
  businessHours: 'Segunda a Sábado, das 09h às 19h',
  freeShippingThreshold: 199.00,
  defaultShippingCost: 18.00,
  announcementBarText: '✨ FRETE GRÁTIS para compras acima de R$ 199 | 1ª Troca Grátis sem complicações',
  showAnnouncementBar: true,
  showCountdownPromo: true,
  countdownPromoEnd: new Date(Date.now() + 86400000 * 4).toISOString(),
  countdownPromoTitle: 'Semana da Lingerie Elegante – Até 35% OFF por tempo limitado'
};

const initialCustomers: CustomerUser[] = [
  {
    id: 'cust-001',
    name: 'Beatriz Silveira',
    email: 'beatriz.silveira@email.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    addresses: [
      {
        id: 'addr-1',
        title: 'Casa',
        cep: '04538-132',
        street: 'Rua Amauri',
        number: '280',
        complement: 'Apto 81',
        neighborhood: 'Itaim Bibi',
        city: 'São Paulo',
        state: 'SP',
        isDefault: true
      }
    ]
  }
];

export class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error('Error loading db file, initializing defaults:', e);
    }

    const defaultData: DatabaseSchema = {
      products: initialProducts,
      categories: initialCategories,
      orders: initialOrders,
      coupons: initialCoupons,
      banners: initialBanners,
      reviews: initialReviews,
      settings: initialSettings,
      customers: initialCustomers
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db file:', e);
    }
  }

  public getProducts(): Product[] {
    return this.data.products;
  }

  public getProductById(id: string): Product | undefined {
    return this.data.products.find(p => p.id === id || p.slug === id);
  }

  public addProduct(product: Omit<Product, 'id' | 'createdAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    this.data.products.unshift(newProduct);
    this.saveData(this.data);
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
    const index = this.data.products.findIndex(p => p.id === id);
    if (index === -1) return null;
    this.data.products[index] = { ...this.data.products[index], ...updates };
    this.saveData(this.data);
    return this.data.products[index];
  }

  public deleteProduct(id: string): boolean {
    const initialLen = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    const deleted = this.data.products.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  public getCategories(): Category[] {
    return this.data.categories;
  }

  public getOrders(): Order[] {
    return this.data.orders;
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find(o => o.id === id || o.orderNumber === id);
  }

  public createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const orderNumber = `MITD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Decrement stock automatically
    for (const item of newOrder.items) {
      const prod = this.data.products.find(p => p.id === item.productId);
      if (prod) {
        prod.stock = Math.max(0, prod.stock - item.quantity);
      }
    }

    // Increment coupon count if used
    if (newOrder.couponCode) {
      const coup = this.data.coupons.find(c => c.code.toUpperCase() === newOrder.couponCode?.toUpperCase());
      if (coup) {
        coup.usageCount = (coup.usageCount || 0) + 1;
      }
    }

    this.data.orders.unshift(newOrder);
    this.saveData(this.data);
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order['status']): Order | null {
    const order = this.data.orders.find(o => o.id === id || o.orderNumber === id);
    if (!order) return null;
    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.saveData(this.data);
    return order;
  }

  public getCoupons(): Coupon[] {
    return this.data.coupons;
  }

  public addCoupon(coupon: Omit<Coupon, 'id' | 'usageCount'>): Coupon {
    const newCoupon: Coupon = {
      ...coupon,
      id: `coup-${Date.now()}`,
      usageCount: 0
    };
    this.data.coupons.push(newCoupon);
    this.saveData(this.data);
    return newCoupon;
  }

  public deleteCoupon(id: string): boolean {
    const initialLen = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter(c => c.id !== id);
    const deleted = this.data.coupons.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  public validateCoupon(code: string, cartTotal: number): { valid: boolean; discount: number; message: string; coupon?: Coupon } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = this.data.coupons.find(c => c.code.toUpperCase() === cleanCode && c.isActive);

    if (!coupon) {
      return { valid: false, discount: 0, message: 'Cupom inválido ou expirado.' };
    }

    const today = new Date().toISOString().split('T')[0];
    if (coupon.startDate && coupon.startDate > today) {
      return { valid: false, discount: 0, message: 'Este cupom ainda não começou a valer.' };
    }
    if (coupon.expiryDate && coupon.expiryDate < today) {
      return { valid: false, discount: 0, message: 'Este cupom já expirou.' };
    }
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, message: 'Limite de utilizações deste cupom atingido.' };
    }
    if (cartTotal < coupon.minPurchaseValue) {
      return {
        valid: false,
        discount: 0,
        message: `Valor mínimo para este cupom é de R$ ${coupon.minPurchaseValue.toFixed(2).replace('.', ',')}.`
      };
    }

    let discount = 0;
    if (coupon.type === 'percentage') {
      discount = (cartTotal * coupon.value) / 100;
    } else {
      discount = Math.min(coupon.value, cartTotal);
    }

    return {
      valid: true,
      discount: Math.round(discount * 100) / 100,
      message: `Cupom aplicado! Economia de R$ ${discount.toFixed(2).replace('.', ',')}`,
      coupon
    };
  }

  public getBanners(): Banner[] {
    return this.data.banners.sort((a, b) => a.order - b.order);
  }

  public updateBanner(id: string, updates: Partial<Banner>): Banner | null {
    const banner = this.data.banners.find(b => b.id === id);
    if (!banner) return null;
    Object.assign(banner, updates);
    this.saveData(this.data);
    return banner;
  }

  public addBanner(banner: Omit<Banner, 'id'>): Banner {
    const newBanner: Banner = {
      ...banner,
      id: `ban-${Date.now()}`
    };
    this.data.banners.push(newBanner);
    this.saveData(this.data);
    return newBanner;
  }

  public deleteBanner(id: string): boolean {
    const initialLen = this.data.banners.length;
    this.data.banners = this.data.banners.filter(b => b.id !== id);
    const deleted = this.data.banners.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  public getReviews(status?: string): Review[] {
    if (status) {
      return this.data.reviews.filter(r => r.status === status);
    }
    return this.data.reviews;
  }

  public addReview(review: Omit<Review, 'id' | 'date' | 'status'>): Review {
    const newReview: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'approved' // Automatically approved for demonstration unless moderated
    };
    this.data.reviews.unshift(newReview);
    this.saveData(this.data);
    return newReview;
  }

  public updateReviewStatus(id: string, status: Review['status']): Review | null {
    const review = this.data.reviews.find(r => r.id === id);
    if (!review) return null;
    review.status = status;
    this.saveData(this.data);
    return review;
  }

  public getSettings(): StoreSettings {
    return this.data.settings;
  }

  public updateSettings(updates: Partial<StoreSettings>): StoreSettings {
    this.data.settings = { ...this.data.settings, ...updates };
    this.saveData(this.data);
    return this.data.settings;
  }

  public getStats() {
    const totalOrders = this.data.orders.length;
    const paidOrders = this.data.orders.filter(o => o.status !== 'Cancelado');
    const revenue = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const totalProducts = this.data.products.length;
    const lowStockProducts = this.data.products.filter(p => p.stock <= p.minStockAlert);
    const outOfStockProducts = this.data.products.filter(p => p.stock === 0);

    return {
      revenue,
      totalOrders,
      averageTicket: totalOrders > 0 ? revenue / totalOrders : 0,
      totalProducts,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      recentOrders: this.data.orders.slice(0, 5),
      lowStockProducts
    };
  }
}

export const db = new Database();
