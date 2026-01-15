import { useApp } from "@/context/AppContext";

export function DocumentFooter() {
  const { company } = useApp();

  if (!company) {
    return null;
  }

  return (
    <footer className="mt-auto pt-6 border-t-2 border-gray-200">
      {/* Footer text from company settings */}
      {company.footer && (
        <div className="text-xs text-gray-600 whitespace-pre-line">
          {company.footer}
        </div>
      )}

      {/* Default footer if no custom footer */}
      {!company.footer && (
        <div className="text-xs text-gray-500 text-center">
          <p>Document généré automatiquement</p>
        </div>
      )}
    </footer>
  );
}
