import { Globe } from 'lucide-react';

// Gmail Logo - External URL worked fine
export const GmailLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg" 
    alt="Gmail" 
    className={className}
  />
);

// Outlook Logo - Inline SVG (external didn't work)
export const OutlookLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L2 6V18L12 22L22 18V6L12 2Z" fill="#0078D4"/>
    <ellipse cx="8" cy="12" rx="4" ry="5" fill="#28A8EA"/>
    <ellipse cx="8" cy="12" rx="2" ry="3" fill="white"/>
    <path d="M14 8H22V16H14L18 12L14 8Z" fill="#0078D4"/>
    <path d="M14 8L18 12L14 16V8Z" fill="#50E6FF"/>
  </svg>
);

// GMX Logo - Inline SVG (external didn't work)
export const GmxLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#1C449B"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">GMX</text>
  </svg>
);

// Web.de Logo - Inline SVG (external didn't work)
export const WebDeLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#FFD800"/>
    <text x="12" y="14" textAnchor="middle" fill="#333" fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif">WEB</text>
    <text x="12" y="19" textAnchor="middle" fill="#333" fontSize="5" fontFamily="Arial, sans-serif">.de</text>
  </svg>
);

// T-Online / Telekom Logo - External URL worked
export const TelekomLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#E20074"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">T</text>
  </svg>
);

// Yahoo Logo - Inline SVG (external didn't work)
export const YahooLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#6001D2"/>
    <path d="M6 7L10 13V17H8V13L4 7H6Z" fill="white"/>
    <path d="M12 7L16 13V17H14V13L18 7H16L14 10L12 7Z" fill="white"/>
    <circle cx="17" cy="17" r="1.5" fill="white"/>
  </svg>
);

// iCloud Logo - External URL worked fine
export const ICloudLogo = ({ className }: { className?: string }) => (
  <img 
    src="https://upload.wikimedia.org/wikipedia/commons/1/1c/ICloud_logo.svg" 
    alt="iCloud" 
    className={className}
  />
);

// IONOS Logo - Inline SVG for reliability
export const IonosLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#003D8F"/>
    <text x="12" y="15" textAnchor="middle" fill="white" fontSize="5" fontWeight="bold" fontFamily="Arial, sans-serif">IONOS</text>
  </svg>
);

// Custom/Other Provider
export const CustomProviderLogo = ({ className }: { className?: string }) => (
  <Globe className={className} />
);

export const getProviderLogo = (providerId: string, className?: string) => {
  switch (providerId) {
    case 'gmail':
      return <GmailLogo className={className} />;
    case 'outlook':
      return <OutlookLogo className={className} />;
    case 'gmx':
      return <GmxLogo className={className} />;
    case 'webde':
      return <WebDeLogo className={className} />;
    case 'tonline':
      return <TelekomLogo className={className} />;
    case 'yahoo':
      return <YahooLogo className={className} />;
    case 'icloud':
      return <ICloudLogo className={className} />;
    case 'ionos':
      return <IonosLogo className={className} />;
    default:
      return <CustomProviderLogo className={className} />;
  }
};
