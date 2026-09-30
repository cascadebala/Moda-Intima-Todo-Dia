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
  const getFullLocation = () => {
    return (window.location.pathname + window.location.search) || '/';
  };

  const [currentPath, setCurrentPath] = useState<string>(() => getFullLocation());

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getFullLocation());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
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
          key={`cat-${slug}`}
          initialCategory={slug}
          pageTitle={`Linha ${categoryTitle}`}
          navigate={navigate}
        />
      );
    }

    // Ofertas
    if (currentPath.startsWith('/ofertas')) {
      return (
        <CatalogView
          key="ofertas"
          isSaleOnly={true}
          pageTitle="Ofertas Especiais"
          pageSubtitle="Peças exclusivas com descontos especiais de até 35% OFF."
          navigate={navigate}
        />
      );
    }

    // Novidades
    if (currentPath.startsWith('/novidades')) {
      return (
        <CatalogView
          key="novidades"
          isNewOnly={true}
          pageTitle="Lançamentos & Novidades"
          pageSubtitle="As mais recentes criações da Moda Intima Todo Dia."
          navigate={navigate}
        />
      );
    }

    // Search query or general products
    if (currentPath.startsWith('/produtos')) {
      const searchIndex = currentPath.indexOf('?');
      const queryParams = searchIndex !== -1
        ? new URLSearchParams(currentPath.slice(searchIndex))
        : new URLSearchParams(window.location.search);
      const search = queryParams.get('search') || undefined;
      return (
        <CatalogView
          key={`produtos-${search || 'all'}`}
          initialSearch={search}
          navigate={navigate}
        />
      );
    }

    // Checkout
    if (currentPath.startsWith('/checkout')) {
      return <CheckoutView navigate={navigate} />;
    }

    // Account & Login
    if (
      currentPath.startsWith('/minha-conta') ||
      currentPath.startsWith('/login') ||
      currentPath.startsWith('/cadastro')
    ) {
      return <AccountView navigate={navigate} />;
    }

    // Wishlist
    if (currentPath.startsWith('/favoritos')) {
      return <WishlistView navigate={navigate} />;
    }

    // Institutional Pages
    if (currentPath.startsWith('/sobre-nos')) {
      return <AboutView navigate={navigate} />;
    }
    if (currentPath.startsWith('/contato')) {
      return <ContactView navigate={navigate} />;
    }
    if (currentPath.startsWith('/trocas-e-devolucoes')) {
      return <ExchangesPolicyView navigate={navigate} />;
    }
    if (currentPath.startsWith('/politica-de-entrega')) {
      return <ShippingPolicyView navigate={navigate} />;
    }
    if (
      currentPath.startsWith('/politica-de-privacidade') ||
      currentPath.startsWith('/termos-de-uso')
    ) {
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
