import { Globe } from 'lucide-react';

// Gmail Logo
export const GmailLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22 6L12 13L2 6V4L12 11L22 4V6Z" fill="#EA4335"/>
    <path d="M2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6L12 13L2 6Z" fill="#4285F4"/>
    <path d="M2 6L12 13V20H4C2.9 20 2 19.1 2 18V6Z" fill="#34A853"/>
    <path d="M22 6L12 13V20H20C21.1 20 22 19.1 22 18V6Z" fill="#FBBC05"/>
  </svg>
);

// Outlook Logo
export const OutlookLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="1" y="4" width="14" height="16" rx="1" fill="#0078D4"/>
    <ellipse cx="8" cy="12" rx="4" ry="5" fill="#28A8EA"/>
    <path d="M23 6V18L15 12L23 6Z" fill="#0078D4"/>
    <path d="M15 6H23V18H15V6Z" fill="#50D9FF" fillOpacity="0.4"/>
    <ellipse cx="8" cy="12" rx="2.5" ry="3" fill="white"/>
  </svg>
);

// GMX Logo
export const GmxLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#1C449B"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial, sans-serif">GMX</text>
  </svg>
);

// Web.de Logo
export const WebDeLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#FFD800"/>
    <text x="12" y="14" textAnchor="middle" fill="#333" fontSize="6" fontWeight="bold" fontFamily="Arial, sans-serif">WEB</text>
    <text x="12" y="19" textAnchor="middle" fill="#333" fontSize="5" fontFamily="Arial, sans-serif">.de</text>
  </svg>
);

// T-Online / Telekom Logo
export const TelekomLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#E20074"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="Arial, sans-serif">T</text>
  </svg>
);

// Yahoo Logo
export const YahooLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="4" fill="#6001D2"/>
    <text x="12" y="16" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold" fontFamily="Arial, sans-serif">Y!</text>
  </svg>
);

// iCloud Logo
export const ICloudLogo = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M19.5 12.5C19.5 10.01 17.49 8 15 8C14.28 8 13.61 8.18 13 8.5C12.25 6.5 10.29 5 8 5C5.24 5 3 7.24 3 10C3 10.17 3.01 10.33 3.03 10.5C1.83 11.03 1 12.18 1 13.5C1 15.43 2.57 17 4.5 17H19C21.21 17 23 15.21 23 13C23 11.32 21.87 9.89 20.32 9.35C19.87 10.78 19.5 12.5 19.5 12.5Z" fill="#3693F3"/>
  </svg>
);

// IONOS Logo
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
