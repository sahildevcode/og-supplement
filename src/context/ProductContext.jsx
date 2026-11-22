import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { socket } from '../services/socket';
import { useToast } from './ToastContext';
import { initialProducts } from '../data/seedProducts';

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState(() => {
    try {
      const cached = localStorage.getItem('og_cached_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return initialProducts || [];
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [sortOption, setSortOption] = useState('featured');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [socketStatus, setSocketStatus] = useState('connecting');
  const { addToast } = useToast();

  // Fetch initial product catalog from API (Stale-While-Revalidate: instant display, silent background refresh)
  const fetchProducts = useCallback(async () => {
    try {
      setProducts((current) => {
        if (!current || current.length === 0) {
          setLoading(true);
        }
        return current;
      });
      const data = await api.getProducts();
      if (data && data.products && data.products.length > 0) {
        setProducts(data.products);
        try {
          localStorage.setItem('og_cached_products', JSON.stringify(data.products));
        } catch (e) {}
      }
    } catch (error) {
      console.warn('[Fetch Products Notice] Live products fetch error:', error.message);
    } finally {
      setLoading(false);
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
    socket.on('product:bestSellerUpdated', handleProductUpdated);
    socket.on('product:stockUpdated', handleStockUpdated);
    socket.on('product:created', handleProductCreated);
    socket.on('product:deleted', handleProductDeleted);

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.io.off('reconnect', handleReconnect);
      socket.off('product:updated', handleProductUpdated);
      socket.off('product:bestSellerUpdated', handleProductUpdated);
      socket.off('product:stockUpdated', handleStockUpdated);
      socket.off('product:created', handleProductCreated);
      socket.off('product:deleted', handleProductDeleted);
    };
  }, [fetchProducts]);

  // Expand products with multi-flavor variants so every flavor appears as its own discoverable product card across all catalog views
  const expandedProducts = React.useMemo(() => {
    const list = [];
    for (const p of products) {
      list.push(p);

      const flavours = p.flavours || [];
      if (flavours.length > 1) {
        const rawVariantDetails =
          p.variantDetails &&
          (Object.keys(p.variantDetails.flavours || {}).length > 0 || Object.keys(p.variantDetails.sizes || {}).length > 0)
            ? p.variantDetails
            : p.nutritionalInfo?.__variantDetails || p.variantDetails || { flavours: {}, sizes: {} };

        const flvMap = rawVariantDetails.flavours || {};

        for (let i = 1; i < flavours.length; i++) {
          const flvName = flavours[i];
          const flvDetail = flvMap[flvName] || flvMap[flvName.trim()] || {};

          const baseName = (p.name || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
          const flvTitle =
            flvDetail.title?.trim() ||
            `${baseName} (${p.variants?.[0] ? p.variants[0] + ', ' : ''}${flvName})`;

          const flvImages =
            Array.isArray(flvDetail.images) && flvDetail.images.length > 0 ? flvDetail.images : p.images;
          const flvPrice = Number(flvDetail.price || p.price);
          const flvDiscountPrice = Number(flvDetail.discountPrice || p.discountPrice || flvPrice);
          const flvStock =
            flvDetail.stock !== '' && flvDetail.stock !== undefined ? Number(flvDetail.stock) : p.stock;

          list.push({
            ...p,
            _id: `${p._id || p.id}__flv__${encodeURIComponent(flvName)}`,
            id: `${p._id || p.id}__flv__${encodeURIComponent(flvName)}`,
            _parentProductId: p._id || p.id,
            _selectedFlavour: flvName,
            name: flvTitle,
            price: flvPrice,
            discountPrice: flvDiscountPrice,
            images: flvImages,
            stock: flvStock,
            flavours: [flvName, ...flavours.filter((f) => f !== flvName)],
            isFlavourVariantCard: true
          });
        }
      }
    }
    return list;
  }, [products]);

  // Client-side filtering and sorting for instant UI response
  const filteredProducts = expandedProducts.filter((p) => {
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
