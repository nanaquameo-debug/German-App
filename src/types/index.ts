export type SupportedCountry = 'DE' | 'FR' | 'INTL';
export type SupportedLanguage = 'en' | 'de' | 'fr';
export type SupportedCurrency = 'EUR' | 'USD' | 'GBP';

export type DietaryTag = 'Halal' | 'Vegan' | 'Vegetarian' | 'Gluten-Free' | 'Bio/Organic' | 'Nut-Free';

export interface MenuItemOptionGroup {
  id: string;
  name: string;
  nameDe?: string;
  nameFr?: string;
  minSelect: number;
  maxSelect: number;
  options: {
    id: string;
    name: string;
    nameDe?: string;
    nameFr?: string;
    price: number;
  }[];
}

export interface MenuItem {
  id: string;
  name: string;
  nameDe: string;
  nameFr: string;
  description: string;
  descriptionDe: string;
  descriptionFr: string;
  price: number;
  imageUrl: string;
  category: string;
  taxCategory: 'food_standard' | 'food_essential' | 'beverage_alcohol' | 'beverage_soft';
  calories?: number;
  dietaryTags: DietaryTag[];
  isPopular?: boolean;
  optionGroups?: MenuItemOptionGroup[];
}

export interface Restaurant {
  id: string;
  name: string;
  tagline: string;
  taglineDe: string;
  taglineFr: string;
  cuisine: string;
  cuisineDe: string;
  cuisineFr: string;
  rating: number;
  ratingCount: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  deliveryFee: number;
  minOrder: number;
  city: string;
  country: SupportedCountry;
  address: string;
  heroImage: string;
  logoImage: string;
  dietaryTags: DietaryTag[];
  menuCategories: string[];
  items: MenuItem[];
  isOpen: boolean;
  coordinates: { x: number; y: number }; // SVG map coordinates (0-1000 range)
}

export interface CartItemOption {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  price: number;
}

export interface GroupMember {
  id: string;
  name: string;
  avatar: string;
  isHost: boolean;
  joinedAt: string;
}

export interface GroupOrderSession {
  id: string;
  code: string;
  restaurantId: string;
  restaurantName: string;
  host: GroupMember;
  members: GroupMember[];
  spendingLimitPerPerson?: number; // null/undefined for unlimited
  cutoffMinutes: number;
  createdAt: string;
  expiresAt: string;
  status: 'open' | 'locked' | 'ordered';
  splitMode: 'host_pays' | 'split_evenly' | 'pay_own';
  joinUrl: string;
}

export interface CartItem {
  cartItemId: string;
  menuItem: MenuItem;
  restaurantId: string;
  restaurantName: string;
  quantity: number;
  selectedOptions: CartItemOption[];
  specialInstructions?: string;
  itemSubtotal: number;
  addedBy?: {
    id: string;
    name: string;
    avatar: string;
  };
}

export type OrderStatus =
  | 'placed'
  | 'kitchen_preparing'
  | 'ready_for_pickup'
  | 'driver_en_route'
  | 'arriving'
  | 'delivered'
  | 'cancelled';

export interface DriverInfo {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  vehicleType: 'e-bike' | 'scooter' | 'car';
  vehiclePlate?: string;
  rating: number;
  totalDeliveries: number;
  currentCoordinates: { x: number; y: number };
  speedKmh: number;
  bearing: number; // degrees
}

export interface TaxBreakdown {
  country: SupportedCountry;
  foodRatePercent: number;
  foodTaxAmount: number;
  standardRatePercent: number;
  standardTaxAmount: number;
  totalTax: number;
  mehrwegDeposit: number;
  cutleryOptedIn: boolean;
  taxLabel: string;
  complianceNotes: string[];
}

export interface PaymentDetails {
  method: 'card' | 'apple_pay' | 'google_pay' | 'paypal' | 'sofort_klarna';
  last4?: string;
  cardBrand?: string;
  transactionId: string;
  is3DSVerified: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  createdAt: string;
  restaurant: {
    id: string;
    name: string;
    address: string;
    country: SupportedCountry;
    coordinates: { x: number; y: number };
  };
  deliveryAddress: {
    street: string;
    city: string;
    postalCode: string;
    country: SupportedCountry;
    doorCode?: string;
    instructions?: string;
    coordinates: { x: number; y: number };
  };
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  promoCode?: string;
  mehrwegPackagingFee: number;
  cutleryIncluded: boolean;
  tipAmount: number;
  totalAmount: number;
  currency: SupportedCurrency;
  taxBreakdown: TaxBreakdown;
  status: OrderStatus;
  statusHistory: { status: OrderStatus; timestamp: string; note: string }[];
  estimatedDeliveryTime: string;
  etaMinutes: number;
  driver?: DriverInfo;
  payment: PaymentDetails;
  groupSession?: {
    id: string;
    code: string;
    hostName: string;
    membersCount: number;
    splitMode: 'host_pays' | 'split_evenly' | 'pay_own';
    memberSummaries: { memberName: string; itemCount: number; total: number }[];
  };
  driverRating?: {
    stars: number;
    tags: string[];
    comment?: string;
    ratedAt: string;
  };
  restaurantRating?: {
    stars: number;
    comment?: string;
    ratedAt: string;
  };
}

export interface PushNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'order_status' | 'promotion' | 'driver_message' | 'system';
  isRead: boolean;
  actionUrl?: string;
}

export type ActiveAppView = 'customer' | 'restaurant_kds' | 'driver_app' | 'admin_portal';
export type DevicePreviewMode = 'responsive' | 'iphone' | 'android';
