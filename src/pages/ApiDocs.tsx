import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Book, Phone, Users, Megaphone, Bot, Search, Key, ChevronRight, AlertTriangle, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ApiEndpoint } from '@/components/docs/ApiEndpoint';
import { CodeBlock } from '@/components/docs/CodeBlock';

const BASE_URL = 'https://dwuelcsawiudvihxeddc.supabase.co/functions/v1';

const sections = [
  { id: 'overview', label: 'Übersicht', icon: Book },
  { id: 'auth', label: 'Authentifizierung', icon: Key },
  { id: 'ratelimits', label: 'Rate Limits', icon: Clock },
  { id: 'errors', label: 'Fehlercodes', icon: AlertTriangle },
  { id: 'security', label: 'Sicherheit', icon: Shield },
  { id: 'leads', label: 'Leads', icon: Users },
  { id: 'calls', label: 'Anrufe', icon: Phone },
  { id: 'campaigns', label: 'Kampagnen', icon: Megaphone },
  { id: 'agent', label: 'Agent Actions', icon: Bot },
  { id: 'leadgen', label: 'Lead-Generierung', icon: Search },
];

export default function ApiDocs() {
  const [activeSection, setActiveSection] = useState('overview');

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-muted/30 hidden lg:block">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <Book className="w-5 h-5" />
            API Dokumentation
          </h2>
        </div>
        <ScrollArea className="h-[calc(100%-60px)]">
          <nav className="p-2 space-y-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <section.icon className="w-4 h-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="max-w-4xl mx-auto p-6 space-y-12">
          {/* Overview */}
          <section id="overview" className="space-y-4">
            <h1 className="text-3xl font-bold">API Dokumentation</h1>
            <p className="text-lg text-muted-foreground">
              Willkommen zur API-Dokumentation. Hier findest du alle Informationen, um 
              programmatisch auf Leads, Anrufe und Kampagnen zuzugreifen.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-medium mb-2">Base URL</h3>
                <code className="text-sm bg-muted px-2 py-1 rounded break-all">
                  {BASE_URL}
                </code>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-medium mb-2">API Keys</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  Erstelle und verwalte deine API-Keys in den Einstellungen.
                </p>
                <Link to="/app/settings">
                  <Button variant="outline" size="sm" className="gap-2">
                    Zu den Einstellungen
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          <Separator />

          {/* Authentication */}
          <section id="auth" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Key className="w-6 h-6" />
              Authentifizierung
            </h2>
            <p className="text-muted-foreground">
              Alle API-Anfragen müssen mit einem Bearer Token im Authorization-Header authentifiziert werden.
            </p>

            <CodeBlock
              code={`curl -X GET "${BASE_URL}/your-endpoint" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}
              language="bash"
            />

            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r-lg">
              <p className="text-sm">
                <strong>Wichtig:</strong> Behandle deinen API-Key wie ein Passwort. 
                Teile ihn niemals öffentlich und speichere ihn nicht in Client-seitigem Code.
              </p>
            </div>
          </section>

          <Separator />

          {/* Rate Limits */}
          <section id="ratelimits" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6" />
              Rate Limits
            </h2>
            <p className="text-muted-foreground">
              Um eine faire Nutzung zu gewährleisten und die API-Stabilität zu sichern, 
              gelten folgende Rate Limits:
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-medium mb-3">Standard-Limits</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anfragen pro Minute</span>
                    <Badge variant="secondary">60</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anfragen pro Stunde</span>
                    <Badge variant="secondary">1.000</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anfragen pro Tag</span>
                    <Badge variant="secondary">10.000</Badge>
                  </div>
                </div>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <h3 className="font-medium mb-3">Anruf-Limits</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Gleichzeitige Anrufe</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anrufe pro Stunde</span>
                    <Badge variant="secondary">50</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Anrufe pro Tag</span>
                    <Badge variant="secondary">500</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-l-4 border-blue-500 bg-blue-500/10 rounded-r-lg">
              <h4 className="font-medium mb-2">Rate Limit Header</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Jede API-Antwort enthält Header mit Informationen zum aktuellen Rate Limit Status:
              </p>
              <CodeBlock
                code={`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1705234567`}
                language="http"
              />
            </div>

            <div className="p-4 border-l-4 border-yellow-500 bg-yellow-500/10 rounded-r-lg">
              <p className="text-sm">
                <strong>Limit überschritten?</strong> Bei Überschreitung erhältst du einen 
                <code className="mx-1 px-1 bg-muted rounded">429 Too Many Requests</code> 
                Fehler. Warte die angegebene Zeit ab oder kontaktiere uns für höhere Limits.
              </p>
            </div>
          </section>

          <Separator />

          {/* Error Codes */}
          <section id="errors" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="w-6 h-6" />
              Fehlercodes
            </h2>
            <p className="text-muted-foreground">
              Die API verwendet Standard-HTTP-Statuscodes und gibt detaillierte Fehlermeldungen zurück.
            </p>

            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium">Code</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Beschreibung</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="p-3"><Badge variant="secondary">200</Badge></td>
                    <td className="p-3 font-medium text-green-600">OK</td>
                    <td className="p-3 text-muted-foreground">Anfrage erfolgreich</td>
                  </tr>
                  <tr>
                    <td className="p-3"><Badge variant="secondary">201</Badge></td>
                    <td className="p-3 font-medium text-green-600">Created</td>
                    <td className="p-3 text-muted-foreground">Ressource erfolgreich erstellt</td>
                  </tr>
                  <tr>
                    <td className="p-3"><Badge variant="secondary">400</Badge></td>
                    <td className="p-3 font-medium text-yellow-600">Bad Request</td>
                    <td className="p-3 text-muted-foreground">Ungültige Parameter oder fehlende Pflichtfelder</td>
                  </tr>
                  <tr>
                    <td className="p-3"><Badge variant="secondary">401</Badge></td>
                    <td className="p-3 font-medium text-red-600">Unauthorized</td>
                    <td className="p-3 text-muted-foreground">Fehlender oder ungültiger API-Key</td>
                  </tr>
                  <tr>
                    <td className="p-3"><Badge variant="secondary">403</Badge></td>
                    <td className="p-3 font-medium text-red-600">Forbidden</td>
                    <td className="p-3 text-muted-foreground">Keine Berechtigung für diese Ressource</td>
                  </tr>
                  <tr>
                    <td className="p-3"><Badge variant="secondary">404</Badge></td>
                    <td className="p-3 font-medium text-yellow-600">Not Found</td>
                    <td className="p-3 text-muted-foreground">Ressource nicht gefunden</td>
                  </tr>
                  <tr>
                    <td className="p-3"><Badge variant="secondary">429</Badge></td>
                    <td className="p-3 font-medium text-orange-600">Too Many Requests</td>
                    <td className="p-3 text-muted-foreground">Rate Limit überschritten</td>
                  </tr>
                  <tr>
                    <td className="p-3"><Badge variant="secondary">500</Badge></td>
                    <td className="p-3 font-medium text-red-600">Server Error</td>
                    <td className="p-3 text-muted-foreground">Interner Serverfehler</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Fehler-Antwort Format</h4>
              <CodeBlock
                code={`{
  "success": false,
  "error": "Fehlermeldung hier",
  "code": "ERROR_CODE",
  "details": {
    "field": "phone_number",
    "reason": "Invalid format. Use E.164 format (+49...)"
  }
}`}
                language="json"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Häufige Fehlercodes</h4>
              <div className="grid gap-2 text-sm">
                <div className="p-3 border rounded-lg flex items-start gap-3">
                  <code className="bg-muted px-2 py-1 rounded text-xs">INVALID_PHONE_NUMBER</code>
                  <span className="text-muted-foreground">Telefonnummer muss im E.164 Format sein (+491234567890)</span>
                </div>
                <div className="p-3 border rounded-lg flex items-start gap-3">
                  <code className="bg-muted px-2 py-1 rounded text-xs">LEAD_NOT_FOUND</code>
                  <span className="text-muted-foreground">Der angegebene Lead existiert nicht oder gehört einem anderen User</span>
                </div>
                <div className="p-3 border rounded-lg flex items-start gap-3">
                  <code className="bg-muted px-2 py-1 rounded text-xs">CAMPAIGN_INACTIVE</code>
                  <span className="text-muted-foreground">Die Kampagne ist deaktiviert und kann nicht verwendet werden</span>
                </div>
                <div className="p-3 border rounded-lg flex items-start gap-3">
                  <code className="bg-muted px-2 py-1 rounded text-xs">CALL_LIMIT_REACHED</code>
                  <span className="text-muted-foreground">Maximale Anzahl gleichzeitiger Anrufe erreicht</span>
                </div>
                <div className="p-3 border rounded-lg flex items-start gap-3">
                  <code className="bg-muted px-2 py-1 rounded text-xs">INSUFFICIENT_CREDITS</code>
                  <span className="text-muted-foreground">Nicht genügend Credits für diese Aktion verfügbar</span>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          {/* Security */}
          <section id="security" className="space-y-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Sicherheit
            </h2>
            <p className="text-muted-foreground">
              Alle API-Anfragen sind durch mehrere Sicherheitsebenen geschützt.
            </p>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-medium">Datenisolation</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Jeder API-Key ist an einen Benutzer gebunden. Du kannst nur auf deine 
                  eigenen Leads, Kampagnen und Anrufe zugreifen.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Key className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-medium">Token-Validierung</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alle Anfragen werden gegen deine Benutzer-ID validiert. 
                  Fremde Ressourcen sind nicht abrufbar.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-medium">RLS Policies</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Datenbankzugriffe sind durch Row-Level-Security abgesichert. 
                  Selbst bei einem Fehler im Code sind deine Daten geschützt.
                </p>
              </div>
              <div className="p-4 border rounded-lg bg-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Key className="w-4 h-4 text-green-600" />
                  </div>
                  <h3 className="font-medium">HTTPS Only</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Alle API-Verbindungen sind SSL-verschlüsselt. 
                  Unverschlüsselte HTTP-Anfragen werden abgelehnt.
                </p>
              </div>
            </div>

            <div className="p-4 border-l-4 border-green-500 bg-green-500/10 rounded-r-lg">
              <h4 className="font-medium mb-2">✓ Vollständige Datenisolation</h4>
              <p className="text-sm text-muted-foreground">
                Jeder Benutzer kann ausschließlich auf seine eigenen Ressourcen zugreifen. 
                Es ist technisch nicht möglich, auf Leads, Kampagnen oder Anrufe anderer 
                Benutzer zuzugreifen - auch nicht mit einem gültigen API-Key.
              </p>
            </div>
          </section>

          <Separator />

          {/* Leads API */}
          <section id="leads" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6" />
              Leads API
            </h2>
            <p className="text-muted-foreground">
              Verwalte deine Leads programmatisch - erstellen, abrufen, aktualisieren und löschen.
            </p>

            <ApiEndpoint
              method="GET"
              path="/leads"
              description="Ruft alle Leads ab. Optional mit Filtern für Status, Kampagne oder Suchbegriff."
              requestParams={[
                { name: 'status', type: 'string', required: false, description: 'Filter nach Status (new, called, interested, etc.)' },
                { name: 'campaign_id', type: 'uuid', required: false, description: 'Filter nach Kampagnen-ID' },
                { name: 'search', type: 'string', required: false, description: 'Suchbegriff für Name, Firma oder E-Mail' },
              ]}
              exampleRequest={{
                curl: `curl -X GET "${BASE_URL}/leads?status=new" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
                javascript: `const response = await fetch("${BASE_URL}/leads?status=new", {
  headers: {
    "Authorization": "Bearer YOUR_API_KEY"
  }
});
const leads = await response.json();`,
                python: `import requests

response = requests.get(
    "${BASE_URL}/leads",
    params={"status": "new"},
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
leads = response.json()`,
              }}
              exampleResponse={`{
  "success": true,
  "data": [
    {
      "id": "uuid-123",
      "first_name": "Max",
      "last_name": "Mustermann",
      "company": "Muster GmbH",
      "phone_number": "+491234567890",
      "email": "max@muster.de",
      "status": "new",
      "created_at": "2025-01-14T10:00:00Z"
    }
  ]
}`}
            />

            <ApiEndpoint
              method="POST"
              path="/leads"
              description="Erstellt einen neuen Lead."
              requestParams={[
                { name: 'first_name', type: 'string', required: true, description: 'Vorname des Leads' },
                { name: 'last_name', type: 'string', required: false, description: 'Nachname des Leads' },
                { name: 'phone_number', type: 'string', required: true, description: 'Telefonnummer im E.164 Format' },
                { name: 'email', type: 'string', required: false, description: 'E-Mail-Adresse' },
                { name: 'company', type: 'string', required: false, description: 'Firmenname' },
                { name: 'campaign_id', type: 'uuid', required: false, description: 'Zugehörige Kampagnen-ID' },
                { name: 'notes', type: 'string', required: false, description: 'Notizen zum Lead' },
              ]}
              exampleRequest={{
                curl: `curl -X POST "${BASE_URL}/leads" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "first_name": "Max",
    "last_name": "Mustermann",
    "phone_number": "+491234567890",
    "company": "Muster GmbH"
  }'`,
                javascript: `const response = await fetch("${BASE_URL}/leads", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    first_name: "Max",
    last_name: "Mustermann",
    phone_number: "+491234567890",
    company: "Muster GmbH"
  })
});
const lead = await response.json();`,
                python: `import requests

response = requests.post(
    "${BASE_URL}/leads",
    json={
        "first_name": "Max",
        "last_name": "Mustermann",
        "phone_number": "+491234567890",
        "company": "Muster GmbH"
    },
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
lead = response.json()`,
              }}
              exampleResponse={`{
  "success": true,
  "data": {
    "id": "uuid-456",
    "first_name": "Max",
    "last_name": "Mustermann",
    "company": "Muster GmbH",
    "phone_number": "+491234567890",
    "status": "new",
    "created_at": "2025-01-14T10:00:00Z"
  }
}`}
            />
          </section>

          <Separator />

          {/* Calls API */}
          <section id="calls" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Phone className="w-6 h-6" />
              Anrufe API
            </h2>
            <p className="text-muted-foreground">
              Starte und verwalte KI-gestützte Anrufe über die API.
            </p>

            <ApiEndpoint
              method="POST"
              path="/start-call"
              description="Startet einen ausgehenden Telefonanruf über den KI-Agenten."
              requestParams={[
                { name: 'to', type: 'string', required: true, description: 'Telefonnummer im E.164 Format (+49...)' },
                { name: 'leadId', type: 'uuid', required: false, description: 'ID des verknüpften Leads' },
                { name: 'campaignId', type: 'uuid', required: false, description: 'ID der Kampagne für den Anruf-Kontext' },
                { name: 'campaignPrompt', type: 'string', required: false, description: 'Custom Prompt für den KI-Agenten' },
              ]}
              exampleRequest={{
                curl: `curl -X POST "${BASE_URL}/start-call" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "+491234567890",
    "leadId": "uuid-123",
    "campaignId": "uuid-456"
  }'`,
                javascript: `const response = await fetch("${BASE_URL}/start-call", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    to: "+491234567890",
    leadId: "uuid-123",
    campaignId: "uuid-456"
  })
});
const call = await response.json();`,
                python: `import requests

response = requests.post(
    "${BASE_URL}/start-call",
    json={
        "to": "+491234567890",
        "leadId": "uuid-123",
        "campaignId": "uuid-456"
    },
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
call = response.json()`,
              }}
              exampleResponse={`{
  "success": true,
  "callSid": "call_abc123",
  "roomName": "outbound-1705234567890",
  "callLogId": "uuid-789",
  "status": "calling"
}`}
            />

            <ApiEndpoint
              method="POST"
              path="/end-call"
              description="Beendet einen laufenden Anruf und aktualisiert den Call-Log."
              requestParams={[
                { name: 'callLogId', type: 'uuid', required: true, description: 'ID des Call-Logs' },
                { name: 'outcome', type: 'string', required: false, description: 'Ergebnis: interested, not_interested, callback_scheduled, etc.' },
                { name: 'summary', type: 'string', required: false, description: 'Zusammenfassung des Gesprächs' },
                { name: 'transcript', type: 'string', required: false, description: 'Vollständiges Transkript' },
              ]}
              exampleRequest={{
                curl: `curl -X POST "${BASE_URL}/end-call" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "callLogId": "uuid-789",
    "outcome": "interested",
    "summary": "Kunde interessiert an Produkt X"
  }'`,
                javascript: `const response = await fetch("${BASE_URL}/end-call", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    callLogId: "uuid-789",
    outcome: "interested",
    summary: "Kunde interessiert an Produkt X"
  })
});`,
                python: `import requests

response = requests.post(
    "${BASE_URL}/end-call",
    json={
        "callLogId": "uuid-789",
        "outcome": "interested",
        "summary": "Kunde interessiert an Produkt X"
    },
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)`,
              }}
              exampleResponse={`{
  "success": true,
  "message": "Call ended successfully"
}`}
            />
          </section>

          <Separator />

          {/* Campaigns API */}
          <section id="campaigns" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Megaphone className="w-6 h-6" />
              Kampagnen API
            </h2>
            <p className="text-muted-foreground">
              Erstelle KI-generierte Kampagnen basierend auf deinen Produkten und Zielgruppen.
            </p>

            <ApiEndpoint
              method="POST"
              path="/generate-campaign-ai"
              description="Generiert eine vollständige Kampagne mit KI-Prompt, Einwandbehandlung und mehr."
              requestParams={[
                { name: 'campaignName', type: 'string', required: true, description: 'Name der Kampagne' },
                { name: 'targetGroup', type: 'string', required: true, description: 'Beschreibung der Zielgruppe' },
                { name: 'productDescription', type: 'string', required: true, description: 'Was wird verkauft/angeboten?' },
                { name: 'callGoal', type: 'string', required: true, description: 'Ziel des Anrufs (Termin, Verkauf, etc.)' },
                { name: 'tonality', type: 'number', required: false, description: 'Tonalität 0-100 (formell bis locker)' },
                { name: 'salesStyle', type: 'number', required: false, description: 'Vertriebsstil 0-100 (soft bis assertive)' },
              ]}
              exampleRequest={{
                curl: `curl -X POST "${BASE_URL}/generate-campaign-ai" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "campaignName": "SaaS Q1 2025",
    "targetGroup": "IT-Leiter in mittelständischen Unternehmen",
    "productDescription": "Cloud-basierte ERP-Lösung",
    "callGoal": "Demo-Termin vereinbaren",
    "tonality": 60,
    "salesStyle": 50
  }'`,
                javascript: `const response = await fetch("${BASE_URL}/generate-campaign-ai", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    campaignName: "SaaS Q1 2025",
    targetGroup: "IT-Leiter in mittelständischen Unternehmen",
    productDescription: "Cloud-basierte ERP-Lösung",
    callGoal: "Demo-Termin vereinbaren",
    tonality: 60,
    salesStyle: 50
  })
});
const campaign = await response.json();`,
                python: `import requests

response = requests.post(
    "${BASE_URL}/generate-campaign-ai",
    json={
        "campaignName": "SaaS Q1 2025",
        "targetGroup": "IT-Leiter in mittelständischen Unternehmen",
        "productDescription": "Cloud-basierte ERP-Lösung",
        "callGoal": "Demo-Termin vereinbaren",
        "tonality": 60,
        "salesStyle": 50
    },
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
campaign = response.json()`,
              }}
              exampleResponse={`{
  "success": true,
  "campaign": {
    "name": "SaaS Q1 2025",
    "aiPrompt": "Du bist ein professioneller Vertriebsmitarbeiter...",
    "callGoal": "Demo-Termin vereinbaren",
    "targetGroup": "IT-Leiter in mittelständischen Unternehmen",
    "productDescription": "Cloud-basierte ERP-Lösung",
    "advancedSettings": {
      "formality": "du",
      "responseLength": "medium",
      "emotionLevel": "medium"
    },
    "objectionHandling": {
      "objections": [
        {
          "objection": "Wir haben bereits ein ERP-System",
          "response": "Das verstehe ich. Viele unserer Kunden..."
        }
      ],
      "closingStrategy": "medium",
      "fallbackResponse": "Ich verstehe Ihre Bedenken..."
    }
  }
}`}
            />
          </section>

          <Separator />

          {/* Agent Actions */}
          <section id="agent" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Bot className="w-6 h-6" />
              Agent Actions
            </h2>
            <p className="text-muted-foreground">
              Aktionen, die der KI-Agent während eines Anrufs ausführen kann.
            </p>

            <ApiEndpoint
              method="POST"
              path="/agent-actions"
              description="Führt eine Agent-Aktion aus (E-Mail senden, Meeting erstellen, etc.)."
              requestParams={[
                { name: 'action', type: 'string', required: true, description: 'Aktion: send_email, create_meeting, update_lead_status' },
                { name: 'leadId', type: 'uuid', required: true, description: 'ID des betroffenen Leads' },
                { name: 'callLogId', type: 'uuid', required: false, description: 'ID des aktuellen Call-Logs' },
                { name: 'data', type: 'object', required: true, description: 'Aktions-spezifische Daten' },
              ]}
              exampleRequest={{
                curl: `curl -X POST "${BASE_URL}/agent-actions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "action": "send_email",
    "leadId": "uuid-123",
    "data": {
      "templateId": "follow-up",
      "meetingLink": "https://cal.com/..."
    }
  }'`,
                javascript: `const response = await fetch("${BASE_URL}/agent-actions", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    action: "send_email",
    leadId: "uuid-123",
    data: {
      templateId: "follow-up",
      meetingLink: "https://cal.com/..."
    }
  })
});`,
                python: `import requests

response = requests.post(
    "${BASE_URL}/agent-actions",
    json={
        "action": "send_email",
        "leadId": "uuid-123",
        "data": {
            "templateId": "follow-up",
            "meetingLink": "https://cal.com/..."
        }
    },
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)`,
              }}
              exampleResponse={`{
  "success": true,
  "action": "send_email",
  "message": "E-Mail erfolgreich gesendet"
}`}
            />
          </section>

          <Separator />

          {/* Lead Generation */}
          <section id="leadgen" className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Search className="w-6 h-6" />
              Lead-Generierung
            </h2>
            <p className="text-muted-foreground">
              Generiere Leads automatisch durch Web-Scraping von Unternehmenswebsites.
            </p>

            <ApiEndpoint
              method="POST"
              path="/firecrawl-generate-leads"
              description="Scraped Websites und extrahiert Kontaktinformationen als neue Leads."
              requestParams={[
                { name: 'query', type: 'string', required: true, description: 'Suchbegriff oder Branche' },
                { name: 'location', type: 'string', required: false, description: 'Geografische Einschränkung' },
                { name: 'limit', type: 'number', required: false, description: 'Maximale Anzahl Leads (default: 10)' },
                { name: 'campaignId', type: 'uuid', required: false, description: 'Kampagne für neue Leads' },
              ]}
              exampleRequest={{
                curl: `curl -X POST "${BASE_URL}/firecrawl-generate-leads" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "IT Dienstleister",
    "location": "München",
    "limit": 20
  }'`,
                javascript: `const response = await fetch("${BASE_URL}/firecrawl-generate-leads", {
  method: "POST",
  headers: {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    query: "IT Dienstleister",
    location: "München",
    limit: 20
  })
});
const leads = await response.json();`,
                python: `import requests

response = requests.post(
    "${BASE_URL}/firecrawl-generate-leads",
    json={
        "query": "IT Dienstleister",
        "location": "München",
        "limit": 20
    },
    headers={"Authorization": "Bearer YOUR_API_KEY"}
)
leads = response.json()`,
              }}
              exampleResponse={`{
  "success": true,
  "leads": [
    {
      "id": "uuid-new-1",
      "first_name": "Thomas",
      "last_name": "Schmidt",
      "company": "IT Solutions GmbH",
      "phone_number": "+4989123456",
      "email": "t.schmidt@itsolutions.de"
    }
  ],
  "count": 15
}`}
            />
          </section>

          {/* Footer spacing */}
          <div className="h-20" />
        </div>
      </ScrollArea>
    </div>
  );
}
