"use client"

import { PRODUCTS } from "@/lib/products";
import { useCart } from "@/lib/cart-context";
import { Box } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { addToCart } = useCart();

  return (
    <>

      <div className="mb-12">
        <h2 className="text-4xl font-black uppercase tracking-tighter mb-2">Available_Modules</h2>
        <p className="text-white/40 text-sm uppercase tracking-widest">Equipping the next generation of validators.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PRODUCTS.map(product => (
          <div key={product.id} className="group flex flex-col bg-white/[0.02] border border-white/10 rounded-lg overflow-hidden hover:border-white/30 transition-all">
            <div className="aspect-[4/3] relative overflow-hidden">
              <img
                src={product.image}
                className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                alt={product.name}
              />
              <div className="absolute top-4 left-4">
                <span className="bg-black/80 backdrop-blur-sm border border-white/10 text-[10px] font-bold px-2 py-1 uppercase rounded-sm">
                  {product.category}
                </span>
              </div>
            </div>

            <div className="p-6 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <Link href={`/product/${product.id}`} className="text-lg font-bold hover:underline decoration-white/20">
                  {product.name}
                </Link>
                <span className="text-lg font-black">${product.price}</span>
              </div>

              <p className="text-xs text-white/40 leading-relaxed truncate">
                {product.description}
              </p>

              <button
                onClick={() => addToCart(product)}
                className="w-full bg-white text-black py-3 rounded text-[10px] font-bold uppercase tracking-widest hover:bg-[#eaeaea] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                Add_To_Inventory
              </button>
            </div>
          </div>
        ))}
      </div>

      <footer className="mt-24 pt-12 border-t border-white/10 opacity-20 text-[10px] uppercase font-bold tracking-widest text-center">
        Syndicate Hardware © 2026 // Integrated with Irion Protocol
      </footer>
    </>
  );
}
