import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  selectCartItems,
  selectCartCount,
  selectCartTotals,
  selectCoupon,
  selectIsInCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  setCoupon,
  removeCoupon,
} from '../redux/slices/cartSlice';

export function useCart() {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const count = useSelector(selectCartCount);
  const totals = useSelector(selectCartTotals);
  const coupon = useSelector(selectCoupon);

  const handleAddToCart = (product, quantity = 1) => {
    if (!product.stock || product.stock === 0) {
      toast.error('This product is out of stock');
      return;
    }
    dispatch(addToCart({ product, quantity }));
    toast.success(`${product.name} added to cart! 🛒`);
  };

  const handleRemoveFromCart = (productId, productName) => {
    dispatch(removeFromCart(productId));
    toast.success(`${productName || 'Item'} removed from cart`);
  };

  const handleUpdateQuantity = (productId, quantity) => {
    dispatch(updateQuantity({ productId, quantity }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleSetCoupon = (couponData) => {
    dispatch(setCoupon(couponData));
    toast.success(`Coupon "${couponData.code}" applied! 🎉`);
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.success('Coupon removed');
  };

  const isInCart = (productId) => items.some((item) => item.product._id === productId);

  const getItemQuantity = (productId) => {
    const item = items.find((i) => i.product._id === productId);
    return item ? item.quantity : 0;
  };

  return {
    items,
    count,
    totals,
    coupon,
    isInCart,
    getItemQuantity,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    updateQuantity: handleUpdateQuantity,
    clearCart: handleClearCart,
    setCoupon: handleSetCoupon,
    removeCoupon: handleRemoveCoupon,
  };
}

export default useCart;
