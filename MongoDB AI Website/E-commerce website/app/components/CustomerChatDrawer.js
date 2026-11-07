"use client";

import { useState, useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";
import { validatePakistaniPhone } from "../lib/pakistanLocations";

export default function CustomerChatDrawer() {
  const {
    isChatOpen,
    setIsChatOpen,
    customerChatPhone,
    setCustomerChatPhone,
    customerChatName,
    setCustomerChatName,
    setChatUnreadCount,
  } = useCart();

  // Internal state
  const [phoneInput, setPhoneInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleteConfirmMsg, setDeleteConfirmMsg] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Sync inputs with context
  useEffect(() => {
    if (customerChatPhone) setPhoneInput(customerChatPhone);
    if (customerChatName) setNameInput(customerChatName);
  }, [customerChatPhone, customerChatName]);

  // Load or fetch conversation when drawer opens and phone exists
  const loadConversation = async (phone) => {
    if (!phone) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/chat/conversations?customerPhone=${encodeURIComponent(phone)}`
      );
      const data = await res.json();
      if (data.success && data.conversations?.length > 0) {
        const activeConv = data.conversations[0];
        setConversation(activeConv);
        fetchMessages(activeConv._id);
      } else {
        // Create initial conversation
        const createRes = await fetch("/api/chat/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customerPhone: phone,
            customerName: customerChatName || nameInput || "Valued Customer",
          }),
        });
        const createData = await createRes.json();
        if (createData.success && createData.conversation) {
          setConversation(createData.conversation);
          fetchMessages(createData.conversation._id);
        }
      }
    } catch (err) {
      console.error("Error loading chat conversation:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages and mark as read for customer
  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${convId}&reader=customer`);
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages(data.messages);
        setChatUnreadCount(0);
      }
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  // Initial load when drawer is opened
  useEffect(() => {
    if (isChatOpen && customerChatPhone) {
      loadConversation(customerChatPhone);
    }
  }, [isChatOpen, customerChatPhone]);

  // Periodic polling for new messages every 4s while drawer is open
  useEffect(() => {
    if (!isChatOpen || !conversation?._id) return;

    const interval = setInterval(() => {
      fetchMessages(conversation._id);
    }, 4000);

    return () => clearInterval(interval);
  }, [isChatOpen, conversation?._id]);

  // Scroll down when new messages arrive
  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Start chat after phone verification
  const handleStartChat = async (e) => {
    e.preventDefault();
    setPhoneError("");

    const phoneCheck = validatePakistaniPhone(phoneInput);
    if (!phoneCheck.isValid) {
      setPhoneError(phoneCheck.message);
      return;
    }

    const cleanPhone = phoneCheck.formatted || phoneInput.trim();
    const cleanName = nameInput.trim() || "Valued Customer";

    localStorage.setItem("storezen_customer_phone", cleanPhone);
    localStorage.setItem("storezen_customer_name", cleanName);
    setCustomerChatPhone(cleanPhone);
    setCustomerChatName(cleanName);

    loadConversation(cleanPhone);
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !conversation?._id || sending) return;

    const textToSend = inputMessage.trim();
    setInputMessage("");
    setSending(true);

    try {
      const res = await fetch("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversation._id,
          sender: "customer",
          text: textToSend,
        }),
      });

      const data = await res.json();
      if (data.success && data.message) {
        setMessages((prev) => [...prev, data.message]);
        scrollToBottom();
      }
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  // WhatsApp-Style Delete Message Handler
  const handleDeleteMessage = async (messageId, deleteMode) => {
    setIsDeleting(true);
    try {
      const res = await fetch("/api/chat/messages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messageId,
          deleteMode,
          requester: "customer",
        }),
      });
      const data = await res.json();
      if (data.success) {
        if (deleteMode === "everyone") {
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId
                ? { ...m, isDeletedForEveryone: true, text: "This message was deleted" }
                : m
            )
          );
        } else {
          setMessages((prev) => prev.filter((m) => m._id !== messageId));
        }
      }
    } catch (e) {
      console.error("Delete message error:", e);
    } finally {
      setIsDeleting(false);
      setDeleteConfirmMsg(null);
    }
  };

  if (!isChatOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      {/* Click outside to close */}
      <div
        className="flex-1 hidden sm:block cursor-pointer"
        onClick={() => setIsChatOpen(false)}
      />

      {/* Drawer Container */}
      <div className="w-full sm:w-[460px] bg-white h-full flex flex-col shadow-2xl border-l border-gray-200 animate-slideLeft">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white p-4 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center text-lg font-bold">
                💬
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-blue-600 animate-pulse"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm sm:text-base leading-tight">
                  StoreZen Support & Orders
                </h3>
              </div>
              <p className="text-[11px] text-blue-100 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-300"></span>
                <span>Active 24/7 • Instant Order Alerts</span>
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsChatOpen(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-sm font-bold transition cursor-pointer"
            title="Close Chat"
          >
            ✕
          </button>
        </div>

        {/* State 1: Onboarding (Phone verification if not already set) */}
        {!customerChatPhone ? (
          <div className="flex-1 p-6 flex flex-col justify-center items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center text-3xl mb-4 shadow-inner">
              📱
            </div>
            <h4 className="text-lg font-extrabold text-gray-900">
              Welcome to StoreZen Support
            </h4>
            <p className="text-xs text-gray-500 mt-1.5 max-w-xs leading-relaxed">
              Enter your mobile number to view auto-generated order confirmation messages, payment approval alerts, and chat live with our support team.
            </p>

            <form onSubmit={handleStartChat} className="w-full max-w-xs mt-6 space-y-3.5 text-left">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Full Name (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ali Khan"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-3.5 py-2.5 text-gray-900 focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0300-1234567"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-sm rounded-xl px-3.5 py-2.5 text-gray-900 font-mono focus:bg-white focus:border-blue-600 focus:outline-hidden"
                />
                {phoneError && (
                  <p className="text-[11px] text-red-600 font-medium mt-1">
                    {phoneError}
                  </p>
                )}
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Use the same number you use during checkout.
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Open My Chat</span>
                <span>💬</span>
              </button>
            </form>
          </div>
        ) : (
          /* State 2: Active Chat Screen */
          <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
            {/* Active User Sub-bar */}
            <div className="bg-white px-4 py-2 border-b border-gray-200 flex items-center justify-between text-xs shrink-0">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-bold text-gray-800 truncate">
                  {customerChatName || "My Chat"}
                </span>
                <span className="text-gray-400 font-mono text-[11px]">
                  ({customerChatPhone})
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (confirm("Switch to another phone number?")) {
                    localStorage.removeItem("storezen_customer_phone");
                    setCustomerChatPhone("");
                    setConversation(null);
                    setMessages([]);
                  }
                }}
                className="text-[10px] text-blue-600 hover:underline font-semibold cursor-pointer shrink-0"
              >
                Change #
              </button>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5">
              {loading && (
                <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading messages...</span>
                </div>
              )}

              {!loading && messages.length === 0 && (
                <div className="text-center py-10 px-4 text-xs text-gray-500">
                  <div className="text-3xl mb-2">👋</div>
                  <p className="font-bold text-gray-700">No messages yet!</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Send a question to our team or order products to receive live payment approval alerts here.
                  </p>
                </div>
              )}

              {/* Message Bubbles */}
              {messages.map((msg) => {
                const isCustomer = msg.sender === "customer";
                const isApprovedNotice = msg.type === "payment_approved";
                const isRejectedNotice = msg.type === "payment_rejected";

                return (
                  <div
                    key={msg._id}
                    className={`flex flex-col ${isCustomer ? "items-end" : "items-start"}`}
                  >
                    {/* Special Auto-Generated Card for Payment Approved */}
                    {isApprovedNotice ? (
                      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-emerald-500 shadow-md p-3.5 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-emerald-800 font-black border-b border-emerald-100 pb-1.5">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-sm">
                            ✓
                          </span>
                          <span className="text-xs uppercase tracking-wide">
                            Payment Verified & Received
                          </span>
                        </div>
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed text-[11px] font-sans">
                          {msg.text}
                        </div>
                        <div className="pt-1 flex items-center justify-between text-[9px] text-gray-400">
                          <span className="font-bold text-emerald-600">Auto-Generated Notification</span>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ) : isRejectedNotice ? (
                      /* Special Auto-Generated Card for Payment Issue / Rejected */
                      <div className="w-full max-w-sm bg-white rounded-2xl border-2 border-rose-400 shadow-md p-3.5 space-y-2 text-xs">
                        <div className="flex items-center gap-2 text-rose-800 font-black border-b border-rose-100 pb-1.5">
                          <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-sm">
                            ⚠️
                          </span>
                          <span className="text-xs uppercase tracking-wide">
                            Payment Verification Alert
                          </span>
                        </div>
                        <div className="text-gray-700 whitespace-pre-line leading-relaxed text-[11px] font-sans">
                          {msg.text}
                        </div>
                        <div className="pt-1 flex items-center justify-between text-[9px] text-gray-400">
                          <span className="font-bold text-rose-600">Action Required</span>
                          <span>
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    ) : msg.isDeletedForEveryone ? (
                      /* WhatsApp-Style Deleted for Everyone Bubble */
                      <div
                        className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed italic border flex items-center gap-1.5 select-none ${
                          isCustomer
                            ? "bg-blue-50/70 border-blue-200 text-blue-900/60 rounded-br-xs"
                            : "bg-gray-100/90 border-gray-200 text-gray-500 rounded-bl-xs"
                        }`}
                      >
                        <span className="text-xs not-italic opacity-70">🚫</span>
                        <span>
                          {isCustomer ? "You deleted this message" : "This message was deleted"}
                        </span>
                        <span className="text-[9px] not-italic text-gray-400 ml-auto">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ) : (
                      /* Standard Chat Bubble */
                      <div
                        className={`group relative max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed transition ${
                          isCustomer
                            ? "bg-blue-600 text-white rounded-br-xs"
                            : "bg-white text-gray-800 border border-gray-200/80 rounded-bl-xs"
                        }`}
                      >
                        {/* WhatsApp-Style Delete Button on Hover / Tap */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmMsg(msg);
                          }}
                          className={`absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition p-1 rounded-md text-[10px] cursor-pointer ${
                            isCustomer
                              ? "bg-blue-700/90 hover:bg-blue-800 text-white"
                              : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                          }`}
                          title="Delete message"
                        >
                          🗑️
                        </button>

                        {!isCustomer && (
                          <span className="text-[10px] font-black text-blue-600 block mb-0.5">
                            🛡️ StoreZen Official Support
                          </span>
                        )}
                        <p className="whitespace-pre-wrap pr-3">{msg.text}</p>
                        <div className="flex items-center justify-between gap-2 mt-1">
                          <button
                            type="button"
                            onClick={() => setDeleteConfirmMsg(msg)}
                            className={`sm:hidden text-[9px] underline opacity-75 ${
                              isCustomer ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            delete
                          </button>
                          <span
                            className={`text-[9px] ml-auto ${
                              isCustomer ? "text-blue-100" : "text-gray-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSendMessage}
              className="p-2.5 sm:p-3 bg-white border-t border-gray-200 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder="Type your reply to StoreZen support..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="flex-1 bg-gray-100 focus:bg-white text-xs sm:text-sm rounded-xl px-3.5 py-2.5 border border-transparent focus:border-blue-500 focus:outline-hidden transition"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || sending}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer flex items-center gap-1 shrink-0"
              >
                <span>Send</span>
                <span>➤</span>
              </button>
            </form>
          </div>
        )}

        {/* WhatsApp-Style Delete Confirmation Modal */}
        {deleteConfirmMsg && (
          <div className="fixed inset-0 z-60 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-2xl max-w-xs w-full p-5 shadow-2xl border border-gray-100 space-y-3 animate-scaleUp text-center">
              <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto text-lg">
                🗑️
              </div>
              <h4 className="font-extrabold text-sm text-gray-900">Delete message?</h4>
              <p className="text-xs text-gray-500">
                Choose how you want to delete this message.
              </p>

              <div className="pt-2 flex flex-col gap-2">
                {/* Delete for everyone (if sent by customer) */}
                {deleteConfirmMsg.sender === "customer" && (
                  <button
                    disabled={isDeleting}
                    onClick={() => handleDeleteMessage(deleteConfirmMsg._id, "everyone")}
                    className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs"
                  >
                    {isDeleting ? "Deleting..." : "Delete for everyone"}
                  </button>
                )}

                <button
                  disabled={isDeleting}
                  onClick={() => handleDeleteMessage(deleteConfirmMsg._id, "forMe")}
                  className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Delete for me"}
                </button>

                <button
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirmMsg(null)}
                  className="w-full py-2 text-gray-500 hover:text-gray-800 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

