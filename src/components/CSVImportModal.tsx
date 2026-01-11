import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useCreateLead } from '@/hooks/useLeads';
import { Upload, FileSpreadsheet, Check, X, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CSVImportModalProps {
  open: boolean;
  onClose: () => void;
  campaignId?: string;
}

interface CSVRow {
  [key: string]: string;
}

interface ColumnMapping {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  company: string;
  notes: string;
}

const REQUIRED_FIELDS = ['first_name', 'phone_number'];
const FIELD_LABELS: Record<keyof ColumnMapping, string> = {
  first_name: 'Vorname *',
  last_name: 'Nachname',
  phone_number: 'Telefon *',
  email: 'E-Mail',
  company: 'Firma',
  notes: 'Notizen',
};

const CSVImportModal = ({ open, onClose, campaignId }: CSVImportModalProps) => {
  const { toast } = useToast();
  const createLead = useCreateLead();
  
  const [step, setStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const [csvData, setCsvData] = useState<CSVRow[]>([]);
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Partial<ColumnMapping>>({});
  const [importProgress, setImportProgress] = useState(0);
  const [importErrors, setImportErrors] = useState<string[]>([]);

  const parseCSV = (text: string): { headers: string[]; data: CSVRow[] } => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      throw new Error('CSV muss mindestens eine Kopfzeile und eine Datenzeile enthalten');
    }

    // Parse header
    const headers = parseCSVLine(lines[0]);
    
    // Parse data rows
    const data: CSVRow[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const row: CSVRow = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }

    return { headers, data };
  };

  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if ((char === ',' || char === ';') && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());

    return result;
  };

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const { headers, data } = parseCSV(text);
        
        setCsvHeaders(headers);
        setCsvData(data);
        
        // Auto-map columns if possible
        const autoMapping: Partial<ColumnMapping> = {};
        const lowerHeaders = headers.map(h => h.toLowerCase());
        
        const mappingHints: Record<keyof ColumnMapping, string[]> = {
          first_name: ['vorname', 'first_name', 'firstname', 'first name', 'name'],
          last_name: ['nachname', 'last_name', 'lastname', 'last name', 'surname'],
          phone_number: ['telefon', 'phone', 'phone_number', 'phonenumber', 'tel', 'mobile', 'mobil'],
          email: ['email', 'e-mail', 'mail'],
          company: ['firma', 'company', 'unternehmen', 'organisation'],
          notes: ['notizen', 'notes', 'bemerkung', 'kommentar'],
        };

        Object.entries(mappingHints).forEach(([field, hints]) => {
          const matchIndex = lowerHeaders.findIndex(h => 
            hints.some(hint => h.includes(hint))
          );
          if (matchIndex !== -1) {
            autoMapping[field as keyof ColumnMapping] = headers[matchIndex];
          }
        });

        setColumnMapping(autoMapping);
        setStep('mapping');
        
        toast({
          title: 'Datei geladen',
          description: `${data.length} Zeilen gefunden`,
        });
      } catch (error) {
        toast({
          title: 'Fehler beim Lesen der Datei',
          description: error instanceof Error ? error.message : 'Unbekannter Fehler',
          variant: 'destructive',
        });
      }
    };
    reader.readAsText(file);
  }, [toast]);

  const handleMappingChange = (field: keyof ColumnMapping, value: string) => {
    setColumnMapping(prev => ({
      ...prev,
      [field]: value === '_none_' ? undefined : value,
    }));
  };

  const validateMapping = (): boolean => {
    const missingFields = REQUIRED_FIELDS.filter(
      field => !columnMapping[field as keyof ColumnMapping]
    );
    
    if (missingFields.length > 0) {
      toast({
        title: 'Pflichtfelder fehlen',
        description: `Bitte mappe: ${missingFields.map(f => FIELD_LABELS[f as keyof ColumnMapping]).join(', ')}`,
        variant: 'destructive',
      });
      return false;
    }
    return true;
  };

  const handleStartImport = async () => {
    if (!validateMapping()) return;

    setStep('importing');
    setImportProgress(0);
    setImportErrors([]);

    const errors: string[] = [];
    
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      
      try {
        const firstName = row[columnMapping.first_name!] || '';
        const phoneNumber = row[columnMapping.phone_number!] || '';

        // Validate required fields
        if (!firstName || !phoneNumber) {
          errors.push(`Zeile ${i + 2}: Vorname oder Telefon fehlt`);
          continue;
        }

        const leadData = {
          firstName,
          phoneNumber,
          lastName: columnMapping.last_name ? row[columnMapping.last_name] : undefined,
          email: columnMapping.email ? row[columnMapping.email] : undefined,
          company: columnMapping.company ? row[columnMapping.company] : undefined,
          notes: columnMapping.notes ? row[columnMapping.notes] : undefined,
          campaignId,
        };

        await createLead.mutateAsync(leadData);
      } catch (error) {
        errors.push(`Zeile ${i + 2}: ${error instanceof Error ? error.message : 'Import fehlgeschlagen'}`);
      }

      setImportProgress(((i + 1) / csvData.length) * 100);
    }

    setImportErrors(errors);
    
    if (errors.length === 0) {
      toast({
        title: 'Import abgeschlossen',
        description: `${csvData.length} Leads erfolgreich importiert`,
      });
      handleClose();
    } else {
      toast({
        title: 'Import mit Fehlern abgeschlossen',
        description: `${csvData.length - errors.length} von ${csvData.length} Leads importiert`,
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setStep('upload');
    setCsvData([]);
    setCsvHeaders([]);
    setColumnMapping({});
    setImportProgress(0);
    setImportErrors([]);
    onClose();
  };

  const previewData = csvData.slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" />
            Leads aus CSV importieren
          </DialogTitle>
          <DialogDescription>
            {step === 'upload' && 'Lade eine CSV-Datei mit deinen Leads hoch'}
            {step === 'mapping' && 'Ordne die CSV-Spalten den Lead-Feldern zu'}
            {step === 'preview' && 'Überprüfe die Vorschau und starte den Import'}
            {step === 'importing' && 'Import läuft...'}
          </DialogDescription>
        </DialogHeader>

        {/* Upload Step */}
        {step === 'upload' && (
          <div className="flex flex-col items-center justify-center py-12">
            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex flex-col items-center justify-center">
                <Upload className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">CSV-Datei hochladen</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Klicken oder Datei hierher ziehen
                </p>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            
            <div className="mt-6 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Unterstützte Spalten:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Vorname (Pflicht)</li>
                <li>Nachname</li>
                <li>Telefon (Pflicht)</li>
                <li>E-Mail</li>
                <li>Firma</li>
                <li>Notizen</li>
              </ul>
            </div>
          </div>
        )}

        {/* Mapping Step */}
        {step === 'mapping' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {(Object.keys(FIELD_LABELS) as (keyof ColumnMapping)[]).map(field => (
                <div key={field} className="space-y-2">
                  <label className="text-sm font-medium">
                    {FIELD_LABELS[field]}
                  </label>
                  <Select
                    value={columnMapping[field] || '_none_'}
                    onValueChange={(value) => handleMappingChange(field, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Spalte auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_none_">— Nicht zuordnen —</SelectItem>
                      {csvHeaders.map(header => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>

            {/* Preview */}
            <div>
              <h3 className="text-sm font-medium mb-2">Vorschau (erste 5 Zeilen)</h3>
              <div className="border rounded-lg overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {csvHeaders.map(header => (
                        <TableHead key={header} className="whitespace-nowrap">
                          {header}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewData.map((row, index) => (
                      <TableRow key={index}>
                        {csvHeaders.map(header => (
                          <TableCell key={header} className="whitespace-nowrap">
                            {row[header] || '-'}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="outline" onClick={() => setStep('upload')}>
                Zurück
              </Button>
              <Button onClick={handleStartImport}>
                {csvData.length} Leads importieren
              </Button>
            </div>
          </div>
        )}

        {/* Importing Step */}
        {step === 'importing' && (
          <div className="space-y-6 py-8">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Importiere Leads...</span>
                <span>{Math.round(importProgress)}%</span>
              </div>
              <Progress value={importProgress} />
            </div>

            {importErrors.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-destructive flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Fehler ({importErrors.length})
                </h3>
                <div className="max-h-32 overflow-y-auto space-y-1 text-sm">
                  {importErrors.map((error, index) => (
                    <p key={index} className="text-destructive">{error}</p>
                  ))}
                </div>
              </div>
            )}

            {importProgress === 100 && (
              <div className="flex justify-end">
                <Button onClick={handleClose}>
                  Schließen
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CSVImportModal;
