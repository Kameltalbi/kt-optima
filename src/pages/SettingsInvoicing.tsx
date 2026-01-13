import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function SettingsInvoicing() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Numérotation des documents</CardTitle>
          <CardDescription className="text-xs">
            Format de numérotation automatique
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Préfixe factures</Label>
              <Input defaultValue="FAC-" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Prochain numéro</Label>
              <Input defaultValue="00001" className="h-9 text-sm" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Préfixe devis</Label>
              <Input defaultValue="DEV-" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Prochain numéro</Label>
              <Input defaultValue="00001" className="h-9 text-sm" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Taux de TVA</CardTitle>
          <CardDescription className="text-xs">
            Taux applicables aux produits et services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "TVA Standard", rate: "20%" },
              { name: "TVA Réduit", rate: "10%" },
              { name: "TVA Super réduit", rate: "7%" },
            ].map((vat) => (
              <div key={vat.name} className="flex items-center justify-between p-2 rounded bg-muted/30">
                <span className="text-sm">{vat.name}</span>
                <Badge variant="secondary" className="text-[10px]">{vat.rate}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
