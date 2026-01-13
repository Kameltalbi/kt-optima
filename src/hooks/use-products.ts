import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import type { Product, Service, ProductCategory } from '@/types/database';

const STORAGE_PREFIX = 'bilvoxa_erp_products_';

// Mock data
const mockProducts: Product[] = [
  {
    id: 'prod_1',
    code: 'PROD-001',
    name: 'Ordinateur portable',
    category_id: 'cat_prod_1',
    purchase_price: 1200,
    sale_price: 1800,
    tax_rate: 19,
    unit: 'pièce',
    stockable: true,
    active: true,
    description: 'Ordinateur portable professionnel',
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'prod_2',
    code: 'PROD-002',
    name: 'Souris sans fil',
    category_id: 'cat_prod_2',
    purchase_price: 15,
    sale_price: 25,
    tax_rate: 19,
    unit: 'pièce',
    stockable: true,
    active: true,
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockServices: Service[] = [
  {
    id: 'serv_1',
    code: 'SERV-001',
    name: 'Formation ERP',
    category_id: 'cat_serv_1',
    price: 5000,
    tax_rate: 19,
    billing_type: 'fixed',
    active: true,
    description: 'Formation complète sur l\'utilisation de l\'ERP',
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'serv_2',
    code: 'SERV-002',
    name: 'Support technique',
    category_id: 'cat_serv_1',
    price: 150,
    tax_rate: 19,
    billing_type: 'duration',
    active: true,
    description: 'Support technique par heure',
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

const mockCategories: ProductCategory[] = [
  {
    id: 'cat_prod_1',
    name: 'Informatique',
    type: 'product',
    description: 'Produits informatiques',
    active: true,
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'cat_prod_2',
    name: 'Périphériques',
    type: 'product',
    active: true,
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'cat_serv_1',
    name: 'Formation & Support',
    type: 'service',
    description: 'Services de formation et support',
    active: true,
    company_id: '1',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
];

export function useProducts() {
  const { companyId } = useAuth();

  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}products`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((p: Product) => p.company_id === companyId) : data;
        } catch {
          return companyId ? mockProducts.filter(p => p.company_id === companyId) : mockProducts;
        }
      }
    }
    return companyId ? mockProducts.filter(p => p.company_id === companyId) : mockProducts;
  });

  const [services, setServices] = useState<Service[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}services`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((s: Service) => s.company_id === companyId) : data;
        } catch {
          return companyId ? mockServices.filter(s => s.company_id === companyId) : mockServices;
        }
      }
    }
    return companyId ? mockServices.filter(s => s.company_id === companyId) : mockServices;
  });

  const [categories, setCategories] = useState<ProductCategory[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}categories`);
      if (stored) {
        try {
          const data = JSON.parse(stored);
          return companyId ? data.filter((c: ProductCategory) => c.company_id === companyId) : data;
        } catch {
          return companyId ? mockCategories.filter(c => c.company_id === companyId) : mockCategories;
        }
      }
    }
    return companyId ? mockCategories.filter(c => c.company_id === companyId) : mockCategories;
  });

  // Re-load data when companyId changes
  useEffect(() => {
    if (!companyId) return;

    const loadAndFilter = <T extends { company_id: string }>(
      storageKey: string,
      mockData: T[],
      setter: (data: T[]) => void
    ) => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          try {
            const allData = JSON.parse(stored);
            const filtered = allData.filter((item: T) => item.company_id === companyId);
            setter(filtered);
            return;
          } catch {
            // Fall through to mock data
          }
        }
      }
      const filtered = mockData.filter(item => item.company_id === companyId);
      setter(filtered);
    };

    loadAndFilter(`${STORAGE_PREFIX}products`, mockProducts, setProducts);
    loadAndFilter(`${STORAGE_PREFIX}services`, mockServices, setServices);
    loadAndFilter(`${STORAGE_PREFIX}categories`, mockCategories, setCategories);
  }, [companyId]);

  // Save functions
  const saveProducts = useCallback((data: Product[]) => {
    const filtered = companyId ? data.filter(p => p.company_id === companyId) : data;
    setProducts(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}products`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((p: Product) => p.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}products`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveServices = useCallback((data: Service[]) => {
    const filtered = companyId ? data.filter(s => s.company_id === companyId) : data;
    setServices(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}services`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((s: Service) => s.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}services`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}services`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}services`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  const saveCategories = useCallback((data: ProductCategory[]) => {
    const filtered = companyId ? data.filter(c => c.company_id === companyId) : data;
    setCategories(filtered);
    if (typeof window !== 'undefined') {
      const existing = localStorage.getItem(`${STORAGE_PREFIX}categories`);
      if (existing) {
        try {
          const allData = JSON.parse(existing);
          const otherCompanies = allData.filter((c: ProductCategory) => c.company_id !== companyId);
          localStorage.setItem(`${STORAGE_PREFIX}categories`, JSON.stringify([...otherCompanies, ...filtered]));
        } catch {
          localStorage.setItem(`${STORAGE_PREFIX}categories`, JSON.stringify(filtered));
        }
      } else {
        localStorage.setItem(`${STORAGE_PREFIX}categories`, JSON.stringify(filtered));
      }
    }
  }, [companyId]);

  // Product methods
  const createProduct = useCallback((productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newProduct: Product = {
      ...productData,
      company_id: companyId,
      id: `prod_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveProducts([...products, newProduct]);
    return newProduct;
  }, [products, saveProducts, companyId]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    );
    saveProducts(updated);
    return updated.find(p => p.id === id);
  }, [products, saveProducts]);

  const deleteProduct = useCallback((id: string) => {
    const filtered = products.filter(p => p.id !== id);
    saveProducts(filtered);
  }, [products, saveProducts]);

  // Service methods
  const createService = useCallback((serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newService: Service = {
      ...serviceData,
      company_id: companyId,
      id: `serv_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveServices([...services, newService]);
    return newService;
  }, [services, saveServices, companyId]);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    const updated = services.map(s =>
      s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
    );
    saveServices(updated);
    return updated.find(s => s.id === id);
  }, [services, saveServices]);

  const deleteService = useCallback((id: string) => {
    const filtered = services.filter(s => s.id !== id);
    saveServices(filtered);
  }, [services, saveServices]);

  // Category methods
  const createCategory = useCallback((categoryData: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }
    const newCategory: ProductCategory = {
      ...categoryData,
      company_id: companyId,
      id: `cat_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    saveCategories([...categories, newCategory]);
    return newCategory;
  }, [categories, saveCategories, companyId]);

  const updateCategory = useCallback((id: string, updates: Partial<ProductCategory>) => {
    const updated = categories.map(c =>
      c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
    );
    saveCategories(updated);
    return updated.find(c => c.id === id);
  }, [categories, saveCategories]);

  const deleteCategory = useCallback((id: string) => {
    const filtered = categories.filter(c => c.id !== id);
    saveCategories(filtered);
  }, [categories, saveCategories]);

  // Helper methods
  const getProductsByCategory = useCallback((categoryId: string): Product[] => {
    return products.filter(p => p.category_id === categoryId && p.active);
  }, [products]);

  const getServicesByCategory = useCallback((categoryId: string): Service[] => {
    return services.filter(s => s.category_id === categoryId && s.active);
  }, [services]);

  const getProductCategories = useCallback((): ProductCategory[] => {
    return categories.filter(c => c.type === 'product' && c.active);
  }, [categories]);

  const getServiceCategories = useCallback((): ProductCategory[] => {
    return categories.filter(c => c.type === 'service' && c.active);
  }, [categories]);

  const getStockableProducts = useCallback((): Product[] => {
    return products.filter(p => p.stockable && p.active);
  }, [products]);

  return {
    products,
    services,
    categories,
    createProduct,
    updateProduct,
    deleteProduct,
    createService,
    updateService,
    deleteService,
    createCategory,
    updateCategory,
    deleteCategory,
    getProductsByCategory,
    getServicesByCategory,
    getProductCategories,
    getServiceCategories,
    getStockableProducts,
  };
}
