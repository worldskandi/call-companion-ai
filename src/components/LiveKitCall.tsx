import { useState, useCallback } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  useRoomContext,
  useParticipants,
  useConnectionState,
  useTracks,
} from "@livekit/components-react";
import { Track, ConnectionState } from "livekit-client";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  Loader2,
  Volume2,
  VolumeX,
} from "lucide-react";

interface LiveKitCallProps {
  leadId: string;
  leadName: string;
  campaignId?: string;
  campaignPrompt?: string;
  onCallStarted?: () => void;
  onCallEnded?: (durationSeconds: number) => void;
}

// Inner component that has access to LiveKit room context
function CallControls({
  onDisconnect,
  startTime,
}: {
  onDisconnect: () => void;
  startTime: Date | null;
}) {
  const room = useRoomContext();
  const connectionState = useConnectionState();
  const participants = useParticipants();
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);

  // Track call duration
  useState(() => {
    if (startTime) {
      const interval = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTime.getTime()) / 1000));
      }, 1000);
      return () => clearInterval(interval);
    }
  });

  const toggleMute = useCallback(() => {
    const localParticipant = room.localParticipant;
    if (localParticipant) {
      localParticipant.setMicrophoneEnabled(isMuted);
      setIsMuted(!isMuted);
    }
  }, [room, isMuted]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case ConnectionState.Connecting:
        return "Verbinde...";
      case ConnectionState.Connected:
        return "Verbunden";
      case ConnectionState.Reconnecting:
        return "Verbindung wird wiederhergestellt...";
      case ConnectionState.Disconnected:
        return "Getrennt";
      default:
        return "Unbekannt";
    }
  };

  // Find AI agent participant (starts with "agent-" or contains identity patterns)
  const agentParticipant = participants.find(
    (p) => 
      p.identity.startsWith("agent-") || 
      p.identity.includes("grok") ||
      p.identity.includes("Test1") ||
      !p.identity.startsWith("user-")
  );

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Status Display */}
      <div className="text-center">
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            connectionState === ConnectionState.Connected
              ? "bg-success/10 text-success"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {connectionState === ConnectionState.Connecting && (
            <Loader2 className="w-4 h-4 animate-spin" />
          )}
          {connectionState === ConnectionState.Connected && (
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
          )}
          <span className="font-medium">{getConnectionStatusText()}</span>
        </div>

        {connectionState === ConnectionState.Connected && (
          <div className="mt-2 text-2xl font-mono text-foreground">
            {formatDuration(duration)}
          </div>
        )}

        {/* Agent status indicator */}
        {connectionState === ConnectionState.Connected && !agentParticipant && (
          <div className="mt-2 text-sm text-muted-foreground flex items-center gap-2 justify-center">
            <Loader2 className="w-3 h-3 animate-spin" />
            Warte auf KI-Agent...
          </div>
        )}

        {agentParticipant && (
          <div className="mt-2 text-sm text-success flex items-center gap-2 justify-center">
            <div className="w-2 h-2 rounded-full bg-success" />
            KI-Agent verbunden
          </div>
        )}
      </div>

      {/* Audio Visualization */}
      <div className="flex items-center gap-2">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-1 bg-primary rounded-full transition-all duration-150 ${
              connectionState === ConnectionState.Connected
                ? "animate-pulse"
                : ""
            }`}
            style={{
              height: `${20 + Math.random() * 20}px`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full"
          onClick={toggleMute}
          disabled={connectionState !== ConnectionState.Connected}
        >
          {isMuted ? (
            <MicOff className="w-6 h-6 text-destructive" />
          ) : (
            <Mic className="w-6 h-6" />
          )}
        </Button>

        <Button
          variant="destructive"
          size="icon"
          className="h-16 w-16 rounded-full"
          onClick={onDisconnect}
        >
          <PhoneOff className="w-7 h-7" />
        </Button>
      </div>

      {/* Audio Renderer - plays remote audio */}
      <RoomAudioRenderer />
    </div>
  );
}

export function LiveKitCall({
  leadId,
  leadName,
  campaignId,
  campaignPrompt,
  onCallStarted,
  onCallEnded,
}: LiveKitCallProps) {
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string | null>(null);
  const [roomName, setRoomName] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  const startCall = async () => {
    setIsConnecting(true);

    try {
      // Request microphone permission first
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Generate unique room name
      const generatedRoomName = `call-${leadId}-${Date.now()}`;

      // Get LiveKit token from edge function
      // Edge function loads full campaign/lead data from DB
      const { data, error } = await supabase.functions.invoke(
        "get-livekit-token",
        {
          body: {
            roomName: generatedRoomName,
            leadId,
            campaignId,
          },
        }
      );

      if (error) throw error;

      if (!data?.token || !data?.url) {
        throw new Error("Keine LiveKit-Zugangsdaten erhalten");
      }

      setToken(data.token);
      setServerUrl(data.url);
      setRoomName(generatedRoomName);
      setStartTime(new Date());
      setIsConnected(true);
      onCallStarted?.();

      toast({
        title: "Anruf gestartet",
        description: `Verbinde mit ${leadName}...`,
      });
    } catch (error) {
      console.error("Error starting LiveKit call:", error);
      toast({
        title: "Fehler",
        description:
          error instanceof Error
            ? error.message
            : "Anruf konnte nicht gestartet werden",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const endCall = async () => {
    const duration = startTime
      ? Math.floor((Date.now() - startTime.getTime()) / 1000)
      : 0;

    // Call the end-call edge function to update the database
    if (roomName) {
      try {
        await supabase.functions.invoke("end-call", {
          body: {
            room_name: roomName,
            duration_seconds: duration,
            outcome: "answered",
          },
        });
      } catch (error) {
        console.error("Error updating call log:", error);
      }
    }

    setIsConnected(false);
    setToken(null);
    setServerUrl(null);
    setRoomName(null);

    onCallEnded?.(duration);

    toast({
      title: "Anruf beendet",
      description: `Dauer: ${Math.floor(duration / 60)}:${(duration % 60)
        .toString()
        .padStart(2, "0")}`,
    });

    setStartTime(null);
  };

  if (!isConnected || !token || !serverUrl) {
    return (
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={startCall}
          disabled={isConnecting}
          className="h-16 px-12 text-lg gap-3 bg-primary hover:bg-primary/90 rounded-2xl shadow-glow hover:shadow-glow-lg transition-all"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin" />
              Verbinde...
            </>
          ) : (
            <>
              <Phone className="w-6 h-6" />
              Web-Anruf starten
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={true}
      video={false}
      onDisconnected={endCall}
      onError={(error) => {
        console.error("LiveKit error:", error);
        toast({
          title: "Verbindungsfehler",
          description: error.message,
          variant: "destructive",
        });
        endCall();
      }}
    >
      <CallControls onDisconnect={endCall} startTime={startTime} />
    </LiveKitRoom>
  );
}

export default LiveKitCall;
