import { 
  calculateLeadQuality, 
  getQualityColor, 
  getQualityLabel,
  getQualityIcon,
  type LeadData,
  type QualityLevel
} from '@/lib/leadQuality';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface LeadQualityBadgeProps {
  lead: LeadData;
  showScore?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function LeadQualityBadge({ 
  lead, 
  showScore = false, 
  showIcon = true,
  size = 'sm' 
}: LeadQualityBadgeProps) {
  const quality = calculateLeadQuality(lead);
  const colorClasses = getQualityColor(quality.level);
  const label = getQualityLabel(quality.level);
  const icon = getQualityIcon(quality.level);
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span 
          className={`inline-flex items-center gap-1 rounded-full font-medium border cursor-help ${colorClasses} ${sizeClasses}`}
        >
          {showIcon && <span>{icon}</span>}
          <span>{label}</span>
          {showScore && <span className="opacity-70">({quality.score}%)</span>}
        </span>
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs">
        <div className="space-y-1">
          <p className="font-medium">
            Qualitätsscore: {quality.score}/100
          </p>
          {quality.missingFields.length > 0 ? (
            <div>
              <p className="text-xs text-muted-foreground">Fehlende Daten:</p>
              <ul className="text-xs list-disc list-inside">
                {quality.missingFields.map((field) => (
                  <li key={field}>{field}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-green-600">Alle Daten vollständig!</p>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
}

interface QualityBadgeFromLevelProps {
  level: QualityLevel;
  score?: number;
  showScore?: boolean;
  showIcon?: boolean;
  size?: 'sm' | 'md';
}

export function QualityBadgeFromLevel({ 
  level, 
  score,
  showScore = false, 
  showIcon = true,
  size = 'sm' 
}: QualityBadgeFromLevelProps) {
  const colorClasses = getQualityColor(level);
  const label = getQualityLabel(level);
  const icon = getQualityIcon(level);
  
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-3 py-1 text-sm';

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-full font-medium border ${colorClasses} ${sizeClasses}`}
    >
      {showIcon && <span>{icon}</span>}
      <span>{label}</span>
      {showScore && score !== undefined && <span className="opacity-70">({score}%)</span>}
    </span>
  );
}
