"use client"

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { initiateIrionment } from "@/app/actions/payment";
import { CreditCard, ShieldCheck, Zap, Loader2, User, Mail, MapPin, ArrowLeft, Wallet, CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useWallet } from "@txnlab/use-wallet-react";
import { toast } from "react-toastify";
import { useQuery } from "@tanstack/react-query";

interface PaymentResult {
    type: "Irion_PAYMENT_RESULT";
    success: boolean;
    loanId?: number;
    amount?: number;
    paymentMode: "bnpl" | "split3";
    txHash?: string;
    error?: string;
}

export default function CheckoutPage() {
    const { total, items, clearCart } = useCart();
    const router = useRouter();
    const { activeAccount } = useWallet();
    const user = activeAccount ? { wallet: { address: activeAccount.address }, email: { address: '' } } : null;
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "Avery Sterling",
        email: "avery@syndicate.net",
        address: "7th Sector Node, Neo-Tokyo 2045"
    });
    const [orderStatus, setOrderStatus] = useState<null | "success" | "error">(null);
    const [paymentDetails, setPaymentDetails] = useState<PaymentResult | null>(null);

    const { data: userProfile, isLoading: isProfileLoading } = useQuery({
        queryKey: ['userProfile', activeAccount?.address],
        queryFn: async () => {
            if (!activeAccount?.address) return null;
            console.log('[CHECKOUT-DEBUG] Fetching user profile for:', activeAccount.address);
            const res = await fetch(`http://localhost:3000/api/user/${activeAccount.address}?t=${Date.now()}`);
            console.log('[CHECKOUT-DEBUG] Profile response status:', res.status);
            if (!res.ok) throw new Error('Failed to fetch profile');
            const data = await res.json();
            console.log('[CHECKOUT-DEBUG] Profile data:', data);
            return data;
        },
        enabled: !!activeAccount?.address,
        staleTime: 0,
        refetchOnMount: 'always'
    });

    const creditLimit = userProfile?.borrow_limit ?? 0;
    console.log('[CHECKOUT-DEBUG] Credit limit:', creditLimit, 'Profile:', userProfile);
    const hasSufficientCredit = creditLimit >= total;

    useEffect(() => {
        const handler = (event: MessageEvent) => {
            const data = event.data;
            if (data?.type !== "Irion_PAYMENT_RESULT") return;
            console.log("[IRION-DEBUG] Checkout Received Payment Message:", data)

            const result = data as PaymentResult;
            setPaymentDetails(result);

            if (result.success) {
                console.log("[IRION-DEBUG] Payment Success handled in Checkout")
                setOrderStatus("success");
                clearCart();
                toast.success(
                    `Payment confirmed via ${result.paymentMode === "bnpl" ? "BNPL" : "Split-in-3"}!`,
                    { theme: "dark" }
                );
            } else {
                console.error("[IRION-DEBUG] Payment Failure handled in Checkout:", result.error)
                setOrderStatus("error");
                toast.error(
                    result.error || "Payment failed. Please try again.",
                    { theme: "dark" }
                );
            }
        };

        window.addEventListener("message", handler);
        return () => window.removeEventListener("message", handler);
    }, [clearCart]);

    const handleIrion = async () => {
        if (!activeAccount?.address) {
            console.log("[IRION-DEBUG] Checkout: No wallet connected")
            toast.error("Please connect your wallet first", { theme: "dark" });
            return;
        }

        console.log("[IRION-DEBUG] Checkout: Initiating Irion Payment", { total, itemsCount: items.length })
        
        if (total <= 0 || items.length === 0) {
            console.log("[IRION-DEBUG] Checkout: Empty cart attempt")
            toast.error("Your inventory is empty!", { theme: "dark" });
            return;
        }

        if (!hasSufficientCredit) {
            console.log("[IRION-DEBUG] Checkout: Insufficient Credit", { creditLimit, total })
            toast.error(`Insufficient credit! Limit: $${creditLimit.toFixed(2)}, Cart: $${total.toFixed(2)}`, { theme: "dark" });
            return;
        }

        setLoading(true);
        const result = await initiateIrionment(total, `Order for ${items.length} Modules`);
        console.log("[IRION-DEBUG] initiateIrionment Result:", result)

        if (result.error) {
            console.error("[IRION-DEBUG] Checkout Initiation Error:", result.error)
            alert(`Error: ${result.error}`);
            setLoading(false);
        } else if (result.checkoutUrl) {
            console.log("[IRION-DEBUG] Opening Checkout Hub Popup:", result.checkoutUrl)
            // Open the Irion Checkout Hub in a new popup window
            const width = 500;
            const height = 700;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;

            window.open(
                result.checkoutUrl,
                "Irion_Secure_Settlement",
                `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no`
            );

            setLoading(false);
        }
    };


    return (
        <>
            {orderStatus === "success" && paymentDetails && (
                <div className="mb-12 p-8 rounded-xl border-2 border-green-500/30 bg-green-500/5">
                    <div className="flex items-center gap-4 mb-6">
                        <CheckCircle className="w-8 h-8 text-green-500" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-green-400">Settlement_Confirmed</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Payment_Mode</span>
                            <span className="text-sm font-black uppercase">{paymentDetails.paymentMode === "bnpl" ? "BNPL" : "Split-in-3"}</span>
                        </div>
                        {paymentDetails.amount != null && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Amount</span>
                                <span className="text-sm font-black">${paymentDetails.amount.toFixed(2)}</span>
                            </div>
                        )}
                        {paymentDetails.loanId != null && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Loan_ID</span>
                                <span className="text-sm font-black font-mono">#{paymentDetails.loanId}</span>
                            </div>
                        )}
                        {paymentDetails.txHash && (
                            <div className="flex flex-col gap-1">
                                <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Tx_Hash</span>
                                <span className="text-sm font-black font-mono truncate">{paymentDetails.txHash}</span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => router.push("/")}
                        className="mt-6 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-green-500/30 transition-all"
                    >
                        Continue_Shopping
                    </button>
                </div>
            )}

            {orderStatus === "error" && (
                <div className="mb-12 p-8 rounded-xl border-2 border-red-500/30 bg-red-500/5">
                    <div className="flex items-center gap-4 mb-4">
                        <XCircle className="w-8 h-8 text-red-500" />
                        <h2 className="text-2xl font-black uppercase tracking-tighter text-red-400">Settlement_Failed</h2>
                    </div>
                    <p className="text-sm text-white/60 mb-4">
                        {paymentDetails?.error || "An unexpected error occurred during payment processing."}
                    </p>
                    <button
                        onClick={() => { setOrderStatus(null); setPaymentDetails(null); }}
                        className="bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-500/30 transition-all"
                    >
                        Try_Again
                    </button>
                </div>
            )}

            <button onClick={() => router.back()} className="flex items-center gap-2 text-white/40 hover:text-white mb-12 transition-all uppercase text-[10px] font-bold tracking-widest group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> Return_To_Inventory
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                {/* Settlement Info */}
                <div className="flex flex-col gap-10">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-4">Finalize_Settlement</h1>
                        <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold">Verify your deployment details and select a protocol.</p>
                    </div>

                    <div className="flex flex-col gap-6">
                        <div className="flex flex-col gap-4">
                            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest italic">Recipient_Data</label>
                            <div className="grid grid-cols-1 gap-3">
                                <div className="bg-white/5 border border-white/10 p-3 rounded flex items-center gap-3">
                                    <User className="w-4 h-4 text-white/20" />
                                    <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-transparent border-none outline-none text-xs font-bold w-full" />
                                </div>
                                <div className="bg-white/5 border border-white/10 p-3 rounded flex items-center gap-3">
                                    <Mail className="w-4 h-4 text-white/20" />
                                    <input value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-transparent border-none outline-none text-xs font-bold w-full" />
                                </div>
                                <div className="bg-white/5 border border-white/10 p-3 rounded flex items-center gap-3">
                                    <MapPin className="w-4 h-4 text-white/20" />
                                    <input value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="bg-transparent border-none outline-none text-xs font-bold w-full" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 mt-4">
                            <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest italic">Protocol_Selection</label>

                            <button
                                onClick={handleIrion}
                                disabled={loading || total <= 0 || items.length === 0}
                                className="group relative overflow-hidden bg-primary p-6 rounded-lg border-2 border-white/10 hover:border-white/40 transition-all flex flex-col gap-4 text-left disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-black rounded flex items-center justify-center">
                                            <Zap className="w-4 h-4 text-white" />
                                        </div>
                                        <span className="font-black text-sm text-white uppercase tracking-tighter">
                                            Pay_Via_Irion
                                        </span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                      <span className="bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black px-2 py-0.5 rounded uppercase">0%_APR</span>
                                      {activeAccount && (
                                        <span className={`text-[9px] mt-1 font-bold ${hasSufficientCredit ? "text-green-400" : "text-red-400"}`}>
                                           Limit: ${creditLimit.toFixed(2)}
                                        </span>
                                      )}
                                    </div>
                                </div>
                                <p className="text-[11px] text-white/60 leading-relaxed font-medium">
                                    Buy now, pay later with your Irion Credit Limit. Zero-collateral, sub-second settlement on LocalNet.
                                </p>
                                {loading && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                                        <Loader2 className="w-6 h-6 animate-spin text-white" />
                                    </div>
                                )}
                            </button>

                            <div className="p-4 rounded border border-white/5 opacity-50 cursor-not-allowed">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase text-white/40">Standard Credit Card</span>
                                    <span className="text-[10px] font-black text-white/20">UNAVAILABLE</span>
                                </div>
                                <div className="h-1 bg-white/5 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="flex flex-col gap-8 bg-white/[0.02] border border-white/10 p-8 rounded-xl h-fit sticky top-12">
                    <h3 className="text-xl font-bold uppercase tracking-tighter">Inventory_Summary</h3>
                    <div className="divide-y divide-white/10">
                        {items.map(item => (
                            <div key={item.id} className="py-4 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-xs font-bold uppercase">{item.name}</span>
                                    <span className="text-[10px] text-white/40 uppercase">x{item.quantity} units</span>
                                </div>
                                <span className="text-sm font-black">${(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col gap-4 pt-6 border-t border-white/20">
                        <div className="flex justify-between items-center text-white/40 text-[10px] font-bold uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span>${total.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-white/40 text-[10px] font-bold uppercase tracking-widest">
                            <span>Protocol Fee</span>
                            <span className="text-green-500">Free</span>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-white/10 mt-2">
                            <span className="text-lg font-black uppercase italic">Total Settlement</span>
                            <span className="text-2xl font-black">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-4 bg-white/5 rounded border border-white/10">
                        <ShieldCheck className="w-5 h-5 text-green-500" />
                        <span className="text-[10px] font-bold text-white/60 leading-tight uppercase tracking-wider">
                            Secured by LocalNet Native Verification & Irion Escrow Protocol
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
}
