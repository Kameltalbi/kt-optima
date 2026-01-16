import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { Product, Service, ProductCategory } from '@/types/database';

// Hook pour gérer les produits et services depuis Supabase
export function useProducts() {
  const { companyId } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les produits et services depuis Supabase (table produits)
  const fetchProductsAndServices = useCallback(async () => {
    if (!companyId) {
      setProducts([]);
      setServices([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('produits')
        .select('*')
        .eq('company_id', companyId)
        .eq('actif', true)
        .order('nom', { ascending: true });

      if (error) throw error;

      // Séparer les produits et services
      const allItems = data || [];
      
      const productsList: Product[] = allItems
        .filter(item => item.type === 'produit')
        .map(item => ({
          id: item.id,
          code: item.code || '',
          name: item.nom,
          category_id: item.categorie || '',
          purchase_price: Number(item.prix_achat) || 0,
          sale_price: Number(item.prix_vente) || 0,
          tax_rate: Number(item.taux_tva) || 0,
          unit: item.unite || 'pièce',
          stockable: item.stockable || false,
          active: item.actif,
          description: item.description || '',
          company_id: item.company_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

      const servicesList: Service[] = allItems
        .filter(item => item.type === 'service')
        .map(item => ({
          id: item.id,
          code: item.code || '',
          name: item.nom,
          category_id: item.categorie || '',
          price: Number(item.prix_vente) || 0,
          tax_rate: Number(item.taux_tva) || 0,
          billing_type: 'fixed',
          active: item.actif,
          description: item.description || '',
          company_id: item.company_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

      setProducts(productsList);
      setServices(servicesList);
    } catch (err) {
      console.error('Error fetching products/services:', err);
      toast.error('Erreur lors du chargement des produits/services');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Charger les catégories depuis Supabase
  const fetchCategories = useCallback(async () => {
    if (!companyId) {
      setCategories([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('company_id', companyId)
        .order('name', { ascending: true });

      if (error) throw error;

      const categoriesList: ProductCategory[] = (data || []).map(cat => ({
        id: cat.id,
        name: cat.name,
        type: cat.type as 'product' | 'service',
        description: cat.description || '',
        active: cat.active ?? true,
        company_id: cat.company_id,
        createdAt: cat.created_at,
        updatedAt: cat.updated_at,
      }));

      setCategories(categoriesList);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, [companyId]);

  // Charger au montage
  useEffect(() => {
    fetchProductsAndServices();
    fetchCategories();
  }, [fetchProductsAndServices, fetchCategories]);

  // Product methods
  const createProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      toast.error('Aucune entreprise sélectionnée');
      throw new Error('Company ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('produits')
        .insert({
          company_id: companyId,
          code: productData.code,
          nom: productData.name,
          description: productData.description,
          type: 'produit',
          stockable: productData.stockable,
          unite: productData.unit,
          prix_achat: productData.purchase_price,
          prix_vente: productData.sale_price,
          taux_tva: productData.tax_rate,
          categorie: productData.category_id,
          actif: productData.active ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Produit créé avec succès');
      await fetchProductsAndServices();
      return data;
    } catch (err: any) {
      if (err?.code === '23505') {
        toast.error('Un produit avec ce code existe déjà');
      } else {
        toast.error('Erreur lors de la création du produit');
      }
      throw err;
    }
  }, [companyId, fetchProductsAndServices]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    try {
      const updateData: any = {};
      if (updates.code !== undefined) updateData.code = updates.code;
      if (updates.name !== undefined) updateData.nom = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.stockable !== undefined) updateData.stockable = updates.stockable;
      if (updates.unit !== undefined) updateData.unite = updates.unit;
      if (updates.purchase_price !== undefined) updateData.prix_achat = updates.purchase_price;
      if (updates.sale_price !== undefined) updateData.prix_vente = updates.sale_price;
      if (updates.tax_rate !== undefined) updateData.taux_tva = updates.tax_rate;
      if (updates.category_id !== undefined) updateData.categorie = updates.category_id;
      if (updates.active !== undefined) updateData.actif = updates.active;

      const { data, error } = await supabase
        .from('produits')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Produit mis à jour avec succès');
      await fetchProductsAndServices();
      return data;
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du produit');
      throw err;
    }
  }, [fetchProductsAndServices]);

  const deleteProduct = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('produits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Produit supprimé avec succès');
      await fetchProductsAndServices();
    } catch (err) {
      toast.error('Erreur lors de la suppression du produit');
      throw err;
    }
  }, [fetchProductsAndServices]);

  // Service methods
  const createService = useCallback(async (serviceData: Omit<Service, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('produits')
        .insert({
          company_id: companyId,
          code: serviceData.code,
          nom: serviceData.name,
          description: serviceData.description,
          type: 'service',
          stockable: false,
          prix_vente: serviceData.price,
          taux_tva: serviceData.tax_rate,
          categorie: serviceData.category_id,
          actif: serviceData.active ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Service créé avec succès');
      await fetchProductsAndServices();
      return data;
    } catch (err) {
      toast.error('Erreur lors de la création du service');
      throw err;
    }
  }, [companyId, fetchProductsAndServices]);

  const updateService = useCallback(async (id: string, updates: Partial<Service>) => {
    try {
      const updateData: any = {};
      if (updates.code !== undefined) updateData.code = updates.code;
      if (updates.name !== undefined) updateData.nom = updates.name;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.price !== undefined) updateData.prix_vente = updates.price;
      if (updates.tax_rate !== undefined) updateData.taux_tva = updates.tax_rate;
      if (updates.category_id !== undefined) updateData.categorie = updates.category_id;
      if (updates.active !== undefined) updateData.actif = updates.active;

      const { data, error } = await supabase
        .from('produits')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Service mis à jour avec succès');
      await fetchProductsAndServices();
      return data;
    } catch (err) {
      toast.error('Erreur lors de la mise à jour du service');
      throw err;
    }
  }, [fetchProductsAndServices]);

  const deleteService = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('produits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Service supprimé avec succès');
      await fetchProductsAndServices();
    } catch (err) {
      toast.error('Erreur lors de la suppression du service');
      throw err;
    }
  }, [fetchProductsAndServices]);

  // Category methods
  const createCategory = useCallback(async (categoryData: Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt' | 'company_id'>) => {
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    try {
      const { data, error } = await supabase
        .from('product_categories')
        .insert({
          company_id: companyId,
          name: categoryData.name,
          type: categoryData.type,
          description: categoryData.description,
          active: categoryData.active ?? true,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Catégorie créée avec succès');
      await fetchCategories();
      return data;
    } catch (err) {
      toast.error('Erreur lors de la création de la catégorie');
      throw err;
    }
  }, [companyId, fetchCategories]);

  const updateCategory = useCallback(async (id: string, updates: Partial<ProductCategory>) => {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .update({
          name: updates.name,
          type: updates.type,
          description: updates.description,
          active: updates.active,
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      toast.success('Catégorie mise à jour avec succès');
      await fetchCategories();
      return data;
    } catch (err) {
      toast.error('Erreur lors de la mise à jour de la catégorie');
      throw err;
    }
  }, [fetchCategories]);

  const deleteCategory = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Catégorie supprimée avec succès');
      await fetchCategories();
    } catch (err) {
      toast.error('Erreur lors de la suppression de la catégorie');
      throw err;
    }
  }, [fetchCategories]);

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
    loading,
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
    refreshProducts: fetchProductsAndServices,
    refreshCategories: fetchCategories,
  };
}
