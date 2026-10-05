import { GoogleGenAI, Type } from '@google/genai';

// Initialize server-side Gemini SDK
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

export interface ParsedSearchCommand {
  country?: string;
  city?: string;
  category?: string;
  website_status?: 'NO_WEBSITE_FOUND' | 'WEBSITE_FOUND' | 'WEBSITE_UNAVAILABLE';
  requested_leads?: number;
  is_valid: boolean;
  clarification_needed?: string;
  original_query: string;
}

export async function parseNaturalLanguageCommand(prompt: string): Promise<ParsedSearchCommand> {
  const cleanPrompt = prompt.trim();
  if (!cleanPrompt) {
    return {
      is_valid: false,
      clarification_needed: 'Please enter a search prompt describing the business category and city.',
      original_query: prompt,
    };
  }

  // If Gemini API key is missing or blank, fallback to robust heuristic parser
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'MY_GEMINI_API_KEY') {
    return heuristicFallbackParser(cleanPrompt);
  }

  try {
    const systemInstruction = `You are a high-precision Natural Language search query parser for LeadHunter AI, a SaaS platform discovering local businesses that need websites.
Analyze the user's natural language input in ANY language (English, Hindi, Hinglish, Spanish, etc., e.g., "USA ke Dallas me dentists dhundo jinki official website nahi mil rahi").
Extract the structured parameters:
- category: The specific profession or business type in singular or common form (e.g., "dentist", "plumber", "restaurant", "roofing contractor", "lawyer").
- city: The target city, municipality, or metropolitan area.
- country: The country (e.g. "USA", "India", "UK", "Canada", "Australia", etc.). Default to "USA" if not specified but standard US city mentioned, or "India" if Indian city.
- website_status: Should be "NO_WEBSITE_FOUND" by default for queries looking for businesses needing a website or without a website.
- requested_leads: An integer between 1 and 20. Default to 5.
- is_valid: Set to true if category AND city can be identified with high confidence. Set to false if crucial location or category is absent.
- clarification_needed: If is_valid is false, specify a polite, concise question asking the user to clarify the missing city or category. DO NOT invent missing information.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: cleanPrompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING },
            city: { type: Type.STRING },
            country: { type: Type.STRING },
            website_status: { type: Type.STRING },
            requested_leads: { type: Type.INTEGER },
            is_valid: { type: Type.BOOLEAN },
            clarification_needed: { type: Type.STRING },
          },
          required: ['category', 'city', 'country', 'is_valid'],
        },
      },
    });

    const text = response.text?.trim();
    if (!text) {
      return heuristicFallbackParser(cleanPrompt);
    }

    const parsed = JSON.parse(text);
    return {
      category: parsed.category || undefined,
      city: parsed.city || undefined,
      country: parsed.country || 'USA',
      website_status: (parsed.website_status as any) || 'NO_WEBSITE_FOUND',
      requested_leads: parsed.requested_leads ? Math.min(20, Math.max(1, parsed.requested_leads)) : 5,
      is_valid: Boolean(parsed.is_valid && parsed.category && parsed.city),
      clarification_needed: parsed.clarification_needed || (!parsed.is_valid ? 'Please provide both the business category and the city/area.' : undefined),
      original_query: cleanPrompt,
    };
  } catch (error) {
    console.error('Gemini natural language parsing error, using heuristic fallback:', error);
    return heuristicFallbackParser(cleanPrompt);
  }
}

// Resilient heuristic parser when offline or in test environments
function heuristicFallbackParser(prompt: string): ParsedSearchCommand {
  const lower = prompt.toLowerCase();

  let category = '';
  let city = '';
  let country = 'USA';

  // Common categories
  const categories = [
    'dentist', 'dentists', 'dental clinic', 'plumber', 'plumbers', 'electrician',
    'restaurant', 'restaurants', 'cafe', 'bakery', 'roofing', 'roofer',
    'mechanic', 'auto repair', 'lawyer', 'attorney', 'accountant', 'gym',
    'salon', 'hair salon', 'barbershop', 'chiropractor', 'veterinarian', 'vet',
    'cleaning service', 'landscaping', 'real estate', 'doctor', 'photographer'
  ];

  for (const cat of categories) {
    if (lower.includes(cat)) {
      category = cat.endsWith('s') && !cat.endsWith('ss') ? cat.slice(0, -1) : cat;
      if (category === 'dentist') category = 'dentist';
      break;
    }
  }

  // Detect countries
  if (lower.includes('india') || lower.includes('bharat')) country = 'India';
  else if (lower.includes('uk') || lower.includes('london') || lower.includes('england')) country = 'UK';
  else if (lower.includes('canada') || lower.includes('toronto')) country = 'Canada';
  else if (lower.includes('australia') || lower.includes('sydney')) country = 'Australia';
  else if (lower.includes('usa') || lower.includes('united states') || lower.includes('america')) country = 'USA';

  // Detect common cities
  const cities = [
    'dallas', 'austin', 'houston', 'new york', 'los angeles', 'chicago',
    'miami', 'seattle', 'san francisco', 'denver', 'phoenix', 'atlanta',
    'mumbai', 'delhi', 'bangalore', 'hyderabad', 'pune', 'chennai',
    'london', 'manchester', 'toronto', 'vancouver', 'sydney', 'melbourne'
  ];

  for (const c of cities) {
    if (lower.includes(c)) {
      city = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // Fallback regex detection for "in <City>" or "<City> me" (Hinglish)
  if (!city) {
    const inMatch = prompt.match(/\bin\s+([A-Za-z]+)/i) || prompt.match(/([A-Za-z]+)\s+me\b/i);
    if (inMatch && inMatch[1]) {
      city = inMatch[1].charAt(0).toUpperCase() + inMatch[1].slice(1);
    }
  }

  const isValid = Boolean(category && city);

  return {
    category: category || undefined,
    city: city || undefined,
    country,
    website_status: 'NO_WEBSITE_FOUND',
    requested_leads: 5,
    is_valid: isValid,
    clarification_needed: isValid
      ? undefined
      : !city
      ? 'Which city or area should we search in?'
      : 'What business category or service are you targeting (e.g. dentists, plumbers)?',
    original_query: prompt,
  };
}
