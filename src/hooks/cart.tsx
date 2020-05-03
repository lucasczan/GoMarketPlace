import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storageProducts = await AsyncStorage.getItem('@GoMarketPlace');

      if (storageProducts) {
        setProducts(JSON.parse(storageProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const found = products.find(item => item.id === product.id);

      if (found) {
        found.quantity += 1;
        setProducts(products.map(prod => (prod === found ? found : prod)));
      } else {
        product.quantity = 1;
        setProducts([...products, product]);
      }

      await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const found = products.find(prod => prod.id === id);
      if (found) {
        const productIndex = products.findIndex(item => item.id === id);
        const newArray = [...products];

        newArray[productIndex].quantity += 1;

        setProducts(newArray);
      }
      await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const found = products.find(prod => prod.id === id);
      if (found) {
        const productIndex = products.findIndex(item => item.id === id);
        const newArray = [...products];

        if (newArray[productIndex].quantity === 1) {
          const removeItem = products.filter(item => item.id !== id);
          setProducts(removeItem);
        } else {
          newArray[productIndex].quantity -= 1;
          setProducts(newArray);
        }
      }
      await AsyncStorage.setItem('@GoMarketPlace', JSON.stringify(products));
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
