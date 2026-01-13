import { Routes, Route, Navigate } from "react-router-dom";
import { ModuleTabs } from "@/components/layout/ModuleTabs";
import Products from "../Products";
import Services from "../Services";
import Categories from "../Categories";

export default function ProductsServicesModule() {
  const moduleName = "Produits & Services";
  const tabs = [
    { id: "products", label: "Produits", path: "/parametres/produits-services/produits" },
    { id: "services", label: "Services", path: "/parametres/produits-services/services" },
    { id: "categories", label: "Catégories", path: "/parametres/produits-services/categories" },
  ];

  return (
    <div>
      <ModuleTabs moduleName={moduleName} tabs={tabs} />
      <Routes>
        <Route path="produits" element={<Products />} />
        <Route path="services" element={<Services />} />
        <Route path="categories" element={<Categories />} />
        <Route path="" element={<Navigate to="produits" replace />} />
      </Routes>
    </div>
  );
}
