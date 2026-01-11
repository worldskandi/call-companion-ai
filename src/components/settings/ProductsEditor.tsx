import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Package, GripVertical } from 'lucide-react';
import type { ProductService } from '@/hooks/useCompanyProfile';

interface ProductsEditorProps {
  products: ProductService[];
  onChange: (products: ProductService[]) => void;
}

export function ProductsEditor({ products, onChange }: ProductsEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAdd = () => {
    const newProduct: ProductService = {
      id: crypto.randomUUID(),
      name: '',
      description: '',
      price: '',
      targetGroup: '',
    };
    onChange([...products, newProduct]);
    setEditingId(newProduct.id);
  };

  const handleUpdate = (id: string, field: keyof ProductService, value: string) => {
    onChange(
      products.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  const handleDelete = (id: string) => {
    onChange(products.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produkte & Dienstleistungen
            </CardTitle>
            <CardDescription>
              Listen Sie Ihre Produkte und Services auf. Diese werden in KI-Gesprächen verwendet.
            </CardDescription>
          </div>
          <Button onClick={handleAdd} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Hinzufügen
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Noch keine Produkte oder Services hinzugefügt.</p>
            <Button onClick={handleAdd} variant="link" className="mt-2">
              Erstes Produkt hinzufügen
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product, index) => (
              <Card key={product.id} className="relative">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="h-5 w-5 cursor-grab" />
                      <span className="text-sm font-medium w-6">{index + 1}.</span>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label>Produktname</Label>
                          <Input
                            value={product.name}
                            onChange={(e) => handleUpdate(product.id, 'name', e.target.value)}
                            placeholder="z.B. Premium Beratungspaket"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Preis / Preisbereich</Label>
                          <Input
                            value={product.price || ''}
                            onChange={(e) => handleUpdate(product.id, 'price', e.target.value)}
                            placeholder="z.B. ab 999€ / auf Anfrage"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Beschreibung</Label>
                        <Textarea
                          value={product.description}
                          onChange={(e) => handleUpdate(product.id, 'description', e.target.value)}
                          placeholder="Was beinhaltet dieses Produkt / diese Dienstleistung?"
                          rows={2}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Zielgruppe</Label>
                        <Input
                          value={product.targetGroup || ''}
                          onChange={(e) => handleUpdate(product.id, 'targetGroup', e.target.value)}
                          placeholder="Für wen ist dieses Produkt ideal?"
                        />
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
