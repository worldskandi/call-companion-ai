import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { Search, MoreHorizontal, Shield, User, Mail, Calendar, RefreshCw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface UserWithRole {
  id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: 'admin' | 'user';
}

export const UserManagementCard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleChangeUser, setRoleChangeUser] = useState<{ id: string; currentRole: string } | null>(null);
  const queryClient = useQueryClient();

  const { data: users, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async (): Promise<UserWithRole[]> => {
      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name, created_at')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      const roleMap = new Map(roles?.map(r => [r.user_id, r.role]) || []);

      return (profiles || []).map(profile => ({
        ...profile,
        role: (roleMap.get(profile.id) as 'admin' | 'user') || 'user',
      }));
    },
  });

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: 'Rolle geändert',
        description: `Benutzer ist jetzt ${newRole === 'admin' ? 'Administrator' : 'Benutzer'}.`,
      });

      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Rolle konnte nicht geändert werden.',
        variant: 'destructive',
      });
    } finally {
      setRoleChangeUser(null);
    }
  };

  const filteredUsers = users?.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Benutzerverwaltung</CardTitle>
          <CardDescription>Alle registrierten Benutzer verwalten</CardDescription>
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
            <CardTitle>Benutzerverwaltung</CardTitle>
            <CardDescription>{users?.length || 0} registrierte Benutzer</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Benutzer suchen..."
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
        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Keine Benutzer gefunden</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Benutzer</TableHead>
                  <TableHead>Rolle</TableHead>
                  <TableHead>Registriert</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{user.full_name || 'Unbenannt'}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? (
                          <><Shield className="w-3 h-3 mr-1" /> Admin</>
                        ) : (
                          <><User className="w-3 h-3 mr-1" /> Benutzer</>
                        )}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(user.created_at), 'dd.MM.yyyy', { locale: de })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {user.role === 'user' ? (
                            <DropdownMenuItem onClick={() => setRoleChangeUser({ id: user.id, currentRole: 'user' })}>
                              <Shield className="w-4 h-4 mr-2" />
                              Zum Admin machen
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => setRoleChangeUser({ id: user.id, currentRole: 'admin' })}>
                              <User className="w-4 h-4 mr-2" />
                              Zum Benutzer machen
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Role Change Confirmation */}
      <AlertDialog open={!!roleChangeUser} onOpenChange={() => setRoleChangeUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rolle ändern?</AlertDialogTitle>
            <AlertDialogDescription>
              {roleChangeUser?.currentRole === 'user'
                ? 'Dieser Benutzer erhält Admin-Rechte und kann alle Daten im Workspace verwalten.'
                : 'Dieser Benutzer verliert seine Admin-Rechte.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => roleChangeUser && handleRoleChange(
                roleChangeUser.id,
                roleChangeUser.currentRole === 'user' ? 'admin' : 'user'
              )}
            >
              Bestätigen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
