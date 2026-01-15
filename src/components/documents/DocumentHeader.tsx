import { useApp } from "@/context/AppContext";
import { Building2 } from "lucide-react";

export function DocumentHeader() {
  const { company } = useApp();

  if (!company) {
    return null;
  }

  return (
    <header className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
      {/* Left side - Company info */}
      <div className="flex-1">
        {/* Logo */}
        {company.logo ? (
          <img
            src={company.logo}
            alt={company.name}
            className="h-20 w-auto mb-3 object-contain"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-primary" />
            </div>
          </div>
        )}

        {/* Company name */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">{company.name}</h1>

        {/* Address */}
        {company.address && (
          <p className="text-sm text-gray-600 mb-1">{company.address}</p>
        )}

        {/* Contact info */}
        <div className="space-y-1 mt-2">
          {company.phone && (
            <p className="text-sm text-gray-600">Tél: {company.phone}</p>
          )}
          {company.email && (
            <p className="text-sm text-gray-600">{company.email}</p>
          )}
          {company.tax_number && (
            <p className="text-sm font-medium text-gray-700 mt-1">
              IF: {company.tax_number}
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
