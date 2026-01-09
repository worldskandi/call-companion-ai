import { useState, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, isSameDay, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarDays, Clock, User, Building2, Video, Mail, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface Meeting {
  id: string;
  meeting_scheduled_at: string;
  meeting_link: string | null;
  meeting_link_sent_via: string | null;
  lead_first_name: string;
  lead_last_name: string | null;
  lead_company: string | null;
  campaign_name: string | null;
}

export function MeetingsCalendar() {
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

  // Upcoming meetings (next 7 days)
  const upcomingMeetings = useMemo(() => {
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return meetings.filter((m) => {
      const date = parseISO(m.meeting_scheduled_at);
      return date >= now && date <= nextWeek;
    });
  }, [meetings]);

  const getSentViaIcon = (via: string | null) => {
    if (via === "email") return <Mail className="h-3 w-3" />;
    if (via === "sms") return <MessageSquare className="h-3 w-3" />;
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          Geplante Meetings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
              backgroundColor: "hsl(var(--primary) / 0.1)",
              fontWeight: "bold",
              color: "hsl(var(--primary))",
            },
          }}
        />

        {/* Selected Date Meetings */}
        {selectedDate && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">
              {format(selectedDate, "EEEE, d. MMMM", { locale: de })}
            </h4>
            {selectedDateMeetings.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Keine Meetings an diesem Tag
              </p>
            ) : (
              <ScrollArea className="h-[150px]">
                <div className="space-y-2">
                  {selectedDateMeetings.map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        )}

        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <div className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-medium">Nächste 7 Tage</h4>
            <ScrollArea className="h-[200px]">
              <div className="space-y-2">
                {upcomingMeetings.map((meeting) => (
                  <MeetingCard key={meeting.id} meeting={meeting} showDate />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {isLoading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MeetingCard({ meeting, showDate = false }: { meeting: Meeting; showDate?: boolean }) {
  const meetingDate = parseISO(meeting.meeting_scheduled_at);
  const leadName = `${meeting.lead_first_name}${meeting.lead_last_name ? " " + meeting.lead_last_name : ""}`;

  return (
    <div className="rounded-lg border bg-card p-3 space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium text-sm">{leadName}</span>
        </div>
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
      </div>

      {meeting.lead_company && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Building2 className="h-3 w-3" />
          {meeting.lead_company}
        </div>
      )}

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="h-3 w-3" />
        {showDate && format(meetingDate, "dd.MM.", { locale: de })}
        {format(meetingDate, "HH:mm", { locale: de })} Uhr
      </div>

      {meeting.meeting_link && (
        <a
          href={meeting.meeting_link}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-primary hover:underline"
        >
          <Video className="h-3 w-3" />
          Google Meet beitreten
        </a>
      )}

      {meeting.campaign_name && (
        <Badge variant="secondary" className="text-xs">
          {meeting.campaign_name}
        </Badge>
      )}
    </div>
  );
}
