import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('apex_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const { addToast } = useToast();

  useEffect(() => {
    localStorage.setItem('apex_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1, variant = null, flavour = null) => {
    const selectedVariant = variant || (product.variants && product.variants[0]) || 'Standard';
    const selectedFlavour = flavour || (product.flavours && product.flavours[0]) || 'Standard';
    const currentStock = Number(product.stock || 0);

    if (currentStock <= 0) {
      addToast(`"${product.name}" is currently Out of Stock`, 'error');
      return false;
    }

    const itemKey = `${product._id || product.id}-${selectedVariant}-${selectedFlavour}`;

    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => (i._id || i.productId) === (product._id || product.id) && i.variant === selectedVariant && i.flavour === selectedFlavour
      );

      if (existingIndex > -1) {
        const existingItem = prev[existingIndex];
        const newQty = existingItem.quantity + quantity;

        if (newQty > currentStock) {
          addToast(`Cannot add more. Only ${currentStock} units available in stock.`, 'warning');
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = { ...existingItem, quantity: newQty };
        addToast(`Updated quantity in cart (${newQty})`, 'success');
        return updated;
      } else {
        if (quantity > currentStock) {
          addToast(`Only ${currentStock} units available in stock.`, 'warning');
          return prev;
        }

        const newItem = {
          productId: product._id || product.id,
          _id: product._id || product.id,
          name: product.name,
          brand: product.brand,
          category: product.category,
          price: product.price,
          discountPrice: product.discountPrice || product.price,
          image: (product.images && product.images[0]) || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80',
          quantity,
          variant: selectedVariant,
          flavour: selectedFlavour,
          stock: currentStock,
        };

        addToast(`Added "${product.name}" to cart`, 'success');
        return [...prev, newItem];
      }
    });

    return true;
  };

  const updateQuantity = (productId, variant, flavour, newQty, maxStock = 999) => {
    if (newQty <= 0) {
      removeFromCart(productId, variant, flavour);
      return;
    }

    if (newQty > maxStock) {
      addToast(`Maximum available stock is ${maxStock}`, 'warning');
      return;
    }

    setCartItems((prev) =>
      prev.map((item) => {
        if ((item._id === productId || item.productId === productId) && item.variant === variant && item.flavour === flavour) {
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, variant, flavour) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !((item._id === productId || item.productId === productId) && item.variant === variant && item.flavour === flavour)
      )
    );
    addToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('apex_cart');
  };

  // Cart financial calculations
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cartItems.reduce((sum, item) => sum + item.discountPrice * item.quantity, 0);
  const totalMRP = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountOnMRP = totalMRP - subtotal;
  const bulkDiscount = subtotal >= 2000 ? Math.round(subtotal * 0.05) : 0; // 5% extra discount over 2000
  const deliveryCharge = subtotal >= 999 || subtotal === 0 ? 0 : 99; // Free above 999
  const totalAmount = Math.max(0, subtotal - bulkDiscount + deliveryCharge);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalItems,
        subtotal,
        totalMRP,
        discountOnMRP,
        bulkDiscount,
        deliveryCharge,
        totalAmount,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
