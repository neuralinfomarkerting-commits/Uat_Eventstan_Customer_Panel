import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import CartDrawer from "@/components/ui/CartDrawer";
import { CartProvider } from "@/lib/CartContext";
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "EventStan - Find Perfect Event Vendors",
  description: "Your one-stop marketplace for premium event services",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-9HD74LKG7J"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-9HD74LKG7J');
          `}
        </Script>
        {/* Tawk.to Live Chat */}
        <Script
          id="tawk-to"
          strategy="afterInteractive"
          src="https://embed.tawk.to/66544c16981b6c564774ffbf/1huskiei9"
        />
      </head>

      <body
        className="bg-white font-sans antialiased"
        suppressHydrationWarning={true}
      >
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
          </CartProvider>
        </AuthProvider>

        <Toaster position="top-right" />
      </body>
    </html>
  );
}