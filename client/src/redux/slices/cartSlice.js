import { createSlice, createSelector } from '@reduxjs/toolkit';

// Load cart from localStorage
const loadCartFromStorage = () => {
  try {
    const saved = localStorage.getItem('cart');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return { items: [], coupon: null };
};

const saveCartToStorage = (state) => {
  try {
    localStorage.setItem('cart', JSON.stringify({ items: state.items, coupon: state.coupon }));
  } catch {
    // ignore
  }
};

const savedCart = loadCartFromStorage();

const initialState = {
  items: savedCart.items || [],
  coupon: savedCart.coupon || null,
  loading: false,
  error: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1 } = action.payload;
      const existingIdx = state.items.findIndex((item) => item.product._id === product._id);
      if (existingIdx >= 0) {
        const newQty = state.items[existingIdx].quantity + quantity;
        state.items[existingIdx].quantity = Math.min(newQty, product.stock || 99);
      } else {
        state.items.push({
          product,
          quantity,
          price: product.discountedPrice || product.price,
        });
      }
      saveCartToStorage(state);
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((item) => item.product._id !== productId);
      saveCartToStorage(state);
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.items.find((i) => i.product._id === productId);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter((i) => i.product._id !== productId);
        } else {
          item.quantity = Math.min(quantity, item.product.stock || 99);
        }
      }
      saveCartToStorage(state);
    },
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      localStorage.removeItem('cart');
    },
    setCoupon: (state, action) => {
      state.coupon = action.payload;
      saveCartToStorage(state);
    },
    removeCoupon: (state) => {
      state.coupon = null;
      saveCartToStorage(state);
    },
    syncCart: (state, action) => {
      state.items = action.payload;
      saveCartToStorage(state);
    },
    setCartLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCoupon,
  removeCoupon,
  syncCart,
  setCartLoading,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export const selectCartTotals = createSelector(
  (state) => state.cart.items,
  (state) => state.cart.coupon,
  (items, coupon) => {
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const TAX_RATE = 0.08;
    const SHIPPING_THRESHOLD = 50;
    const SHIPPING_COST = 9.99;

    let discount = 0;
    if (coupon) {
      if (coupon.type === 'percentage') {
        discount = (subtotal * coupon.value) / 100;
        if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
      } else if (coupon.type === 'fixed') {
        discount = coupon.value;
      }
    }

    const afterDiscount = Math.max(0, subtotal - discount);
    const shipping = afterDiscount >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
    const tax = afterDiscount * TAX_RATE;
    const total = afterDiscount + shipping + tax;

    return {
      subtotal: parseFloat(subtotal.toFixed(2)),
      discount: parseFloat(discount.toFixed(2)),
      shipping: parseFloat(shipping.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    };
  }
);

export const selectCoupon = (state) => state.cart.coupon;
export const selectIsInCart = (productId) => (state) =>
  state.cart.items.some((item) => item.product._id === productId);

export default cartSlice.reducer;
