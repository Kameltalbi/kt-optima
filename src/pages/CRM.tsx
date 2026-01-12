import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, Users, TrendingUp, Target, Phone } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "won" | "lost";
  value: number;
  source: string;
}

const mockLeads: Lead[] = [
  { id: "1", name: "Ahmed Benali", company: "Tech Solutions SA", email: "ahmed@techsolutions.ma", phone: "+212 661 123 456", status: "qualified", value: 45000, source: "Site web" },
  { id: "2", name: "Fatima Alaoui", company: "Import Export Plus", email: "fatima@iexport.ma", phone: "+212 662 234 567", status: "proposal", value: 120000, source: "Recommandation" },
  { id: "3", name: "Youssef Mansouri", company: "Agro Maroc", email: "youssef@agromaroc.ma", phone: "+212 663 345 678", status: "new", value: 35000, source: "LinkedIn" },
  { id: "4", name: "Sara Idrissi", company: "Digital Agency", email: "sara@digitalagency.ma", phone: "+212 664 456 789", status: "contacted", value: 75000, source: "Salon" },
  { id: "5", name: "Karim Tazi", company: "Construction Pro", email: "karim@constructionpro.ma", phone: "+212 665 567 890", status: "won", value: 250000, source: "Appel entrant" },
];

const statusConfig = {
  new: { label: "Nouveau", color: "bg-blue-500/10 text-blue-600" },
  contacted: { label: "Contacté", color: "bg-purple-500/10 text-purple-600" },
  qualified: { label: "Qualifié", color: "bg-cyan-500/10 text-cyan-600" },
  proposal: { label: "Proposition", color: "bg-warning/10 text-warning" },
  won: { label: "Gagné", color: "bg-success/10 text-success" },
  lost: { label: "Perdu", color: "bg-destructive/10 text-destructive" },
};

const pipelineStages = ["new", "contacted", "qualified", "proposal", "won"] as const;

export default function CRM() {
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"pipeline" | "list">("pipeline");

  const filteredLeads = mockLeads.filter(
    (lead) =>
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = mockLeads.reduce((sum, l) => sum + l.value, 0);
  const wonValue = mockLeads.filter(l => l.status === "won").reduce((sum, l) => sum + l.value, 0);
  const pipelineValue = mockLeads.filter(l => !["won", "lost"].includes(l.status)).reduce((sum, l) => sum + l.value, 0);

  const getLeadsByStage = (stage: string) => filteredLeads.filter(l => l.status === stage);

  return (
    <MainLayout title="CRM" subtitle="Gestion de la relation client">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total leads</p>
                  <p className="text-xl font-semibold">{mockLeads.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pipeline</p>
                  <p className="text-xl font-semibold">{pipelineValue.toLocaleString()} MAD</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Gagnés</p>
                  <p className="text-xl font-semibold">{wonValue.toLocaleString()} MAD</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taux conversion</p>
                  <p className="text-xl font-semibold">{Math.round((wonValue / totalValue) * 100)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un lead..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={view === "pipeline" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("pipeline")}
            >
              Pipeline
            </Button>
            <Button
              variant={view === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("list")}
            >
              Liste
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau lead
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Ajouter un nouveau lead</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-muted-foreground text-sm">
                    Formulaire de création de lead à implémenter.
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Pipeline View */}
        {view === "pipeline" && (
          <div className="grid grid-cols-5 gap-4">
            {pipelineStages.map((stage) => (
              <div key={stage} className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className={statusConfig[stage].color + " border-0"}>
                    {statusConfig[stage].label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {getLeadsByStage(stage).length}
                  </span>
                </div>
                <div className="space-y-2">
                  {getLeadsByStage(stage).map((lead) => (
                    <Card key={lead.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-3">
                        <p className="font-medium text-sm truncate">{lead.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                        <p className="text-sm font-semibold text-primary mt-2">
                          {lead.value.toLocaleString()} MAD
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === "list" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-medium">Liste des leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredLeads.map((lead) => (
                  <div
                    key={lead.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {lead.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">{lead.company}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-semibold">{lead.value.toLocaleString()} MAD</p>
                        <p className="text-xs text-muted-foreground">{lead.source}</p>
                      </div>
                      <Badge className={statusConfig[lead.status].color + " border-0"}>
                        {statusConfig[lead.status].label}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
