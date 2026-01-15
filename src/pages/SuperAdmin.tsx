import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useSuperadmin, Company, Module, Plan } from '@/hooks/use-superadmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Building2,
  Package,
  Settings,
  Plus,
  Edit,
  Trash2,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { Textarea } from '@/components/ui/textarea';

// Local interface for company form that includes all editable fields
interface CompanyFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  tax_number: string;
  currency: string;
  language: string;
}

export default function SuperAdmin() {
  const { memberships } = useApp();
  const {
    loading,
    getCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    getModules,
    toggleModule,
    getPlans,
  } = useSuperadmin();

  // Check if user is superadmin
  const isSuperadmin = memberships.some(m => m.role === 'superadmin');

  const [companies, setCompanies] = useState<Company[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [plans] = useState<Plan[]>(getPlans());

  // Company modal state
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyForm, setCompanyForm] = useState<CompanyFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    tax_number: '',
    currency: 'TND',
    language: 'fr',
  });

  // Load data
  useEffect(() => {
    if (isSuperadmin) {
      loadData();
    }
  }, [isSuperadmin]);

  const loadData = async () => {
    const [companiesData, modulesData] = await Promise.all([
      getCompanies(),
      getModules(),
    ]);
    setCompanies(companiesData);
    setModules(modulesData);
  };

  // Company handlers
  const handleCreateCompany = async () => {
    const company = await createCompany(companyForm);
    if (company) {
      setCompanies([company, ...companies]);
      setCompanyModalOpen(false);
      resetCompanyForm();
    }
  };

  const handleUpdateCompany = async () => {
    if (!editingCompany) return;
    const success = await updateCompany(editingCompany.id, companyForm);
    if (success) {
      await loadData();
      setCompanyModalOpen(false);
      setEditingCompany(null);
      resetCompanyForm();
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      const success = await deleteCompany(id);
      if (success) {
        setCompanies(companies.filter(c => c.id !== id));
      }
    }
  };

  const openEditCompany = (company: Company) => {
    setEditingCompany(company);
    setCompanyForm({
      name: company.name,
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
      tax_number: company.tax_number || '',
      currency: company.currency,
      language: company.language,
    });
    setCompanyModalOpen(true);
  };

  const resetCompanyForm = () => {
    setCompanyForm({
      name: '',
      email: '',
      phone: '',
      address: '',
      tax_number: '',
      currency: 'TND',
      language: 'fr',
    });
    setEditingCompany(null);
  };

  // Module handlers
  const handleToggleModule = async (id: string, active: boolean) => {
    const success = await toggleModule(id, active);
    if (success) {
      setModules(modules.map(m => m.id === id ? { ...m, active } : m));
    }
  };

  if (!isSuperadmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Super Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion complète de l'application, des entreprises et modules
          </p>
        </div>
      </div>

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Entreprises
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="plans" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Plans
          </TabsTrigger>
        </TabsList>

        {/* COMPANIES TAB */}
        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Entreprises</CardTitle>
                  <CardDescription>
                    Gérer toutes les entreprises de l'application
                  </CardDescription>
                </div>
                <Dialog open={companyModalOpen} onOpenChange={setCompanyModalOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={resetCompanyForm}>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle entreprise
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>
                        {editingCompany ? 'Modifier l\'entreprise' : 'Nouvelle entreprise'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingCompany
                          ? 'Modifiez les informations de l\'entreprise'
                          : 'Créez une nouvelle entreprise dans le système'}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nom *</Label>
                          <Input
                            id="name"
                            value={companyForm.name}
                            onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                            placeholder="Nom de l'entreprise"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={companyForm.email}
                            onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="phone">Téléphone</Label>
                          <Input
                            id="phone"
                            value={companyForm.phone}
                            onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                            placeholder="+216 XX XXX XXX"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="tax_number">Numéro fiscal</Label>
                          <Input
                            id="tax_number"
                            value={companyForm.tax_number}
                            onChange={(e) => setCompanyForm({ ...companyForm, tax_number: e.target.value })}
                            placeholder="12345678"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Adresse</Label>
                        <Textarea
                          id="address"
                          value={companyForm.address}
                          onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
                          placeholder="Adresse complète"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="currency">Devise</Label>
                          <Select
                            value={companyForm.currency}
                            onValueChange={(value) => setCompanyForm({ ...companyForm, currency: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="TND">TND</SelectItem>
                              <SelectItem value="MAD">MAD</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="language">Langue</Label>
                          <Select
                            value={companyForm.language}
                            onValueChange={(value) => setCompanyForm({ ...companyForm, language: value })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fr">Français</SelectItem>
                              <SelectItem value="ar">العربية</SelectItem>
                              <SelectItem value="en">English</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCompanyModalOpen(false)}>
                        Annuler
                      </Button>
                      <Button
                        onClick={editingCompany ? handleUpdateCompany : handleCreateCompany}
                        disabled={!companyForm.name}
                      >
                        {editingCompany ? 'Modifier' : 'Créer'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Téléphone</TableHead>
                    <TableHead>Devise</TableHead>
                    <TableHead>Créée le</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.map((company) => (
                    <TableRow key={company.id}>
                      <TableCell className="font-medium">{company.name}</TableCell>
                      <TableCell>{company.email || '-'}</TableCell>
                      <TableCell>{company.phone || '-'}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{company.currency}</Badge>
                      </TableCell>
                      <TableCell>
                        {company.created_at ? new Date(company.created_at).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditCompany(company)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteCompany(company.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* MODULES TAB */}
        <TabsContent value="modules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Modules</CardTitle>
              <CardDescription>
                Activer ou désactiver les modules de l'application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-center">Actif</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modules.map((module) => (
                    <TableRow key={module.id}>
                      <TableCell className="font-mono text-sm">{module.code}</TableCell>
                      <TableCell className="font-medium">{module.name}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {module.description || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={module.active}
                          onCheckedChange={(checked) => handleToggleModule(module.id, checked)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLANS TAB */}
        <TabsContent value="plans" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.code}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="text-2xl font-bold">
                        {plan.price_monthly} {plan.currency}
                        <span className="text-sm font-normal text-muted-foreground">/mois</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        ou {plan.price_yearly} {plan.currency}/an
                      </div>
                    </div>
                    <ul className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
