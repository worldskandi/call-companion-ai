import { useAISettings } from './useAISettings';

export const useElevenLabsConfig = () => {
  const { settings, loading } = useAISettings();

  // Platform-managed: always configured since API key is stored server-side
  const isConfigured = true;
  const agentId = settings?.elevenlabs_agent_id || '';
  const apiKey = '';
  const voiceProvider = (settings?.voice_provider as 'builtin' | 'elevenlabs') || 'builtin';
  const isElevenLabs = voiceProvider === 'elevenlabs' && isConfigured;

  return {
    isConfigured,
    agentId,
    apiKey,
    voiceProvider,
    isElevenLabs,
    loading,
  };
};
