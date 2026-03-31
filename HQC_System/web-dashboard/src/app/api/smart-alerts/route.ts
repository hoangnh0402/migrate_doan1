// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

/**
 * Smart Alerts API Route
 * Uses Gemini AI to analyze city data and generate intelligent alerts
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface CityMetrics {
  aqi?: number;
  temperature?: number;
  humidity?: number;
  traffic_speed?: number;
  congestion_level?: number;
  pending_issues?: number;
  parking_occupancy?: number;
}

interface GeneratedAlert {
  id: string;
  type: 'environment' | 'traffic' | 'civic' | 'parking' | 'health' | 'safety';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  ward: string;
  district: string;
  recommendation: string;
  impact: string;
  affectedPopulation: string;
  timestamp: string;
}

// Ward data for Hanoi
const HANOI_WARDS = [
  'PhÆ°á»ng PhÃºc XÃ¡', 'PhÆ°á»ng TrÃºc Báº¡ch', 'PhÆ°á»ng VÄ©nh PhÃºc', 'PhÆ°á»ng Cá»‘ng Vá»‹', 'PhÆ°á»ng Liá»…u Giai',
  'PhÆ°á»ng Nguyá»…n Trung Trá»±c', 'PhÆ°á»ng QuÃ¡n ThÃ¡nh', 'PhÆ°á»ng Ngá»c HÃ ', 'PhÆ°á»ng Äiá»‡n BiÃªn', 'PhÆ°á»ng Äá»™i Cáº¥n',
  'PhÆ°á»ng Ba ÄÃ¬nh', 'PhÆ°á»ng Kim MÃ£', 'PhÆ°á»ng Giáº£ng VÃµ', 'PhÆ°á»ng ThÃ nh CÃ´ng', 'PhÆ°á»ng HÃ ng Buá»“m',
  'PhÆ°á»ng HÃ ng ÄÃ o', 'PhÆ°á»ng HÃ ng Bá»“', 'PhÆ°á»ng HÃ ng Báº¡c', 'PhÆ°á»ng HÃ ng Gai', 'PhÆ°á»ng ChÆ°Æ¡ng DÆ°Æ¡ng',
  'PhÆ°á»ng HÃ ng Trá»‘ng', 'PhÆ°á»ng Cá»­a Nam', 'PhÆ°á»ng HÃ ng BÃ´ng', 'PhÆ°á»ng TrÃ ng Tiá»n', 'PhÆ°á»ng Tráº§n HÆ°ng Äáº¡o',
];

const DISTRICTS: Record<string, string[]> = {
  'Ba ÄÃ¬nh': ['PhÆ°á»ng PhÃºc XÃ¡', 'PhÆ°á»ng TrÃºc Báº¡ch', 'PhÆ°á»ng VÄ©nh PhÃºc', 'PhÆ°á»ng Cá»‘ng Vá»‹', 'PhÆ°á»ng Liá»…u Giai',
              'PhÆ°á»ng Nguyá»…n Trung Trá»±c', 'PhÆ°á»ng QuÃ¡n ThÃ¡nh', 'PhÆ°á»ng Ngá»c HÃ ', 'PhÆ°á»ng Äiá»‡n BiÃªn', 'PhÆ°á»ng Äá»™i Cáº¥n',
              'PhÆ°á»ng Ba ÄÃ¬nh', 'PhÆ°á»ng Kim MÃ£', 'PhÆ°á»ng Giáº£ng VÃµ', 'PhÆ°á»ng ThÃ nh CÃ´ng'],
  'HoÃ n Kiáº¿m': ['PhÆ°á»ng HÃ ng Buá»“m', 'PhÆ°á»ng HÃ ng ÄÃ o', 'PhÆ°á»ng HÃ ng Bá»“', 'PhÆ°á»ng HÃ ng Báº¡c', 'PhÆ°á»ng HÃ ng Gai',
                'PhÆ°á»ng ChÆ°Æ¡ng DÆ°Æ¡ng', 'PhÆ°á»ng HÃ ng Trá»‘ng', 'PhÆ°á»ng Cá»­a Nam', 'PhÆ°á»ng HÃ ng BÃ´ng', 'PhÆ°á»ng TrÃ ng Tiá»n',
                'PhÆ°á»ng Tráº§n HÆ°ng Äáº¡o'],
};

const getRandomWard = (): { ward: string; district: string } => {
  const ward = HANOI_WARDS[Math.floor(Math.random() * HANOI_WARDS.length)];
  for (const [district, wards] of Object.entries(DISTRICTS)) {
    if (wards.includes(ward)) return { ward, district };
  }
  return { ward, district: 'HÃ  Ná»™i' };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const metrics: CityMetrics = body.metrics || {};
    
    if (!GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const prompt = `
Báº¡n lÃ  há»‡ thá»‘ng AI giÃ¡m sÃ¡t Ä‘Ã´ thá»‹ thÃ´ng minh HQC System cho thÃ nh phá»‘ HÃ  Ná»™i.
Dá»±a trÃªn dá»¯ liá»‡u thá»i gian thá»±c sau Ä‘Ã¢y, hÃ£y phÃ¢n tÃ­ch vÃ  táº¡o ra cÃ¡c cáº£nh bÃ¡o thÃ´ng minh cho ngÆ°á»i dÃ¢n.

**Dá»® LIá»†U HIá»†N Táº I:**
- Chá»‰ sá»‘ AQI (Cháº¥t lÆ°á»£ng khÃ´ng khÃ­): ${metrics.aqi || 'KhÃ´ng cÃ³ dá»¯ liá»‡u'}
- Nhiá»‡t Ä‘á»™: ${metrics.temperature || 'KhÃ´ng cÃ³ dá»¯ liá»‡u'}Â°C
- Äá»™ áº©m: ${metrics.humidity || 'KhÃ´ng cÃ³ dá»¯ liá»‡u'}%
- Tá»‘c Ä‘á»™ giao thÃ´ng trung bÃ¬nh: ${metrics.traffic_speed || 'KhÃ´ng cÃ³ dá»¯ liá»‡u'} km/h
- Má»©c Ä‘á»™ táº¯c ngháº½n: ${metrics.congestion_level || 'KhÃ´ng cÃ³ dá»¯ liá»‡u'}%
- Sá»± cá»‘ dÃ¢n sá»± Ä‘ang chá» xá»­ lÃ½: ${metrics.pending_issues || 'KhÃ´ng cÃ³ dá»¯ liá»‡u'}
- Tá»· lá»‡ láº¥p Ä‘áº§y bÃ£i Ä‘á»— xe: ${metrics.parking_occupancy || 'KhÃ´ng cÃ³ dá»¯ liá»‡u'}%

**YÃŠU Cáº¦U:**
Táº¡o 3-5 cáº£nh bÃ¡o dá»±a trÃªn phÃ¢n tÃ­ch thÃ´ng minh. Má»—i cáº£nh bÃ¡o cáº§n:
1. XÃ¡c Ä‘á»‹nh loáº¡i (environment/traffic/civic/parking/health/safety)
2. ÄÃ¡nh giÃ¡ má»©c Ä‘á»™ nghiÃªm trá»ng (critical/warning/info)
3. TiÃªu Ä‘á» ngáº¯n gá»n (tiáº¿ng Viá»‡t)
4. MÃ´ táº£ chi tiáº¿t tÃ¬nh huá»‘ng (tiáº¿ng Viá»‡t)
5. Khuyáº¿n nghá»‹ hÃ nh Ä‘á»™ng cá»¥ thá»ƒ cho ngÆ°á»i dÃ¢n (tiáº¿ng Viá»‡t)
6. ÄÃ¡nh giÃ¡ tÃ¡c Ä‘á»™ng (tiáº¿ng Viá»‡t)
7. Æ¯á»›c tÃ­nh sá»‘ ngÆ°á»i bá»‹ áº£nh hÆ°á»Ÿng (tiáº¿ng Viá»‡t)

Tráº£ vá» JSON array:
[
  {
    "type": "environment|traffic|civic|parking|health|safety",
    "severity": "critical|warning|info",
    "title": "TiÃªu Ä‘á» tiáº¿ng Viá»‡t",
    "description": "MÃ´ táº£ chi tiáº¿t tiáº¿ng Viá»‡t",
    "recommendation": "Khuyáº¿n nghá»‹ cho ngÆ°á»i dÃ¢n",
    "impact": "ÄÃ¡nh giÃ¡ tÃ¡c Ä‘á»™ng",
    "affectedPopulation": "Æ¯á»›c tÃ­nh sá»‘ ngÆ°á»i áº£nh hÆ°á»Ÿng"
  }
]

LÆ°u Ã½: Náº¿u cÃ¡c chá»‰ sá»‘ bÃ¬nh thÆ°á»ng, váº«n táº¡o 1-2 cáº£nh bÃ¡o má»©c "info" Ä‘á»ƒ thÃ´ng bÃ¡o tÃ¬nh tráº¡ng tá»‘t.
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Parse JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Invalid response format from Gemini');
    }

    const alertsData = JSON.parse(jsonMatch[0]);
    
    // Add metadata to each alert
    const alerts: GeneratedAlert[] = alertsData.map((alert: any, index: number) => {
      const { ward, district } = getRandomWard();
      return {
        id: `gemini-alert-${Date.now()}-${index}`,
        type: alert.type || 'environment',
        severity: alert.severity || 'info',
        title: alert.title || 'Cáº£nh bÃ¡o há»‡ thá»‘ng',
        description: alert.description || 'Äang phÃ¢n tÃ­ch...',
        ward,
        district,
        recommendation: alert.recommendation || 'Äang cáº­p nháº­t khuyáº¿n nghá»‹...',
        impact: alert.impact || 'Äang Ä‘Ã¡nh giÃ¡ tÃ¡c Ä‘á»™ng...',
        affectedPopulation: alert.affectedPopulation || 'Äang Æ°á»›c tÃ­nh...',
        timestamp: new Date().toISOString(),
      };
    });

    return NextResponse.json({
      success: true,
      data: alerts,
      generated_at: new Date().toISOString(),
      model: 'gemini-2.0-flash-exp',
    });
  } catch (error) {
    console.error('Smart Alerts API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        data: [],
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Smart Alerts API - Use POST to generate alerts with city metrics',
    endpoints: {
      'POST /api/smart-alerts': 'Generate AI-powered alerts based on city metrics',
    },
  });
}

