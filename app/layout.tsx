import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FixIt - Post-Production & Media Enhancement",
  description: "Professional media repair, enhancement, and post-production solutions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="https://fast.wistia.com/assets/external/E-v1.js" async></script>
        {/* Razorpay checkout SDK */}
        <script src="https://checkout.razorpay.com/v1/checkout.js" async></script>
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
