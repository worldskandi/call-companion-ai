import { useConversation } from "@elevenlabs/react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const AGENT_ID = "agent_5401kj3m2h2neep8pvtfjnz5t8yb";

const ElevenLabsAgent = () => {
  const [isConnecting, setIsConnecting] = useState(false);

  const conversation = useConversation({
    onConnect: () => console.log("ElevenLabs Agent connected"),
    onDisconnect: () => console.log("ElevenLabs Agent disconnected"),
    onMessage: (message) => console.log("Agent message:", message),
    onError: (error) => console.error("Agent error:", error),
  });

  const startConversation = useCallback(async () => {
    setIsConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      await conversation.startSession({
        agentId: AGENT_ID,
        connectionType: "webrtc",
      });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    } finally {
      setIsConnecting(false);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  const isConnected = conversation.status === "connected";

  return (
    <div className="flex flex-col items-center gap-6 p-8 rounded-2xl bg-card/50 backdrop-blur-xl border border-border">
      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-muted-foreground/30"}`} />
        <span className="text-sm text-muted-foreground">
          {isConnected ? "Verbunden" : "Nicht verbunden"}
        </span>
      </div>

      {/* Animated orb */}
      <div className="relative w-32 h-32 flex items-center justify-center">
        <AnimatePresence>
          {isConnected && (
            <>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: conversation.isSpeaking ? [1, 1.3, 1] : 1,
                  opacity: 0.2,
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: conversation.isSpeaking ? 1.2 : 0.3, repeat: conversation.isSpeaking ? Infinity : 0 }}
                className="absolute inset-0 rounded-full bg-primary/20"
              />
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{
                  scale: conversation.isSpeaking ? [1, 1.15, 1] : 1,
                  opacity: 0.3,
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: conversation.isSpeaking ? 1 : 0.3, repeat: conversation.isSpeaking ? Infinity : 0, delay: 0.1 }}
                className="absolute inset-2 rounded-full bg-primary/30"
              />
            </>
          )}
        </AnimatePresence>
        <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-colors ${isConnected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
          {isConnected ? (
            conversation.isSpeaking ? <Mic className="w-8 h-8 animate-pulse" /> : <MicOff className="w-8 h-8" />
          ) : (
            <Phone className="w-8 h-8" />
          )}
        </div>
      </div>

      {/* Speaking status */}
      {isConnected && (
        <p className="text-sm text-muted-foreground">
          Agent {conversation.isSpeaking ? "spricht…" : "hört zu…"}
        </p>
      )}

      {/* Controls */}
      {!isConnected ? (
        <Button
          onClick={startConversation}
          disabled={isConnecting}
          size="lg"
          className="gap-2"
        >
          <Phone className="w-4 h-4" />
          {isConnecting ? "Verbinde…" : "Sales Agent starten"}
        </Button>
      ) : (
        <Button
          onClick={stopConversation}
          variant="destructive"
          size="lg"
          className="gap-2"
        >
          <PhoneOff className="w-4 h-4" />
          Gespräch beenden
        </Button>
      )}
    </div>
  );
};

export default ElevenLabsAgent;
