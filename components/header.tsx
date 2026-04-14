"use client"

import Link from "next/link"
import { ShoppingCart, Box, Wallet } from "lucide-react"
import { useCart } from "@/lib/cart-context"
import { useWallet } from "@txnlab/use-wallet-react"
import { WalletButton } from "@txnlab/use-wallet-ui-react"

export function Header() {
  const { items } = useCart()
  const { activeAccount, providers } = useWallet()
  const authenticated = !!activeAccount

  const logout = () => {
    providers?.forEach((p) => p.disconnect())
  }

  return (
    <header className="flex justify-between items-center mb-16 border-b border-white/10 pb-8">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white flex items-center justify-center rounded-sm">
            <Box className="w-5 h-5 text-black" />
          </div>
          <h1 className="text-xl font-bold uppercase tracking-tighter">Syndicate_Equip</h1>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        {!authenticated ? (
          <div className="wui-custom-trigger">
            <WalletButton />
          </div>
        ) : (
          <button
            onClick={logout}
            className="group flex flex-col items-end text-right"
          >
            <span className="text-[10px] font-black uppercase tracking-tighter group-hover:text-red-500 transition-colors">
              {activeAccount?.address.slice(0, 6)}...{activeAccount?.address.slice(-4)}
            </span>
            <span className="text-[8px] text-white/20 uppercase font-bold tracking-widest">Active_Session</span>
          </button>
        )}

        <Link href="/cart" className="relative p-2 hover:bg-white/5 rounded transition-all">
          <ShoppingCart className="w-5 h-5" />
          {items.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-white text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full">
              {items.length}
            </span>
          )}
        </Link>
      </div>
    </header>
  )
}
