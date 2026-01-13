import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, Company } from '@/types/database';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  companyId: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, companyName: string) => Promise<boolean>;
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock companies (en production, viendrait de l'API)
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Entreprise SA',
    address: 'Tunis, Tunisie',
    phone: '+216 12 345 678',
    email: 'contact@entreprise.tn',
    tax_number: '12345678',
    currency: 'TND',
    language: 'fr',
  },
];

// Mock users (en production, viendrait de l'API)
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin',
    email: 'admin@entreprise.tn',
    role: 'admin',
    company_id: '1',
  },
  {
    id: '2',
    name: 'Utilisateur Test',
    email: 'user@test.com',
    role: 'user',
    company_id: '1',
  },
];

const STORAGE_KEY_USER = 'bilvoxa_erp_user';
const STORAGE_KEY_COMPANY = 'bilvoxa_erp_company';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const loadAuth = () => {
      try {
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        const storedCompany = localStorage.getItem(STORAGE_KEY_COMPANY);
        
        if (storedUser && storedCompany) {
          const userData = JSON.parse(storedUser);
          const companyData = JSON.parse(storedCompany);
          setUser(userData);
          setCompany(companyData);
        }
      } catch (error) {
        console.error('Error loading auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simuler une authentification (en production, appel API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Vérifier si l'email existe dans les utilisateurs mock
      let foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      // Si l'utilisateur n'existe pas, vérifier dans localStorage (utilisateurs créés via register)
      if (!foundUser) {
        try {
          const storedUser = localStorage.getItem(STORAGE_KEY_USER);
          if (storedUser) {
            const storedUserData = JSON.parse(storedUser);
            if (storedUserData.email.toLowerCase() === email.toLowerCase()) {
              foundUser = storedUserData;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      if (!foundUser) {
        setIsLoading(false);
        return false;
      }

      // En production, vérifier le mot de passe avec le hash
      // Pour la démo, on accepte n'importe quel mot de passe (mais il doit être non vide)
      if (!password || password.trim().length === 0) {
        setIsLoading(false);
        return false;
      }

      // Trouver ou créer la company
      let foundCompany = mockCompanies.find(c => c.id === foundUser.company_id);
      
      // Si la company n'est pas trouvée, chercher dans localStorage
      if (!foundCompany) {
        try {
          const storedCompany = localStorage.getItem(STORAGE_KEY_COMPANY);
          if (storedCompany) {
            const storedCompanyData = JSON.parse(storedCompany);
            if (storedCompanyData.id === foundUser.company_id) {
              foundCompany = storedCompanyData;
            }
          }
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Si toujours pas de company, créer une company par défaut
      if (!foundCompany) {
        foundCompany = {
          id: foundUser.company_id || '1',
          name: 'Mon Entreprise',
          address: '',
          phone: '',
          email: foundUser.email,
          tax_number: '',
          currency: 'TND',
          language: 'fr',
        };
      }
      
      setUser(foundUser);
      setCompany(foundCompany);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(foundUser));
      localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(foundCompany));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    companyName: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Simuler une inscription (en production, appel API)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Vérifier si l'email existe déjà
      if (mockUsers.some(u => u.email === email)) {
        setIsLoading(false);
        return false;
      }

      // Créer nouvelle entreprise
      const newCompany: Company = {
        id: `company_${Date.now()}`,
        name: companyName,
        address: '',
        phone: '',
        email: email,
        tax_number: '',
        currency: 'TND',
        language: 'fr',
      };

      // Créer nouvel utilisateur
      const newUser: User = {
        id: `user_${Date.now()}`,
        name: name,
        email: email,
        role: 'admin', // Premier utilisateur = admin
        company_id: newCompany.id,
      };

      setUser(newUser);
      setCompany(newCompany);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
      localStorage.setItem(STORAGE_KEY_COMPANY, JSON.stringify(newCompany));
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Register error:', error);
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCompany(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_COMPANY);
    // Nettoyer aussi les données des hooks
    localStorage.removeItem('bilvoxa_erp_hr_employees');
    localStorage.removeItem('bilvoxa_erp_hr_contracts');
    localStorage.removeItem('bilvoxa_erp_hr_payrolls');
    localStorage.removeItem('bilvoxa_erp_accounting_entries');
    // ... autres données
  };

  const value: AuthContextType = {
    user,
    company,
    companyId: company?.id || null,
    login,
    logout,
    register,
    isLoading,
    isAuthenticated: !!user && !!company,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
