import { useState } from 'react';
import { useKnowledgeBase, KnowledgeItem, KnowledgeCategory } from '@/hooks/useKnowledgeBase';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Plus, Globe, FileText, MessageSquare, Building2,
  Folder, Trash2, Edit, Loader2, Search, ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOURCE_ICONS: Record<string, React.ReactNode> = {
  manual: <MessageSquare className="w-4 h-4" />,
  url: <Globe className="w-4 h-4" />,
  document: <FileText className="w-4 h-4" />,
  company_profile: <Building2 className="w-4 h-4" />,
};

const SOURCE_LABELS: Record<string, string> = {
  manual: 'Manuell',
  url: 'URL',
  document: 'Dokument',
  company_profile: 'Firmenprofil',
};

const KnowledgeBase = () => {
  const { toast } = useToast();
  const {
    categories, items, categoriesLoading, itemsLoading,
    createCategory, deleteCategory,
    createItem, deleteItem,
    importFromUrl, importFromCompanyProfile,
  } = useKnowledgeBase();

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [addMode, setAddMode] = useState<'manual' | 'url' | 'company' | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [viewItem, setViewItem] = useState<KnowledgeItem | null>(null);

  // Add form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formUrl, setFormUrl] = useState('');
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  const filteredItems = items?.filter(item => {
    const matchesSearch = !search ||
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddManual = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      toast({ title: 'Fehler', description: 'Titel und Inhalt sind Pflicht.', variant: 'destructive' });
      return;
    }
    try {
      await createItem.mutateAsync({
        title: formTitle,
        content: formContent,
        source_type: 'manual',
        category_id: formCategory || null,
      });
      toast({ title: 'Gespeichert ✓', description: 'Wissenseintrag erstellt.' });
      setAddMode(null);
      resetForm();
    } catch (e: any) {
      toast({ title: 'Fehler', description: e.message, variant: 'destructive' });
    }
  };

  const handleImportUrl = async () => {
    if (!formUrl.trim()) {
      toast({ title: 'Fehler', description: 'URL eingeben.', variant: 'destructive' });
      return;
    }
    try {
      await importFromUrl.mutateAsync({ url: formUrl, categoryId: formCategory || undefined });
      toast({ title: 'Importiert ✓', description: 'URL-Inhalt wurde importiert.' });
      setAddMode(null);
      resetForm();
    } catch (e: any) {
      toast({ title: 'Fehler', description: e.message, variant: 'destructive' });
    }
  };

  const handleImportCompany = async () => {
    try {
      const result = await importFromCompanyProfile.mutateAsync(formCategory || undefined);
      toast({ title: 'Importiert ✓', description: `${result.count} Einträge aus dem Firmenprofil importiert.` });
      setAddMode(null);
    } catch (e: any) {
      toast({ title: 'Fehler', description: e.message, variant: 'destructive' });
    }
  };

  const handleCreateCategory = async () => {
    if (!catName.trim()) return;
    try {
      await createCategory.mutateAsync({ name: catName, description: catDesc || undefined });
      toast({ title: 'Kategorie erstellt ✓' });
      setShowCategoryDialog(false);
      setCatName('');
      setCatDesc('');
    } catch (e: any) {
      toast({ title: 'Fehler', description: e.message, variant: 'destructive' });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await deleteItem.mutateAsync(id);
      toast({ title: 'Gelöscht ✓' });
    } catch (e: any) {
      toast({ title: 'Fehler', description: e.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('');
    setFormUrl('');
  };

  const isLoading = categoriesLoading || itemsLoading;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            Wissensdatenbank
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Zentrale Wissensbibliothek für deine AI-Agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCategoryDialog(true)} className="gap-2">
            <Folder className="w-4 h-4" />
            Kategorie
          </Button>
          <Button onClick={() => setAddMode('manual')} className="gap-2">
            <Plus className="w-4 h-4" />
            Neuer Eintrag
          </Button>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Suchen..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Alle Kategorien" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Alle Kategorien</SelectItem>
            {categories?.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setAddMode('url')}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">URL importieren</p>
              <p className="text-xs text-muted-foreground">Webseite crawlen & speichern</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setAddMode('manual')}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Text / FAQ</p>
              <p className="text-xs text-muted-foreground">Manuell Wissen eingeben</p>
            </div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => setAddMode('company')}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-sm">Firmenprofil</p>
              <p className="text-xs text-muted-foreground">Produkte & USPs importieren</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories overview */}
      {categories && categories.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <Badge
              key={c.id}
              variant={filterCategory === c.id ? 'default' : 'outline'}
              className="cursor-pointer gap-1"
              onClick={() => setFilterCategory(filterCategory === c.id ? 'all' : c.id)}
            >
              <Folder className="w-3 h-3" />
              {c.name}
              <span className="text-xs opacity-70">
                ({items?.filter(i => i.category_id === c.id).length || 0})
              </span>
            </Badge>
          ))}
        </div>
      )}

      {/* Items List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : !filteredItems?.length ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="font-medium text-lg mb-1">Noch keine Einträge</h3>
          <p className="text-muted-foreground text-sm">
            Füge Wissen hinzu, das deine Agents nutzen können.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3">
          <AnimatePresence>
            {filteredItems.map(item => {
              const cat = categories?.find(c => c.id === item.category_id);
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Card className="hover:border-primary/30 transition-colors">
                    <CardContent className="p-4 flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-muted flex-shrink-0 mt-0.5">
                        {SOURCE_ICONS[item.source_type] || <FileText className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3
                            className="font-medium truncate cursor-pointer hover:text-primary transition-colors"
                            onClick={() => setViewItem(item)}
                          >
                            {item.title}
                          </h3>
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            {SOURCE_LABELS[item.source_type]}
                          </Badge>
                          {cat && (
                            <Badge variant="secondary" className="text-xs flex-shrink-0 gap-1">
                              <Folder className="w-3 h-3" />
                              {cat.name}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.content.substring(0, 200)}
                        </p>
                        {item.source_url && (
                          <a
                            href={item.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {item.source_url}
                          </a>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteItem(item.id)}
                        className="text-muted-foreground hover:text-destructive flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Manual / URL Dialog */}
      <Dialog open={addMode === 'manual' || addMode === 'url'} onOpenChange={() => { setAddMode(null); resetForm(); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {addMode === 'url' ? 'URL importieren' : 'Wissenseintrag erstellen'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {addMode === 'url' && (
              <div className="space-y-2">
                <Label>URL</Label>
                <Input
                  placeholder="https://example.com/faq"
                  value={formUrl}
                  onChange={e => setFormUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Die Seite wird gecrawlt und der Inhalt als Wissen gespeichert.
                </p>
              </div>
            )}

            {addMode === 'manual' && (
              <>
                <div className="space-y-2">
                  <Label>Titel *</Label>
                  <Input
                    placeholder="z.B. Preisliste 2025, FAQ, Produktinfos..."
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Inhalt *</Label>
                  <Textarea
                    placeholder="Wissen eingeben... (Markdown wird unterstützt)"
                    value={formContent}
                    onChange={e => setFormContent(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Kategorie (optional)</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger><SelectValue placeholder="Keine Kategorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Keine Kategorie</SelectItem>
                  {categories?.map(c => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => { setAddMode(null); resetForm(); }}>Abbrechen</Button>
            {addMode === 'url' ? (
              <Button onClick={handleImportUrl} disabled={importFromUrl.isPending} className="gap-2">
                {importFromUrl.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Importieren
              </Button>
            ) : (
              <Button onClick={handleAddManual} disabled={createItem.isPending} className="gap-2">
                {createItem.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Speichern
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Company Import Confirm Dialog */}
      <Dialog open={addMode === 'company'} onOpenChange={() => setAddMode(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              Aus Firmenprofil importieren
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Beschreibung, Produkte und USPs aus deinem Firmenprofil werden als Wissenseinträge importiert.
          </p>
          <div className="space-y-2">
            <Label>Kategorie (optional)</Label>
            <Select value={formCategory} onValueChange={setFormCategory}>
              <SelectTrigger><SelectValue placeholder="Keine Kategorie" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keine Kategorie</SelectItem>
                {categories?.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddMode(null)}>Abbrechen</Button>
            <Button onClick={handleImportCompany} disabled={importFromCompanyProfile.isPending} className="gap-2">
              {importFromCompanyProfile.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Importieren
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Neue Kategorie</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input placeholder="z.B. Produkte, FAQs, Preise..." value={catName} onChange={e => setCatName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Beschreibung</Label>
              <Input placeholder="Optional" value={catDesc} onChange={e => setCatDesc(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowCategoryDialog(false)}>Abbrechen</Button>
            <Button onClick={handleCreateCategory} disabled={createCategory.isPending}>Erstellen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Item Dialog */}
      <Dialog open={!!viewItem} onOpenChange={() => setViewItem(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewItem?.title}</DialogTitle>
          </DialogHeader>
          {viewItem && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1">
                  {SOURCE_ICONS[viewItem.source_type]}
                  {SOURCE_LABELS[viewItem.source_type]}
                </Badge>
                {viewItem.source_url && (
                  <a href={viewItem.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1">
                    <ExternalLink className="w-3 h-3" /> Quelle
                  </a>
                )}
              </div>
              <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-4 whitespace-pre-wrap text-sm">
                {viewItem.content}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KnowledgeBase;
