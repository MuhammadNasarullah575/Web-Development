"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { COURIER_OPTIONS, getTrackingUrl } from "@/app/lib/courierConfig";

const ORDER_STATUSES = [
  "Pending",
  "Processing",
  "Order Dispatch",
  "Delivered",
  "Return",
  "Cancel",
];

const STATUS_BADGE_STYLES = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/10",
  Processing: "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/10",
  "Order Dispatch": "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/10",
  Delivered: "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/10",
  Return: "bg-orange-50 text-orange-700 border-orange-200 ring-orange-500/10",
  Cancel: "bg-rose-50 text-rose-700 border-rose-200 ring-rose-500/10",
};

// Comprehensive list of all Pakistani Banks, Islamic Banks, Microfinance Banks & Digital Wallets
const PAKISTANI_BANKS = [
  {
    category: "📱 Digital Wallets & EMIs (Instant QR / Raast)",
    banks: [
      "SadaPay",
      "NayaPay",
      "JazzCash",
      "EasyPaisa",
      "Keenu Wallet",
      "TAG Wallet",
    ],
  },
  {
    category: "🕌 Islamic Banks",
    banks: [
      "Meezan Bank",
      "BankIslami Pakistan Limited",
      "Dubai Islamic Bank (DIB)",
      "Al Baraka Bank Pakistan",
      "MCB Islamic Bank",
      "Faysal Bank (Islamic)",
    ],
  },
  {
    category: "🏛️ Major Commercial Banks",
    banks: [
      "Habib Bank Limited (HBL)",
      "United Bank Limited (UBL)",
      "MCB Bank Limited",
      "Allied Bank Limited (ABL)",
      "Bank Alfalah",
      "National Bank of Pakistan (NBP)",
      "Standard Chartered Bank",
      "Askari Bank",
      "Bank of Punjab (BOP)",
      "Habib Metropolitan Bank",
      "Soneri Bank",
      "JS Bank",
      "Bank of Khyber (BOK)",
      "Sindh Bank",
      "Samba Bank",
      "Silkbank Limited",
      "Bank Makramah Limited (BML / Summit Bank)",
      "Industrial and Commercial Bank of China (ICBC)",
      "CitiBank Pakistan",
    ],
  },
  {
    category: "💰 Microfinance Banks",
    banks: [
      "Mobilink Microfinance Bank (JazzCash)",
      "Telenor Microfinance Bank (EasyPaisa)",
      "U Microfinance Bank (UPaisa)",
      "Khushhali Microfinance Bank",
      "FINCA Microfinance Bank",
      "NRSP Microfinance Bank",
      "First MicroFinance Bank (FMFB)",
      "APNA Microfinance Bank",
      "Sindh Microfinance Bank",
      "Advans Pakistan Microfinance Bank",
      "Pak-Oman Microfinance Bank",
    ],
  },
];

export default function AdminPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Dashboard Tabs: "orders" | "products" | "categories"
  const [activeTab, setActiveTab] = useState("orders");

  // Data states
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState("All");
  const [orderSearch, setOrderSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [productSearch, setProductSearch] = useState("");

  // Product Modals
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [productFormData, setProductFormData] = useState({
    title: "",
    price: "",
    originalPrice: "",
    category: "",
    description: "",
    image: "",
    images: [],
    video: "",
  });
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  // Category Add / Edit / Delete States
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);

  // Courier Dispatch Modal States
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [selectedDispatchOrder, setSelectedDispatchOrder] = useState(null);
  const [dispatchCourier, setDispatchCourier] = useState("PostEx");
  const [dispatchTrackingId, setDispatchTrackingId] = useState("");
  const [dispatchStatus, setDispatchStatus] = useState("Order Dispatch");
  const [isSavingDispatch, setIsSavingDispatch] = useState(false);

  // Payment Proof Modal & Settings States
  const [selectedProofOrder, setSelectedProofOrder] = useState(null);
  const [paymentSettings, setPaymentSettings] = useState({
    bankName: "Meezan Bank",
    accountTitle: "StoreZen E-Commerce",
    accountNumber: "01020304050607",
    iban: "PK00MEZN0001020304050607",
    raastId: "03233937672",
    qrCodeUrl: "",
    instructions: "",
  });
  const [isSavingPaymentSettings, setIsSavingPaymentSettings] = useState(false);
  const [isUploadingAdminQr, setIsUploadingAdminQr] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [isCustomBankSelected, setIsCustomBankSelected] = useState(false);

  // Customer Chat States (Tab 5)
  const [adminUnreadTotal, setAdminUnreadTotal] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [adminMessageText, setAdminMessageText] = useState("");
  const [isSendingAdminMessage, setIsSendingAdminMessage] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [isLoadingChatMessages, setIsLoadingChatMessages] = useState(false);
  const [adminDeleteConfirmMsg, setAdminDeleteConfirmMsg] = useState(null);
  const [isDeletingAdminMsg, setIsDeletingAdminMsg] = useState(false);

  // Payment Issue / Rejection Modal States
  const [showPaymentIssueModal, setShowPaymentIssueModal] = useState(false);
  const [paymentIssueReason, setPaymentIssueReason] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Check auth session on load
  useEffect(() => {
    const token = sessionStorage.getItem("storezen_admin_token");
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all admin data
  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, categoriesRes, paymentSettingsRes] = await Promise.all([
        fetch("/api/products"),
        fetch("/api/orders"),
        fetch("/api/categories"),
        fetch("/api/payment-settings"),
      ]);

      const pData = await productsRes.json();
      const oData = await ordersRes.json();
      const cData = await categoriesRes.json();
      const psData = await paymentSettingsRes.json();

      if (pData.success) setProducts(pData.products || []);
      if (oData.success) setOrders(oData.orders || []);
      if (psData.success && psData.settings) {
        setPaymentSettings(psData.settings);
        const allPredefined = PAKISTANI_BANKS.flatMap((g) => g.banks);
        if (psData.settings.bankName && !allPredefined.includes(psData.settings.bankName)) {
          setIsCustomBankSelected(true);
        } else {
          setIsCustomBankSelected(false);
        }
      }
      if (cData.success) {
        setCategories(cData.categories || []);
        if (cData.categories?.length > 0 && !productFormData.category) {
          setProductFormData((prev) => ({
            ...prev,
            category: cData.categories[0].name,
          }));
        }
      }
    } catch (err) {
      console.error("Admin data fetch error:", err);
      showToast("Error fetching data.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAllAdminData();
    }
  }, [isAuthenticated]);

  // Handle Login Authentication
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setIsAuthenticating(true);

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passcode }),
      });

      const data = await res.json();
      if (data.success && data.token) {
        sessionStorage.setItem("storezen_admin_token", data.token);
        setIsAuthenticated(true);
        setPasscode("");
      } else {
        setAuthError(data.message || "Incorrect Passcode! Access Denied.");
      }
    } catch (err) {
      setAuthError("Unable to connect to the server.");
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.removeItem("storezen_admin_token");
    setIsAuthenticated(false);
  };

  // 1. ORDER STATUS UPDATE
  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order status update: "${newStatus}"!`);
      } else {
        showToast(data.message || "Status update error", "error");
      }
    } catch (err) {
      showToast("Failed to update status.", "error");
    }
  };

  // Open Courier Dispatch & Tracking Setup Modal
  const handleOpenDispatchModal = (order) => {
    setSelectedDispatchOrder(order);
    setDispatchCourier(order.courier || "PostEx");
    setDispatchTrackingId(order.trackingId || "");
    setDispatchStatus(
      order.status === "Pending" ? "Order Dispatch" : order.status || "Order Dispatch"
    );
    setShowDispatchModal(true);
  };

  // Save Courier & Tracking Details
  const handleSaveDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDispatchOrder) return;

    if (!dispatchTrackingId.trim()) {
      showToast("Please enter a Tracking ID / Consignment Number.", "error");
      return;
    }

    setIsSavingDispatch(true);
    try {
      const res = await fetch(`/api/orders/${selectedDispatchOrder._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: dispatchStatus,
          courier: dispatchCourier,
          trackingId: dispatchTrackingId.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) =>
          prev.map((o) => (o._id === selectedDispatchOrder._id ? data.order : o))
        );
        showToast(
          `Order #${selectedDispatchOrder.orderNumber} assigned to ${dispatchCourier}!`
        );
        setShowDispatchModal(false);
        setSelectedDispatchOrder(null);
      } else {
        showToast(data.message || "Failed to update courier details", "error");
      }
    } catch (err) {
      console.error("Save dispatch error:", err);
      showToast("Network error while updating dispatch details", "error");
    } finally {
      setIsSavingDispatch(false);
    }
  };

  // Delete Order
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/orders/${orderId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o._id !== orderId));
        showToast("Order deleted");
      }
    } catch (err) {
      showToast("Delete error", "error");
    }
  };

  // Update Payment Status (e.g. Approve & Mark as Paid, or Issue Reason)
  const handleUpdatePaymentStatus = async (
    orderId,
    newPaymentStatus,
    newOrderStatus = null,
    rejectionReason = ""
  ) => {
    setIsVerifyingPayment(true);
    try {
      const payload = { paymentStatus: newPaymentStatus };
      if (newOrderStatus) {
        payload.status = newOrderStatus;
      }
      if (rejectionReason) {
        payload.rejectionReason = rejectionReason;
      }

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.order) {
        setOrders((prev) => prev.map((o) => (o._id === orderId ? data.order : o)));
        if (selectedProofOrder?._id === orderId) {
          setSelectedProofOrder(data.order);
        }
        showToast(
          newPaymentStatus === "Paid"
            ? "Payment Approved & Automated Confirmation Message Sent to Customer! 💬"
            : `Payment Issue Alert Sent to Customer Chat! 💬`
        );
        checkAdminUnreadCount();
      } else {
        showToast(data.message || "Failed to update payment status", "error");
      }
    } catch (err) {
      console.error("Payment status error:", err);
      showToast("Network error updating payment status", "error");
    } finally {
      setIsVerifyingPayment(false);
    }
  };

  // --- Customer Chat Methods (Tab 5) ---
  const checkAdminUnreadCount = async () => {
    try {
      const res = await fetch("/api/chat/unread?forAdmin=true");
      const data = await res.json();
      if (data.success && typeof data.unreadCount === "number") {
        setAdminUnreadTotal(data.unreadCount);
      }
    } catch (e) {}
  };

  const fetchConversations = async (search = "") => {
    setIsLoadingConversations(true);
    try {
      const q = search ? `?search=${encodeURIComponent(search)}` : "";
      const res = await fetch(`/api/chat/conversations${q}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.conversations)) {
        setConversations(data.conversations);
        if (activeConversation) {
          const updated = data.conversations.find((c) => c._id === activeConversation._id);
          if (updated) setActiveConversation(updated);
        }
      }
    } catch (e) {
      console.error("Fetch conversations error:", e);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const fetchActiveChatMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${convId}&reader=admin`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setChatMessages(data.messages);
        checkAdminUnreadCount();
      }
    } catch (e) {
      console.error("Fetch chat messages error:", e);
    }
  };

  const handleSelectConversation = (conv) => {
    setActiveConversation(conv);
    fetchActiveChatMessages(conv._id);
  };

  const handleSendAdminMessage = async (e, customText = null) => {
    if (e) e.preventDefault();
    const textToSend = customText || adminMessageText;
    if (!textToSend.trim() || !activeConversation?._id || isSendingAdminMessage) return;

    setIsSendingAdminMessage(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversation._id,
          sender: "admin",
          text: textToSend.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setChatMessages((prev) => [...prev, data.message]);
        setAdminMessageText("");
        fetchConversations(chatSearchQuery);
      }
    } catch (err) {
      showToast("Failed to send message", "error");
    } finally {
      setIsSendingAdminMessage(false);
    }
  };

  // WhatsApp-Style Delete Admin Message Handler
  const handleDeleteAdminMessage = async (messageId, deleteMode) => {
    setIsDeletingAdminMsg(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          deleteMode,
          requester: "admin",
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (deleteMode === "everyone") {
          setChatMessages((prev) =>
            prev.map((m) =>
              m._id === messageId
                ? { ...m, isDeletedForEveryone: true, text: "This message was deleted" }
                : m
            )
          );
        } else {
          setChatMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
        fetchConversations(chatSearchQuery);
        showToast("Message deleted");
      }
    } catch (e) {
      showToast("Error deleting message", "error");
    } finally {
      setIsDeletingAdminMsg(false);
      setAdminDeleteConfirmMsg(null);
    }
  };

  // Poll unread counts globally every 15s
  useEffect(() => {
    if (isAuthenticated) {
      checkAdminUnreadCount();
      const interval = setInterval(checkAdminUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  // When activeTab === "chats", fetch conversations and poll active chat
  useEffect(() => {
    if (isAuthenticated && activeTab === "chats") {
      fetchConversations(chatSearchQuery);
    }
  }, [isAuthenticated, activeTab]);

  useEffect(() => {
    if (activeTab === "chats" && activeConversation?._id) {
      const interval = setInterval(() => {
        fetchActiveChatMessages(activeConversation._id);
      }, 4500);
      return () => clearInterval(interval);
    }
  }, [activeTab, activeConversation?._id]);

  // Save Store Bank & QR Settings
  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setIsSavingPaymentSettings(true);
    try {
      const res = await fetch("/api/payment-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentSettings),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Bank & Raast QR settings saved successfully! ✓");
      } else {
        showToast(data.message || "Failed to save settings", "error");
      }
    } catch (err) {
      console.error("Save settings error:", err);
      showToast("Network error saving bank settings", "error");
    } finally {
      setIsSavingPaymentSettings(false);
    }
  };

  // Upload Admin Bank QR Image
  const handleUploadAdminQr = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAdminQr(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setPaymentSettings((prev) => ({ ...prev, qrCodeUrl: data.url }));
        showToast("Bank QR image uploaded! Don't forget to click 'Save Settings'.");
      } else {
        showToast(data.message || "Failed to upload QR image", "error");
      }
    } catch (err) {
      console.error("QR upload error:", err);
      showToast("Failed to upload QR image", "error");
    } finally {
      setIsUploadingAdminQr(false);
    }
  };

  // 2. PRODUCT CRUD
  const handleMultipleImageUpload = async (files) => {
    if (!files || files.length === 0) return;
    const currentImages = productFormData.images?.length > 0
      ? productFormData.images
      : (productFormData.image ? [productFormData.image] : []);

    const remainingSlots = 5 - currentImages.length;
    if (remainingSlots <= 0) {
      showToast("Maximum 5 images allowed. Please remove an image first.", "error");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      showToast(`Only ${remainingSlots} more image(s) can be added (Maximum 5).`, "info");
    }

    setIsUploadingImage(true);
    let uploadedUrls = [];

    try {
      for (const file of filesToUpload) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        if (data.success && data.url) {
          uploadedUrls.push(data.url);
        }
      }

      if (uploadedUrls.length > 0) {
        const newImages = [...currentImages, ...uploadedUrls].slice(0, 5);
        setProductFormData((prev) => ({
          ...prev,
          images: newImages,
          image: newImages[0], // Main Image is always index 0
        }));
        showToast(`${uploadedUrls.length} image(s) uploaded successfully!`);
      }
    } catch (err) {
      showToast("Some images failed to upload.", "error");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddImageUrl = (url) => {
    if (!url || !url.trim()) return;
    const currentImages = productFormData.images?.length > 0
      ? productFormData.images
      : (productFormData.image ? [productFormData.image] : []);
    if (currentImages.length >= 5) {
      showToast("Maximum 5 images allowed.", "error");
      return;
    }
    const newImages = [...currentImages, url.trim()].slice(0, 5);
    setProductFormData((prev) => ({
      ...prev,
      images: newImages,
      image: newImages[0],
    }));
    setImageUrlInput("");
    showToast("Image URL added!");
  };

  const handleRemoveImage = (indexToRemove) => {
    const currentImages = productFormData.images?.length > 0
      ? productFormData.images
      : (productFormData.image ? [productFormData.image] : []);
    const updated = currentImages.filter((_, idx) => idx !== indexToRemove);
    setProductFormData((prev) => ({
      ...prev,
      images: updated,
      image: updated[0] || "",
    }));
  };

  const handleSetMainImage = (indexToMakeMain) => {
    const currentImages = productFormData.images?.length > 0
      ? productFormData.images
      : (productFormData.image ? [productFormData.image] : []);
    if (indexToMakeMain === 0 || !currentImages[indexToMakeMain]) return;
    const target = currentImages[indexToMakeMain];
    const filtered = currentImages.filter((_, idx) => idx !== indexToMakeMain);
    const updated = [target, ...filtered];
    setProductFormData((prev) => ({
      ...prev,
      images: updated,
      image: updated[0],
    }));
    showToast("Main cover image updated!");
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    setIsUploadingVideo(true);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.url) {
        setProductFormData((prev) => ({ ...prev, video: data.url }));
        showToast("Short video uploaded successfully!");
      } else {
        showToast(data.message || "Video upload failed.", "error");
      }
    } catch (err) {
      showToast("Video upload failed due to network error.", "error");
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingProduct(true);
    try {
      const currentImages = productFormData.images?.length > 0
        ? productFormData.images
        : (productFormData.image ? [productFormData.image] : []);

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productFormData,
          images: currentImages,
          image: currentImages[0] || productFormData.image,
          category: productFormData.category || categories[0]?.name || "General",
        }),
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts([data.product, ...products]);
        setShowAddProductModal(false);
        setProductFormData({
          title: "",
          price: "",
          originalPrice: "",
          category: categories[0]?.name || "",
          description: "",
          image: "",
          images: [],
          video: "",
        });
        setImageUrlInput("");
        showToast(`"${data.product.title}" successfully added`);
        fetchAllAdminData(); // refresh counts
      } else {
        showToast(data.message || "Failed to add product.", "error");
      }
    } catch (err) {
      showToast("Network error. Failed to add product.", "error");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const openEditProductModal = (p) => {
    setEditingProductId(p._id);
    const initialImages = Array.isArray(p.images) && p.images.length > 0
      ? p.images
      : (p.image ? [p.image] : []);
    setProductFormData({
      title: p.title || "",
      price: p.price || "",
      originalPrice: p.originalPrice || "",
      category: p.category || categories[0]?.name || "",
      description: p.description || "",
      image: initialImages[0] || p.image || "",
      images: initialImages,
      video: p.video || "",
    });
    setImageUrlInput("");
    setShowEditProductModal(true);
  };

  const handleEditProductSubmit = async (e) => {
    e.preventDefault();
    if (!editingProductId) return;

    setIsSubmittingProduct(true);
    try {
      const currentImages = productFormData.images?.length > 0
        ? productFormData.images
        : (productFormData.image ? [productFormData.image] : []);

      const res = await fetch(`/api/products/${editingProductId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...productFormData,
          images: currentImages,
          image: currentImages[0] || productFormData.image,
        }),
      });

      const data = await res.json();
      if (data.success && data.product) {
        setProducts((prev) =>
          prev.map((p) => (p._id === editingProductId ? data.product : p))
        );
        setShowEditProductModal(false);
        setEditingProductId(null);
        showToast(`Product "${data.product.title}" updated`);
        fetchAllAdminData();
      } else {
        showToast(data.message || "Update error", "error");
      }
    } catch (err) {
      showToast("Update error", "error");
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  const confirmDeleteProduct = async () => {
    if (!productToDelete) return;
    try {
      const res = await fetch(`/api/products/${productToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== productToDelete._id));
        showToast(`"${productToDelete.title}" deleted successfully.`);
        fetchAllAdminData();
      }
    } catch (err) {
      showToast("error");
    } finally {
      setProductToDelete(null);
    }
  };

  // 3. CATEGORIES MANAGEMENT (Add, Rename, Delete)
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsAddingCategory(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      });

      const data = await res.json();
      if (data.success && data.category) {
        setCategories([...categories, data.category]);
        setNewCategoryName("");
        showToast(`Category "${data.category.name}" added`);
      } else {
        showToast(data.message ||  "error");
      }
    } catch (err) {
      showToast("Network error", "error");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = async (catId) => {
    if (!editCategoryName.trim()) return;
    try {
      const res = await fetch(`/api/categories/${catId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editCategoryName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c._id === catId ? { ...c, name: editCategoryName.trim() } : c))
        );
        setEditingCategory(null);
        setEditCategoryName("");
        showToast("Category name updated");
        fetchAllAdminData();
      }
    } catch (err) {
      showToast("Update error", "error");
    }
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    try {
      const res = await fetch(`/api/categories/${categoryToDelete._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c._id !== categoryToDelete._id));
        showToast(`Category "${categoryToDelete.name}" deleted`);
      }
    } catch (err) {
      showToast("Delete error", "error");
    } finally {
      setCategoryToDelete(null);
    }
  };

  // Stats
  const totalRevenue = orders
    .filter((o) => o.status !== "Cancel" && o.status !== "Return")
    .reduce((acc, o) => acc + (Number(o.totalAmount) || 0), 0);

  const pendingOrders = orders.filter((o) => o.status === "Pending").length;
  const dispatchedOrders = orders.filter((o) => o.status === "Order Dispatch").length;

  // Filtered Orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus =
      orderStatusFilter === "All" || o.status === orderStatusFilter;
    const matchesSearch =
      o.orderNumber?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer?.phone?.includes(orderSearch);
    return matchesStatus && matchesSearch;
  });

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCat =
      productCategoryFilter === "All" || p.category === productCategoryFilter;
    const matchesSearch =
      p.title?.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(productSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // ==========================================
  // VIEW 1: ADMIN SECURITY LOCK SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-indigo-50/40 flex items-center justify-center p-4 font-sans text-gray-900">
        <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-xl border border-gray-100 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-3xl mx-auto shadow-lg shadow-blue-500/25 mb-6">
            🔒
          </div>

          <h2 className="text-2xl font-black text-gray-900 tracking-tight">
            StoreZen Control Center
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            This portal is restricted to Store Administrators. Please enter your Master Passcode to unlock.
          </p>

          {authError && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold flex items-center justify-center gap-1.5 animate-shake">
              <span>✕</span> {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="mt-6 space-y-4">
            <div className="text-left">
              <label className="text-xs font-bold text-gray-700 block mb-1.5 uppercase tracking-wider">
                Admin Secret Passcode
              </label>
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter secret passcode..."
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-blue-600 focus:outline-hidden transition shadow-2xs text-gray-900 placeholder-gray-400 font-mono tracking-widest"
              />
              <span className="text-[11px] text-gray-400 mt-1 block">
                Default Master Passcode: <strong className="text-gray-700 font-mono">admin123</strong>
              </span>
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-blue-500/25 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isAuthenticating ? "Authenticating..." : "Unlock Admin Dashboard →"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-xs text-gray-400">
            Protected with Secure Session Authentication
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: LIGHT THEME ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-slate-50 text-gray-900 flex flex-col font-sans min-w-0">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 border text-sm font-bold transition-all animate-bounce ${
            toast.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-emerald-50 text-emerald-800 border-emerald-200"
          }`}
        >
          <span>{toast.type === "error" ? "✕" : "✓"}</span>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Sticky Navbar */}
      <header className="sticky top-0 z-50 w-full max-w-full bg-white/95 backdrop-blur-md border-b border-gray-200/90 shadow-2xs min-w-0 transition-shadow">
        <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
          {/* Brand Logo & Clean Admin Badge */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/20 text-sm sm:text-base shrink-0">
              🛒
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
              <span className="font-extrabold text-base sm:text-lg lg:text-xl tracking-tight text-gray-900">
                StoreZen
              </span>
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200/80 shrink-0">
                Admin
              </span>
              <span className="hidden md:inline text-xs text-gray-400 font-medium pl-2 border-l border-gray-200">
                Dashboard
              </span>
            </div>
          </div>

          {/* Right Actions: Atlas Status, View Store, Add Product, Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* MongoDB Atlas Connected Pill */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Atlas Connected</span>
            </div>

            {/* View Store Preview Link */}
            <Link
              href="/"
              target="_blank"
              className="px-2 sm:px-3 py-1.5 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition text-xs font-bold flex items-center gap-1 border border-gray-200 hover:border-blue-200 shadow-2xs group"
              title="Open Customer Storefront"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 group-hover:text-blue-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              <span className="hidden sm:inline">Store</span>
            </Link>

            {/* + Add Product Button */}
            <button
              onClick={() => {
                setProductFormData({
                  title: "",
                  price: "",
                  originalPrice: "",
                  category: categories[0]?.name || "Footwear",
                  description: "",
                  image: "",
                  images: [],
                  video: "",
                });
                setImageUrlInput("");
                setShowAddProductModal(true);
              }}
              className="px-2.5 sm:px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1"
              title="Add New Product"
            >
              <span className="text-sm font-black leading-none">+</span>
              <span className="hidden sm:inline">Add Product</span>
              <span className="sm:hidden">Product</span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-2 sm:px-3 py-1.5 text-gray-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer text-xs font-bold flex items-center gap-1 border border-gray-200 hover:border-rose-200 shadow-2xs group"
              title="Logout / Lock Admin"
            >
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 group-hover:text-rose-600 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-5 sm:py-8 flex-1 min-w-0">
        {/* KPI Stats Grid: 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-5 mb-5 sm:mb-8">
          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Products
              </span>
              <span className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 text-sm sm:text-base font-bold">
                🛍️
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-black text-gray-900 mt-1.5 sm:mt-2">{products.length}</p>
            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 block truncate">MongoDB Atlas</span>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Orders
              </span>
              <span className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-indigo-50 text-indigo-600 text-sm sm:text-base font-bold">
                📦
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-black text-gray-900 mt-1.5 sm:mt-2">{orders.length}</p>
            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 block truncate">Checkouts</span>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                Pending Orders
              </span>
              <span className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 text-sm sm:text-base font-bold">
                ⏳
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-black text-amber-600 mt-1.5 sm:mt-2">{pendingOrders}</p>
            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 block truncate">Need dispatch</span>
          </div>

          <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-gray-200/90 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider">
                Total Revenue
              </span>
              <span className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 text-sm sm:text-base font-bold">
                💵
              </span>
            </div>
            <p className="text-xl sm:text-3xl font-black text-emerald-600 mt-1.5 sm:mt-2 truncate">
              Rs. {totalRevenue?.toLocaleString()}
            </p>
            <span className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1 block truncate">Active sales</span>
          </div>
        </div>

        {/* 3 Main Tabs */}
        <div className="flex items-center gap-1.5 sm:gap-2 border-b border-gray-200 pb-3 mb-5 sm:mb-6 overflow-x-auto no-scrollbar touch-scroll min-w-0">
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "orders"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <span>📦 Orders</span>
            <span className="hidden sm:inline">Management</span>
            <span
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black ${
                activeTab === "orders" ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("products")}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "products"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <span>🛍️ Products</span>
            <span className="hidden sm:inline">Management</span>
            <span
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black ${
                activeTab === "products" ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {products.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("categories")}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "categories"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <span>🏷️ Categories</span>
            <span className="hidden sm:inline">Management</span>
            <span
              className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black ${
                activeTab === "categories" ? "bg-white/25 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              {categories.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "settings"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <span>🏦 Bank & Raast</span>
            <span className="hidden sm:inline">Settings</span>
          </button>

          <button
            onClick={() => setActiveTab("chats")}
            className={`px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center gap-1.5 sm:gap-2 whitespace-nowrap shrink-0 ${
              activeTab === "chats"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 hover:bg-white"
            }`}
          >
            <span>💬 Customer Chats</span>
            {adminUnreadTotal > 0 && (
              <span className="bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full animate-pulse">
                {adminUnreadTotal}
              </span>
            )}
          </button>
        </div>

        {/* ==================================================== */}
        {/* TAB 1: ORDERS MANAGEMENT                             */}
        {/* ==================================================== */}
        {activeTab === "orders" && (
          <div className="w-full min-w-0">
            {/* Filter and Search Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 mb-5 sm:mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 shadow-2xs w-full min-w-0">
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 min-w-0 no-scrollbar touch-scroll">
                <span className="text-xs font-bold text-gray-400 uppercase mr-1 shrink-0">Status:</span>
                {["All", ...ORDER_STATUSES].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      orderStatusFilter === st
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              <div className="w-full md:w-72 shrink-0">
                <input
                  type="text"
                  placeholder="Search by Order # or Customer..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-3.5 py-2 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Orders Table */}
            {loading ? (
              <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
                Loading orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
                No order found!
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50/80 text-xs font-extrabold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-4">Order #</th>
                        <th className="px-5 py-4">Customer Details</th>
                        <th className="px-5 py-4">Ordered Items</th>
                        <th className="px-5 py-4">Bill & Payment</th>
                        <th className="px-5 py-4">Date</th>
                        <th className="px-5 py-4">Current Status</th>
                        <th className="px-5 py-4 text-center">Courier & Tracking</th>
                        <th className="px-5 py-4 text-center">Change Status</th>
                        <th className="px-5 py-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50/60 transition">
                          <td className="px-5 py-4 font-black text-gray-900 whitespace-nowrap">
                            #{order.orderNumber}
                          </td>
                          <td className="px-5 py-4">
                            <div className="font-bold text-gray-900">{order.customer?.name}</div>
                            <div className="text-xs text-blue-600 font-semibold flex items-center gap-1 mt-0.5">
                              <span>📞</span> {order.customer?.phone}
                            </div>
                            {(order.customer?.city || order.customer?.district) && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {order.customer?.city && (
                                  <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                                    📍 {order.customer.city}
                                  </span>
                                )}
                                {order.customer?.district && (
                                  <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-semibold border border-gray-200">
                                    Dist: {order.customer.district}
                                  </span>
                                )}
                              </div>
                            )}
                            <div className="text-xs text-gray-500 mt-1 max-w-xs leading-relaxed" title={order.customer?.address}>
                              {order.customer?.sectorStreet || order.customer?.address}
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <div className="space-y-1">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                  {item.image && (
                                    <img
                                      src={item.image}
                                      alt={item.title}
                                      className="w-7 h-7 rounded-md object-cover bg-gray-100 border border-gray-200 shrink-0"
                                    />
                                  )}
                                  <span className="font-medium text-gray-800 truncate max-w-[170px]">
                                    {item.title}
                                  </span>
                                  <span className="font-bold text-blue-600">
                                    ×{item.quantity} (Rs. {item.price?.toLocaleString()})
                                  </span>
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-black text-emerald-600 text-base block">
                              Rs. {order.totalAmount?.toLocaleString()}
                            </span>
                            {/* Payment Badge */}
                            {order.paymentMethod === "Bank Transfer / Raast QR" ? (
                              <div className="mt-1 space-y-1">
                                {order.paymentStatus === "Paid" ? (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                                    <span>✓</span> Paid (Raast)
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200 inline-flex items-center gap-1 animate-pulse">
                                    <span>🟡</span> Verify Proof
                                  </span>
                                )}
                                {(order.paymentReceipt || order.transactionId) && (
                                  <button
                                    onClick={() => setSelectedProofOrder(order)}
                                    className="block text-[11px] font-bold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                                  >
                                    🔍 View Receipt & TID
                                  </button>
                                )}
                              </div>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-600 border border-gray-200 inline-flex items-center gap-1 mt-1">
                                <span>💵</span> COD
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-500 whitespace-nowrap">
                            {new Date(order.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
                                STATUS_BADGE_STYLES[order.status] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            {order.courier && order.trackingId ? (
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                  {COURIER_OPTIONS.find((c) => c.id === order.courier)?.logo && (
                                    <div className="w-14 h-6 rounded-md bg-white border border-gray-200/90 p-0.5 shadow-2xs overflow-hidden flex items-center justify-center shrink-0">
                                      <img
                                        src={COURIER_OPTIONS.find((c) => c.id === order.courier)?.logo}
                                        alt={order.courier}
                                        className="w-full h-full object-contain"
                                      />
                                    </div>
                                  )}
                                  <span
                                    className="font-mono text-xs font-black text-gray-900 bg-gray-50 px-2 py-0.5 rounded border border-gray-200"
                                    title="Tracking ID"
                                  >
                                    {order.trackingId}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleOpenDispatchModal(order)}
                                    className="text-[11px] text-blue-600 hover:text-blue-800 font-bold hover:underline cursor-pointer"
                                  >
                                    Edit Courier / CN
                                  </button>
                                  {getTrackingUrl(order.courier, order.trackingId) && (
                                    <a
                                      href={getTrackingUrl(order.courier, order.trackingId)}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-[11px] text-gray-500 hover:text-blue-600 font-semibold flex items-center gap-0.5"
                                      title="Live Courier Portal"
                                    >
                                      Track ↗
                                    </a>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleOpenDispatchModal(order)}
                                className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-2xs inline-flex items-center gap-1.5"
                              >
                                <span>🚚</span>
                                <span>Process & Dispatch</span>
                              </button>
                            )}
                          </td>
                          <td className="px-5 py-4 text-center whitespace-nowrap">
                            <select
                              value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                              className="bg-gray-50 hover:bg-white border border-gray-300 text-xs text-gray-900 rounded-xl px-2.5 py-1.5 focus:border-blue-600 focus:outline-hidden cursor-pointer font-bold transition shadow-2xs"
                            >
                              {ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <button
                              onClick={() => handleDeleteOrder(order._id)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                              title="Delete Order"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 2: PRODUCTS CRUD                                 */}
        {/* ==================================================== */}
        {activeTab === "products" && (
          <div className="w-full min-w-0">
            {/* Filter and Search Bar */}
            <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-gray-200 mb-5 sm:mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4 shadow-2xs w-full min-w-0">
              <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 min-w-0 no-scrollbar touch-scroll">
                <span className="text-xs font-bold text-gray-400 uppercase mr-1 shrink-0">Category:</span>
                <button
                  onClick={() => setProductCategoryFilter("All")}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                    productCategoryFilter === "All"
                      ? "bg-blue-600 text-white shadow-2xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  All ({products.length})
                </button>
                {categories.map((c) => (
                  <button
                    key={c._id || c.name}
                    onClick={() => setProductCategoryFilter(c.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer shrink-0 ${
                      productCategoryFilter === c.name
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {c.name} ({c.productCount ?? 0})
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto min-w-0">
                <input
                  type="text"
                  placeholder="Search products by title..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="flex-1 md:w-64 bg-gray-50 border border-gray-200 text-sm rounded-xl px-3.5 py-2 text-gray-900 focus:bg-white focus:border-blue-500 focus:outline-hidden min-w-0"
                />
                <button
                  onClick={() => {
                    setProductFormData({
                      title: "",
                      price: "",
                      originalPrice: "",
                      category: categories[0]?.name || "Footwear",
                      description: "",
                      image: "",
                      images: [],
                      video: "",
                    });
                    setImageUrlInput("");
                    setShowAddProductModal(true);
                  }}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span className="text-sm font-black leading-none">+</span>
                  <span>New Product</span>
                </button>
              </div>
            </div>

            {/* Products Table */}
            {loading ? (
              <div className="py-20 text-center text-gray-400 bg-white rounded-2xl border border-gray-200">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-2xl border border-gray-200 text-gray-500">
                No products found.
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-700">
                    <thead className="bg-gray-50/80 text-xs font-extrabold uppercase tracking-wider text-gray-500 border-b border-gray-200">
                      <tr>
                        <th className="px-5 py-4">Product</th>
                        <th className="px-5 py-4">Category</th>
                        <th className="px-5 py-4">Price (PKR)</th>
                        <th className="px-5 py-4">Description</th>
                        <th className="px-5 py-4">Reviews</th>
                        <th className="px-5 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredProducts.map((p) => (
                        <tr key={p._id} className="hover:bg-gray-50/60 transition">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={p.image}
                                alt={p.title}
                                className="w-12 h-12 rounded-xl object-cover bg-gray-100 border border-gray-200 shrink-0"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600";
                                }}
                              />
                              <div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="font-bold text-gray-900 block max-w-xs truncate">
                                    {p.title}
                                  </span>
                                  {p.video && (
                                    <span className="px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                                      📹 Video
                                    </span>
                                  )}
                                </div>
                                <span className="text-[10px] text-gray-400">ID: {p._id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              {p.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className="font-black text-emerald-600 text-base block">
                              Rs. {p.price?.toLocaleString()}
                            </span>
                            {p.originalPrice && Number(p.originalPrice) > Number(p.price) && (
                              <div className="flex items-center gap-1.5 text-[11px] mt-0.5">
                                <span className="text-gray-400 line-through">
                                  Rs. {Number(p.originalPrice).toLocaleString()}
                                </span>
                                <span className="text-red-600 font-bold bg-red-50 px-1 py-0.2 rounded text-[10px]">
                                  -{Math.round(((p.originalPrice - p.price) / p.originalPrice) * 100)}%
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 max-w-xs">
                            <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                          </td>
                          <td className="px-5 py-4 text-xs font-medium text-gray-600 whitespace-nowrap">
                            ⭐ {p.reviews?.length || 0} reviews
                          </td>
                          <td className="px-5 py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => openEditProductModal(p)}
                                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 transition cursor-pointer"
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={() => setProductToDelete(p)}
                                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200 transition cursor-pointer"
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 3: CATEGORIES MANAGEMENT                         */}
        {/* ==================================================== */}
        {activeTab === "categories" && (
          <div>
            {/* Top Add Category Box */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 mb-6 shadow-2xs">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <span>🏷️</span> Add New Store Category
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Create a new product category here. It will immediately save to the database and sync live with the storefront.
              </p>

              <form onSubmit={handleAddCategory} className="mt-4 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  required
                  placeholder="e.g. Watches, Gaming, Furniture, Groceries..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
                <button
                  type="submit"
                  disabled={isAddingCategory}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-xs transition cursor-pointer disabled:opacity-50"
                >
                  {isAddingCategory ? "Adding..." : "+ Create Category"}
                </button>
              </form>
            </div>

            {/* Categories Table / Cards */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h4 className="text-sm font-bold text-gray-900">
                  Active Categories ({categories.length})
                </h4>
                <span className="text-xs text-gray-400">Total Products Linked</span>
              </div>

              <div className="divide-y divide-gray-100">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/60 transition gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                        📁
                      </div>
                      {editingCategory?._id === cat._id ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                            className="text-sm bg-white border border-blue-500 rounded-lg px-2.5 py-1 focus:outline-hidden"
                          />
                          <button
                            onClick={() => handleUpdateCategory(cat._id)}
                            className="px-2.5 py-1 bg-emerald-600 text-white text-xs font-bold rounded-lg"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingCategory(null)}
                            className="px-2 py-1 text-gray-500 text-xs"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <h5 className="font-bold text-gray-900 text-sm">{cat.name}</h5>
                          <span className="text-[11px] text-gray-400">Slug: {cat.slug || cat.name.toLowerCase()}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-gray-100 text-gray-700 border border-gray-200">
                        {cat.productCount ?? 0} {cat.productCount === 1 ? "Product" : "Products"}
                      </span>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingCategory(cat);
                            setEditCategoryName(cat.name);
                          }}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Rename Category"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setCategoryToDelete(cat)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                          title="Delete Category"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 4: BANK & RAAST QR SETTINGS                      */}
        {/* ==================================================== */}
        {activeTab === "settings" && (
          <div className="w-full min-w-0 space-y-6 animate-fadeIn">
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-gray-900 flex items-center gap-2">
                    <span>🏦</span> Store Bank Account & Raast QR Settings
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Customers will transfer order bills to these credentials during digital checkout.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-emerald-700">Live on Storefront</span>
                </div>
              </div>

              <form onSubmit={handleSavePaymentSettings} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Bank Name Dropdown */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Bank / Wallet Name <span className="text-red-500">*</span>
                    </label>
                    <select
                      required
                      value={isCustomBankSelected ? "__custom__" : (paymentSettings.bankName || "")}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "__custom__") {
                          setIsCustomBankSelected(true);
                          const allPredefined = PAKISTANI_BANKS.flatMap((g) => g.banks);
                          if (allPredefined.includes(paymentSettings.bankName)) {
                            setPaymentSettings({ ...paymentSettings, bankName: "" });
                          }
                        } else {
                          setIsCustomBankSelected(false);
                          setPaymentSettings({ ...paymentSettings, bankName: val });
                        }
                      }}
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden cursor-pointer font-semibold shadow-2xs"
                    >
                      <option value="" disabled>-- Select Pakistani Bank / Microfinance / Wallet --</option>
                      {PAKISTANI_BANKS.map((group) => (
                        <optgroup key={group.category} label={group.category}>
                          {group.banks.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                      <option value="__custom__">➕ Other Bank / Microfinance (Type Custom Name)</option>
                    </select>

                    {/* Custom Bank Name Input */}
                    {isCustomBankSelected && (
                      <div className="mt-2 space-y-1">
                        <label className="text-[11px] font-bold text-blue-700 block">
                          Type Custom Bank / Microfinance Name:
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Zarai Taraqiati Bank Limited (ZTBL)"
                          value={paymentSettings.bankName}
                          onChange={(e) =>
                            setPaymentSettings({ ...paymentSettings, bankName: e.target.value })
                          }
                          className="w-full text-sm bg-blue-50/50 border border-blue-400 rounded-xl px-4 py-2 text-gray-900 font-semibold focus:bg-white focus:border-blue-600 focus:outline-hidden"
                        />
                      </div>
                    )}
                  </div>

                  {/* Account Title */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Account Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. StoreZen Official or Your Name"
                      value={paymentSettings.accountTitle}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, accountTitle: e.target.value })
                      }
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Account Number */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Account Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 01020304050607"
                      value={paymentSettings.accountNumber}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, accountNumber: e.target.value })
                      }
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 font-mono tracking-wider focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  {/* IBAN */}
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      IBAN Number (24 characters)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PK00MEZN0001020304050607"
                      value={paymentSettings.iban}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, iban: e.target.value })
                      }
                      className="w-full text-sm bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-gray-900 font-mono tracking-wider focus:bg-white focus:border-blue-600 focus:outline-hidden"
                    />
                  </div>

                  {/* Raast ID */}
                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-emerald-800 block flex items-center gap-1">
                        <span>⚡</span> Raast ID (Phone Number or IBAN) <span className="text-red-500">*</span>
                      </label>
                      <span className="text-[11px] text-gray-400">Works with all Pakistani banking apps</span>
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 03233937672"
                      value={paymentSettings.raastId}
                      onChange={(e) =>
                        setPaymentSettings({ ...paymentSettings, raastId: e.target.value })
                      }
                      className="w-full text-sm bg-emerald-50/40 border border-emerald-300 rounded-xl px-4 py-2.5 text-emerald-950 font-mono tracking-wider font-bold focus:bg-white focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                {/* Custom Bank / Raast QR Image Upload */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200">
                  <label className="text-xs font-bold text-gray-800 block mb-1">
                    Upload Your Bank / SadaPay / Raast QR Code (Optional)
                  </label>
                  <p className="text-[11px] text-gray-500 mb-3">
                    You can take a screenshot of your Raast/SadaPay QR code from your bank app and upload it here. If left blank, a dynamic Raast QR code will be generated automatically.
                  </p>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {paymentSettings.qrCodeUrl ? (
                      <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-2xl overflow-hidden border-2 border-blue-400 bg-white p-2 shrink-0 shadow-md flex items-center justify-center">
                        <img
                          src={paymentSettings.qrCodeUrl}
                          alt="Custom QR Preview"
                          className="w-full h-full object-contain"
                        />
                        <button
                          type="button"
                          onClick={() => setPaymentSettings({ ...paymentSettings, qrCodeUrl: "" })}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md hover:bg-red-700 cursor-pointer"
                          title="Remove custom QR"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="w-full sm:w-auto px-4 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-500 bg-white cursor-pointer transition flex items-center justify-center gap-2 text-xs font-bold text-gray-700 hover:text-blue-600">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleUploadAdminQr}
                          className="hidden"
                        />
                        {isUploadingAdminQr ? (
                          <span>Uploading QR Image...</span>
                        ) : (
                          <>
                            <span>📷</span>
                            <span>Upload QR Code Image from Computer / Phone</span>
                          </>
                        )}
                      </label>
                    )}

                    {paymentSettings.qrCodeUrl && (
                      <span className="text-xs text-emerald-600 font-bold">
                        ✓ Custom Bank QR Image Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Save Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSavingPaymentSettings}
                    className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isSavingPaymentSettings ? "Saving Settings..." : "Save Bank & Raast Settings ✓"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* TAB 5: CUSTOMER CHATS (WHATSAPP-STYLE LIVE PORTAL)   */}
        {/* ==================================================== */}
        {activeTab === "chats" && (
          <div className="w-full min-w-0 bg-white rounded-2xl sm:rounded-3xl border border-gray-200/90 shadow-sm overflow-hidden flex flex-col md:flex-row h-[780px] max-h-[85vh] animate-fadeIn">
            {/* Left Column: Conversations List */}
            <div
              className={`w-full md:w-80 lg:w-96 border-r border-gray-200 flex flex-col h-full bg-gray-50/50 ${
                activeConversation ? "hidden md:flex" : "flex"
              }`}
            >
              {/* Header & Search */}
              <div className="p-3.5 sm:p-4 border-b border-gray-200 bg-white space-y-3 shrink-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-sm sm:text-base text-gray-900 flex items-center gap-1.5">
                    <span>💬</span> Customer Chats
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {conversations.length} total
                    </span>
                    <button
                      onClick={() => fetchConversations(chatSearchQuery)}
                      className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition cursor-pointer"
                      title="Refresh conversations"
                    >
                      🔄
                    </button>
                  </div>
                </div>

                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by customer name, phone, order #..."
                    value={chatSearchQuery}
                    onChange={(e) => {
                      setChatSearchQuery(e.target.value);
                      fetchConversations(e.target.value);
                    }}
                    className="w-full bg-gray-100 focus:bg-white text-xs rounded-xl pl-8 pr-3 py-2 border border-transparent focus:border-blue-500 focus:outline-hidden transition"
                  />
                  <svg
                    className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100 no-scrollbar">
                {isLoadingConversations && conversations.length === 0 ? (
                  <div className="py-16 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                    <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading conversations...</span>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="py-16 text-center text-xs text-gray-400 p-4">
                    <p className="font-bold text-gray-600">No chat conversations found.</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Customer order alerts and chat inquiries will automatically appear here.
                    </p>
                  </div>
                ) : (
                  conversations.map((conv) => {
                    const isSelected = activeConversation?._id === conv._id;
                    const hasUnread = (conv.unreadByAdmin || 0) > 0;

                    return (
                      <div
                        key={conv._id}
                        onClick={() => handleSelectConversation(conv)}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition select-none ${
                          isSelected
                            ? "bg-blue-50/80 border-l-4 border-blue-600"
                            : "hover:bg-white"
                        }`}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold flex items-center justify-center shrink-0 shadow-xs text-sm">
                          {conv.customerName?.charAt(0)?.toUpperCase() || "C"}
                        </div>

                        {/* Conv Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                              {conv.customerName}
                            </span>
                            <span className="text-[10px] text-gray-400 shrink-0 font-medium">
                              {conv.updatedAt
                                ? new Date(conv.updatedAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[11px] font-mono text-gray-500 font-semibold truncate">
                              {conv.customerPhone}
                            </span>
                            {conv.relatedOrderNumber && (
                              <span className="bg-indigo-50 text-indigo-700 font-mono text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                                #{conv.relatedOrderNumber}
                              </span>
                            )}
                          </div>

                          <p className="text-[11px] text-gray-500 truncate mt-1">
                            {conv.lastMessage?.text || "No messages yet"}
                          </p>
                        </div>

                        {/* Unread Counter Badge */}
                        {hasUnread && (
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs animate-pulse">
                            {conv.unreadByAdmin}
                          </span>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Right Column: Active Chat Pane */}
            <div
              className={`flex-1 flex flex-col h-full bg-slate-50 ${
                activeConversation ? "flex" : "hidden md:flex"
              }`}
            >
              {activeConversation ? (
                <>
                  {/* Active Chat Header */}
                  <div className="bg-white px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0 shadow-2xs">
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Mobile Back Button */}
                      <button
                        onClick={() => setActiveConversation(null)}
                        className="md:hidden p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 cursor-pointer font-bold"
                        title="Back to list"
                      >
                        ←
                      </button>

                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {activeConversation.customerName?.charAt(0)?.toUpperCase() || "C"}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-gray-900 truncate">
                            {activeConversation.customerName}
                          </h4>
                          {activeConversation.relatedOrderNumber && (
                            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-1.5 py-0.5 rounded-md font-mono">
                              Order #{activeConversation.relatedOrderNumber}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] font-mono text-gray-500 font-semibold block">
                          {activeConversation.customerPhone}
                        </span>
                      </div>
                    </div>

                    {/* Header Action: Open WhatsApp */}
                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={`https://wa.me/${activeConversation.customerPhone?.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `Assalam-o-Alaikum ${activeConversation.customerName}, this is StoreZen Official Support regarding your order #${activeConversation.relatedOrderNumber || ""}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Open direct WhatsApp chat"
                      >
                        <span>💬</span>
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Messages Scroll Thread */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
                    {chatMessages.length === 0 ? (
                      <div className="py-20 text-center text-xs text-gray-400">
                        <span>No message history in this chat yet.</span>
                      </div>
                    ) : (
                      chatMessages.map((msg) => {
                        const isAdmin = msg.sender === "admin";
                        const isSystem = msg.sender === "system";
                        const isApproved = msg.type === "payment_approved";
                        const isRejected = msg.type === "payment_rejected";

                        return (
                          <div
                            key={msg._id}
                            className={`flex flex-col ${
                              isAdmin ? "items-end" : "items-start"
                            }`}
                          >
                            {/* Auto System Notification Card */}
                            {isSystem || isApproved || isRejected ? (
                              <div
                                className={`group relative w-full max-w-md rounded-2xl p-4 space-y-2 border shadow-xs text-xs ${
                                  isApproved
                                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                                    : isRejected
                                    ? "bg-rose-50/70 border-rose-300 text-rose-950"
                                    : "bg-blue-50/70 border-blue-200 text-blue-950"
                                }`}
                              >
                                {/* Admin Delete Button for System Notice */}
                                <button
                                  type="button"
                                  onClick={() => setAdminDeleteConfirmMsg(msg)}
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-[10px] cursor-pointer bg-black/10 hover:bg-black/20 text-gray-700"
                                  title="Delete message"
                                >
                                  🗑️
                                </button>

                                <div className="flex items-center justify-between pb-1.5 border-b border-black/10 font-black">
                                  <span className="flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
                                    {isApproved
                                      ? "🎉 Automated Payment Confirmation"
                                      : isRejected
                                      ? "⚠️ Payment Rejection Notice"
                                      : "ℹ️ StoreZen System Message"}
                                  </span>
                                  <span className="text-[10px] opacity-75 font-normal">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                <div className="whitespace-pre-line leading-relaxed text-[11px] font-sans">
                                  {msg.text}
                                </div>
                              </div>
                            ) : msg.isDeletedForEveryone ? (
                              /* WhatsApp-Style Deleted for Everyone Bubble */
                              <div
                                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed italic border flex items-center gap-1.5 select-none bg-gray-100/90 border-gray-200 text-gray-500 ${
                                  isAdmin ? "rounded-br-xs" : "rounded-bl-xs"
                                }`}
                              >
                                <span className="text-xs not-italic opacity-70">🚫</span>
                                <span>
                                  {isAdmin ? "You deleted this message" : "This message was deleted"}
                                </span>
                                <span className="text-[9px] not-italic text-gray-400 ml-auto">
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            ) : (
                              /* Standard Message Bubble */
                              <div
                                className={`group relative max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed transition ${
                                  isAdmin
                                    ? "bg-blue-600 text-white rounded-br-xs"
                                    : "bg-white text-gray-900 border border-gray-200/90 rounded-bl-xs"
                                }`}
                              >
                                {/* WhatsApp-Style Delete Button on Hover */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setAdminDeleteConfirmMsg(msg);
                                  }}
                                  className={`absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-[10px] cursor-pointer ${
                                    isAdmin
                                      ? "bg-blue-700 hover:bg-blue-800 text-white"
                                      : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                                  }`}
                                  title="Delete message"
                                >
                                  🗑️
                                </button>

                                <span
                                  className={`text-[9px] font-black block mb-0.5 ${
                                    isAdmin ? "text-blue-200" : "text-gray-500"
                                  }`}
                                >
                                  {isAdmin ? "Admin (StoreZen)" : activeConversation.customerName}
                                </span>
                                <p className="whitespace-pre-wrap pr-3">{msg.text}</p>
                                <span
                                  className={`text-[9px] block text-right mt-1 ${
                                    isAdmin ? "text-blue-100" : "text-gray-400"
                                  }`}
                                >
                                  {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Predefined Quick Templates Bar */}
                  <div className="bg-white px-3 py-2 border-t border-gray-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
                    <span className="text-[10px] font-bold text-gray-400 uppercase shrink-0">
                      Quick:
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendAdminMessage(
                          null,
                          "✓ Payment verified and approved! Your order is currently being packed for courier dispatch."
                        )
                      }
                      className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 text-gray-700 text-[11px] font-semibold rounded-lg transition shrink-0 cursor-pointer border border-gray-200"
                    >
                      ✓ Payment Verified
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendAdminMessage(
                          null,
                          "📷 Please reply with a clear screenshot of your bank transfer receipt or check your Transaction ID (TID)."
                        )
                      }
                      className="px-2.5 py-1 bg-gray-100 hover:bg-amber-50 hover:text-amber-800 text-gray-700 text-[11px] font-semibold rounded-lg transition shrink-0 cursor-pointer border border-gray-200"
                    >
                      📷 Request Clear Receipt
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleSendAdminMessage(
                          null,
                          "🚚 Your parcel has been dispatched! You will receive your courier tracking ID shortly."
                        )
                      }
                      className="px-2.5 py-1 bg-gray-100 hover:bg-purple-50 hover:text-purple-800 text-gray-700 text-[11px] font-semibold rounded-lg transition shrink-0 cursor-pointer border border-gray-200"
                    >
                      🚚 Parcel Dispatched
                    </button>
                  </div>

                  {/* Message Input Box */}
                  <form
                    onSubmit={handleSendAdminMessage}
                    className="p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
                  >
                    <input
                      type="text"
                      placeholder={`Reply to ${activeConversation.customerName}...`}
                      value={adminMessageText}
                      onChange={(e) => setAdminMessageText(e.target.value)}
                      className="flex-1 bg-gray-100 focus:bg-white text-xs sm:text-sm rounded-xl px-4 py-2.5 border border-transparent focus:border-blue-500 focus:outline-hidden transition"
                    />
                    <button
                      type="submit"
                      disabled={!adminMessageText.trim() || isSendingAdminMessage}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      <span>Send</span>
                      <span>➤</span>
                    </button>
                  </form>
                </>
              ) : (
                /* Empty Chat Pane Placeholder */
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
                  <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mb-3 shadow-inner">
                    💬
                  </div>
                  <h4 className="text-base font-extrabold text-gray-800">
                    StoreZen Customer Chat Portal
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
                    Select any customer from the left sidebar to read incoming queries, view automated order payment logs, and reply in real-time.
                  </p>
                </div>
              )}
            </div>

            {/* WhatsApp-Style Delete Confirmation Modal for Admin */}
            {adminDeleteConfirmMsg && (
              <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
                <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-gray-100 space-y-3 text-center animate-scaleUp">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-lg">
                    🗑️
                  </div>
                  <h4 className="font-extrabold text-sm text-gray-900">Delete message?</h4>
                  <p className="text-xs text-gray-500">
                    Choose how you want to delete this message.
                  </p>

                  <div className="pt-2 flex flex-col gap-2">
                    <button
                      disabled={isDeletingAdminMsg}
                      onClick={() =>
                        handleDeleteAdminMessage(adminDeleteConfirmMsg._id, "everyone")
                      }
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
                    >
                      {isDeletingAdminMsg ? "Deleting..." : "Delete for everyone"}
                    </button>

                    <button
                      disabled={isDeletingAdminMsg}
                      onClick={() =>
                        handleDeleteAdminMessage(adminDeleteConfirmMsg._id, "forMe")
                      }
                      className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                    >
                      {isDeletingAdminMsg ? "Deleting..." : "Delete for me"}
                    </button>

                    <button
                      disabled={isDeletingAdminMsg}
                      onClick={() => setAdminDeleteConfirmMsg(null)}
                      className="w-full py-2 text-gray-500 hover:text-gray-800 font-semibold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* MODAL: ADD PRODUCT                                   */}
      {/* ==================================================== */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>✨</span> Add New Product
              </h3>
              <button
                onClick={() => setShowAddProductModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leather Oxford Shoes"
                  value={productFormData.title}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, title: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Category (From Database)
                </label>
                <select
                  value={productFormData.category}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, category: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c._id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing & Discount */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Pricing & Discount (PKR)
                  </span>
                  {productFormData.originalPrice &&
                  Number(productFormData.originalPrice) > Number(productFormData.price) &&
                  Number(productFormData.price) > 0 ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      🎉 Save Rs. {(Number(productFormData.originalPrice) - Number(productFormData.price)).toLocaleString()} (
                      {Math.round(
                        ((Number(productFormData.originalPrice) - Number(productFormData.price)) /
                          Number(productFormData.originalPrice)) *
                          100
                      )}
                      % OFF)
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">Regular Pricing</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Original / Regular Price (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 3500 (Optional)"
                      value={productFormData.originalPrice}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, originalPrice: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 text-sm rounded-xl px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Cut-price shown with strike-through
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Discounted / Selling Price (PKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 2500"
                      value={productFormData.price}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, price: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 text-sm rounded-xl px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Customer pays this price
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Images (Up to 5 Images with Main Cover Badge) */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="text-xs font-black text-gray-900 uppercase tracking-wider block">
                      Product Photos (Up to 5) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-500">
                      The first photo is the <strong>Main Cover Image</strong> shown on customer cards.
                    </span>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                      (productFormData.images?.length || 0) >= 5
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {productFormData.images?.length || 0} / 5 Images
                  </span>
                </div>

                {/* Upload from Computer & URL Input (if < 5 images) */}
                {(productFormData.images?.length || 0) < 5 ? (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 rounded-xl p-3 flex items-center justify-center gap-2.5 cursor-pointer transition">
                      <span className="text-blue-600 text-lg">📁</span>
                      <div className="text-center">
                        <span className="text-xs font-bold text-blue-700 block">
                          {isUploadingImage
                            ? "Uploading Images..."
                            : "Upload Photos from Computer (Select up to 5)"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Hold Ctrl / Shift to select multiple images
                        </span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={isUploadingImage}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) handleMultipleImageUpload(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageUrl(imageUrlInput);
                          }
                        }}
                        className="flex-1 bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl(imageUrlInput)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
                    <span>✓</span>
                    <span>
                      Maximum limit of <strong>5 images</strong> reached. Click ✕ on any thumbnail to remove or replace it.
                    </span>
                  </div>
                )}

                {/* Uploaded Images Gallery Strip */}
                {productFormData.images && productFormData.images.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                      Uploaded Gallery Preview:
                    </span>
                    <div className="grid grid-cols-5 gap-2.5">
                      {productFormData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-white group shadow-2xs ${
                            idx === 0 ? "border-blue-600 ring-2 ring-blue-500/20" : "border-gray-200"
                          }`}
                        >
                          <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                          {/* Main Image Badge */}
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                              ★ Main
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              className="absolute top-1 left-1 bg-black/60 hover:bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition cursor-pointer"
                              title="Set as Main Cover Image"
                            >
                              Make Main
                            </button>
                          )}

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white text-[10px] flex items-center justify-center transition cursor-pointer"
                            title="Remove image"
                          >
                            ✕
                          </button>

                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Short Video: Upload from PC or URL */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-wider block">
                    Short Video (Optional)
                  </label>
                  <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    MP4 / WebM (Max 60MB)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white hover:bg-purple-50/50 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition">
                    <span className="text-purple-600 text-lg">📹</span>
                    <span className="text-xs font-bold text-purple-700">
                      {isUploadingVideo ? "Uploading Video..." : "Upload Short Video from Computer"}
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      disabled={isUploadingVideo}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="Or paste video URL (https://...mp4)"
                    value={productFormData.video}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, video: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-900 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                {productFormData.video && (
                  <div className="relative rounded-xl overflow-hidden border border-purple-200 bg-black mt-2">
                    <video
                      src={productFormData.video}
                      controls
                      playsInline
                      className="w-full max-h-36 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setProductFormData({ ...productFormData, video: "" })}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center transition cursor-pointer"
                      title="Remove video"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Product description for semantic AI vector indexing..."
                  value={productFormData.description}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, description: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingProduct || isUploadingImage || isUploadingVideo}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingProduct ? "Saving to Database..." : "Save Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: EDIT PRODUCT                                  */}
      {/* ==================================================== */}
      {showEditProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-8 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>✏️</span> Edit Product
              </h3>
              <button
                onClick={() => {
                  setShowEditProductModal(false);
                  setEditingProductId(null);
                }}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditProductSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={productFormData.title}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, title: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Category</label>
                <select
                  value={productFormData.category}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, category: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c._id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing & Discount */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-gray-900 uppercase tracking-wider">
                    Pricing & Discount (PKR)
                  </span>
                  {productFormData.originalPrice &&
                  Number(productFormData.originalPrice) > Number(productFormData.price) &&
                  Number(productFormData.price) > 0 ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                      🎉 Save Rs. {(Number(productFormData.originalPrice) - Number(productFormData.price)).toLocaleString()} (
                      {Math.round(
                        ((Number(productFormData.originalPrice) - Number(productFormData.price)) /
                          Number(productFormData.originalPrice)) *
                          100
                      )}
                      % OFF)
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-400">Regular Pricing</span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Original / Regular Price (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="e.g. 3500 (Optional)"
                      value={productFormData.originalPrice}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, originalPrice: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 text-sm rounded-xl px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Cut-price shown with strike-through
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-gray-600 block mb-1">
                      Discounted / Selling Price (PKR) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 2500"
                      value={productFormData.price}
                      onChange={(e) =>
                        setProductFormData({ ...productFormData, price: e.target.value })
                      }
                      className="w-full bg-white border border-gray-200 text-sm rounded-xl px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-hidden"
                    />
                    <span className="text-[10px] text-gray-400 block mt-0.5">
                      Customer pays this price
                    </span>
                  </div>
                </div>
              </div>

              {/* Product Images (Up to 5 Images with Main Cover Badge) */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <label className="text-xs font-black text-gray-900 uppercase tracking-wider block">
                      Product Photos (Up to 5) <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[11px] text-gray-500">
                      The first photo is the <strong>Main Cover Image</strong> shown on customer cards.
                    </span>
                  </div>
                  <span
                    className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                      (productFormData.images?.length || 0) >= 5
                        ? "bg-amber-50 text-amber-700 border-amber-200"
                        : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {productFormData.images?.length || 0} / 5 Images
                  </span>
                </div>

                {/* Upload from Computer & URL Input (if < 5 images) */}
                {(productFormData.images?.length || 0) < 5 ? (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-blue-200 hover:border-blue-400 bg-white hover:bg-blue-50/50 rounded-xl p-3 flex items-center justify-center gap-2.5 cursor-pointer transition">
                      <span className="text-blue-600 text-lg">📁</span>
                      <div className="text-center">
                        <span className="text-xs font-bold text-blue-700 block">
                          {isUploadingImage
                            ? "Uploading Images..."
                            : "Upload Photos from Computer (Select up to 5)"}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          Hold Ctrl / Shift to select multiple images
                        </span>
                      </div>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={isUploadingImage}
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files) handleMultipleImageUpload(e.target.files);
                          e.target.value = "";
                        }}
                      />
                    </label>

                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="Or paste image URL (https://...)"
                        value={imageUrlInput}
                        onChange={(e) => setImageUrlInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddImageUrl(imageUrlInput);
                          }
                        }}
                        className="flex-1 bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-900 focus:border-blue-600 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddImageUrl(imageUrlInput)}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        + Add
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
                    <span>✓</span>
                    <span>
                      Maximum limit of <strong>5 images</strong> reached. Click ✕ on any thumbnail to remove or replace it.
                    </span>
                  </div>
                )}

                {/* Uploaded Images Gallery Strip */}
                {productFormData.images && productFormData.images.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">
                      Uploaded Gallery Preview:
                    </span>
                    <div className="grid grid-cols-5 gap-2.5">
                      {productFormData.images.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-xl overflow-hidden border-2 bg-white group shadow-2xs ${
                            idx === 0 ? "border-blue-600 ring-2 ring-blue-500/20" : "border-gray-200"
                          }`}
                        >
                          <img src={imgUrl} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />

                          {/* Main Image Badge */}
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-blue-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                              ★ Main
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(idx)}
                              className="absolute top-1 left-1 bg-black/60 hover:bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition cursor-pointer"
                              title="Set as Main Cover Image"
                            >
                              Make Main
                            </button>
                          )}

                          {/* Remove Button */}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/70 hover:bg-red-600 text-white text-[10px] flex items-center justify-center transition cursor-pointer"
                            title="Remove image"
                          >
                            ✕
                          </button>

                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Short Video: Upload from PC or URL */}
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-wider block">
                    Short Video (Optional)
                  </label>
                  <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    MP4 / WebM (Max 60MB)
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex-1 border-2 border-dashed border-purple-200 hover:border-purple-400 bg-white hover:bg-purple-50/50 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition">
                    <span className="text-purple-600 text-lg">📹</span>
                    <span className="text-xs font-bold text-purple-700">
                      {isUploadingVideo ? "Uploading Video..." : "Upload Short Video from Computer"}
                    </span>
                    <input
                      type="file"
                      accept="video/*"
                      disabled={isUploadingVideo}
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoUpload(file);
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>

                <div>
                  <input
                    type="url"
                    placeholder="Or paste video URL (https://...mp4)"
                    value={productFormData.video}
                    onChange={(e) =>
                      setProductFormData({ ...productFormData, video: e.target.value })
                    }
                    className="w-full bg-white border border-gray-200 text-xs rounded-xl px-3 py-2 text-gray-900 focus:border-purple-600 focus:outline-hidden"
                  />
                </div>

                {productFormData.video && (
                  <div className="relative rounded-xl overflow-hidden border border-purple-200 bg-black mt-2">
                    <video
                      src={productFormData.video}
                      controls
                      playsInline
                      className="w-full max-h-36 object-contain"
                    />
                    <button
                      type="button"
                      onClick={() => setProductFormData({ ...productFormData, video: "" })}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/80 hover:bg-red-600 text-white text-xs font-bold flex items-center justify-center transition cursor-pointer"
                      title="Remove video"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={productFormData.description}
                  onChange={(e) =>
                    setProductFormData({ ...productFormData, description: e.target.value })
                  }
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl p-3 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmittingProduct || isUploadingImage || isUploadingVideo}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSubmittingProduct ? "Updating in Database..." : "Update Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: DELETE PRODUCT CONFIRMATION                   */}
      {/* ==================================================== */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mx-auto mb-4">
              🗑️
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Product?</h3>
            <p className="text-xs text-gray-500 mt-2">
              Are you sure you want to delete <strong>&ldquo;{productToDelete.title}&rdquo;</strong> from Databse?
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setProductToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteProduct}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: DELETE CATEGORY CONFIRMATION                 */}
      {/* ==================================================== */}
      {categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-14 h-14 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-2xl mx-auto mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-gray-900">Delete Category?</h3>
            <p className="text-xs text-gray-500 mt-2">
              Delete category <strong>&ldquo;{categoryToDelete.name}&rdquo;</strong>? Linked products will not be deleted; they will retain their category.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCategoryToDelete(null)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteCategory}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODAL: PROCESS ORDER & ASSIGN COURIER (5 COURIERS)  */}
      {/* ==================================================== */}
      {showDispatchModal && selectedDispatchOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] overflow-y-auto p-4 sm:p-8 shadow-2xl border border-gray-100">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl shadow-2xs">
                  🚚
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Process & Dispatch Order
                  </h3>
                  <p className="text-xs text-gray-500">
                    Assign courier service & consignment tracking ID
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDispatchModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Order Brief Info */}
            <div className="py-3 px-4 bg-gray-50 rounded-2xl border border-gray-200/80 my-4 text-xs">
              <div className="flex justify-between items-center mb-1">
                <span className="font-extrabold text-sm text-gray-900 font-mono">
                  #{selectedDispatchOrder.orderNumber}
                </span>
                <span className="font-black text-emerald-600 text-sm">
                  Rs. {selectedDispatchOrder.totalAmount?.toLocaleString()} (COD)
                </span>
              </div>
              <p className="text-gray-600">
                Customer: <strong>{selectedDispatchOrder.customer?.name}</strong> •{" "}
                {selectedDispatchOrder.customer?.phone}
              </p>
              <p className="text-gray-500 mt-0.5">
                Destination: {selectedDispatchOrder.customer?.city || "Pakistan"}
              </p>
            </div>

            <form onSubmit={handleSaveDispatchSubmit} className="space-y-4">
              {/* Courier Selection (5 Options) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-2 uppercase tracking-wider">
                  Select Courier Service (5 Options) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {COURIER_OPTIONS.map((c) => {
                    const isSelected = dispatchCourier === c.id;
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setDispatchCourier(c.id)}
                        className={`p-3 rounded-2xl border text-left transition flex items-center gap-3.5 cursor-pointer shadow-2xs ${
                          isSelected
                            ? "bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/25"
                            : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/70"
                        }`}
                      >
                        <div className="w-20 h-11 rounded-xl bg-white border border-gray-200/90 flex items-center justify-center p-1 shrink-0 shadow-2xs overflow-hidden">
                          <img
                            src={c.logo}
                            alt={c.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-gray-900 block truncate">
                              {c.name}
                            </span>
                            {isSelected && (
                              <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                                ✓
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-gray-500 truncate block">
                            {c.description}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tracking ID / Consignment Number */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Tracking ID / Consignment Number (CN) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1029384756 or TRAX-98210"
                  value={dispatchTrackingId}
                  onChange={(e) => setDispatchTrackingId(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden font-mono tracking-wider"
                />
                <span className="text-[11px] text-gray-400 mt-1 block">
                  The barcode / CN number issued by the courier receipt
                </span>
              </div>

              {/* Order Status */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Update Order Status
                </label>
                <select
                  value={dispatchStatus}
                  onChange={(e) => setDispatchStatus(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-4 py-2.5 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden cursor-pointer font-bold"
                >
                  <option value="Order Dispatch">Order Dispatch (Dispatched with Courier)</option>
                  <option value="Processing">Processing (Packed & Ready)</option>
                  <option value="Delivered">Delivered (Completed)</option>
                  <option value="Return">Return</option>
                  <option value="Cancel">Cancel</option>
                </select>
              </div>

              {/* Tracking Preview */}
              {dispatchCourier && dispatchTrackingId.trim() && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs space-y-1">
                  <span className="font-bold text-blue-900 block">
                    Customer Tracking Preview:
                  </span>
                  <p className="text-blue-800 break-all text-[11px] font-mono">
                    {getTrackingUrl(dispatchCourier, dispatchTrackingId.trim())}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingDispatch}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSavingDispatch ? (
                    "Saving Dispatch..."
                  ) : (
                    <>
                      <span>Save & Dispatch Order</span>
                      <span>✓</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payment Proof & Transaction Verification Modal */}
      {selectedProofOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-5 sm:px-6 py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-lg">
                  🏦
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black tracking-tight leading-none">
                    Payment Verification
                  </h3>
                  <p className="text-[11px] sm:text-xs text-blue-100 mt-1">
                    Order #{selectedProofOrder.orderNumber || selectedProofOrder._id?.slice(-6)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedProofOrder(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm">
              {/* Order & Customer Summary Card */}
              <div className="bg-gray-50 rounded-2xl p-3.5 sm:p-4 border border-gray-200/80 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                    Customer Details
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-black ${
                      selectedProofOrder.paymentStatus === "Paid"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedProofOrder.paymentStatus === "Pending Verification"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {selectedProofOrder.paymentStatus || "Pending"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Name</span>
                    <span className="font-extrabold text-gray-900">{selectedProofOrder.customerName}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Phone / WhatsApp</span>
                    <a
                      href={`https://wa.me/${selectedProofOrder.customerPhone?.replace(/\D/g, "")}?text=${encodeURIComponent(
                        `Assalam-o-Alaikum ${selectedProofOrder.customerName}, this is regarding your StoreZen Order #${
                          selectedProofOrder.orderNumber || selectedProofOrder._id?.slice(-6)
                        } of Rs. ${selectedProofOrder.totalAmount?.toLocaleString()}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                    >
                      <span>💬</span> {selectedProofOrder.customerPhone}
                    </a>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Total Bill</span>
                    <span className="font-black text-blue-600 text-sm sm:text-base">
                      Rs. {selectedProofOrder.totalAmount?.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Payment Method</span>
                    <span className="font-bold text-gray-800">
                      {selectedProofOrder.paymentMethod || "Bank Transfer / Raast"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction ID (TID) */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 sm:p-4 space-y-1.5">
                <span className="text-[10px] sm:text-xs font-extrabold text-blue-900 uppercase tracking-wider block">
                  Customer Submitted Transaction ID (TID)
                </span>
                <div className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-blue-200">
                  <span className="font-mono font-bold text-gray-900 text-sm sm:text-base tracking-wide select-all">
                    {selectedProofOrder.transactionId || "No TID entered by customer"}
                  </span>
                  {selectedProofOrder.transactionId && (
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(selectedProofOrder.transactionId);
                        showToast("TID copied to clipboard! 📋");
                      }}
                      className="px-2.5 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-bold rounded-lg transition cursor-pointer shrink-0"
                    >
                      Copy TID
                    </button>
                  )}
                </div>
                <p className="text-[10px] text-blue-700">
                  Compare this TID with your Meezan/SadaPay/Raast mobile app notification to confirm payment arrival.
                </p>
              </div>

              {/* Screenshot Receipt Preview */}
              <div className="space-y-1.5">
                <span className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase tracking-wider block">
                  Payment Receipt Screenshot
                </span>
                {selectedProofOrder.paymentReceipt ? (
                  <div className="border border-gray-200 rounded-2xl p-2 bg-gray-50 flex flex-col items-center">
                    <a
                      href={selectedProofOrder.paymentReceipt}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative group overflow-hidden rounded-xl border border-gray-300 max-h-80"
                      title="Click to open original full-size image"
                    >
                      <img
                        src={selectedProofOrder.paymentReceipt}
                        alt="Customer Payment Receipt"
                        className="max-h-72 w-auto object-contain rounded-xl group-hover:scale-[1.02] transition"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1.5">
                        <span>🔍 Open Full Size</span>
                      </div>
                    </a>
                    <span className="text-[11px] text-gray-500 mt-2">
                      Click image to inspect or download full receipt
                    </span>
                  </div>
                ) : (
                  <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50 text-gray-400">
                    <span className="text-2xl block mb-1">🧾</span>
                    <span>No screenshot receipt attached for this order.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="bg-gray-50 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setSelectedProofOrder(null)}
                className="order-3 sm:order-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Close
              </button>

              {selectedProofOrder.paymentStatus !== "Unpaid" && (
                <button
                  type="button"
                  disabled={isVerifyingPayment}
                  onClick={() => {
                    setPaymentIssueReason("Transaction ID (TID) could not be matched with bank record.");
                    setShowPaymentIssueModal(true);
                  }}
                  className="order-2 px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  <span>⚠️ Reject / Issue Reason</span>
                </button>
              )}

              <button
                type="button"
                disabled={isVerifyingPayment || selectedProofOrder.paymentStatus === "Paid"}
                onClick={() => handleUpdatePaymentStatus(selectedProofOrder._id, "Paid", "Processing")}
                className="order-1 sm:order-3 flex-1 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isVerifyingPayment ? (
                  "Updating..."
                ) : selectedProofOrder.paymentStatus === "Paid" ? (
                  "✓ Payment Already Approved"
                ) : (
                  <>
                    <span>✓ Approve & Mark as Paid</span>
                    <span className="text-[10px] font-normal opacity-90">(Moves to Processing)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Issue / Rejection Modal */}
      {showPaymentIssueModal && selectedProofOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-fadeIn">
            <div className="flex items-center gap-2.5 text-rose-600 font-black mb-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                  Payment Verification Issue
                </h3>
                <p className="text-[11px] text-gray-500 font-normal">
                  Order #{selectedProofOrder.orderNumber || selectedProofOrder._id?.slice(-6)} • {selectedProofOrder.customerName}
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-3">
              Please specify the issue so an auto-generated English alert is sent directly to the customer&apos;s chat with instructions:
            </p>

            {/* Quick Suggestion Chips */}
            <div className="space-y-1.5 mb-3">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                Quick Reason Templates:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Transaction ID (TID) could not be matched with bank record.",
                  "Payment receipt screenshot is blurry or unreadable.",
                  "Transferred amount is less than total order bill.",
                  "Sender name on bank slip does not match customer details.",
                ].map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => setPaymentIssueReason(chip)}
                    className="text-[10px] bg-gray-100 hover:bg-rose-50 hover:text-rose-700 text-gray-700 px-2.5 py-1 rounded-lg border border-gray-200 transition cursor-pointer text-left"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Reason Input */}
            <div className="mb-4">
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Reason sent to Customer:
              </label>
              <textarea
                rows={3}
                required
                value={paymentIssueReason}
                onChange={(e) => setPaymentIssueReason(e.target.value)}
                placeholder="Type explanation for customer..."
                className="w-full bg-gray-50 border border-gray-200 text-xs sm:text-sm rounded-xl p-3 text-gray-900 focus:bg-white focus:border-rose-500 focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setShowPaymentIssueModal(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isVerifyingPayment || !paymentIssueReason.trim()}
                onClick={async () => {
                  await handleUpdatePaymentStatus(
                    selectedProofOrder._id,
                    "Unpaid",
                    null,
                    paymentIssueReason.trim()
                  );
                  setShowPaymentIssueModal(false);
                  setPaymentIssueReason("");
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
              >
                {isVerifyingPayment ? "Sending Alert..." : "Send Alert & Mark Unpaid"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
