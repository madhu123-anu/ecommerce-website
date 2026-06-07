import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  selectWishlistItems,
  selectWishlistCount,
  selectIsInWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  setWishlist,
  clearWishlist,
} from '../redux/slices/wishlistSlice';

export function useWishlist() {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);
  const count = useSelector(selectWishlistCount);

  const handleToggleWishlist = (productId, productName) => {
    const isAlreadyIn = items.includes(productId);
    dispatch(toggleWishlist(productId));
    if (isAlreadyIn) {
      toast.success(`Removed from wishlist`);
    } else {
      toast.success(`${productName || 'Product'} added to wishlist ❤️`);
    }
  };

  const handleAddToWishlist = (productId, productName) => {
    if (!items.includes(productId)) {
      dispatch(addToWishlist(productId));
      toast.success(`${productName || 'Product'} added to wishlist ❤️`);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    dispatch(removeFromWishlist(productId));
    toast.success('Removed from wishlist');
  };

  const isInWishlist = (productId) => items.includes(productId);

  const handleSetWishlist = (productIds) => {
    dispatch(setWishlist(productIds));
  };

  const handleClearWishlist = () => {
    dispatch(clearWishlist());
  };

  return {
    items,
    count,
    isInWishlist,
    toggleWishlist: handleToggleWishlist,
    addToWishlist: handleAddToWishlist,
    removeFromWishlist: handleRemoveFromWishlist,
    setWishlist: handleSetWishlist,
    clearWishlist: handleClearWishlist,
  };
}

export default useWishlist;
