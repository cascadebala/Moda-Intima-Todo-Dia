import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CustomerUser } from '../types/index.ts';
import { api } from '../services/api.ts';
import { useToast } from './ToastContext.tsx';

interface AuthContextType {
  customer: CustomerUser | null;
  isAdmin: boolean;
  adminUser: { name: string; email: string } | null;
  loginCustomer: (email: string, name?: string) => void;
  registerCustomer: (data: { name: string; email: string; phone: string; cpf: string }) => void;
  logoutCustomer: () => void;
  loginAdmin: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { showToast } = useToast();

  const [customer, setCustomer] = useState<CustomerUser | null>(() => {
    try {
      const saved = localStorage.getItem('mitd_customer');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem('mitd_is_admin') === 'true';
  });

  const [adminUser, setAdminUser] = useState<{ name: string; email: string } | null>(() => {
    try {
      const saved = localStorage.getItem('mitd_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const loginCustomer = (email: string, name = 'Cliente') => {
    const user: CustomerUser = {
      id: `cust-${Date.now()}`,
      name: name || email.split('@')[0],
      email,
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      addresses: [
        {
          id: 'addr-1',
          title: 'Principal',
          cep: '01310-100',
          street: 'Avenida Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          isDefault: true
        }
      ]
    };
    setCustomer(user);
    localStorage.setItem('mitd_customer', JSON.stringify(user));
    showToast(`Bem-vinda(o), ${user.name}!`);
  };

  const registerCustomer = (data: { name: string; email: string; phone: string; cpf: string }) => {
    const user: CustomerUser = {
      id: `cust-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      addresses: []
    };
    setCustomer(user);
    localStorage.setItem('mitd_customer', JSON.stringify(user));
    showToast(`Cadastro realizado com sucesso! Bem-vinda(o), ${user.name}.`);
  };

  const logoutCustomer = () => {
    setCustomer(null);
    localStorage.removeItem('mitd_customer');
    showToast('Você saiu da sua conta.', 'info');
  };

  const loginAdmin = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await api.adminLogin(email, pass);
      if (res.success) {
        setIsAdmin(true);
        setAdminUser(res.user);
        localStorage.setItem('mitd_is_admin', 'true');
        localStorage.setItem('mitd_admin_user', JSON.stringify(res.user));
        showToast('Painel administrativo autenticado com sucesso!');
        return true;
      }
      return false;
    } catch (e: any) {
      showToast(e.message || 'Erro na autenticação de administrador', 'error');
      return false;
    }
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminUser(null);
    localStorage.removeItem('mitd_is_admin');
    localStorage.removeItem('mitd_admin_user');
    showToast('Sessão administrativa encerrada.', 'info');
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        isAdmin,
        adminUser,
        loginCustomer,
        registerCustomer,
        logoutCustomer,
        loginAdmin,
        logoutAdmin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
