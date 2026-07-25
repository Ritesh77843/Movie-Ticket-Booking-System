"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const loadRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

/* ─────────────────────────────────────────────
   Food Item Interface
───────────────────────────────────────────── */
interface FoodItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  type: string;
}

interface CartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  emoji: string;
}

/* ─────────────────────────────────────────────
   Success screen
───────────────────────────────────────────── */
function SuccessScreen({ bookingId, seats, totalPrice }: { bookingId: string; seats: string[]; totalPrice: number; }) {
  const router = useRouter();
  return (
    <div className="text-center space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-900/50"
      >
        <span className="text-5xl">✓</span>
      </motion.div>
      <div>
        <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
        <p className="text-gray-400">Your payment was successful and your seats are reserved.</p>
      </div>
      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-left space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">Booking ID</span>
          <span className="text-blue-400 font-mono text-xs">{bookingId.slice(-10).toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">Seats</span>
          <span className="text-white text-sm font-semibold">{seats.join(", ")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400 text-sm">Total Paid</span>
          <span className="text-emerald-400 font-bold">₹{totalPrice.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => router.push(`/ticket/${bookingId}`)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/40"
        >
          🎟️ View E-Ticket
        </button>
        <button
          onClick={() => router.push("/bookings")}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl transition-all"
        >
          My Bookings
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main page
───────────────────────────────────────────── */
function CheckoutPageInner() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const showId = Array.isArray(params.showId) ? params.showId[0] : params.showId ?? "";
  const seatsParam = searchParams.get("seats") || "";
  const seats = seatsParam ? seatsParam.split(",") : [];

  const [show, setShow] = useState<any>(null);
  const [foodMenu, setFoodMenu] = useState<FoodItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [utr, setUtr] = useState("");

  const seatTotal = show ? seats.length * show.price : 0;
  const foodTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const finalTotal = seatTotal + foodTotal;

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    if (!showId || seats.length === 0) { router.push("/shows"); return; }

    const fetchData = async () => {
      try {
        const [showRes, foodRes] = await Promise.all([
          axios.get(`${API_URL}/api/shows/${showId}`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_URL}/api/food`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        setShow(showRes.data);
        setFoodMenu(foodRes.data || []);
      } catch (err: any) {
        setErrorText(err?.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showId]);

  const updateCart = (food: FoodItem, change: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.itemId === food._id);
      if (existing) {
        const newQty = existing.quantity + change;
        if (newQty <= 0) return prev.filter(item => item.itemId !== food._id);
        return prev.map(item => item.itemId === food._id ? { ...item, quantity: newQty } : item);
      } else if (change > 0) {
        return [...prev, { itemId: food._id, name: food.name, price: food.price, quantity: 1, emoji: food.image }];
      }
      return prev;
    });
  };

  const getFoodPayload = () => cart.map(c => ({ itemId: c.itemId, name: c.name, quantity: c.quantity, price: c.price }));

  const handlePayment = async () => {
    const res = await loadRazorpay();
    if (!res) { alert("Razorpay SDK failed to load."); return; }
    if (!show) return;

    setProcessing(true);
    const token = sessionStorage.getItem("token");
    const user = JSON.parse(sessionStorage.getItem("user") || "{}");

    try {
      // 1. Generate Razorpay order ID immediately before checkout
      const amount = finalTotal * 100;
      const orderRes = await axios.post(
        `${API_URL}/api/payments/create-order`,
        { amount, currency: "INR" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const razorOrderId = orderRes.data.orderId;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency: "INR",
        name: "Cinema Tickets & Food",
        description: `Booking for ${show.movie?.title}`,
        order_id: razorOrderId,
        handler: async function (response: any) {
          try {
            const verifyRes = await axios.post(
              `${API_URL}/api/payments/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                showId,
                seats,
                foodItems: getFoodPayload()
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (verifyRes.data.booking) {
              setSuccessBookingId(verifyRes.data.booking._id);
            }
          } catch (err: any) {
            alert(err?.response?.data?.message || "Payment verification failed.");
            setProcessing(false);
          }
        },
        prefill: { name: user?.name, email: user?.email, contact: user?.phone },
        theme: { color: "#3b82f6" },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', () => { setProcessing(false); });
      paymentObject.open();

    } catch (err: any) {
      alert("Failed to initialize payment gateway.");
      setProcessing(false);
    }
  };

  const handleUpiSubmit = async () => {
    if (!utr) { alert("Please enter the UTR/Transaction ID"); return; }
    setProcessing(true);
    try {
      const confirmRes = await axios.post(
        `${API_URL}/api/shows/${showId}/confirm`,
        { seats, foodItems: getFoodPayload() },
        { headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` } }
      );
      if (confirmRes.data.booking) setSuccessBookingId(confirmRes.data.booking._id);
    } catch (err: any) {
      alert(err.response?.data?.message || "Booking verification failed.");
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col pb-20">
      <header className="border-b border-white/5 py-4 flex items-center justify-center bg-[#0d0d14] sticky top-0 z-50 shadow-md">
        <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
          SECURE CHECKOUT
        </h1>
      </header>

      <div className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Side: Order & Snacks */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {!successBookingId && (
            <div className="bg-gradient-to-br from-white/[0.05] to-transparent border border-white/10 rounded-3xl p-6 shadow-xl">
              <h2 className="text-xl font-bold mb-1">🍿 Grab a Snack!</h2>
              <p className="text-sm text-gray-400 mb-6">Your selected food will be delivered directly to your seats.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {foodMenu.map(food => {
                  const qty = cart.find(c => c.itemId === food._id)?.quantity || 0;
                  return (
                    <div key={food._id} className="bg-black/40 border border-white/5 rounded-2xl p-4 flex gap-4 items-center transition hover:bg-white/[0.02]">
                      <div className="text-4xl">{food.image}</div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-zinc-100">{food.name}</h3>
                        <p className="font-bold text-amber-400 text-sm tracking-wide">₹{food.price}</p>
                      </div>
                      {qty === 0 ? (
                        <button onClick={() => updateCart(food, 1)} className="px-4 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-500 border border-amber-500/30 rounded-full text-sm font-bold shadow-inner">
                          ADD
                        </button>
                      ) : (
                        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-2 py-1">
                          <button onClick={() => updateCart(food, -1)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-red-500 hover:text-white flex items-center justify-center transition font-bold leading-none select-none text-xl">−</button>
                          <span className="font-mono font-bold">{qty}</span>
                          <button onClick={() => updateCart(food, 1)} className="w-7 h-7 rounded-full bg-white/10 hover:bg-emerald-500 flex items-center justify-center transition font-bold leading-none select-none text-lg">+</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Payment Gateway */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-24 bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            {successBookingId ? (
              <SuccessScreen bookingId={successBookingId} seats={seats} totalPrice={finalTotal} />
            ) : loading ? (
              <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 border-t-blue-500 border-white/10 animate-spin" /></div>
            ) : errorText ? (
              <div className="text-red-400 p-4 bg-red-900/20 rounded-xl">{errorText}</div>
            ) : (
              <div className="space-y-6">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-4">Order Summary</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="text-sm">
                        <p className="font-bold text-gray-200">{show?.movie?.title}</p>
                        <p className="text-gray-500 text-xs mt-0.5">{seats.join(", ")} ({seats.length} Seats)</p>
                      </div>
                      <span className="text-gray-300 font-mono">₹{seatTotal}</span>
                    </div>

                    <AnimatePresence>
                      {cart.length > 0 && cart.map(item => (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} key={item.itemId} className="flex justify-between items-start pt-2">
                          <p className="text-sm text-gray-400">{item.emoji} {item.name} <span className="text-xs">x{item.quantity}</span></p>
                          <span className="text-gray-300 font-mono text-sm">₹{item.price * item.quantity}</span>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex justify-between items-end">
                  <div className="text-gray-400 text-sm font-semibold">Total Payable</div>
                  <div className="text-3xl font-black text-white">₹{finalTotal}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 bg-black/50 border border-white/5 rounded-2xl">
                  <button onClick={() => setPaymentMethod("card")} className={`py-2 px-2 text-xs font-bold rounded-xl transition ${paymentMethod === 'card' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}>💳 Cards / Net</button>
                  <button onClick={() => setPaymentMethod("upi")} className={`py-2 px-2 text-xs font-bold rounded-xl transition ${paymentMethod === 'upi' ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'text-gray-400 hover:text-white'}`}>📱 UPI Apps</button>
                </div>

                {paymentMethod === 'upi' ? (
                  <div className="bg-white p-4 rounded-3xl flex flex-col items-center">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=prajapatikanchan765@okhdfcbank&pn=Ritesh prajapati&am=${finalTotal}&cu=INR&tn=Cinemas`)}`} alt="UPI QR" className="w-32 h-32" />
                    <input type="text" placeholder="Enter 12-digit UTR No." value={utr} onChange={e => setUtr(e.target.value)} className="mt-4 w-full bg-zinc-100 border border-zinc-200 text-black text-center text-sm font-mono p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" maxLength={12} />
                  </div>
                ) : null}

                <button
                  onClick={paymentMethod === 'card' ? handlePayment : handleUpiSubmit}
                  disabled={processing || (paymentMethod === 'upi' && !utr)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-zinc-950 font-black text-lg py-4 rounded-xl disabled:opacity-50 disabled:grayscale transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] shadow-emerald-500/20"
                >
                  {processing ? "PROCESSING..." : `PAY ₹${finalTotal}`}
                </button>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutPageInner />
    </Suspense>
  );
}
