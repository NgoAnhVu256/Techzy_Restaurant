import { createContext, useEffect, useState } from "react";
import api from "@/utils/axios";
import { FILE_BASE_URL } from "@/config/apiConfig";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [foodList, setFoodList] = useState([]);

  // Safe localStorage access
  const safeLocalStorage = {
    getItem: (key) => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
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
        if (typeof window !== 'undefined' && window.localStorage) {
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
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(key);
          return true;
        }
        return false;
      } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
        return false;
      }
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = safeLocalStorage.getItem('token');
    const userData = safeLocalStorage.getItem('user');
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(userData);
    }
  }, []);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await api.get("/MonAn");
        const formattedFoods = response.data.map((item) => ({
          _id: item.maMon,
          name: item.tenMon,
          price: item.gia,
          category: item.loaiMon.tenLoai,
          image: `${FILE_BASE_URL}/images/${item.hinhAnh}`,
        }));
        setFoodList(formattedFoods);
      } catch (error) {
        console.error("Error fetching foods:", error);
      }
    };

    fetchFoods();
  }, []);

  const login = (userData) => {
    setIsLoggedIn(true);
    setUser(userData);
    safeLocalStorage.setItem('user', userData);
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
    safeLocalStorage.removeItem('token');
    safeLocalStorage.removeItem('user');
  };

  const addToCart = (itemId) => {
    if (!cartItems[itemId]) {
      setCartItems((prev) => ({ ...prev, [itemId]: 1 }));
    } else {
      setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] + 1 }));
    }
  };

  const removeFromCart = (itemId) => {
    setCartItems((prev) => ({ ...prev, [itemId]: prev[itemId] - 1 }));
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = foodList.find((product) => product._id === item);
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        }
      }
    }
    return totalAmount;
  };

  const contextValue = {
    foodList,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    isLoggedIn,
    user,
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
