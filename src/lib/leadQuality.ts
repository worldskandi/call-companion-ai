export type QualityLevel = 'high' | 'medium' | 'low';

export interface LeadQualityResult {
  score: number;
  level: QualityLevel;
  missingFields: string[];
}

export interface LeadData {
  first_name?: string | null;
  last_name?: string | null;
  company?: string | null;
  phone_number?: string | null;
  email?: string | null;
}

const SCORE_WEIGHTS = {
  phone_number: 30,    // Essential for cold calling
  email: 25,           // Important for follow-ups
  full_name: 25,       // First + Last name for personalization
  company: 20,         // Business context
};

export function calculateLeadQuality(lead: LeadData): LeadQualityResult {
  let score = 0;
  const missingFields: string[] = [];

  // Phone number (30 points)
  if (lead.phone_number && lead.phone_number.trim().length > 0) {
    score += SCORE_WEIGHTS.phone_number;
  } else {
    missingFields.push('Telefonnummer');
  }

  // Email (25 points)
  if (lead.email && lead.email.trim().length > 0) {
    score += SCORE_WEIGHTS.email;
  } else {
    missingFields.push('E-Mail');
  }

  // Full name - requires both first and last name (25 points)
  if (lead.first_name && lead.first_name.trim().length > 0) {
    if (lead.last_name && lead.last_name.trim().length > 0) {
      score += SCORE_WEIGHTS.full_name;
    } else {
      score += SCORE_WEIGHTS.full_name / 2; // Partial credit for first name only
      missingFields.push('Nachname');
    }
  } else {
    missingFields.push('Vorname');
    if (!lead.last_name || lead.last_name.trim().length === 0) {
      missingFields.push('Nachname');
    }
  }

  // Company (20 points)
  if (lead.company && lead.company.trim().length > 0) {
    score += SCORE_WEIGHTS.company;
  } else {
    missingFields.push('Firma');
  }

  // Determine quality level
  let level: QualityLevel;
  if (score >= 80) {
    level = 'high';
  } else if (score >= 50) {
    level = 'medium';
  } else {
    level = 'low';
  }

  return {
    score: Math.round(score),
    level,
    missingFields,
  };
}

export function getQualityColor(level: QualityLevel): string {
  switch (level) {
    case 'high':
      return 'text-green-600 bg-green-100 border-green-200';
    case 'medium':
      return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    case 'low':
      return 'text-red-600 bg-red-100 border-red-200';
  }
}

export function getQualityLabel(level: QualityLevel): string {
  switch (level) {
    case 'high':
      return 'Hoch';
    case 'medium':
      return 'Mittel';
    case 'low':
      return 'Niedrig';
  }
}

export function getQualityIcon(level: QualityLevel): string {
  switch (level) {
    case 'high':
      return '🟢';
    case 'medium':
      return '🟡';
    case 'low':
      return '🔴';
  }
}
