import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { FileCheck, Eye, FileText } from "lucide-react";

export default function SettingsTemplates() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Modèle de document actif</CardTitle>
          <CardDescription className="text-xs">
            Ce modèle sera utilisé pour toutes les factures, devis et bons de commande
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border-2 border-primary">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">Modèle Standard</p>
                <p className="text-xs text-muted-foreground">Design professionnel avec en-tête et pied de page</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary border-0 text-[10px]">Actif</Badge>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs gap-1.5"
                onClick={() => window.open('/documents/preview', '_blank')}
              >
                <Eye className="w-3.5 h-3.5" />
                Aperçu
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-3">Autres modèles disponibles</p>
            <div className="space-y-2">
              {[
                { id: 2, name: "Modèle Minimaliste", desc: "Design épuré et moderne" },
                { id: 3, name: "Modèle Coloré", desc: "Avec couleurs personnalisées" },
              ].map((template) => (
                <div key={template.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <FileText className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{template.name}</p>
                      <p className="text-xs text-muted-foreground">{template.desc}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Activer
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Personnalisation du modèle</CardTitle>
          <CardDescription className="text-xs">
            Ajustez l'apparence de vos documents
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs">Couleur principale</Label>
              <div className="flex gap-2">
                <Input defaultValue="#22C55E" className="h-9 text-sm flex-1" />
                <div className="w-9 h-9 rounded-md bg-primary border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Police du document</Label>
              <select className="w-full h-9 rounded-md border bg-background px-3 text-sm">
                <option>Inter</option>
                <option>Roboto</option>
                <option>Open Sans</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Afficher le logo</Label>
            <div className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="rounded" />
              <span className="text-sm">Afficher le logo de l'entreprise en haut des documents</span>
            </div>
          </div>
          <div className="pt-2">
            <Button size="sm" className="text-xs">
              Enregistrer les préférences
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
