import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { useAuditLog } from '@/hooks/useAdminStats';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, RefreshCw, User, Settings, Phone, Users, Megaphone, Key, FileText } from 'lucide-react';

const getActionIcon = (action: string) => {
  if (action.includes('call')) return Phone;
  if (action.includes('lead')) return Users;
  if (action.includes('campaign')) return Megaphone;
  if (action.includes('api_key') || action.includes('token')) return Key;
  if (action.includes('settings') || action.includes('config')) return Settings;
  if (action.includes('user') || action.includes('member')) return User;
  return FileText;
};

const getActionBadgeVariant = (action: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  if (action.includes('delete') || action.includes('remove')) return 'destructive';
  if (action.includes('create') || action.includes('add')) return 'default';
  if (action.includes('update') || action.includes('edit')) return 'secondary';
  return 'outline';
};

const formatAction = (action: string): string => {
  const translations: Record<string, string> = {
    'login': 'Anmeldung',
    'logout': 'Abmeldung',
    'create_lead': 'Lead erstellt',
    'update_lead': 'Lead aktualisiert',
    'delete_lead': 'Lead gelöscht',
    'create_campaign': 'Kampagne erstellt',
    'update_campaign': 'Kampagne aktualisiert',
    'delete_campaign': 'Kampagne gelöscht',
    'start_call': 'Anruf gestartet',
    'end_call': 'Anruf beendet',
    'create_api_key': 'API-Key erstellt',
    'revoke_api_key': 'API-Key widerrufen',
    'invite_member': 'Mitglied eingeladen',
    'remove_member': 'Mitglied entfernt',
    'update_settings': 'Einstellungen geändert',
  };
  return translations[action] || action.replace(/_/g, ' ');
};

export const AuditLogCard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: logs, isLoading, refetch, isFetching } = useAuditLog(100);

  const filteredLogs = logs?.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit-Log</CardTitle>
          <CardDescription>Alle Aktivitäten im Workspace</CardDescription>
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
            <CardTitle>Audit-Log</CardTitle>
            <CardDescription>Alle Aktivitäten im Workspace nachverfolgen</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Suchen..." 
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
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Keine Aktivitäten gefunden</p>
            <p className="text-sm">Aktivitäten werden hier angezeigt, sobald Aktionen durchgeführt werden.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Zeitpunkt</TableHead>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Aktion</TableHead>
                  <TableHead>Ressource</TableHead>
                  <TableHead className="hidden lg:table-cell">IP-Adresse</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map((log) => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {log.created_at && format(new Date(log.created_at), 'dd.MM.yyyy HH:mm', { locale: de })}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-sm truncate max-w-32">
                            {log.user_email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <ActionIcon className="w-4 h-4 text-muted-foreground" />
                          <Badge variant={getActionBadgeVariant(log.action)}>
                            {formatAction(log.action)}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.resource_type && (
                          <span className="text-sm text-muted-foreground">
                            {log.resource_type}
                            {log.resource_id && (
                              <span className="text-xs ml-1">
                                ({log.resource_id.slice(0, 8)}...)
                              </span>
                            )}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {log.ip_address || '-'}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
