# 🛒 Irion Shopping App (Demo)

The **Irion Shopping App** is a demonstration e-commerce store built to showcase the Irion Buy Now Pay Later (BNPL) protocol. It simulates a customer-facing storefront where users can purchase products using liquidity across multiple chains.

## 🚀 Key Features
- **Product Catalog**: Sample items for testing the BNPL payment flow.
- **Irion Integration**: Seamless "Pay with Irion" button for decentralized settlements.
- **BNPL Checkout**: Interactive demo of how the system calculates collateral requirements and payment plans.
- **Customer Portal**: Mock dashboard for users to track their ongoing BNPL installments.

## 🛠️ Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Styling**: Tailwind CSS
- **Interactions**: Framer Motion
- **Payment Link**: Irion Checkout Extension (Redirect-based)

---

## 🚀 Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the demo store and test the BNPL flow.

---

## 🔒 Security
As a demo application, this project uses mock credentials. For production implementations, follow the instructions in the [Irion Merchant App](../Irion-merchant-app).

## 🚀 Irion BNPL System
User -> Shopify Store -> Irion Checkout -> `Irion-core` settles on Creditcoin/Sepolia via `Irion-protocol`.
