"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import axios from "axios";

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
   Success screen
───────────────────────────────────────────── */
function SuccessScreen({
  bookingId,
  seats,
  totalPrice,
}: {
  bookingId: string;
  seats: string[];
  totalPrice: number;
}) {
  const router = useRouter();
  return (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-2xl shadow-green-900/50 animate-bounce-once">
        <span className="text-5xl">✓</span>
      </div>
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
          <span className="text-gray-400 text-sm">Amount Paid</span>
          <span className="text-green-400 font-bold">₹{totalPrice.toLocaleString()}</span>
        </div>
      </div>
      <div className="flex gap-3">
        <button
          onClick={() => router.push("/bookings")}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold py-3 rounded-xl transition-all"
        >
          View My Bookings
        </button>
        <button
          onClick={() => router.push("/shows")}
          className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold py-3 rounded-xl transition-all"
        >
          Browse Shows
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
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [loadingIntent, setLoadingIntent] = useState(true);
  const [intentError, setIntentError] = useState("");
  const [successBookingId, setSuccessBookingId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "upi">("card");
  const [utr, setUtr] = useState("");
  const [upiStep, setUpiStep] = useState<"qr" | "success">("qr");

  const totalPrice = show ? seats.length * show.price : 0;

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    if (!showId || seats.length === 0) { router.push("/shows"); return; }

    const init = async () => {
      try {
        // Fetch show details
        const showRes = await axios.get(`${API_URL}/api/shows/${showId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setShow(showRes.data);

        // Attempt to create razorpay order
        const amount = seats.length * showRes.data.price * 100; // paise
        const orderRes = await axios.post(
          `${API_URL}/api/payments/create-order`,
          { amount, currency: "INR" },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setRazorpayOrderId(orderRes.data.orderId);
      } catch (err: any) {
        const msg = err?.response?.data?.message || err.message;
        setIntentError(msg);
        if (err.response?.status === 401) {
          localStorage.clear();
          router.push("/login");
        }
      } finally {
        setLoadingIntent(false);
      }
    };

    init();
  }, [showId]);

  const handlePayment = async () => {
    const res = await loadRazorpay();
    if (!res) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    if (!razorpayOrderId || !show) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Test Key ID
      amount: totalPrice * 100, // paise
      currency: "INR",
      name: "Cinema Tickets",
      description: `Payment for ${show.movie?.title}`,
      order_id: razorpayOrderId,
      handler: async function (response: any) {
        setProcessing(true);
        try {
          const token = localStorage.getItem("token");
          // Verify with backend
          const verifyRes = await axios.post(
            `${API_URL}/api/payments/verify-payment`,
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              showId,
              seats,
            },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (verifyRes.data.booking) {
            setSuccessBookingId(verifyRes.data.booking._id);
          }
        } catch (err: any) {
          console.error("Verification failed", err);
          alert(err?.response?.data?.message || "Payment verification failed. Please contact support.");
        } finally {
          setProcessing(false);
        }
      },
      prefill: {
        name: user?.name,
        email: user?.email,
        contact: user?.phone || "9999999999",
      },
      theme: {
        color: "#3b82f6", // tailwind blue-500
      },
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.on('payment.failed', function (response: any) {
        alert(`Payment Failed: ${response.error.description}`);
    });
    paymentObject.open();
  };

  const handleUpiSubmit = async () => {
    if (!utr) { alert("Please enter the UTR/Transaction ID"); return; }
    setProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const confirmRes = await axios.post(
        `${API_URL}/api/shows/${showId}/confirm`,
        { seats },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (confirmRes.data.booking) {
        setSuccessBookingId(confirmRes.data.booking._id);
        // Play success sound if any
      }
    } catch (err: any) {
      console.error("UPI confirmation failed", err);
      const msg = err.response?.data?.message || "Booking verification failed. Check your UTR and try again.";
      alert(msg);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-white/5 px-6 py-4 flex items-center gap-4 bg-[#0d0d14]">
        <button
          onClick={() => router.back()}
          className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
        >
          ← Back
        </button>
        <div className="h-4 w-px bg-white/10" />
        <h1 className="text-sm font-medium text-gray-300">Secure Checkout</h1>
        <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
          <span>🔒</span>
          <span>Secured by Razorpay</span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Title */}
          {!successBookingId && (
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 mb-4 shadow-xl shadow-blue-900/40">
                <span className="text-2xl">💳</span>
              </div>
              <h2 className="text-2xl font-bold text-white">Complete Payment</h2>
              <p className="text-gray-400 text-sm mt-1">
                {show ? `${show.movie?.title} · ${show.screen?.name}` : "Loading…"}
              </p>
            </div>
          )}

          {/* Card */}
          <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 rounded-3xl p-7 shadow-2xl backdrop-blur-sm">
            {successBookingId ? (
              <SuccessScreen
                bookingId={successBookingId}
                seats={seats}
                totalPrice={totalPrice}
              />
            ) : loadingIntent ? (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                <p className="text-gray-400 text-sm">Initialising secure payment…</p>
              </div>
            ) : intentError ? (
              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl px-4 py-4 text-sm">
                  <p className="font-semibold mb-1">Payment setup failed</p>
                  <p className="text-red-400/80">{intentError}</p>
                </div>
                <button
                  onClick={() => router.back()}
                  className="w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl transition"
                >
                  ← Go Back
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Method Toggle */}
                <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                  <button 
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'card' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:text-white'}`}
                  >
                    💳 Cards / NetBanking
                  </button>
                  <button 
                    onClick={() => setPaymentMethod("upi")}
                    className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-all ${paymentMethod === 'upi' ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-gray-400 hover:text-white'}`}
                  >
                    📱 UPI QR Code
                  </button>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                  <p className="text-xs text-gray-400 uppercase tracking-widest mb-3 font-semibold">
                    Order Summary
                  </p>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">🎬 {show?.movie?.title}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-400 text-sm">Seats</span>
                    <span className="text-blue-400 text-sm font-medium">
                      {seats.join(", ")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400 text-sm">
                      {seats.length} seat{seats.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-white font-bold text-lg">
                      ₹{totalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-px bg-white/10 mb-4" />
                  
                  {paymentMethod === 'upi' ? (
                    <div className="flex flex-col items-center py-6 bg-white/5 rounded-2xl border border-white/10 overflow-hidden relative">
                      {/* Subtle Glow behind QR */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="bg-white p-4 rounded-3xl shadow-2xl mb-6 relative z-10 transition-transform hover:scale-105 duration-300 ring-8 ring-blue-500/5 group">
                         <div className="w-40 h-40 flex items-center justify-center relative">
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`upi://pay?pa=prajapatikanchan765@okhdfcbank&pn=Ritesh prajapati&am=${totalPrice}&cu=INR&tn=Ticket for ${show?.movie?.title}`)}`} 
                              alt="Scan to Pay" 
                              className="w-full h-full rounded-xl"
                            />
                            {/* App Icon overlays for visual flair (purely UI) */}
                            <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-lg border border-gray-100 flex gap-0.5">
                               <div className="w-4 h-4 bg-blue-600 rounded-full" />
                               <div className="w-4 h-4 bg-orange-500 rounded-full" />
                            </div>
                         </div>
                      </div>

                      <div className="text-center mb-6 relative z-10">
                        <p className="text-[10px] text-blue-400 font-bold uppercase tracking-[0.2em] mb-1">Total Amount: ₹{totalPrice}</p>
                        <p className="text-[9px] text-zinc-500 font-medium uppercase tracking-widest px-6 opacity-70">Amount and payee details are pre-filled<br/>just scan and pay securely</p>
                      </div>

                      <div className="w-full px-5 relative z-10">
                        <div className="relative group">
                          <input 
                            type="text" 
                            placeholder="Enter 12-digit UTR No. (eg. 4321...)" 
                            value={utr}
                            onChange={(e) => setUtr(e.target.value)}
                            className="w-full bg-zinc-950/80 border-2 border-zinc-800 rounded-2xl px-4 py-4 text-sm text-center outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-mono tracking-[0.2em] font-bold text-white placeholder:text-zinc-600 placeholder:tracking-normal placeholder:font-sans"
                            maxLength={12}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                      <span>🔒</span>
                      <span>Encrypted payment processed safely by Razorpay</span>
                    </div>
                  )}
                </div>

                {paymentMethod === 'card' ? (
                  <button
                    onClick={handlePayment}
                    disabled={processing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-base shadow-lg shadow-blue-900/40"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying Payment…
                      </>
                    ) : (
                      <>
                        <span>🔒</span> Pay ₹{totalPrice.toLocaleString()} Securely
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={handleUpiSubmit}
                    disabled={processing || !utr}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-base shadow-lg shadow-emerald-900/40"
                  >
                    {processing ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Verifying UTR...
                      </>
                    ) : (
                      <>
                         Submit Transaction ID
                      </>
                    )}
                  </button>
                )}
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
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
      </div>
    }>
      <CheckoutPageInner />
    </Suspense>
  );
}
