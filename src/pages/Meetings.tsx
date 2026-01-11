import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { format, isSameDay, parseISO, isAfter, isBefore, startOfDay, addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { de } from "date-fns/locale";
import { 
  CalendarDays, 
  Clock, 
  User, 
  Building2, 
  Video, 
  Mail, 
  MessageSquare,
  CalendarCheck,
  CalendarClock,
  ExternalLink,
  Users,
  MapPin,
  Link2,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

// Internal meeting from call_logs
interface InternalMeeting {
  id: string;
  type: 'internal';
  meeting_scheduled_at: string;
  meeting_link: string | null;
  meeting_link_sent_via: string | null;
  lead_first_name: string;
  lead_last_name: string | null;
  lead_company: string | null;
  campaign_name: string | null;
  lead_id: string;
}

// Google Calendar event
interface GoogleCalendarEvent {
  id: string;
  type: 'google';
  title: string;
  description: string | null;
  start: string;
  end: string;
  location: string | null;
  htmlLink: string;
  hangoutLink: string | null;
  attendees: Array<{
    email: string;
    displayName?: string;
    responseStatus: string;
  }>;
  isAllDay: boolean;
  status: string;
  organizer: {
    email: string;
    displayName?: string;
    self: boolean;
  } | null;
}

type UnifiedEvent = InternalMeeting | GoogleCalendarEvent;

type CalendarView = 'month' | 'two-months' | 'week';

const Meetings = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [calendarView, setCalendarView] = useState<CalendarView>('month');

  // Fetch internal meetings from call_logs
  const { data: internalMeetings = [], isLoading: loadingInternal } = useQuery({
    queryKey: ["scheduled-meetings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("call_logs")
        .select(`
          id,
          meeting_scheduled_at,
          meeting_link,
          meeting_link_sent_via,
          lead_id,
          leads!inner(first_name, last_name, company),
          campaigns(name)
        `)
        .not("meeting_scheduled_at", "is", null)
        .order("meeting_scheduled_at", { ascending: true });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        id: item.id,
        type: 'internal' as const,
        meeting_scheduled_at: item.meeting_scheduled_at,
        meeting_link: item.meeting_link,
        meeting_link_sent_via: item.meeting_link_sent_via,
        lead_id: item.lead_id,
        lead_first_name: item.leads?.first_name || "",
        lead_last_name: item.leads?.last_name || null,
        lead_company: item.leads?.company || null,
        campaign_name: item.campaigns?.name || null,
      })) as InternalMeeting[];
    },
  });

  // Fetch Google Calendar events
  const { 
    data: googleData, 
    isLoading: loadingGoogle, 
    error: googleError,
    refetch: refetchGoogle 
  } = useQuery({
    queryKey: ["google-calendar-events"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
      const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days ahead

      const response = await supabase.functions.invoke('get-calendar-events', {
        body: null,
        headers: {},
      });

      if (response.error) throw response.error;
      return response.data as { events: GoogleCalendarEvent[]; connected: boolean; error?: string };
    },
    retry: false,
  });

  const googleEvents = useMemo(() => {
    if (!googleData?.events) return [];
    return googleData.events.map(e => ({ ...e, type: 'google' as const }));
  }, [googleData]);

  const isGoogleConnected = googleData?.connected ?? false;

  // Combine all events
  const allEvents = useMemo((): UnifiedEvent[] => {
    const internal = internalMeetings.map(m => ({ ...m, sortDate: m.meeting_scheduled_at }));
    const google = googleEvents.map(e => ({ ...e, sortDate: e.start }));
    return [...internal, ...google].sort((a, b) => 
      new Date(a.sortDate).getTime() - new Date(b.sortDate).getTime()
    );
  }, [internalMeetings, googleEvents]);

  // Get dates that have events for calendar highlighting
  const eventDates = useMemo(() => {
    return allEvents.map((e) => {
      if (e.type === 'internal') return parseISO(e.meeting_scheduled_at);
      return parseISO(e.start);
    });
  }, [allEvents]);

  // Filter events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return allEvents.filter((e) => {
      const date = e.type === 'internal' 
        ? parseISO(e.meeting_scheduled_at) 
        : parseISO(e.start);
      return isSameDay(date, selectedDate);
    });
  }, [allEvents, selectedDate]);

  // Categorize events
  const today = startOfDay(new Date());
  
  const upcomingEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const date = startOfDay(e.type === 'internal' 
        ? parseISO(e.meeting_scheduled_at) 
        : parseISO(e.start));
      return isAfter(date, today) || isSameDay(date, today);
    });
  }, [allEvents, today]);

  const pastEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const date = startOfDay(e.type === 'internal' 
        ? parseISO(e.meeting_scheduled_at) 
        : parseISO(e.start));
      return isBefore(date, today);
    }).reverse();
  }, [allEvents, today]);

  const todayEvents = useMemo(() => {
    return allEvents.filter((e) => {
      const date = e.type === 'internal' 
        ? parseISO(e.meeting_scheduled_at) 
        : parseISO(e.start);
      return isSameDay(date, today);
    });
  }, [allEvents, today]);

  // Week view days
  const weekDays = useMemo(() => {
    if (!selectedDate) return [];
    const start = startOfWeek(selectedDate, { locale: de });
    const end = endOfWeek(selectedDate, { locale: de });
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  // Events for week view
  const getEventsForDay = (day: Date) => {
    return allEvents.filter((e) => {
      const date = e.type === 'internal' 
        ? parseISO(e.meeting_scheduled_at) 
        : parseISO(e.start);
      return isSameDay(date, day);
    });
  };

  const isLoading = loadingInternal || loadingGoogle;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Termine</h1>
          <p className="text-muted-foreground">
            Alle Termine aus Anrufen und Google Calendar
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2 py-1.5 px-3">
            <CalendarCheck className="h-4 w-4 text-primary" />
            {upcomingEvents.length} anstehend
          </Badge>
          <Badge variant="outline" className="gap-2 py-1.5 px-3">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            {todayEvents.length} heute
          </Badge>
          {isGoogleConnected && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => refetchGoogle()}
              title="Google Calendar aktualisieren"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Google Calendar Status */}
      {!isGoogleConnected && !loadingGoogle && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Google Calendar ist nicht verbunden. Verbinde deinen Kalender in den Einstellungen für eine vollständige Übersicht.</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/app/settings?tab=integrations')}
            >
              Verbinden
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Grid - Calendar Full Width */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* Calendar - Large */}
        <Card className="xl:col-span-3">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Kalender
              </CardTitle>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
                  <Button 
                    variant={calendarView === 'month' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCalendarView('month')}
                    className="h-7 px-3 text-xs"
                  >
                    Monat
                  </Button>
                  <Button 
                    variant={calendarView === 'two-months' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCalendarView('two-months')}
                    className="h-7 px-3 text-xs"
                  >
                    2 Monate
                  </Button>
                  <Button 
                    variant={calendarView === 'week' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setCalendarView('week')}
                    className="h-7 px-3 text-xs"
                  >
                    Woche
                  </Button>
                </div>
                {isGoogleConnected && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    Google verbunden
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            {/* Month View */}
            {calendarView === 'month' && (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={de}
                numberOfMonths={1}
                className="rounded-md border w-full mx-auto [&_.rdp]:w-full [&_.rdp-months]:w-full [&_.rdp-month]:w-full [&_.rdp-table]:w-full [&_.rdp-tbody]:w-full [&_.rdp-row]:w-full [&_.rdp-cell]:flex-1 [&_.rdp-cell]:p-2 [&_.rdp-head_cell]:flex-1 [&_.rdp-head_cell]:h-16 [&_.rdp-head_cell]:text-lg [&_.rdp-head_cell]:font-semibold [&_.rdp-day]:h-20 [&_.rdp-day]:w-full [&_.rdp-day]:text-xl [&_.rdp-day]:font-medium [&_.rdp-caption]:py-6 [&_.rdp-caption_label]:text-2xl [&_.rdp-caption_label]:font-bold [&_.rdp-nav_button]:h-12 [&_.rdp-nav_button]:w-12 [&_.rdp-nav]:gap-3 [&_.rdp-table]:border-separate [&_.rdp-table]:border-spacing-2"
                modifiers={{
                  hasEvent: eventDates,
                }}
                modifiersStyles={{
                  hasEvent: {
                    backgroundColor: "hsl(var(--primary) / 0.15)",
                    fontWeight: "bold",
                    color: "hsl(var(--primary))",
                  },
                }}
              />
            )}

            {/* Two Months View */}
            {calendarView === 'two-months' && (
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                locale={de}
                numberOfMonths={2}
                className="rounded-md border w-full mx-auto [&_.rdp]:w-full [&_.rdp-months]:w-full [&_.rdp-months]:flex-row [&_.rdp-months]:gap-8 [&_.rdp-month]:flex-1 [&_.rdp-table]:w-full [&_.rdp-tbody]:w-full [&_.rdp-row]:w-full [&_.rdp-cell]:flex-1 [&_.rdp-cell]:p-1 [&_.rdp-head_cell]:flex-1 [&_.rdp-head_cell]:h-12 [&_.rdp-head_cell]:text-base [&_.rdp-head_cell]:font-semibold [&_.rdp-day]:h-14 [&_.rdp-day]:w-full [&_.rdp-day]:text-lg [&_.rdp-day]:font-medium [&_.rdp-caption]:py-4 [&_.rdp-caption_label]:text-xl [&_.rdp-caption_label]:font-bold [&_.rdp-nav_button]:h-10 [&_.rdp-nav_button]:w-10 [&_.rdp-nav]:gap-2 [&_.rdp-table]:border-separate [&_.rdp-table]:border-spacing-1"
                modifiers={{
                  hasEvent: eventDates,
                }}
                modifiersStyles={{
                  hasEvent: {
                    backgroundColor: "hsl(var(--primary) / 0.15)",
                    fontWeight: "bold",
                    color: "hsl(var(--primary))",
                  },
                }}
              />
            )}

            {/* Week View */}
            {calendarView === 'week' && (
              <div className="space-y-4">
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(d => addDays(d || new Date(), -7))}
                  >
                    ← Vorherige Woche
                  </Button>
                  <h3 className="text-xl font-bold">
                    {weekDays.length > 0 && (
                      <>
                        {format(weekDays[0], "d. MMM", { locale: de })} - {format(weekDays[6], "d. MMM yyyy", { locale: de })}
                      </>
                    )}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedDate(d => addDays(d || new Date(), 7))}
                  >
                    Nächste Woche →
                  </Button>
                </div>
                
                {/* Week Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {weekDays.map((day) => {
                    const dayEvents = getEventsForDay(day);
                    const isToday = isSameDay(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    
                    return (
                      <div
                        key={day.toISOString()}
                        onClick={() => setSelectedDate(day)}
                        className={`
                          rounded-lg border p-3 min-h-[140px] cursor-pointer transition-all
                          ${isToday ? 'border-primary bg-primary/5' : 'hover:border-primary/50'}
                          ${isSelected ? 'ring-2 ring-primary' : ''}
                        `}
                      >
                        <div className="text-center mb-2">
                          <div className="text-sm text-muted-foreground font-medium">
                            {format(day, "EEE", { locale: de })}
                          </div>
                          <div className={`text-2xl font-bold ${isToday ? 'text-primary' : ''}`}>
                            {format(day, "d")}
                          </div>
                        </div>
                        <div className="space-y-1">
                          {dayEvents.slice(0, 3).map((event, i) => (
                            <div
                              key={i}
                              className={`
                                text-xs p-1.5 rounded truncate
                                ${event.type === 'internal' 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'bg-blue-500/10 text-blue-600'}
                              `}
                            >
                              {event.type === 'internal' 
                                ? `${event.lead_first_name}${event.lead_last_name ? ' ' + event.lead_last_name : ''}`
                                : event.title
                              }
                            </div>
                          ))}
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{dayEvents.length - 3} mehr
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Selected Date Preview */}
            {selectedDate && calendarView !== 'week' && (
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-medium">
                      {format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })}
                    </h4>
                    <p className="text-muted-foreground">
                      {selectedDateEvents.length === 0 
                        ? "Keine Termine an diesem Tag"
                        : `${selectedDateEvents.length} Termin${selectedDateEvents.length !== 1 ? 'e' : ''}`
                      }
                    </p>
                  </div>
                  {selectedDateEvents.length > 0 && (
                    <Badge variant="secondary" className="text-sm py-1 px-3">
                      {selectedDateEvents.length}
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Events List - Sidebar */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Termine</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming" className="gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Anstehend ({upcomingEvents.length})
                </TabsTrigger>
                <TabsTrigger value="today" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Heute ({todayEvents.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <CalendarClock className="h-4 w-4" />
                  Vergangen ({pastEvents.length})
                </TabsTrigger>
                {selectedDate && (
                  <TabsTrigger value="selected" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {format(selectedDate, "dd.MM.", { locale: de })} ({selectedDateEvents.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="upcoming">
                <EventsList 
                  events={upcomingEvents} 
                  isLoading={isLoading} 
                  emptyMessage="Keine anstehenden Termine"
                  showDate
                  onLeadClick={(id) => navigate(`/app/leads/${id}`)}
                />
              </TabsContent>

              <TabsContent value="today">
                <EventsList 
                  events={todayEvents} 
                  isLoading={isLoading} 
                  emptyMessage="Keine Termine heute"
                  onLeadClick={(id) => navigate(`/app/leads/${id}`)}
                />
              </TabsContent>

              <TabsContent value="past">
                <EventsList 
                  events={pastEvents} 
                  isLoading={isLoading} 
                  emptyMessage="Keine vergangenen Termine"
                  showDate
                  onLeadClick={(id) => navigate(`/app/leads/${id}`)}
                />
              </TabsContent>

              <TabsContent value="selected">
                <EventsList 
                  events={selectedDateEvents} 
                  isLoading={isLoading} 
                  emptyMessage={`Keine Termine am ${selectedDate ? format(selectedDate, "dd.MM.yyyy", { locale: de }) : ''}`}
                  onLeadClick={(id) => navigate(`/app/leads/${id}`)}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

interface EventsListProps {
  events: UnifiedEvent[];
  isLoading: boolean;
  emptyMessage: string;
  showDate?: boolean;
  onLeadClick: (leadId: string) => void;
}

function EventsList({ events, isLoading, emptyMessage, showDate = false, onLeadClick }: EventsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CalendarDays className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-3">
        {events.map((event) => (
          event.type === 'internal' ? (
            <InternalMeetingCard 
              key={`internal-${event.id}`} 
              meeting={event} 
              showDate={showDate}
              onLeadClick={onLeadClick}
            />
          ) : (
            <GoogleEventCard 
              key={`google-${event.id}`} 
              event={event} 
              showDate={showDate}
            />
          )
        ))}
      </div>
    </ScrollArea>
  );
}

interface InternalMeetingCardProps {
  meeting: InternalMeeting;
  showDate?: boolean;
  onLeadClick: (leadId: string) => void;
}

function InternalMeetingCard({ meeting, showDate = false, onLeadClick }: InternalMeetingCardProps) {
  const meetingDate = parseISO(meeting.meeting_scheduled_at);
  const leadName = `${meeting.lead_first_name}${meeting.lead_last_name ? " " + meeting.lead_last_name : ""}`;
  const isPast = isBefore(meetingDate, new Date());

  return (
    <div className={`rounded-xl border bg-card p-4 space-y-3 transition-colors hover:bg-muted/30 ${isPast ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between">
        <button 
          onClick={() => onLeadClick(meeting.lead_id)}
          className="flex items-center gap-2 hover:text-primary transition-colors"
        >
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{leadName}</span>
          <ExternalLink className="h-3 w-3 text-muted-foreground" />
        </button>
        <div className="flex items-center gap-2">
          <Badge variant="default" className="text-xs bg-primary/10 text-primary border-0">
            CallFlow
          </Badge>
          {meeting.meeting_link_sent_via && (
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {meeting.meeting_link_sent_via === "email" ? (
                <Mail className="h-3 w-3" />
              ) : (
                <MessageSquare className="h-3 w-3" />
              )}
              {meeting.meeting_link_sent_via.toUpperCase()}
            </Badge>
          )}
          {meeting.campaign_name && (
            <Badge variant="secondary" className="text-xs">
              {meeting.campaign_name}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        {meeting.lead_company && (
          <div className="flex items-center gap-1.5">
            <Building2 className="h-4 w-4" />
            {meeting.lead_company}
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {showDate && format(meetingDate, "dd.MM.yyyy ", { locale: de })}
          {format(meetingDate, "HH:mm", { locale: de })} Uhr
        </div>
      </div>

      {meeting.meeting_link && (
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => window.open(meeting.meeting_link!, '_blank')}
        >
          <Video className="h-4 w-4 text-primary" />
          Google Meet beitreten
        </Button>
      )}
    </div>
  );
}

interface GoogleEventCardProps {
  event: GoogleCalendarEvent;
  showDate?: boolean;
}

function GoogleEventCard({ event, showDate = false }: GoogleEventCardProps) {
  const startDate = parseISO(event.start);
  const endDate = parseISO(event.end);
  const isPast = isBefore(startDate, new Date());

  return (
    <div className={`rounded-xl border bg-card p-4 space-y-3 transition-colors hover:bg-muted/30 ${isPast ? 'opacity-70' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{event.title}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-600 border-blue-200">
            Google Calendar
          </Badge>
          {event.isAllDay && (
            <Badge variant="secondary" className="text-xs">
              Ganztägig
            </Badge>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          {showDate && format(startDate, "dd.MM.yyyy ", { locale: de })}
          {event.isAllDay ? (
            "Ganztägig"
          ) : (
            `${format(startDate, "HH:mm", { locale: de })} - ${format(endDate, "HH:mm", { locale: de })} Uhr`
          )}
        </div>
        {event.location && (
          <div className="flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            <span className="truncate max-w-[200px]">{event.location}</span>
          </div>
        )}
        {event.attendees.length > 0 && (
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            {event.attendees.length} Teilnehmer
          </div>
        )}
      </div>

      {event.description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {event.description}
        </p>
      )}

      <div className="flex items-center gap-2">
        {event.hangoutLink && (
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => window.open(event.hangoutLink!, '_blank')}
          >
            <Video className="h-4 w-4 text-primary" />
            Google Meet beitreten
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => window.open(event.htmlLink, '_blank')}
        >
          <Link2 className="h-4 w-4" />
          In Calendar öffnen
        </Button>
      </div>
    </div>
  );
}

export default Meetings;
