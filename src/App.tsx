import React, { useState, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Clock,
  Bike,
  Sparkles,
  ShieldCheck,
  CheckCircle,
  Truck,
  RotateCcw,
  Store,
  Compass,
} from 'lucide-react';
import {
  ActiveAppView,
  CartItem,
  CartItemOption,
  DevicePreviewMode,
  DietaryTag,
  GroupMember,
  GroupOrderSession,
  MenuItem,
  Order,
  PushNotification,
  Restaurant,
  SupportedCountry,
  SupportedLanguage,
} from './types';
import { TRANSLATIONS } from './data/translations';
import { INITIAL_RESTAURANTS, INITIAL_ORDERS } from './data/restaurants';
import { Header } from './components/Header';
import { RestaurantCard } from './components/RestaurantCard';
import { RestaurantDetailView } from './components/RestaurantDetailView';
import { ItemCustomizerModal } from './components/ItemCustomizerModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { GroupOrderModal } from './components/GroupOrderModal';
import { LiveGpsMap } from './components/LiveGpsMap';
import { DriverRatingModal } from './components/DriverRatingModal';
import { DriverChatModal } from './components/DriverChatModal';
import { OrderHistoryView } from './components/OrderHistoryView';
import { RestaurantKdsView } from './components/RestaurantKdsView';
import { DriverAppView } from './components/DriverAppView';
import { AdminPortalView } from './components/AdminPortalView';
import { LegalComplianceModal } from './components/LegalComplianceModal';
import { PushNotificationCenter } from './components/PushNotificationCenter';
import { generateGroupCode } from './utils/groupOrder';
import { sounds } from './utils/sound';

export default function App() {
  // Locale & Market Settings
  const [country, setCountry] = useState<SupportedCountry>('DE');
  const [language, setLanguage] = useState<SupportedLanguage>('en');
  const t = TRANSLATIONS[language];

  // Active View & Device Simulator Frame
  const [activeView, setActiveView] = useState<ActiveAppView>('customer');
  const [deviceMode, setDeviceMode] = useState<DevicePreviewMode>('responsive');

  // Restaurants & Search Filters
  const [restaurants] = useState<Restaurant[]>(INITIAL_RESTAURANTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDietary, setSelectedDietary] = useState<DietaryTag | 'ALL'>('ALL');
  const [sortBy, setSortBy] = useState<'rating' | 'time' | 'fee'>('rating');

  // Customer Navigation State
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [customizingItem, setCustomizingItem] = useState<{
    item: MenuItem;
    restaurantId: string;
    restaurantName: string;
  } | null>(null);

  // Cart & Group Order State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMehrwegOptIn, setIsMehrwegOptIn] = useState(false);
  const [isCutleryOptIn, setIsCutleryOptIn] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeGroupSession, setActiveGroupSession] = useState<GroupOrderSession | null>(null);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  // Orders & Live GPS Tracking
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState<Order | null>(null);
  const [ratingOrder, setRatingOrder] = useState<Order | null>(null);
  const [isDriverChatOpen, setIsDriverChatOpen] = useState(false);

  // Modals & Push Notifications
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isLegalOpen, setIsLegalOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<PushNotification[]>([
    {
      id: 'n1',
      title: 'Welcome to VoltDash EuroExpress!',
      message: 'Explore artisan burgers in Berlin and authentic French bistros in Paris.',
      timestamp: '10:00',
      type: 'promotion',
      isRead: false,
    },
    {
      id: 'n2',
      title: 'Special Launch Promo: BONJOUR10',
      message: 'Get 10% off your entire order with promo code BONJOUR10 at checkout.',
      timestamp: '10:15',
      type: 'promotion',
      isRead: false,
    },
  ]);

  // Derived filtered restaurants
  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesCountry = r.country === country;
      const matchesSearch =
        searchQuery.trim() === '' ||
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisineDe.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.cuisineFr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.items.some(
          (it) =>
            it.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            it.nameDe.toLowerCase().includes(searchQuery.toLowerCase()) ||
            it.nameFr.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchesDietary =
        selectedDietary === 'ALL' || r.dietaryTags.includes(selectedDietary);
      return matchesCountry && matchesSearch && matchesDietary;
    }).sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'time') return a.deliveryTimeMin - b.deliveryTimeMin;
      return a.deliveryFee - b.deliveryFee;
    });
  }, [restaurants, country, searchQuery, selectedDietary, sortBy]);

  // Cart Handlers
  const cartSubtotal = cartItems.reduce((acc, curr) => acc + curr.itemSubtotal, 0);
  const cartCount = cartItems.reduce((acc, curr) => acc + curr.quantity, 0);

  const handleAddToCart = (
    item: MenuItem,
    restaurantId: string,
    restaurantName: string,
    quantity: number,
    selectedOptions: CartItemOption[],
    specialInstructions: string
  ) => {
    // If cart has items from another restaurant, warn and replace
    if (cartItems.length > 0 && cartItems[0].restaurantId !== restaurantId) {
      if (
        !confirm(
          `Your basket currently contains dishes from ${cartItems[0].restaurantName}. Clear basket and add from ${restaurantName}?`
        )
      ) {
        return;
      }
      setCartItems([]);
    }

    const optionsPrice = selectedOptions.reduce((acc, o) => acc + o.price, 0);
    const itemSubtotal = (item.price + optionsPrice) * quantity;
    const newItem: CartItem = {
      cartItemId: `ci-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItem: item,
      restaurantId,
      restaurantName,
      quantity,
      selectedOptions,
      specialInstructions,
      itemSubtotal,
      addedBy: activeGroupSession
        ? {
            id: activeGroupSession.host.id,
            name: activeGroupSession.host.name,
            avatar: activeGroupSession.host.avatar,
          }
        : undefined,
    };

    setCartItems((prev) => [...prev, newItem]);
    sounds.playPushPing();
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.cartItemId === cartItemId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            const singleUnitPrice = item.itemSubtotal / item.quantity;
            return {
              ...item,
              quantity: nextQty,
              itemSubtotal: singleUnitPrice * nextQty,
            };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((it) => it.cartItemId !== cartItemId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  // Group Order Session Handlers
  const handleStartGroupSession = (
    restaurant: Restaurant,
    spendingLimit: number | undefined,
    cutoffMinutes: number,
    splitMode: GroupOrderSession['splitMode']
  ) => {
    // If cart has items from another restaurant, clear them
    if (cartItems.length > 0 && cartItems[0].restaurantId !== restaurant.id) {
      setCartItems([]);
    }

    const code = generateGroupCode();
    const now = new Date();
    const cutoffDate = new Date(now.getTime() + cutoffMinutes * 60000);
    const hostMember: GroupMember = {
      id: 'host-1',
      name: country === 'DE' ? 'Marcus (Host)' : 'Marcus (Hôte)',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      isHost: true,
      joinedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newSession: GroupOrderSession = {
      id: `session-${Date.now()}`,
      code,
      restaurantId: restaurant.id,
      restaurantName: restaurant.name,
      host: hostMember,
      members: [hostMember],
      spendingLimitPerPerson: spendingLimit,
      cutoffMinutes,
      createdAt: now.toISOString(),
      expiresAt: cutoffDate.toISOString(),
      status: 'open',
      splitMode,
      joinUrl: `https://voltdash.eu/join/${code}`,
    };

    setActiveGroupSession(newSession);
    setSelectedRestaurant(restaurant);

    // Push notification
    const notif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: `Group Order Created: ${code}`,
      message: `Group order started for ${restaurant.name}. Share the join link with your friends!`,
      timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system',
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    sounds.playPushPing();
  };

  const handleLockGroupSession = () => {
    if (!activeGroupSession) return;
    const nextStatus = activeGroupSession.status === 'open' ? 'locked' : 'open';
    setActiveGroupSession((prev) => (prev ? { ...prev, status: nextStatus } : null));

    const notif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: nextStatus === 'locked' ? 'Group Cart Locked' : 'Group Cart Reopened',
      message: nextStatus === 'locked'
        ? 'No more items can be added. Ready for host checkout.'
        : 'Friends can now add and edit items in the group cart.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system',
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
    sounds.playPushPing();
  };

  const handleEndGroupSession = () => {
    setActiveGroupSession(null);
    const notif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: 'Group Order Ended',
      message: 'Group session has been closed.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system',
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  const handleSimulateFriendJoin = () => {
    const targetRestaurant =
      selectedRestaurant ||
      (cartItems.length > 0 ? restaurants.find((r) => r.id === cartItems[0].restaurantId) : null) ||
      restaurants[0];

    let currentSession: GroupOrderSession;
    if (activeGroupSession) {
      currentSession = activeGroupSession;
    } else {
      const code = generateGroupCode();
      const now = new Date();
      const cutoffMinutes = 30;
      const cutoffDate = new Date(now.getTime() + cutoffMinutes * 60000);
      const hostMember: GroupMember = {
        id: 'host-1',
        name: country === 'DE' ? 'Marcus (Host)' : 'Marcus (Hôte)',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        isHost: true,
        joinedAt: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      currentSession = {
        id: `session-${Date.now()}`,
        code,
        restaurantId: targetRestaurant.id,
        restaurantName: targetRestaurant.name,
        host: hostMember,
        members: [hostMember],
        spendingLimitPerPerson: 25,
        cutoffMinutes,
        createdAt: now.toISOString(),
        expiresAt: cutoffDate.toISOString(),
        status: 'open',
        splitMode: 'pay_own',
        joinUrl: `https://voltdash.eu/join/${code}`,
      };
      setActiveGroupSession(currentSession);
    }

    const friendRoster = [
      {
        id: 'friend-sophie',
        name: 'Sophie Laurent',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      },
      {
        id: 'friend-max',
        name: 'Max Zimmermann',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      },
      {
        id: 'friend-lea',
        name: 'Léa Fontaine',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      },
    ];

    const existingIds = new Set(currentSession.members.map((m) => m.id));
    const candidate = friendRoster.find((f) => !existingIds.has(f.id)) || {
      id: `friend-${Date.now()}`,
      name: `Friend ${currentSession.members.length + 1}`,
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
    };

    const newMember: GroupMember = {
      id: candidate.id,
      name: candidate.name,
      avatar: candidate.avatar,
      isHost: false,
      joinedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const rest = restaurants.find((r) => r.id === currentSession.restaurantId) || targetRestaurant;
    const dishIndex = (currentSession.members.length - 1) % rest.items.length;
    const dish = rest.items[dishIndex >= 0 ? dishIndex : 0];

    const selectedOptions: CartItemOption[] = [];
    if (dish.optionGroups && dish.optionGroups.length > 0 && dish.optionGroups[0].options.length > 0) {
      const grp = dish.optionGroups[0];
      const opt = grp.options[0];
      selectedOptions.push({
        groupId: grp.id,
        groupName: grp.name,
        optionId: opt.id,
        optionName: opt.name,
        price: opt.price,
      });
    }

    const optionsPrice = selectedOptions.reduce((acc, o) => acc + o.price, 0);

    const newItem: CartItem = {
      cartItemId: `ci-grp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      menuItem: dish,
      restaurantId: rest.id,
      restaurantName: rest.name,
      quantity: 1,
      selectedOptions,
      specialInstructions: 'Extra sauce on the side please!',
      itemSubtotal: dish.price + optionsPrice,
      addedBy: {
        id: candidate.id,
        name: candidate.name,
        avatar: candidate.avatar,
      },
    };

    setActiveGroupSession((prev) => {
      if (!prev) return currentSession;
      const exists = prev.members.some((m) => m.id === candidate.id);
      return {
        ...prev,
        members: exists ? prev.members : [...prev.members, newMember],
      };
    });

    setCartItems((prev) => [...prev, newItem]);
    sounds.playPushPing();

    const notif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: `👥 ${candidate.name} joined the Group Order!`,
      message: `Added ${dish.name} (€${newItem.itemSubtotal.toFixed(2)}) to the shared basket.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'promotion',
      isRead: false,
    };
    setNotifications((prev) => [notif, ...prev]);
  };

  // Order Placement and Live GPS initiation
  const handleOrderCompleted = (newOrder: Order) => {
    setOrders((prev) => [newOrder, ...prev]);
    setCartItems([]);
    setSelectedRestaurant(null);
    setIsHistoryOpen(false);
    setActiveTrackingOrder(newOrder);
    setActiveGroupSession(null); // Complete group session

    // Push notification for order confirmation
    const newNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: `${newOrder.restaurant.name}: Order Confirmed!`,
      message: `Your food is being prepared. Real-time GPS tracking is now live.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'order_status',
      isRead: false,
    };
    setNotifications((prev) => [newNotif, ...prev]);
    sounds.playOrderPlaced();
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: newStatus,
            statusHistory: [
              ...ord.statusHistory,
              {
                status: newStatus,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                note: `Order advanced to ${newStatus}`,
              },
            ],
          };
        }
        return ord;
      })
    );

    if (activeTrackingOrder && activeTrackingOrder.id === orderId) {
      setActiveTrackingOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    // Push Notification trigger
    const statusTitles: Record<string, string> = {
      kitchen_preparing: 'Kitchen is preparing your meal',
      ready_for_pickup: 'Courier Lucas has arrived to collect food',
      driver_en_route: 'Courier is on the way! ETA ~12 mins',
      arriving: 'Courier is at your doorstep!',
      delivered: 'Delivered! Bon Appétit.',
    };

    if (statusTitles[newStatus]) {
      const notif: PushNotification = {
        id: `notif-${Date.now()}`,
        title: statusTitles[newStatus],
        message: `Order #${orderId} update from VoltDash Express.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'order_status',
        isRead: false,
      };
      setNotifications((prev) => [notif, ...prev]);
      sounds.playPushPing();
    }
  };

  const handleReorder = (order: Order) => {
    setCartItems(order.items);
    setIsCartOpen(true);
    setIsHistoryOpen(false);
    sounds.playPushPing();
  };

  const handleSubmitRating = (
    orderId: string,
    stars: number,
    tags: string[],
    comment: string,
    foodStars: number
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            driverRating: {
              stars,
              tags,
              comment,
              ratedAt: new Date().toISOString(),
            },
            restaurantRating: {
              stars: foodStars,
              comment,
              ratedAt: new Date().toISOString(),
            },
          };
        }
        return o;
      })
    );

    const thankYouNotif: PushNotification = {
      id: `notif-${Date.now()}`,
      title: 'Rating Submitted!',
      message: `Thank you for rating courier Lucas ${stars} stars. Your feedback helps our eco-fleet!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'system',
      isRead: false,
    };
    setNotifications((prev) => [thankYouNotif, ...prev]);
  };

  // Main UI shell inside optional Device Simulator Frame
  const renderContent = () => {
    if (activeView === 'restaurant_kds') {
      return (
        <RestaurantKdsView
          orders={orders}
          restaurants={restaurants}
          language={language}
          onUpdateOrderStatus={handleUpdateOrderStatus}
        />
      );
    }

    if (activeView === 'driver_app') {
      return (
        <DriverAppView
          orders={orders}
          language={language}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onOpenCustomerChat={() => setIsDriverChatOpen(true)}
        />
      );
    }

    if (activeView === 'admin_portal') {
      return (
        <AdminPortalView
          orders={orders}
          restaurants={restaurants}
          language={language}
        />
      );
    }

    // Customer App View
    if (isHistoryOpen) {
      return (
        <OrderHistoryView
          orders={orders}
          language={language}
          onReorder={handleReorder}
          onTrackOrder={(ord) => {
            setActiveTrackingOrder(ord);
            setSelectedRestaurant(null);
            setIsHistoryOpen(false);
          }}
          onRateOrder={(ord) => {
            setRatingOrder(ord);
            setIsHistoryOpen(false);
          }}
        />
      );
    }

    if (selectedRestaurant) {
      return (
        <RestaurantDetailView
          restaurant={selectedRestaurant}
          language={language}
          onBack={() => setSelectedRestaurant(null)}
          onOpenGroupOrder={() => setIsGroupModalOpen(true)}
          onSelectItem={(item) =>
            setCustomizingItem({
              item,
              restaurantId: selectedRestaurant.id,
              restaurantName: selectedRestaurant.name,
            })
          }
        />
      );
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Active Order Live GPS Tracking Widget (if active) */}
        {activeTrackingOrder && (
          <section aria-label="Active delivery live GPS tracking">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-extrabold text-stone-900 tracking-tight flex items-center space-x-2">
                <Truck className="w-5 h-5 text-emerald-600" />
                <span>Live Active Order: {activeTrackingOrder.restaurant.name}</span>
              </h2>
              <button
                onClick={() => setActiveTrackingOrder(null)}
                className="text-xs text-stone-500 hover:text-stone-900 font-semibold cursor-pointer"
              >
                Dismiss Map
              </button>
            </div>
            <LiveGpsMap
              order={activeTrackingOrder}
              language={language}
              onUpdateStatus={(newStatus) => handleUpdateOrderStatus(activeTrackingOrder.id, newStatus)}
              onOpenDriverChat={() => setIsDriverChatOpen(true)}
              onOpenRatingModal={() => setRatingOrder(activeTrackingOrder)}
            />
          </section>
        )}

        {/* Hero Banner with Market Branding & Launch Promos */}
        <section
          aria-label="Promotion Banner"
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white p-6 sm:p-10 shadow-xl border border-stone-800"
        >
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-mono font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {country === 'DE'
                  ? 'Berlin & München Express • Mehrweg-Zertifiziert'
                  : 'Paris & Lyon Express • Conforme Loi AGEC'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              {country === 'DE' ? (
                <>
                  Heiß geliefert in unter <span className="text-amber-400">30 Minuten</span>.
                </>
              ) : (
                <>
                  Vos restaurants préférés livrés en <span className="text-amber-400">30 minutes</span>.
                </>
              )}
            </h1>

            <p className="text-stone-300 text-sm sm:text-base leading-relaxed">
              {country === 'DE'
                ? 'Originale Berliner Smash Burger, traditionelle bayerische Kässpatzen und Bio-Köstlichkeiten mit 100% E-Bike-Kurieren.'
                : 'Bistronomie parisienne, boulangeries au levain et sushis ultra-frais livrés sans plastique jetable.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <div className="bg-stone-800/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-stone-700 text-xs font-mono">
                Code:{' '}
                <strong className="text-amber-400">
                  {country === 'DE' ? 'WILLKOMMEN15' : 'BONJOUR10'}
                </strong>{' '}
                ({country === 'DE' ? '15% Rabatt' : '10% de réduction'})
              </div>
              <span className="text-xs text-stone-400">
                &bull; MwSt. & TVA fiscalement conforme
              </span>
            </div>
          </div>

          <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-20 pointer-events-none hidden sm:block bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-500/40 via-transparent to-transparent" />
        </section>

        {/* Search & Dietary Filters Bar */}
        <section aria-label="Restaurant Filters" className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-11 pr-4 py-3 bg-white rounded-2xl border border-stone-200 text-sm placeholder-stone-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent shadow-2xs"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-stone-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs font-semibold text-stone-700 focus:ring-2 focus:ring-amber-500 cursor-pointer shadow-2xs"
              >
                <option value="rating">Top Rated (★ 4.8+)</option>
                <option value="time">Fastest Delivery Time</option>
                <option value="fee">Lowest Delivery Fee</option>
              </select>
            </div>
          </div>

          {/* Dietary Filter Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
            {(['ALL', 'Halal', 'Vegan', 'Vegetarian', 'Gluten-Free', 'Bio/Organic'] as const).map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedDietary(tag)}
                  className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedDietary === tag
                      ? 'bg-amber-500 text-stone-950 shadow-xs'
                      : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  {tag === 'ALL' ? 'All Diets' : tag}
                </button>
              )
            )}
          </div>
        </section>

        {/* Restaurant Partners Grid */}
        <section aria-label="Restaurant Catalog">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">
              {country === 'DE' ? 'Top Partner-Restaurants in Deutschland' : 'Les Meilleurs Restaurants Partenaires'}
            </h2>
            <span className="text-xs text-stone-500 font-medium font-mono">
              {filteredRestaurants.length} available
            </span>
          </div>

          {filteredRestaurants.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200">
              <Store className="w-12 h-12 text-stone-300 mx-auto mb-3" />
              <h3 className="font-bold text-stone-800 text-base">No restaurants match your search</h3>
              <p className="text-xs text-stone-500 mt-1">Try resetting the dietary filter or searching for another dish</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRestaurants.map((restaurant) => (
                <RestaurantCard
                  key={restaurant.id}
                  restaurant={restaurant}
                  language={language}
                  onClick={() => setSelectedRestaurant(restaurant)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans flex flex-col">
      {/* Header */}
      <Header
        country={country}
        onCountryChange={(c) => {
          setCountry(c);
          setSelectedRestaurant(null);
        }}
        language={language}
        onLanguageChange={setLanguage}
        activeView={activeView}
        onViewChange={(v) => {
          setActiveView(v);
          setIsHistoryOpen(false);
          setSelectedRestaurant(null);
        }}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
        cartCount={cartCount}
        cartSubtotal={cartSubtotal}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenHistory={() => {
          setActiveView('customer');
          setIsHistoryOpen(true);
        }}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        onOpenLegal={() => setIsLegalOpen(true)}
        unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
        activeGroupSession={activeGroupSession}
        onOpenGroupOrder={() => setIsGroupModalOpen(true)}
      />

      {/* Main Content (Wrapped in Optional Device Frame Simulator for iOS / Android) */}
      <main className="flex-1 flex justify-center items-start w-full">
        {deviceMode === 'responsive' ? (
          <div className="w-full">{renderContent()}</div>
        ) : (
          <div className="py-8 px-4 flex justify-center w-full">
            {/* Mobile Device Frame */}
            <div
              className={`relative bg-stone-950 rounded-[48px] p-3.5 shadow-2xl border-4 border-stone-700/80 ${
                deviceMode === 'iphone' ? 'w-[393px] min-h-[852px]' : 'w-[412px] min-h-[880px]'
              }`}
            >
              {/* Dynamic Island / Camera Punch Hole */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30">
                {deviceMode === 'iphone' ? (
                  <div className="w-28 h-6 bg-stone-900 rounded-full border border-stone-800 flex items-center justify-between px-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-950" />
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-950" />
                  </div>
                ) : (
                  <div className="w-3.5 h-3.5 bg-stone-900 rounded-full border border-stone-800" />
                )}
              </div>

              {/* Mobile Screen Surface */}
              <div className="bg-stone-50 rounded-[38px] overflow-y-auto max-h-[800px] w-full pt-10 pb-6">
                {renderContent()}
              </div>

              {/* Bottom Home Indicator */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-600 rounded-full" />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-12 py-8 text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-stone-900">VoltDash Europe</span>
            <span>&bull;</span>
            <span>Local & Sustainable Delivery</span>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLegalOpen(true)}
              className="hover:text-stone-900 underline underline-offset-2 cursor-pointer"
            >
              {t.legalNotices}
            </button>
            <span>&bull;</span>
            <span>DE §33 VerpackG Reusable Packaging Certified</span>
            <span>&bull;</span>
            <span>FR Loi AGEC Compliant</span>
          </div>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {/* 1. Item Customizer Modal */}
      {customizingItem && (
        <ItemCustomizerModal
          item={customizingItem.item}
          restaurantId={customizingItem.restaurantId}
          restaurantName={customizingItem.restaurantName}
          language={language}
          onClose={() => setCustomizingItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {/* 2. Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        country={country}
        language={language}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        isMehrwegOptIn={isMehrwegOptIn}
        onToggleMehrweg={setIsMehrwegOptIn}
        isCutleryOptIn={isCutleryOptIn}
        onToggleCutlery={setIsCutleryOptIn}
        deliveryFee={cartItems.length > 0 ? 2.49 : 0}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        activeGroupSession={activeGroupSession}
        onOpenGroupModal={() => setIsGroupModalOpen(true)}
        onSimulateFriendAdd={handleSimulateFriendJoin}
      />

      {/* 3. Secure Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        country={country}
        language={language}
        deliveryFee={2.49}
        isMehrwegOptIn={isMehrwegOptIn}
        isCutleryOptIn={isCutleryOptIn}
        onOrderCompleted={handleOrderCompleted}
        activeGroupSession={activeGroupSession}
      />

      {/* 3b. Group Order Session Modal */}
      <GroupOrderModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        restaurants={filteredRestaurants.length > 0 ? filteredRestaurants : restaurants}
        currentRestaurant={
          selectedRestaurant ||
          (cartItems.length > 0
            ? restaurants.find((r) => r.id === cartItems[0].restaurantId) || null
            : null)
        }
        activeSession={activeGroupSession}
        onStartSession={handleStartGroupSession}
        onLockSession={handleLockGroupSession}
        onEndSession={handleEndGroupSession}
        onSimulateFriendJoin={handleSimulateFriendJoin}
        language={language}
      />

      {/* 4. Driver Rating Modal */}
      {ratingOrder && (
        <DriverRatingModal
          order={ratingOrder}
          language={language}
          onClose={() => setRatingOrder(null)}
          onSubmitRating={handleSubmitRating}
        />
      )}

      {/* 5. Driver Live Chat Modal */}
      {isDriverChatOpen && (
        <DriverChatModal
          isOpen={isDriverChatOpen}
          onClose={() => setIsDriverChatOpen(false)}
          driver={
            activeTrackingOrder?.driver || {
              id: 'drv-lucas',
              name: country === 'DE' ? 'Lucas Richter' : 'Alexandre Dubois',
              avatar:
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
              phone: '+49 176 9928 1142',
              vehicleType: 'e-bike',
              rating: 4.96,
              totalDeliveries: 1420,
              currentCoordinates: { x: 300, y: 280 },
              speedKmh: 22,
              bearing: 90,
            }
          }
          language={language}
        />
      )}

      {/* 6. Legal & Impressum Modal */}
      <LegalComplianceModal
        isOpen={isLegalOpen}
        onClose={() => setIsLegalOpen(false)}
        country={country}
        language={language}
      />

      {/* 7. Push Notification Center */}
      <PushNotificationCenter
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        }
        language={language}
        onSendTestPromo={() => {
          const promoNotif: PushNotification = {
            id: `notif-${Date.now()}`,
            title: country === 'DE' ? '🎉 15% Rabatt mit WILLKOMMEN15' : '🎉 10% de remise avec BONJOUR10',
            message: country === 'DE' ? 'Gültig für alle Berliner & Münchner Partner-Restaurants!' : 'Valable dès maintenant sur vos plats préférés.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: 'promotion',
            isRead: false,
          };
          setNotifications((prev) => [promoNotif, ...prev]);
        }}
      />
    </div>
  );
}
