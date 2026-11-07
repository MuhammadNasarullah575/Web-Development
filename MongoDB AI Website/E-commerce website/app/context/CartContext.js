"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isTrackOrderOpen, setIsTrackOrderOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [customerChatPhone, setCustomerChatPhone] = useState("");
  const [customerChatName, setCustomerChatName] = useState("");
  const [chatUnreadCount, setChatUnreadCount] = useState(0);

  // Initial load from localStorage on client side
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("storezen_cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedPhone = localStorage.getItem("storezen_customer_phone");
      if (savedPhone) {
        setCustomerChatPhone(savedPhone);
      }
      const savedName = localStorage.getItem("storezen_customer_name");
      if (savedName) {
        setCustomerChatName(savedName);
      }
    } catch (err) {
      console.error("Cart load error:", err);
    }
    setIsLoaded(true);
  }, []);

  // Poll for customer unread messages every 15 seconds if phone exists
  useEffect(() => {
    if (!customerChatPhone) return;

    const checkUnread = async () => {
      try {
        const res = await fetch(`/api/chat/unread?customerPhone=${encodeURIComponent(customerChatPhone)}`);
        const data = await res.json();
        if (data.success && typeof data.unreadCount === "number") {
          setChatUnreadCount(data.unreadCount);
        }
      } catch (err) {
        // quiet error
      }
    };

    checkUnread();
    const interval = setInterval(checkUnread, 12000);
    return () => clearInterval(interval);
  }, [customerChatPhone]);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("storezen_cart", JSON.stringify(cart));
      } catch (err) {
        console.error("Cart save error:", err);
      }
    }
  }, [cart, isLoaded]);

  // Add product to cart with custom quantity (default 1)
  const addToCart = (product, quantity = 1) => {
    if (!product || !product._id) return;
    const addQty = Math.max(1, Number(quantity) || 1);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item._id === product._id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + addQty,
        };
        return updated;
      } else {
        return [
          ...prevCart,
          {
            _id: product._id,
            title: product.title,
            price: Number(product.price) || 0,
            image: product.image,
            category: product.category,
            quantity: addQty,
          },
        ];
      }
    });
  };

  // Increase or decrease quantity
  const updateQuantity = (productId, delta) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item._id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Remove specific item from cart
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculations:
  // totalItems = number of unique products (e.g. 5 products + 1 new = 6 items)
  const totalItems = cart.length;
  // totalPieces = sum of all quantities (e.g. 1 + 1 + 1 + 1 + 1 + 10 = 15 pieces)
  const totalPieces = cart.reduce((sum, item) => sum + item.quantity, 0);
  // totalPrice = total amount in PKR
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItems,
        totalPieces,
        totalPrice,
        isCartOpen,
        setIsCartOpen,
        isTrackOrderOpen,
        setIsTrackOrderOpen,
        isChatOpen,
        setIsChatOpen,
        customerChatPhone,
        setCustomerChatPhone,
        customerChatName,
        setCustomerChatName,
        chatUnreadCount,
        setChatUnreadCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

