import { createContext, useEffect, useState } from "react";
import api from "../utils/axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [foodList, setFoodList] = useState([]);

  // Safe localStorage access
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          const value = window.localStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        }
        return null;
      } catch (error) {
        console.error(`Error reading ${key} from localStorage:`, error);
        return null;
      }
    },
    setItem: (key, value) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem(key, JSON.stringify(value));
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Error writing ${key} to localStorage:`, error);
        return false;
      }
    },
    removeItem: (key) => {
      try {
        if (typeof window !== "undefined" && window.localStorage) {
          window.localStorage.removeItem(key);
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
        return false;
      }
    },
  };

  // Check for existing token on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const savedToken = window.localStorage.getItem("token");
        const savedUserStr = window.localStorage.getItem("user");
        if (savedToken && savedUserStr) {
          setToken(savedToken);
          try {
            const savedUser = JSON.parse(savedUserStr);
            setUser(savedUser);
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }
      }
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, []);

  // Fetch menu items
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await api.get("/menu");
        const formattedFoods = (response.data.data || []).map((item) => ({
          _id: item.MaMon || item.maMon,
          MaMon: item.MaMon || item.maMon,
          name: item.TenMon || item.tenMon,
          price: item.Gia || item.gia,
          category: item.loaiMon?.TenLoai || item.loaiMon?.tenLoai || "",
          image: item.HinhAnh || item.hinhAnh, // URL từ S3
        }));
        setFoodList(formattedFoods);
      } catch (error) {
        console.error("Error fetching foods:", error);
      }
    };

    fetchFoods();
  }, []);

  // Login function
  const login = (tokenValue, userData) => {
    setToken(tokenValue);
    setUser(userData);
    // Store token as string, user as JSON
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem("token", tokenValue);
        window.localStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setUser(null);
    setCartItems({});
    safeLocalStorage.removeItem("token");
    safeLocalStorage.removeItem("user");
  };

  // Add to cart
  const addToCart = (itemId) => {
    setCartItems((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  // Remove from cart
  const removeFromCart = (itemId) => {
    setCartItems((prev) => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] = newCart[itemId] - 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  // Get total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = foodList.find(
          (product) =>
            product.MaMon === parseInt(itemId) ||
            product._id === parseInt(itemId)
        );
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[itemId];
        }
      }
    }
    return totalAmount;
  };

  // Get cart items with details
  const getCartItemsWithDetails = () => {
    const items = [];
    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        const itemInfo = foodList.find(
          (product) =>
            product.MaMon === parseInt(itemId) ||
            product._id === parseInt(itemId)
        );
        if (itemInfo) {
          items.push({
            ...itemInfo,
            quantity: cartItems[itemId],
          });
        }
      }
    }
    return items;
  };

  const contextValue = {
    foodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getCartItemsWithDetails,
    token,
    setToken,
    user,
    setUser,
    login,
    logout,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
