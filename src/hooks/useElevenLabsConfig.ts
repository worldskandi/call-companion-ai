import { useAISettings } from './useAISettings';

export const useElevenLabsConfig = () => {
  const { settings, loading } = useAISettings();

  const isConfigured = !!(settings?.elevenlabs_agent_id);
  const agentId = settings?.elevenlabs_agent_id || '';
  const apiKey = settings?.elevenlabs_api_key || '';
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
