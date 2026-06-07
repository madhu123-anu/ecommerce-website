import { createSlice } from '@reduxjs/toolkit';

// Load from localStorage
const loadWishlistFromStorage = () => {
  try {
    const saved = localStorage.getItem('wishlist');
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return [];
};

const saveWishlistToStorage = (items) => {
  try {
    localStorage.setItem('wishlist', JSON.stringify(items));
  } catch {
    // ignore
  }
};

const initialState = {
  items: loadWishlistFromStorage(), // Array of product IDs
  loading: false,
  error: null,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    addToWishlist: (state, action) => {
      const productId = action.payload;
      if (!state.items.includes(productId)) {
        state.items.push(productId);
        saveWishlistToStorage(state.items);
      }
    },
    removeFromWishlist: (state, action) => {
      const productId = action.payload;
      state.items = state.items.filter((id) => id !== productId);
      saveWishlistToStorage(state.items);
    },
    toggleWishlist: (state, action) => {
      const productId = action.payload;
      const idx = state.items.indexOf(productId);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push(productId);
      }
      saveWishlistToStorage(state.items);
    },
    setWishlist: (state, action) => {
      state.items = action.payload;
      saveWishlistToStorage(state.items);
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
    setWishlistLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  setWishlist,
  clearWishlist,
  setWishlistLoading,
} = wishlistSlice.actions;

// Selectors
export const selectWishlistItems = (state) => state.wishlist.items;
export const selectWishlistCount = (state) => state.wishlist.items.length;
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.includes(productId);

export default wishlistSlice.reducer;
