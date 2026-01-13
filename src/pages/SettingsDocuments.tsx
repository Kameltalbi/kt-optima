import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Download, Trash2, FileText } from "lucide-react";

export default function SettingsDocuments() {
  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Documents</CardTitle>
              <CardDescription className="text-xs">
                Gérez vos fichiers et modèles
              </CardDescription>
            </div>
            <Button size="sm" className="text-xs gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Téléverser
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { name: "Modèle facture.docx", type: "Modèle", date: "12/01/2024", size: "45 KB" },
              { name: "Logo HD.png", type: "Image", date: "10/01/2024", size: "1.2 MB" },
              { name: "CGV.pdf", type: "Document", date: "05/01/2024", size: "320 KB" },
            ].map((doc) => (
              <div key={doc.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type} • {doc.date} • {doc.size}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Catégories de documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["Factures", "Devis", "Contrats", "Modèles", "Autres"].map((cat) => (
              <Badge key={cat} variant="secondary" className="text-xs">{cat}</Badge>
            ))}
            <Button variant="outline" size="sm" className="h-6 text-[10px] gap-1">
              <Plus className="w-3 h-3" />
              Ajouter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
