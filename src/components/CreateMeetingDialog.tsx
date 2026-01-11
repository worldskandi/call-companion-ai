import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, addHours, setHours, setMinutes } from "date-fns";
import { de } from "date-fns/locale";
import { CalendarPlus, Video, Clock, Users, FileText, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

const meetingSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich").max(200, "Titel zu lang"),
  description: z.string().max(2000, "Beschreibung zu lang").optional(),
  date: z.date({ required_error: "Datum ist erforderlich" }),
  startTime: z.string().min(1, "Startzeit ist erforderlich"),
  duration: z.string().min(1, "Dauer ist erforderlich"),
  attendees: z.string().optional(),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? "00" : "30";
  return `${hours.toString().padStart(2, "0")}:${minutes}`;
});

const durationOptions = [
  { value: "15", label: "15 Minuten" },
  { value: "30", label: "30 Minuten" },
  { value: "45", label: "45 Minuten" },
  { value: "60", label: "1 Stunde" },
  { value: "90", label: "1,5 Stunden" },
  { value: "120", label: "2 Stunden" },
];

interface CreateMeetingDialogProps {
  defaultDate?: Date;
  isGoogleConnected: boolean;
}

export function CreateMeetingDialog({ defaultDate, isGoogleConnected }: CreateMeetingDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      description: "",
      date: defaultDate || new Date(),
      startTime: "09:00",
      duration: "30",
      attendees: "",
    },
  });

  // Reset form when dialog opens with new default date
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && defaultDate) {
      form.setValue("date", defaultDate);
    }
    setOpen(newOpen);
  };

  const createMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormData) => {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        throw new Error("Nicht angemeldet");
      }

      // Parse start time
      const [hours, minutes] = data.startTime.split(":").map(Number);
      const startDate = setMinutes(setHours(data.date, hours), minutes);
      const endDate = addHours(startDate, parseInt(data.duration) / 60);

      // Parse attendees
      const attendeeList = data.attendees
        ?.split(",")
        .map((email) => email.trim())
        .filter((email) => email.length > 0) || [];

      const response = await supabase.functions.invoke("create-calendar-event", {
        body: {
          title: data.title,
          description: data.description,
          startDateTime: startDate.toISOString(),
          endDateTime: endDate.toISOString(),
          attendees: attendeeList,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Fehler beim Erstellen");
      }

      if (response.data?.error) {
        throw new Error(response.data.error);
      }

      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Termin erstellt!", {
        description: data.event?.meetLink ? (
          <div className="flex flex-col gap-2 mt-2">
            <span>Google Meet Link erstellt</span>
            <a
              href={data.event.meetLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline flex items-center gap-1"
            >
              <Video className="h-3 w-3" />
              Meeting beitreten
            </a>
          </div>
        ) : undefined,
      });
      queryClient.invalidateQueries({ queryKey: ["google-calendar-events"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast.error("Fehler beim Erstellen", {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: MeetingFormData) => {
    createMeetingMutation.mutate(data);
  };

  if (!isGoogleConnected) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CalendarPlus className="h-4 w-4" />
        Google Calendar verbinden
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          Neuer Termin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Neuen Termin erstellen
          </DialogTitle>
          <DialogDescription>
            Erstelle einen neuen Termin mit Google Meet Videokonferenz.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Kundengespräch" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Datum</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "dd.MM.yyyy", { locale: de })
                            ) : (
                              <span>Datum wählen</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          locale={de}
                          disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Uhrzeit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Uhrzeit wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[200px]">
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time} Uhr
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Dauer
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Dauer wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {durationOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="attendees"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Teilnehmer (optional)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="email1@example.com, email2@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    E-Mail-Adressen durch Komma getrennt
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Beschreibung (optional)
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Themen, Agenda, Notizen..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <Video className="h-5 w-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Google Meet Link wird automatisch erstellt
              </span>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                disabled={createMeetingMutation.isPending}
                className="gap-2"
              >
                {createMeetingMutation.isPending && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Termin erstellen
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
