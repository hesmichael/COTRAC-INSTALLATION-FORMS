
import { GoogleGenAI, Type } from "@google/genai";
import { FormField } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const DEFAULT_GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbznk8elEgtGVFgLi8SIN9rcX31noEo-Xx2tVrPI8OYoUeqY504M3BY6aj2LcUT39r-g/exec";

/**
 * Standardized fields for Cotrac Nigeria Database.
 */
const SYNC_WHITELIST = [
    'full_name',
    'email_address',
    'phone_no',
    'whatsapp_no',
    'license_plate',
    'chassis_no',
    'vehicle_make',
    'model',
    'unit_no',
    'home_zone',
    'company_name',
    'address',
    'city',
    'state',
    'mileage',
    'fuel_capacity',
    'fuel_sensor',
    'lead_source',
    'prev_install',
    'dob',
    'alt_contact',
    'social_handles',
    'engine_no',
    'vehicle_color',
    'speed_limit'
];

export async function generateDynamicForm(serviceName: string): Promise<FormField[]> {
  try {
    const isFuelPlan = serviceName.toUpperCase().includes('ENTERPRISE') || serviceName.toUpperCase().includes('FUEL');
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate form fields for Cotrac Nigeria: "${serviceName}".
      
      SECTION: Customer
      - email_address (Required: true)
      - full_name (Required: true)
      - company_name, home_zone, address, dob, city, whatsapp_no, state, phone_no, alt_contact
      - prev_install (Options: ["YES", "NO"])
      - lead_source (Options: ["BILLBOARD", "RADIO", "FRIEND", "STREET", "STICKER", "WEBSITE"])
      - social_handles

      SECTION: Vehicle
      - license_plate, unit_no, vehicle_make, sim_no, model, engine_no, vehicle_color, mileage, chassis_no, speed_limit
      
      ${isFuelPlan ? '- fuel_capacity, fuel_sensor (Options: ["YES", "NO"])' : ''}
      
      Return a JSON array of FormField objects.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              label: { type: Type.STRING },
              type: { type: Type.STRING },
              required: { type: Type.BOOLEAN },
              placeholder: { type: Type.STRING },
              options: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            },
            required: ["id", "label", "type", "required"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Form Generation Error:", error);
    return [
      { id: 'full_name', label: 'Full Name', type: 'text', required: true },
      { id: 'phone_no', label: 'Phone Number', type: 'tel', required: true },
      { id: 'license_plate', label: 'License Plate', type: 'text', required: true }
    ];
  }
}

export async function syncToGoogleSheets(submission: any, webhookUrl: string) {
    const targetUrl = webhookUrl || DEFAULT_GOOGLE_SCRIPT_URL;
    
    try {
        // Explicitly ensuring PLAN_NAME is top-level for the sheet script
        const filteredPayload: Record<string, string> = {
            'RECORD_ID': submission.id,
            'PLAN_NAME': submission.serviceName, // This ensures "COTRAC GOLD" etc shows up
            'DATE_TIME': submission.timestamp,
            'SIGNATURE_DATA': submission.signature
        };

        // Sync whitelisted data points
        Object.keys(submission.formData).forEach(key => {
            if (SYNC_WHITELIST.includes(key)) {
                filteredPayload[key] = String(submission.formData[key]);
            }
        });

        const params = new URLSearchParams();
        for (const key in filteredPayload) {
            params.append(key, filteredPayload[key]);
        }

        // 'no-cors' allows us to ping the Google Script without CORS errors
        await fetch(targetUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        });
        
        return true;
    } catch (e) {
        console.error("Cloud Sync Error:", e);
        throw e;
    }
}

export function convertToCSV(submissions: any[]) {
    if (submissions.length === 0) return "";
    // Added PLAN_NAME to the CSV headers explicitly
    const headers = ['RECORD_ID', 'DATE_TIME', 'PLAN_NAME', ...SYNC_WHITELIST.map(k => k.toUpperCase())];
    const rows = submissions.map(sub => [
        sub.id,
        sub.timestamp,
        sub.serviceName, // Matches PLAN_NAME
        ...SYNC_WHITELIST.map(key => `"${(sub.formData[key] || '').toString().replace(/"/g, '""')}"`)
    ].join(','));
    return [headers.join(','), ...rows].join('\n');
}
