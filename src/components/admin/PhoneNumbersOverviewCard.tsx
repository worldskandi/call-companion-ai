import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, Phone, RefreshCw, User, Megaphone, CheckCircle, XCircle } from 'lucide-react';

interface PhoneNumberWithDetails {
  id: string;
  phone_number: string;
  friendly_name: string | null;
  provider: string | null;
  country_code: string | null;
  is_active: boolean | null;
  monthly_cost_cents: number | null;
  created_at: string | null;
  user_email: string | null;
  campaign_name: string | null;
}

export const PhoneNumbersOverviewCard = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: phoneNumbers, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-phone-numbers'],
    queryFn: async (): Promise<PhoneNumberWithDetails[]> => {
      const { data: numbers, error } = await supabase
        .from('phone_numbers')
        .select(`
          id,
          phone_number,
          friendly_name,
          provider,
          country_code,
          is_active,
          monthly_cost_cents,
          created_at,
          user_id,
          campaign_id
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get user emails
      const userIds = [...new Set((numbers || []).map(n => n.user_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', userIds);

      const emailMap = new Map(profiles?.map(p => [p.id, p.email]) || []);

      // Get campaign names
      const campaignIds = [...new Set((numbers || []).filter(n => n.campaign_id).map(n => n.campaign_id))];
      const { data: campaigns } = campaignIds.length > 0 
        ? await supabase
            .from('campaigns')
            .select('id, name')
            .in('id', campaignIds)
        : { data: [] };

      const campaignMap = new Map<string, string>();
      campaigns?.forEach(c => campaignMap.set(c.id, c.name));

      return (numbers || []).map(num => ({
        id: num.id,
        phone_number: num.phone_number,
        friendly_name: num.friendly_name,
        provider: num.provider,
        country_code: num.country_code,
        is_active: num.is_active,
        monthly_cost_cents: num.monthly_cost_cents,
        created_at: num.created_at,
        user_email: emailMap.get(num.user_id) || null,
        campaign_name: num.campaign_id ? (campaignMap.get(num.campaign_id) || null) : null,
      })) as PhoneNumberWithDetails[];
    },
  });

  const filteredNumbers = phoneNumbers?.filter(num =>
    num.phone_number.includes(searchTerm) ||
    num.friendly_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    num.user_email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalMonthlyCost = (phoneNumbers?.reduce((acc, num) => acc + (num.monthly_cost_cents || 0), 0) || 0) / 100;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Telefonnummern</CardTitle>
          <CardDescription>Alle provisionierten Nummern</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Telefonnummern
            </CardTitle>
            <CardDescription>
              {phoneNumbers?.length || 0} Nummern • €{totalMonthlyCost.toFixed(2)}/Monat
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Nummer suchen..."
                className="pl-9 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredNumbers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Phone className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Keine Telefonnummern gefunden</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nummer</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Kampagne</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Kosten</TableHead>
                  <TableHead>Erstellt</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNumbers.map((num) => (
                  <TableRow key={num.id}>
                    <TableCell>
                      <div>
                        <p className="font-mono font-medium">{num.phone_number}</p>
                        {num.friendly_name && (
                          <p className="text-sm text-muted-foreground">{num.friendly_name}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="truncate max-w-32">{num.user_email || 'Unbekannt'}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {num.campaign_name ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Megaphone className="w-3 h-3 text-muted-foreground" />
                          <span className="truncate max-w-24">{num.campaign_name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {num.is_active ? (
                        <Badge className="bg-green-500">
                          <CheckCircle className="w-3 h-3 mr-1" /> Aktiv
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="w-3 h-3 mr-1" /> Inaktiv
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        €{((num.monthly_cost_cents || 0) / 100).toFixed(2)}/Mo
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {num.created_at && format(new Date(num.created_at), 'dd.MM.yyyy', { locale: de })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
