import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
  Clock,
  CheckCircle2,
  Sparkles,
  Settings,
  Loader2,
  AlertCircle,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  XCircle,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmails, useEmailIntegration, useEmailAnalysis } from '@/hooks/useEmails';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu';

type RelevanceFilter = 'all' | 'high' | 'medium' | 'low' | 'spam';

const Inbox = () => {
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [relevanceFilter, setRelevanceFilter] = useState<RelevanceFilter>('all');
  
  const { emails, total, providerEmail, error, errorCode, isLoading, isFetching, refetch } = useEmails('INBOX', 30);
  const { data: integration, isLoading: integrationLoading } = useEmailIntegration();
  const { analyses, isAnalyzing, analyzeEmails, getAnalysis } = useEmailAnalysis();

  const selectedEmailData = emails.find(e => e.id === selectedEmail);
  const selectedEmailAnalysis = selectedEmail ? getAnalysis(selectedEmail) : undefined;

  // Check if we have analyses
  const hasAnalyses = Object.keys(analyses).length > 0;

  // Filter and sort emails based on analysis
  const filteredEmails = useMemo(() => {
    let result = emails.filter(email => 
      searchQuery === '' ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.fromEmail.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Apply relevance filter if we have analyses
    if (hasAnalyses && relevanceFilter !== 'all') {
      result = result.filter(email => {
        const analysis = getAnalysis(email.id);
        return analysis?.relevance === relevanceFilter;
      });
    }

    // Sort by relevance score if available
    if (hasAnalyses) {
      result.sort((a, b) => {
        const analysisA = getAnalysis(a.id);
        const analysisB = getAnalysis(b.id);
        const scoreA = analysisA?.relevanceScore ?? 50;
        const scoreB = analysisB?.relevanceScore ?? 50;
        return scoreB - scoreA;
      });
    }

    return result;
  }, [emails, searchQuery, relevanceFilter, hasAnalyses, analyses]);

  // Count emails by relevance
  const relevanceCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0, spam: 0 };
    emails.forEach(email => {
      const analysis = getAnalysis(email.id);
      if (analysis) {
        counts[analysis.relevance]++;
      }
    });
    return counts;
  }, [emails, analyses]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 60) return `vor ${minutes} Min.`;
    if (hours < 24) return `vor ${hours} Std.`;
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  };

  const unreadCount = emails.filter(e => !e.isRead).length;
  const starredEmails = emails.filter(e => e.isStarred);

  // Get relevance icon and color
  const getRelevanceInfo = (relevance: string) => {
    switch (relevance) {
      case 'high':
        return { icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-500/10', label: 'Wichtig' };
      case 'medium':
        return { icon: Zap, color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Mittel' };
      case 'low':
        return { icon: TrendingDown, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unwichtig' };
      case 'spam':
        return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Spam' };
      default:
        return { icon: Mail, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unbekannt' };
    }
  };

  // Loading state
  if (integrationLoading || (isLoading && !error)) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">E-Mails werden geladen...</p>
          </div>
        </div>
      </div>
    );
  }

  // No integration state
  if (!integration || errorCode === 'NO_INTEGRATION') {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Mail className="w-8 h-8 text-primary" />
            Inbox
          </h1>
        </motion.div>

        <Card className="max-w-lg mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Kein E-Mail-Konto verbunden</h2>
            <p className="text-muted-foreground mb-6">
              Verbinde dein E-Mail-Postfach, um E-Mails direkt in Beavy zu empfangen und zu verwalten.
            </p>
            <Button asChild>
              <Link to="/app/settings" className="gap-2">
                <Settings className="w-4 h-4" />
                E-Mail-Konto verbinden
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (other than no integration)
  if (error && errorCode !== 'NO_INTEGRATION') {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
            <Mail className="w-8 h-8 text-primary" />
            Inbox
          </h1>
        </motion.div>

        <Card className="max-w-lg mx-auto border-destructive/50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-destructive" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Verbindungsfehler</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={refetch}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Erneut versuchen
              </Button>
              <Button asChild>
                <Link to="/app/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Einstellungen
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              {providerEmail && <span className="text-sm">{providerEmail} • </span>}
              {total} E-Mails
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* AI Analyze Button */}
            <Button 
              onClick={() => analyzeEmails(emails)}
              disabled={isAnalyzing || emails.length === 0}
              className="gap-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analysiere...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  KI-Analyse
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={refetch}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </Button>
            {/* Relevance Filter Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Filter className="w-4 h-4" />
                  {relevanceFilter !== 'all' && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Nach Relevanz filtern</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRelevanceFilter('all')}>
                  <Mail className="w-4 h-4 mr-2" />
                  Alle anzeigen
                  {relevanceFilter === 'all' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRelevanceFilter('high')}>
                  <TrendingUp className="w-4 h-4 mr-2 text-green-500" />
                  Wichtig ({relevanceCounts.high})
                  {relevanceFilter === 'high' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRelevanceFilter('medium')}>
                  <Zap className="w-4 h-4 mr-2 text-yellow-500" />
                  Mittel ({relevanceCounts.medium})
                  {relevanceFilter === 'medium' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setRelevanceFilter('low')}>
                  <TrendingDown className="w-4 h-4 mr-2 text-muted-foreground" />
                  Unwichtig ({relevanceCounts.low})
                  {relevanceFilter === 'low' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setRelevanceFilter('spam')}>
                  <XCircle className="w-4 h-4 mr-2 text-destructive" />
                  Spam ({relevanceCounts.spam})
                  {relevanceFilter === 'spam' && <CheckCircle2 className="w-4 h-4 ml-auto text-primary" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </motion.div>

      {/* AI Analysis Summary */}
      {hasAnalyses && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  <span className="font-medium">KI-Analyse:</span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    {relevanceCounts.high} Wichtig
                  </Badge>
                  <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30">
                    <Zap className="w-3 h-3 mr-1" />
                    {relevanceCounts.medium} Mittel
                  </Badge>
                  <Badge variant="outline" className="bg-muted text-muted-foreground">
                    <TrendingDown className="w-3 h-3 mr-1" />
                    {relevanceCounts.low} Unwichtig
                  </Badge>
                  {relevanceCounts.spam > 0 && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
                      <XCircle className="w-3 h-3 mr-1" />
                      {relevanceCounts.spam} Spam
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

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
            {unreadCount > 0 && <Badge variant="secondary" className="ml-1">{unreadCount}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="starred" className="gap-2">
            <Star className="w-4 h-4" />
            Markiert
            {starredEmails.length > 0 && <Badge variant="secondary" className="ml-1">{starredEmails.length}</Badge>}
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
          {filteredEmails.length === 0 ? (
            <Card className="p-8 text-center">
              <InboxIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {searchQuery ? 'Keine E-Mails gefunden' : relevanceFilter !== 'all' ? 'Keine E-Mails mit dieser Relevanz' : 'Keine E-Mails im Posteingang'}
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Email List */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="lg:col-span-1 space-y-2 max-h-[600px] overflow-y-auto"
              >
                {filteredEmails.map((email, index) => {
                  const emailAnalysis = getAnalysis(email.id);
                  const relevanceInfo = emailAnalysis ? getRelevanceInfo(emailAnalysis.relevance) : null;
                  const RelevanceIcon = relevanceInfo?.icon;
                  
                  return (
                    <motion.div
                      key={email.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * Math.min(index, 10) }}
                      onClick={() => setSelectedEmail(email.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                        selectedEmail === email.id 
                          ? 'bg-primary/5 border-primary/20' 
                          : 'bg-card hover:bg-muted/50'
                      } ${!email.isRead ? 'border-l-4 border-l-primary' : ''}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {relevanceInfo && RelevanceIcon && (
                            <div className={`p-1 rounded ${relevanceInfo.bg}`}>
                              <RelevanceIcon className={`w-3 h-3 ${relevanceInfo.color}`} />
                            </div>
                          )}
                          <span className={`font-medium truncate ${!email.isRead ? 'font-semibold' : ''}`}>
                            {email.from}
                          </span>
                          {email.isStarred && (
                            <Star className="w-4 h-4 text-warning fill-warning shrink-0" />
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0 ml-2">
                          {formatTime(email.date)}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${!email.isRead ? 'font-medium' : 'text-muted-foreground'}`}>
                        {email.subject}
                      </p>
                      {emailAnalysis ? (
                        <p className="text-xs text-primary/80 line-clamp-2">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          {emailAnalysis.summary}
                        </p>
                      ) : (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {email.preview}
                        </p>
                      )}
                      {emailAnalysis && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline" className={`text-xs ${relevanceInfo?.bg} ${relevanceInfo?.color} border-0`}>
                            {emailAnalysis.category}
                          </Badge>
                          {emailAnalysis.actionRequired && (
                            <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-600 border-0">
                              <AlertTriangle className="w-3 h-3 mr-1" />
                              Aktion
                            </Badge>
                          )}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
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
                            Von: {selectedEmailData.from} &lt;{selectedEmailData.fromEmail}&gt;
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(selectedEmailData.date).toLocaleString('de-DE')}
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
                      {selectedEmailAnalysis ? (
                        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary" />
                              <span className="font-medium text-sm">KI-Zusammenfassung</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {(() => {
                                const info = getRelevanceInfo(selectedEmailAnalysis.relevance);
                                const Icon = info.icon;
                                return (
                                  <Badge variant="outline" className={`${info.bg} ${info.color} border-0`}>
                                    <Icon className="w-3 h-3 mr-1" />
                                    {info.label}
                                  </Badge>
                                );
                              })()}
                              <Badge variant="outline">
                                {selectedEmailAnalysis.category}
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm mb-3">
                            {selectedEmailAnalysis.summary}
                          </p>
                          {selectedEmailAnalysis.actionRequired && selectedEmailAnalysis.suggestedAction && (
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-orange-500/10 text-orange-700">
                              <AlertTriangle className="w-4 h-4" />
                              <span className="text-sm font-medium">Vorgeschlagene Aktion: {selectedEmailAnalysis.suggestedAction}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-muted/50 border border-dashed">
                          <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm text-muted-foreground">KI-Analyse</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Klicke auf "KI-Analyse" um diese E-Mail zu analysieren.
                          </p>
                        </div>
                      )}

                      {/* Email Content */}
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{selectedEmailData.preview}</p>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 pt-4 border-t flex-wrap">
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
                        {selectedEmailAnalysis?.relevance === 'spam' && (
                          <Button variant="destructive" className="gap-2">
                            <Trash2 className="w-4 h-4" />
                            Als Spam löschen
                          </Button>
                        )}
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
          )}
        </TabsContent>

        <TabsContent value="starred">
          {starredEmails.length === 0 ? (
            <Card className="p-8 text-center">
              <Star className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Keine markierten E-Mails</p>
            </Card>
          ) : (
            <div className="space-y-2">
              {starredEmails.map((email) => (
                <Card key={email.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{email.subject}</p>
                      <p className="text-sm text-muted-foreground">Von: {email.from}</p>
                    </div>
                    <Star className="w-5 h-5 text-warning fill-warning" />
                  </div>
                </Card>
              ))}
            </div>
          )}
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
