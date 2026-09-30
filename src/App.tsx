import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { WishlistProvider } from './context/WishlistContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';

import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';
import { CartDrawer } from './components/CartDrawer.tsx';
import { FloatingWhatsApp } from './components/FloatingWhatsApp.tsx';

import { HomeView } from './views/HomeView.tsx';
import { CatalogView } from './views/CatalogView.tsx';
import { ProductDetailView } from './views/ProductDetailView.tsx';
import { CheckoutView } from './views/CheckoutView.tsx';
import { AccountView } from './views/AccountView.tsx';
import { WishlistView } from './views/WishlistView.tsx';
import {
  AboutView,
  ContactView,
  ExchangesPolicyView,
  ShippingPolicyView,
  PrivacyPolicyView
} from './views/InstitutionalViews.tsx';
import { AdminDashboard } from './views/admin/AdminDashboard.tsx';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Route resolution
  const renderCurrentView = () => {
    // Admin routes
    if (currentPath.startsWith('/admin')) {
      return <AdminDashboard navigate={navigate} />;
    }

    // Product Detail: /produto/:slug
    if (currentPath.startsWith('/produto/')) {
      const slug = currentPath.replace('/produto/', '').split('?')[0];
      return <ProductDetailView productSlug={slug} navigate={navigate} />;
    }

    // Category view: /categoria/:slug
    if (currentPath.startsWith('/categoria/')) {
      const slug = currentPath.replace('/categoria/', '').split('?')[0];
      const categoryTitle = slug.charAt(0).toUpperCase() + slug.slice(1);
      return (
        <CatalogView
          initialCategory={slug}
          pageTitle={`Linha ${categoryTitle}`}
          navigate={navigate}
        />
      );
    }

    // Ofertas
    if (currentPath === '/ofertas') {
      return (
        <CatalogView
          isSaleOnly={true}
          pageTitle="Ofertas Especiais"
          pageSubtitle="Peças exclusivas com descontos especiais de até 35% OFF."
          navigate={navigate}
        />
      );
    }

    // Novidades
    if (currentPath === '/novidades') {
      return (
        <CatalogView
          isNewOnly={true}
          pageTitle="Lançamentos & Novidades"
          pageSubtitle="As mais recentes criações da Moda Intima Todo Dia."
          navigate={navigate}
        />
      );
    }

    // Search query or general products
    if (currentPath.startsWith('/produtos')) {
      const urlParams = new URLSearchParams(window.location.search);
      const search = urlParams.get('search') || undefined;
      return (
        <CatalogView
          initialSearch={search}
          navigate={navigate}
        />
      );
    }

    // Checkout
    if (currentPath === '/checkout') {
      return <CheckoutView navigate={navigate} />;
    }

    // Account & Login
    if (currentPath === '/minha-conta' || currentPath === '/login' || currentPath === '/cadastro') {
      return <AccountView navigate={navigate} />;
    }

    // Wishlist
    if (currentPath === '/favoritos') {
      return <WishlistView navigate={navigate} />;
    }

    // Institutional Pages
    if (currentPath === '/sobre-nos') {
      return <AboutView navigate={navigate} />;
    }
    if (currentPath === '/contato') {
      return <ContactView navigate={navigate} />;
    }
    if (currentPath === '/trocas-e-devolucoes') {
      return <ExchangesPolicyView navigate={navigate} />;
    }
    if (currentPath === '/politica-de-entrega') {
      return <ShippingPolicyView navigate={navigate} />;
    }
    if (currentPath === '/politica-de-privacidade' || currentPath === '/termos-de-uso') {
      return <PrivacyPolicyView navigate={navigate} />;
    }

    // Fallback: Home
    return <HomeView navigate={navigate} />;
  };

  const isAdminRoute = currentPath.startsWith('/admin');

  return (
    <ToastProvider>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <div className="min-h-screen flex flex-col bg-[#FAF8F7] text-stone-900 selection:bg-[#E8C5C8] selection:text-[#5B1525]">
              {!isAdminRoute && (
                <Header currentPath={currentPath} navigate={navigate} />
              )}

              <main className="flex-1">
                {renderCurrentView()}
              </main>

              {!isAdminRoute && (
                <>
                  <Footer navigate={navigate} />
                  <CartDrawer navigate={navigate} />
                  <FloatingWhatsApp />
                </>
              )}
            </div>
          </CartProvider>
        </WishlistProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
