import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay, parseISO, isAfter, isBefore, startOfDay } from "date-fns";
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
  ExternalLink
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

interface Meeting {
  id: string;
  meeting_scheduled_at: string;
  meeting_link: string | null;
  meeting_link_sent_via: string | null;
  lead_first_name: string;
  lead_last_name: string | null;
  lead_company: string | null;
  campaign_name: string | null;
  lead_id: string;
}

const Meetings = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const { data: meetings = [], isLoading } = useQuery({
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
        meeting_scheduled_at: item.meeting_scheduled_at,
        meeting_link: item.meeting_link,
        meeting_link_sent_via: item.meeting_link_sent_via,
        lead_id: item.lead_id,
        lead_first_name: item.leads?.first_name || "",
        lead_last_name: item.leads?.last_name || null,
        lead_company: item.leads?.company || null,
        campaign_name: item.campaigns?.name || null,
      })) as Meeting[];
    },
  });

  // Get dates that have meetings for calendar highlighting
  const meetingDates = useMemo(() => {
    return meetings.map((m) => parseISO(m.meeting_scheduled_at));
  }, [meetings]);

  // Filter meetings for selected date
  const selectedDateMeetings = useMemo(() => {
    if (!selectedDate) return [];
    return meetings.filter((m) =>
      isSameDay(parseISO(m.meeting_scheduled_at), selectedDate)
    );
  }, [meetings, selectedDate]);

  // Categorize meetings
  const today = startOfDay(new Date());
  
  const upcomingMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const date = startOfDay(parseISO(m.meeting_scheduled_at));
      return isAfter(date, today) || isSameDay(date, today);
    });
  }, [meetings, today]);

  const pastMeetings = useMemo(() => {
    return meetings.filter((m) => {
      const date = startOfDay(parseISO(m.meeting_scheduled_at));
      return isBefore(date, today);
    }).reverse();
  }, [meetings, today]);

  const todayMeetings = useMemo(() => {
    return meetings.filter((m) =>
      isSameDay(parseISO(m.meeting_scheduled_at), today)
    );
  }, [meetings, today]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Termine</h1>
          <p className="text-muted-foreground">
            Alle geplanten Meetings aus deinen Anrufen
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="gap-2 py-1.5 px-3">
            <CalendarCheck className="h-4 w-4 text-primary" />
            {upcomingMeetings.length} anstehend
          </Badge>
          <Badge variant="outline" className="gap-2 py-1.5 px-3">
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
            {todayMeetings.length} heute
          </Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Kalender
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              locale={de}
              className="rounded-md border"
              modifiers={{
                hasMeeting: meetingDates,
              }}
              modifiersStyles={{
                hasMeeting: {
                  backgroundColor: "hsl(var(--primary) / 0.15)",
                  fontWeight: "bold",
                  color: "hsl(var(--primary))",
                },
              }}
            />

            {/* Selected Date Preview */}
            {selectedDate && (
              <div className="mt-4 pt-4 border-t space-y-2">
                <h4 className="text-sm font-medium">
                  {format(selectedDate, "EEEE, d. MMMM yyyy", { locale: de })}
                </h4>
                {selectedDateMeetings.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Keine Meetings an diesem Tag
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {selectedDateMeetings.length} Meeting{selectedDateMeetings.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meetings List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Meetings</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upcoming" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming" className="gap-2">
                  <CalendarCheck className="h-4 w-4" />
                  Anstehend ({upcomingMeetings.length})
                </TabsTrigger>
                <TabsTrigger value="today" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Heute ({todayMeetings.length})
                </TabsTrigger>
                <TabsTrigger value="past" className="gap-2">
                  <CalendarClock className="h-4 w-4" />
                  Vergangen ({pastMeetings.length})
                </TabsTrigger>
                {selectedDate && (
                  <TabsTrigger value="selected" className="gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {format(selectedDate, "dd.MM.", { locale: de })} ({selectedDateMeetings.length})
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="upcoming">
                <MeetingsList 
                  meetings={upcomingMeetings} 
                  isLoading={isLoading} 
                  emptyMessage="Keine anstehenden Meetings"
                  showDate
                  onLeadClick={(id) => navigate(`/app/leads/${id}`)}
                />
              </TabsContent>

              <TabsContent value="today">
                <MeetingsList 
                  meetings={todayMeetings} 
                  isLoading={isLoading} 
                  emptyMessage="Keine Meetings heute"
                  onLeadClick={(id) => navigate(`/app/leads/${id}`)}
                />
              </TabsContent>

              <TabsContent value="past">
                <MeetingsList 
                  meetings={pastMeetings} 
                  isLoading={isLoading} 
                  emptyMessage="Keine vergangenen Meetings"
                  showDate
                  onLeadClick={(id) => navigate(`/app/leads/${id}`)}
                />
              </TabsContent>

              <TabsContent value="selected">
                <MeetingsList 
                  meetings={selectedDateMeetings} 
                  isLoading={isLoading} 
                  emptyMessage={`Keine Meetings am ${selectedDate ? format(selectedDate, "dd.MM.yyyy", { locale: de }) : ''}`}
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

interface MeetingsListProps {
  meetings: Meeting[];
  isLoading: boolean;
  emptyMessage: string;
  showDate?: boolean;
  onLeadClick: (leadId: string) => void;
}

function MeetingsList({ meetings, isLoading, emptyMessage, showDate = false, onLeadClick }: MeetingsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (meetings.length === 0) {
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
        {meetings.map((meeting) => (
          <MeetingCard 
            key={meeting.id} 
            meeting={meeting} 
            showDate={showDate}
            onLeadClick={onLeadClick}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface MeetingCardProps {
  meeting: Meeting;
  showDate?: boolean;
  onLeadClick: (leadId: string) => void;
}

function MeetingCard({ meeting, showDate = false, onLeadClick }: MeetingCardProps) {
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

export default Meetings;
