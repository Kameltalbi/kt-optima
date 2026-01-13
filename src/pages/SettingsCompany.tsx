import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2 } from "lucide-react";

export default function SettingsCompany() {
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
              <Input placeholder="Entreprise SA" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Numéro fiscal</Label>
              <Input placeholder="123456789" className="h-9 text-sm" />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Adresse</Label>
            <Input placeholder="123 Rue Principale, Casablanca" className="h-9 text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Téléphone</Label>
              <Input placeholder="+212 5XX XXX XXX" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Email</Label>
              <Input placeholder="contact@entreprise.ma" className="h-9 text-sm" />
            </div>
          </div>
          <div className="pt-2">
            <Button size="sm" className="text-xs">
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
            <div className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center bg-muted/30">
              <Building2 className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="text-xs">
                Télécharger un logo
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
