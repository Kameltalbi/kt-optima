import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Upload, FileSpreadsheet, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { useProducts } from "@/hooks/use-products";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { Product, Service, ProductCategory } from "@/types/database";

export default function ImportExport() {
  const { company } = useAuth();
  const { products, services, categories, createProduct, createService, createCategory } = useProducts();
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
      toast.error("Aucune donnée à exporter");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          if (value === null || value === undefined) return "";
          if (typeof value === "string" && value.includes(",")) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${data.length} éléments exportés avec succès`);
  };

  const exportProducts = () => {
    const exportData = products.map(p => ({
      code: p.code,
      name: p.name,
      category: p.category_id || "",
      purchase_price: p.purchase_price || "",
      sale_price: p.sale_price,
      tax_rate: p.tax_rate,
      unit: p.unit || "",
      stockable: p.stockable ? "Oui" : "Non",
      active: p.active ? "Oui" : "Non",
      description: p.description || "",
    }));
    exportToCSV(exportData, "produits");
  };

  const exportServices = () => {
    const exportData = services.map(s => ({
      code: s.code,
      name: s.name,
      category: s.category_id || "",
      price: s.price,
      tax_rate: s.tax_rate,
      billing_type: s.billing_type,
      active: s.active ? "Oui" : "Non",
      description: s.description || "",
    }));
    exportToCSV(exportData, "services");
  };

  const exportCategories = () => {
    const exportData = categories.map(c => ({
      name: c.name,
      type: c.type,
      description: c.description || "",
      active: c.active ? "Oui" : "Non",
    }));
    exportToCSV(exportData, "categories");
  };

  // Import functions
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split("\n").filter(line => line.trim());
    if (lines.length < 2) return [];

    // Parse headers
    const parseCSVLine = (line: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++; // Skip next quote
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ""));
    const data: any[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ""));
      if (values.length !== headers.length) continue;

      const row: any = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || "";
      });
      data.push(row);
    }

    return data;
  };

  const handleFileImport = async (file: File, type: "products" | "services" | "categories") => {
    setImporting(true);
    setImportResult(null);

    try {
      const text = await file.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        toast.error("Le fichier est vide ou invalide");
        setImporting(false);
        return;
      }

      const errors: string[] = [];
      let successCount = 0;

      if (type === "products") {
        for (const row of data) {
          try {
            await createProduct({
              code: row.code || "",
              name: row.name || "",
              category_id: row.category || "",
              purchase_price: parseFloat(row.purchase_price) || 0,
              sale_price: parseFloat(row.sale_price) || 0,
              tax_rate: parseFloat(row.tax_rate) || 19,
              unit: row.unit || "pièce",
              stockable: row.stockable === "Oui" || row.stockable === "true",
              active: row.active === "Oui" || row.active === "true",
              description: row.description || "",
            });
            successCount++;
          } catch (error: any) {
            errors.push(`Ligne ${data.indexOf(row) + 2}: ${error.message || "Erreur inconnue"}`);
          }
        }
      } else if (type === "services") {
        for (const row of data) {
          try {
            await createService({
              code: row.code || "",
              name: row.name || "",
              category_id: row.category || "",
              price: parseFloat(row.price) || 0,
              tax_rate: parseFloat(row.tax_rate) || 19,
              billing_type: row.billing_type || "fixed",
              active: row.active === "Oui" || row.active === "true",
              description: row.description || "",
            });
            successCount++;
          } catch (error: any) {
            errors.push(`Ligne ${data.indexOf(row) + 2}: ${error.message || "Erreur inconnue"}`);
          }
        }
      } else if (type === "categories") {
        for (const row of data) {
          try {
            await createCategory({
              name: row.name || "",
              type: row.type === "product" || row.type === "service" ? row.type : "product",
              description: row.description || "",
              active: row.active === "Oui" || row.active === "true",
            });
            successCount++;
          } catch (error: any) {
            errors.push(`Ligne ${data.indexOf(row) + 2}: ${error.message || "Erreur inconnue"}`);
          }
        }
      }

      setImportResult({ success: successCount, errors });
      if (successCount > 0) {
        toast.success(`${successCount} élément(s) importé(s) avec succès`);
      }
      if (errors.length > 0) {
        toast.warning(`${errors.length} erreur(s) lors de l'import`);
      }
    } catch (error: any) {
      toast.error(`Erreur lors de l'import: ${error.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: "products" | "services" | "categories") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Veuillez sélectionner un fichier CSV");
      return;
    }

    handleFileImport(file, type);
    e.target.value = ""; // Reset input
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Import / Export</CardTitle>
        <CardDescription className="text-xs">
          Importez ou exportez vos produits, services et catégories au format CSV
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="mt-6 space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-sm font-semibold">Produits</Label>
                      <p className="text-xs text-muted-foreground">
                        {products.length} produit(s) disponible(s)
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={exportProducts}
                    disabled={products.length === 0}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter CSV
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-sm font-semibold">Services</Label>
                      <p className="text-xs text-muted-foreground">
                        {services.length} service(s) disponible(s)
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={exportServices}
                    disabled={services.length === 0}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter CSV
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-sm font-semibold">Catégories</Label>
                      <p className="text-xs text-muted-foreground">
                        {categories.length} catégorie(s) disponible(s)
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={exportCategories}
                    disabled={categories.length === 0}
                    className="gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Exporter CSV
                  </Button>
                </div>
              </div>
            </div>

            <Alert className="bg-info/5 border-info/20">
              <FileText className="h-4 w-4 text-info" />
              <AlertDescription className="text-xs">
                Les fichiers CSV peuvent être ouverts dans Excel, Google Sheets ou tout autre tableur.
                Les dates d'export sont incluses dans le nom du fichier.
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="import" className="mt-6 space-y-4">
            <div className="space-y-3">
              <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-sm font-semibold">Produits</Label>
                      <p className="text-xs text-muted-foreground">
                        Importez un fichier CSV avec les colonnes: code, name, category, purchase_price, sale_price, tax_rate, unit, stockable, active, description
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileSelect(e, "products")}
                    disabled={importing}
                    className="hidden"
                    id="import-products"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById("import-products")?.click()}
                    disabled={importing}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {importing ? "Import en cours..." : "Importer CSV"}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-sm font-semibold">Services</Label>
                      <p className="text-xs text-muted-foreground">
                        Importez un fichier CSV avec les colonnes: code, name, category, price, tax_rate, billing_type, active, description
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileSelect(e, "services")}
                    disabled={importing}
                    className="hidden"
                    id="import-services"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById("import-services")?.click()}
                    disabled={importing}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {importing ? "Import en cours..." : "Importer CSV"}
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-border/50 bg-muted/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    <div>
                      <Label className="text-sm font-semibold">Catégories</Label>
                      <p className="text-xs text-muted-foreground">
                        Importez un fichier CSV avec les colonnes: name, type, description, active
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFileSelect(e, "categories")}
                    disabled={importing}
                    className="hidden"
                    id="import-categories"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => document.getElementById("import-categories")?.click()}
                    disabled={importing}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    {importing ? "Import en cours..." : "Importer CSV"}
                  </Button>
                </div>
              </div>
            </div>

            {importResult && (
              <Alert className={importResult.errors.length > 0 ? "bg-warning/5 border-warning/20" : "bg-success/5 border-success/20"}>
                {importResult.errors.length > 0 ? (
                  <AlertCircle className="h-4 w-4 text-warning" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-success" />
                )}
                <AlertDescription className="text-xs">
                  <div className="font-semibold mb-1">
                    {importResult.success} élément(s) importé(s) avec succès
                  </div>
                  {importResult.errors.length > 0 && (
                    <div className="mt-2">
                      <div className="font-semibold mb-1">Erreurs:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <li key={index} className="text-xs">{error}</li>
                        ))}
                        {importResult.errors.length > 5 && (
                          <li className="text-xs">... et {importResult.errors.length - 5} autre(s) erreur(s)</li>
                        )}
                      </ul>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <Alert className="bg-info/5 border-info/20">
              <FileText className="h-4 w-4 text-info" />
              <AlertDescription className="text-xs">
                <strong>Format CSV requis:</strong> Le fichier doit être encodé en UTF-8 avec des virgules comme séparateurs.
                La première ligne doit contenir les en-têtes de colonnes. Vous pouvez exporter d'abord pour voir le format exact.
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
