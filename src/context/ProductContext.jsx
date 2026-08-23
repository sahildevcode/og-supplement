import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useToast } from './ToastContext';
import { initialProducts } from '../data/seedProducts';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortOption, setSortOption] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [socketStatus, setSocketStatus] = useState('connecting');
  const { addToast } = useToast();

  // Fetch initial product catalog from API
  const fetchProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      if (data && data.products && data.products.length > 0) {
        setProducts(data.products);
      }
    } catch (error) {
      // Keep initialProducts fallback silently without spamming error toasts
      console.warn('[Fetch Products Notice] Using offline product catalog fallback');
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Setup Real-Time Socket.IO Event Listeners
  useEffect(() => {
    const handleConnect = () => setSocketStatus('connected');
    const handleDisconnect = () => setSocketStatus('disconnected');
    const handleReconnect = () => {
      setSocketStatus('connected');
      fetchProducts(); // Refresh list on reconnect
    };

    if (socket.connected) {
      setSocketStatus('connected');
    }

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.io.on('reconnect', handleReconnect);

    // 1. Live Product Updated
    const handleProductUpdated = (updatedProduct) => {
      const targetId = updatedProduct._id || updatedProduct.id;
      setProducts((prev) =>
        prev.map((p) => ((p._id || p.id) === targetId ? { ...p, ...updatedProduct } : p))
      );

      setQuickViewProduct((prev) =>
        prev && (prev._id || prev.id) === targetId ? { ...prev, ...updatedProduct } : prev
      );
    };

    // 2. Live Stock Updated
    const handleStockUpdated = ({ productId, stock, status, lowStockThreshold }) => {
      setProducts((prev) =>
        prev.map((p) => {
          if ((p._id || p.id) === productId) {
            return {
              ...p,
              stock,
              status,
              ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {})
            };
          }
          return p;
        })
      );

      setQuickViewProduct((prev) => {
        if (prev && (prev._id || prev.id) === productId) {
          return {
            ...prev,
            stock,
            status,
            ...(lowStockThreshold !== undefined ? { lowStockThreshold } : {})
          };
        }
        return prev;
      });
    };

    // 3. Live Product Created
    const handleProductCreated = (newProduct) => {
      setProducts((prev) => {
        const exists = prev.some((p) => (p._id || p.id) === (newProduct._id || newProduct.id));
        if (exists) return prev;
        return [newProduct, ...prev];
      });
    };

    // 4. Live Product Deleted
    const handleProductDeleted = ({ productId }) => {
      setProducts((prev) => prev.filter((p) => (p._id || p.id) !== productId));
      setQuickViewProduct((prev) =>
        prev && (prev._id || prev.id) === productId ? null : prev
      );
    };

    socket.on('product:updated', handleProductUpdated);
    socket.on('product:stockUpdated', handleStockUpdated);
    socket.on('product:created', handleProductCreated);
    socket.on('product:deleted', handleProductDeleted);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.io.off('reconnect', handleReconnect);
      socket.off('product:updated', handleProductUpdated);
      socket.off('product:stockUpdated', handleStockUpdated);
      socket.off('product:created', handleProductCreated);
      socket.off('product:deleted', handleProductDeleted);
    };
  }, [fetchProducts]);

  // Client-side filtering and sorting for instant UI response
  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'All' && p.category.toLowerCase() !== selectedCategory.toLowerCase()) {
      return false;
    }

    if (selectedBrand !== 'All' && p.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchCategory = p.category.toLowerCase().includes(q);
      const matchDesc = p.description ? p.description.toLowerCase().includes(q) : false;
      const matchFlavours = p.flavours ? p.flavours.some((f) => f.toLowerCase().includes(q)) : false;
      if (!matchName && !matchBrand && !matchCategory && !matchDesc && !matchFlavours) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => {
    if (sortOption === 'price_asc') return a.discountPrice - b.discountPrice;
    if (sortOption === 'price_desc') return b.discountPrice - a.discountPrice;
    if (sortOption === 'rating') return b.rating - a.rating;
    if (sortOption === 'discount') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
    return 0;
  });

  const categories = ['All', 'Protein', 'Mass Gainer', 'Creatine', 'Pre-Workout', 'Supplements', 'Vitamins', 'Protein Bars'];
  const brands = ['All', ...new Set(products.map((p) => p.brand).filter(Boolean))];

  return (
    <ProductContext.Provider
      value={{
        products,
        filteredProducts,
        loading,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedBrand,
        setSelectedBrand,
        sortOption,
        setSortOption,
        categories,
        brands,
        quickViewProduct,
        setQuickViewProduct,
        socketStatus,
        refreshProducts: fetchProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProducts = () => useContext(ProductContext);
