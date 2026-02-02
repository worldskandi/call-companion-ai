import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Search, 
  Filter, 
  Star, 
  Archive, 
  Trash2, 
  RefreshCw,
  Inbox as InboxIcon,
  Send,
  AlertCircle,
  Clock,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data for demo - will be replaced with real data from email integration
const mockEmails = [
  {
    id: '1',
    from: 'Max Müller',
    email: 'max@example.com',
    subject: 'Anfrage zu Ihrem Angebot',
    preview: 'Guten Tag, ich habe Interesse an Ihrem Produkt und würde gerne mehr erfahren...',
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 min ago
    isRead: false,
    isStarred: true,
    priority: 'high' as const,
    aiSummary: 'Kunde interessiert an Produktdemo. Follow-up empfohlen.',
  },
  {
    id: '2',
    from: 'Anna Schmidt',
    email: 'anna@company.de',
    subject: 'Meeting morgen',
    preview: 'Hallo, können wir das Meeting morgen um 14:00 Uhr auf 15:00 Uhr verschieben?',
    date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    isRead: true,
    isStarred: false,
    priority: 'medium' as const,
    aiSummary: 'Terminänderung angefragt. Bestätigung erforderlich.',
  },
  {
    id: '3',
    from: 'Rechnungswesen',
    email: 'billing@supplier.com',
    subject: 'Rechnung #12345 fällig',
    preview: 'Ihre Rechnung #12345 über €2.500 ist am 15.02.2026 fällig...',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    isRead: true,
    isStarred: false,
    priority: 'low' as const,
    aiSummary: 'Zahlung bis 15.02 erforderlich. Aufgabe erstellen?',
  },
];

const Inbox = () => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedEmailData = mockEmails.find(e => e.id === selectedEmail);

  const getPriorityColor = (priority: 'high' | 'medium' | 'low') => {
    switch (priority) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-muted text-muted-foreground';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) return `vor ${minutes} Min.`;
    if (hours < 24) return `vor ${hours} Std.`;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Mail className="w-8 h-8 text-primary" />
              Inbox
            </h1>
            <p className="text-muted-foreground">
              Alle E-Mails und Nachrichten an einem Ort
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="E-Mails durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox" className="gap-2">
            <InboxIcon className="w-4 h-4" />
            Posteingang
            <Badge variant="secondary" className="ml-1">3</Badge>
          </TabsTrigger>
          <TabsTrigger value="starred" className="gap-2">
            <Star className="w-4 h-4" />
            Markiert
          </TabsTrigger>
          <TabsTrigger value="sent" className="gap-2">
            <Send className="w-4 h-4" />
            Gesendet
          </TabsTrigger>
          <TabsTrigger value="archive" className="gap-2">
            <Archive className="w-4 h-4" />
            Archiv
          </TabsTrigger>
        </TabsList>

        <TabsContent value="inbox">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Email List */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-1 space-y-2"
            >
              {mockEmails.map((email, index) => (
                <motion.div
                  key={email.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  onClick={() => setSelectedEmail(email.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                    selectedEmail === email.id 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-card hover:bg-muted/50'
                  } ${!email.isRead ? 'border-l-4 border-l-primary' : ''}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${!email.isRead ? 'font-semibold' : ''}`}>
                        {email.from}
                      </span>
                      {email.isStarred && (
                        <Star className="w-4 h-4 text-warning fill-warning" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(email.date)}
                    </span>
                  </div>
                  <p className={`text-sm mb-2 ${!email.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                    {email.subject}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {email.preview}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className={`text-xs ${getPriorityColor(email.priority)}`}>
                      {email.priority === 'high' ? 'Wichtig' : email.priority === 'medium' ? 'Normal' : 'Niedrig'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Email Preview */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="lg:col-span-2"
            >
              {selectedEmailData ? (
                <Card>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-1">{selectedEmailData.subject}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Von: {selectedEmailData.from} &lt;{selectedEmailData.email}&gt;
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon">
                          <Star className={`w-4 h-4 ${selectedEmailData.isStarred ? 'text-warning fill-warning' : ''}`} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Archive className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* AI Summary */}
                    <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <span className="font-medium text-sm">KI-Zusammenfassung</span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedEmailData.aiSummary}
                      </p>
                    </div>

                    {/* Email Content */}
                    <div className="prose prose-sm max-w-none">
                      <p>{selectedEmailData.preview}</p>
                      <p className="text-muted-foreground mt-4">
                        [Vollständiger E-Mail-Inhalt wird nach E-Mail-Integration angezeigt]
                      </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 pt-4 border-t">
                      <Button className="gap-2">
                        <Send className="w-4 h-4" />
                        Antworten
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        Als erledigt markieren
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <Clock className="w-4 h-4" />
                        Aufgabe erstellen
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex items-center justify-center min-h-[400px]">
                  <div className="text-center p-8">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                      <Mail className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Wähle eine E-Mail aus, um sie zu lesen
                    </p>
                  </div>
                </Card>
              )}
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="starred">
          <Card className="p-8 text-center">
            <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Markierte E-Mails werden hier angezeigt</p>
          </Card>
        </TabsContent>

        <TabsContent value="sent">
          <Card className="p-8 text-center">
            <Send className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Gesendete E-Mails werden hier angezeigt</p>
          </Card>
        </TabsContent>

        <TabsContent value="archive">
          <Card className="p-8 text-center">
            <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Archivierte E-Mails werden hier angezeigt</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inbox;
