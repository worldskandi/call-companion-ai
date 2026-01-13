import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useDeleteEmailTemplate,
  categoryLabels,
  type EmailTemplate,
} from '@/hooks/useEmailTemplates';
import {
  FileText,
  Calendar,
  MessageSquare,
  Info,
  XCircle,
  Trash2,
  Save,
  Loader2,
  Search,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmailTemplateLibraryProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: EmailTemplate) => void;
  currentSubject?: string;
  currentContent?: string;
}

const categoryIcons: Record<EmailTemplate['category'], React.ReactNode> = {
  'follow-up': <MessageSquare className="w-4 h-4" />,
  quote: <FileText className="w-4 h-4" />,
  meeting: <Calendar className="w-4 h-4" />,
  info: <Info className="w-4 h-4" />,
  rejection: <XCircle className="w-4 h-4" />,
};

export function EmailTemplateLibrary({
  open,
  onClose,
  onSelect,
  currentSubject,
  currentContent,
}: EmailTemplateLibraryProps) {
  const { data: templates, isLoading } = useEmailTemplates();
  const createTemplate = useCreateEmailTemplate();
  const deleteTemplate = useDeleteEmailTemplate();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] =
    useState<EmailTemplate['category']>('follow-up');

  const filteredTemplates = templates?.filter((t) => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSaveAsTemplate = async () => {
    if (!newTemplateName.trim() || !currentSubject || !currentContent) return;

    await createTemplate.mutateAsync({
      name: newTemplateName,
      category: newTemplateCategory,
      subject: currentSubject,
      html_content: currentContent,
    });

    setShowSaveDialog(false);
    setNewTemplateName('');
  };

  const handleDelete = async (templateId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Vorlage wirklich löschen?')) {
      await deleteTemplate.mutateAsync(templateId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            E-Mail-Vorlagen
          </DialogTitle>
        </DialogHeader>

        {showSaveDialog ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Name der Vorlage</Label>
              <Input
                id="template-name"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                placeholder="z.B. Meine Follow-up E-Mail"
              />
            </div>
            <div>
              <Label htmlFor="template-category">Kategorie</Label>
              <Select
                value={newTemplateCategory}
                onValueChange={(v) => setNewTemplateCategory(v as EmailTemplate['category'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        {categoryIcons[key as EmailTemplate['category']]}
                        {label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                Abbrechen
              </Button>
              <Button
                onClick={handleSaveAsTemplate}
                disabled={!newTemplateName.trim() || createTemplate.isPending}
              >
                {createTemplate.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Speichern
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Suchen..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Kategorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle</SelectItem>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {currentSubject && currentContent && (
                <Button variant="outline" onClick={() => setShowSaveDialog(true)}>
                  <Save className="w-4 h-4 mr-2" />
                  Als Vorlage speichern
                </Button>
              )}
            </div>

            {/* Template List */}
            <ScrollArea className="h-[400px] pr-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : filteredTemplates?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  Keine Vorlagen gefunden
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTemplates?.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => onSelect(template)}
                      className={cn(
                        'p-4 rounded-lg border cursor-pointer transition-colors',
                        'hover:border-primary hover:bg-primary/5'
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {template.is_system && (
                              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            )}
                            <span className="font-medium truncate">{template.name}</span>
                            <Badge
                              variant="secondary"
                              className="gap-1 text-xs shrink-0"
                            >
                              {categoryIcons[template.category]}
                              {categoryLabels[template.category]}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {template.subject}
                          </p>
                        </div>
                        {!template.is_system && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={(e) => handleDelete(template.id, e)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
