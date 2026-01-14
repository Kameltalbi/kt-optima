import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SettingsCompany() {
  const { company, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    tax_number: "",
    address: "",
    phone: "",
    email: "",
    logo: "",
  });

  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name || "",
        tax_number: company.tax_number || "",
        address: company.address || "",
        phone: company.phone || "",
        email: company.email || "",
        logo: company.logo || "",
      });
    }
  }, [company]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Le nom de l'entreprise est requis");
      return;
    }

    setLoading(true);
    try {
      if (company?.id) {
        // Update existing company
        const { error } = await supabase
          .from("companies")
          .update({
            name: formData.name,
            tax_number: formData.tax_number,
            address: formData.address,
            phone: formData.phone,
            email: formData.email,
            logo: formData.logo,
          })
          .eq("id", company.id);

        if (error) throw error;
      } else {
        // Create new company and link to profile via a SECURITY DEFINER RPC (avoids RLS multi-step issues)
        const { data: companyId, error: rpcError } = await supabase.rpc(
          "create_company_and_link_profile",
          {
            _name: formData.name,
            _tax_number: formData.tax_number || null,
            _address: formData.address || null,
            _phone: formData.phone || null,
            _email: formData.email || null,
            _currency: "TND",
            _language: "fr",
          }
        );

        if (rpcError) throw rpcError;
        if (!companyId) throw new Error("Impossible de créer l'entreprise");

        // Reload page to refresh context
        window.location.reload();
      }
      toast.success("Informations enregistrées avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company?.id) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Le fichier ne doit pas dépasser 2MB");
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${company.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("company-logos")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("company-logos")
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, logo: publicUrl }));

      const { error: updateError } = await supabase
        .from("companies")
        .update({ logo: publicUrl })
        .eq("id", company.id);

      if (updateError) throw updateError;
      toast.success("Logo téléchargé avec succès");
    } catch (error: any) {
      toast.error(error.message || "Erreur lors du téléchargement");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Informations de l'entreprise</CardTitle>
          <CardDescription className="text-xs">
            Ces informations apparaîtront sur vos documents officiels
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Nom de l'entreprise</Label>
              <Input 
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Entreprise SA" 
                className="h-9 text-sm" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Numéro fiscal</Label>
              <Input 
                name="tax_number"
                value={formData.tax_number}
                onChange={handleChange}
                placeholder="123456789" 
                className="h-9 text-sm" 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Adresse</Label>
            <Input 
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="123 Rue Principale, Casablanca" 
              className="h-9 text-sm" 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Téléphone</Label>
              <Input 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+212 5XX XXX XXX" 
                className="h-9 text-sm" 
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="contact@entreprise.ma" 
                className="h-9 text-sm" 
              />
            </div>
          </div>
          <div className="pt-2">
            <Button size="sm" className="text-xs" onClick={handleSave} disabled={loading}>
              {loading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
              Enregistrer les modifications
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Logo de l'entreprise</CardTitle>
          <CardDescription className="text-xs">
            Le logo sera affiché sur les factures et documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30 overflow-hidden">
              {formData.logo ? (
                <img src={formData.logo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-muted-foreground/50" />
              )}
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="text-xs" disabled={uploading} asChild>
                <label className="cursor-pointer">
                  {uploading && <Loader2 className="w-3 h-3 mr-2 animate-spin" />}
                  Télécharger un logo
                  <input 
                    type="file" 
                    accept="image/png,image/jpeg" 
                    className="hidden" 
                    onChange={handleLogoUpload}
                  />
                </label>
              </Button>
              <p className="text-[10px] text-muted-foreground">PNG, JPG jusqu'à 2MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Pied de page documents</CardTitle>
          <CardDescription className="text-xs">
            Texte affiché en bas de vos factures, devis et documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Contenu du pied de page</Label>
            <textarea 
              className="w-full min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder="Capital: 100 000 DH | RC: 123456 | IF: 12345678 | ICE: 001234567890123 | Patente: 12345678 | CNSS: 1234567&#10;RIB: XXX XXX XXXX XXXX XXXX XXXX XXX&#10;Conditions de paiement, mentions légales..."
            />
          </div>
          <div className="pt-2">
            <Button size="sm" className="text-xs">
              Enregistrer le pied de page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
