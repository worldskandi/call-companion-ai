import { useEffect, useState } from 'react';
import { useLead, useCreateLead, useUpdateLead, LeadStatus } from '@/hooks/useLeads';
import { Campaign } from '@/hooks/useCampaigns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Phone, Building2, Mail, FileText } from 'lucide-react';
import { z } from 'zod';

const leadSchema = z.object({
  firstName: z.string().trim().min(1, 'Vorname ist erforderlich').max(100),
  lastName: z.string().trim().max(100).optional(),
  company: z.string().trim().max(200).optional(),
  phoneNumber: z.string().trim().min(1, 'Telefonnummer ist erforderlich').max(50),
  email: z.string().trim().email('Ungültige E-Mail').max(255).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional(),
});

interface LeadModalProps {
  open: boolean;
  onClose: () => void;
  leadId: string | null;
  campaigns: Campaign[];
}

const LeadModal = ({ open, onClose, leadId, campaigns }: LeadModalProps) => {
  const { data: lead, isLoading } = useLead(leadId);
  const createLead = useCreateLead();
  const updateLead = useUpdateLead();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [campaignId, setCampaignId] = useState<string>('none');
  const [status, setStatus] = useState<LeadStatus>('new');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (lead && leadId) {
      setFirstName(lead.first_name || '');
      setLastName(lead.last_name || '');
      setCompany(lead.company || '');
      setPhoneNumber(lead.phone_number || '');
      setEmail(lead.email || '');
      setCampaignId(lead.campaign_id || 'none');
      setStatus(lead.status);
      setNotes(lead.notes || '');
    } else if (!leadId) {
      resetForm();
    }
  }, [lead, leadId]);

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setCompany('');
    setPhoneNumber('');
    setEmail('');
    setCampaignId('none');
    setStatus('new');
    setNotes('');
    setErrors({});
  };

  const validate = () => {
    try {
      leadSchema.parse({
        firstName,
        lastName: lastName || undefined,
        company: company || undefined,
        phoneNumber,
        email: email || undefined,
        notes: notes || undefined,
      });
      setErrors({});
      return true;
    } catch (e) {
      if (e instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        e.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      if (leadId) {
        await updateLead.mutateAsync({
          leadId,
          firstName,
          lastName: lastName || undefined,
          company: company || undefined,
          phoneNumber,
          email: email || undefined,
          campaignId: campaignId === 'none' ? undefined : campaignId,
          status,
          notes: notes || undefined,
        });
      } else {
        await createLead.mutateAsync({
          firstName,
          phoneNumber,
          lastName: lastName || undefined,
          company: company || undefined,
          email: email || undefined,
          campaignId: campaignId === 'none' ? undefined : campaignId,
          notes: notes || undefined,
        });
      }
      onClose();
      resetForm();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const isSubmitting = createLead.isPending || updateLead.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] glass-panel border-white/40">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {leadId ? 'Lead bearbeiten' : 'Neuen Lead hinzufügen'}
          </DialogTitle>
        </DialogHeader>

        {isLoading && leadId ? (
          <div className="py-8 text-center text-muted-foreground">Laden...</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Vorname *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Max"
                    className="pl-10"
                  />
                </div>
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nachname</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Mustermann"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Firma</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Musterfirma GmbH"
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Telefonnummer *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+49 123 456789"
                  className="pl-10"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-Mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@beispiel.de"
                  className="pl-10"
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kampagne</Label>
                <Select value={campaignId} onValueChange={setCampaignId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Keine Kampagne</SelectItem>
                    {campaigns.map((campaign) => (
                      <SelectItem key={campaign.id} value={campaign.id}>
                        {campaign.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {leadId && (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Neu</SelectItem>
                      <SelectItem value="called">Angerufen</SelectItem>
                      <SelectItem value="interested">Interessiert</SelectItem>
                      <SelectItem value="callback">Rückruf</SelectItem>
                      <SelectItem value="not_interested">Kein Interesse</SelectItem>
                      <SelectItem value="qualified">Qualifiziert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notizen</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Zusätzliche Informationen..."
                  className="pl-10 min-h-[80px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Speichern...' : leadId ? 'Speichern' : 'Hinzufügen'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeadModal;
