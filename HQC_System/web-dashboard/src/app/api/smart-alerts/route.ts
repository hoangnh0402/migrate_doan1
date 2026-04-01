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
  'Phường Phúc Xá', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc', 'Phường Cống Vị', 'Phường Liễu Giai',
  'Phường Nguyễn Trung Trực', 'Phường Quán Thánh', 'Phường Ngọc Hà', 'Phường Điện Biên', 'Phường Đội Cấn',
  'Phường Ba Đình', 'Phường Kim Mã', 'Phường Giảng Võ', 'Phường Thành Công', 'Phường Hàng Buồm',
  'Phường Hàng Đào', 'Phường Hàng Bồ', 'Phường Hàng Bạc', 'Phường Hàng Gai', 'Phường Chương Dương',
  'Phường Hàng Trống', 'Phường Cửa Nam', 'Phường Hàng Bông', 'Phường Tràng Tiền', 'Phường Trần Hưng Đạo',
];

const DISTRICTS: Record<string, string[]> = {
  'Ba Đình': ['Phường Phúc Xá', 'Phường Trúc Bạch', 'Phường Vĩnh Phúc', 'Phường Cống Vị', 'Phường Liễu Giai',
              'Phường Nguyễn Trung Trực', 'Phường Quán Thánh', 'Phường Ngọc Hà', 'Phường Điện Biên', 'Phường Đội Cấn',
              'Phường Ba Đình', 'Phường Kim Mã', 'Phường Giảng Võ', 'Phường Thành Công'],
  'Hoàn Kiếm': ['Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Bồ', 'Phường Hàng Bạc', 'Phường Hàng Gai',
                'Phường Chương Dương', 'Phường Hàng Trống', 'Phường Cửa Nam', 'Phường Hàng Bông', 'Phường Tràng Tiền',
                'Phường Trần Hưng Đạo'],
};

const getRandomWard = (): { ward: string; district: string } => {
  const ward = HANOI_WARDS[Math.floor(Math.random() * HANOI_WARDS.length)];
  for (const [district, wards] of Object.entries(DISTRICTS)) {
    if (wards.includes(ward)) return { ward, district };
  }
  return { ward, district: 'Hà Nội' };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const metrics: CityMetrics = body.metrics || {};
    
    // Mock fallback if API key is invalid or placeholder
    const isPlaceholder = !GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here';
    
    if (isPlaceholder) {
      return getMockAlerts(metrics);
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      const prompt = `
Bạn là hệ thống AI giám sát đô thị thông minh HQC System cho thành phố Hà Nội.
Dựa trên dữ liệu thời gian thực sau đây, hãy phân tích và tạo ra các cảnh báo thông minh cho người dân.

**DỮ LIỆU HIỆN TẠI:**
- Chỉ số AQI (Chất lượng không khí): ${metrics.aqi || 'Không có dữ liệu'}
- Nhiệt độ: ${metrics.temperature || 'Không có dữ liệu'}°C
- Độ ẩm: ${metrics.humidity || 'Không có dữ liệu'}%
- Tốc độ giao thông trung bình: ${metrics.traffic_speed || 'Không có dữ liệu'} km/h
- Mức độ tắc nghẽn: ${metrics.congestion_level || 'Không có dữ liệu'}%
- Sự cố dân sự đang chờ xử lý: ${metrics.pending_issues || 'Không có dữ liệu'}
- Tỷ lệ lấp đầy bãi đỗ xe: ${metrics.parking_occupancy || 'Không có dữ liệu'}%

**YÊU CẦU:**
Tạo 3-5 cảnh báo dựa trên phân tích thông minh. Mỗi cảnh báo cần:
1. Xác định loại (environment/traffic/civic/parking/health/safety)
2. Đánh giá mức độ nghiêm trọng (critical/warning/info)
3. Tiêu đề ngắn gọn (tiếng Việt)
4. Mô tả chi tiết tình huống (tiếng Việt)
5. Khuyến nghị hành động cụ thể cho người dân (tiếng Việt)
6. Đánh giá tác động (tiếng Việt)
7. Ước tính số người bị ảnh hưởng (tiếng Việt)

Trả về JSON array:
[
  {
    "type": "environment|traffic|civic|parking|health|safety",
    "severity": "critical|warning|info",
    "title": "Tiêu đề tiếng Việt",
    "description": "Mô tả chi tiết tiếng Việt",
    "recommendation": "Khuyến nghị cho người dân",
    "impact": "Đánh giá tác động",
    "affectedPopulation": "Ước tính số người ảnh hưởng"
  }
]
`;

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      
      if (jsonMatch) {
        const alertsData = JSON.parse(jsonMatch[0]);
        const alerts = formatAlerts(alertsData);
        return NextResponse.json({ success: true, data: alerts, is_mock: false });
      }
      
      throw new Error('Invalid Gemini alert response');
      
    } catch (aiError) {
      console.warn('Gemini AI error in alerts, using mock fallback:', aiError);
      return getMockAlerts(metrics);
    }

  } catch (error) {
    console.error('Smart Alerts API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error', data: [] }, { status: 500 });
  }
}

function formatAlerts(alertsData: any[]): GeneratedAlert[] {
  return alertsData.map((alert: any, index: number) => {
    const { ward, district } = getRandomWard();
    return {
      id: `gemini-alert-${Date.now()}-${index}`,
      type: alert.type || 'info',
      severity: alert.severity || 'info',
      title: alert.title || 'Thông báo hệ thống',
      description: alert.description || 'Đang theo dõi...',
      ward,
      district,
      recommendation: alert.recommendation || 'Theo dõi thêm cập nhật.',
      impact: alert.impact || 'Đang đánh giá.',
      affectedPopulation: alert.affectedPopulation || 'Chưa xác định.',
      timestamp: new Date().toISOString(),
    };
  });
}

function getMockAlerts(metrics: CityMetrics) {
  const mockAlertsData = [
    {
      type: 'environment',
      severity: metrics.aqi && metrics.aqi > 150 ? 'critical' : 'warning',
      title: 'Chỉ số chất lượng không khí (AQI) tăng cao',
      description: `Ghi nhận chỉ số AQI là ${metrics.aqi || 120}, nồng độ bụi mịn PM2.5 tăng đáng kể tại khu vực trung tâm do hiện tượng nghịch nhiệt.`,
      recommendation: 'Người dân nên đeo khẩu trang N95 khi ra ngoài. Hạn chế các hoạt động thể thao ngoài trời vào khung giờ cao điểm sáng.',
      impact: 'Ảnh hưởng đến nhóm người nhạy cảm, trẻ em và người già.',
      affectedPopulation: 'Khoảng 50,000 - 100,000 người trong khu vực.'
    },
    {
      type: 'traffic',
      severity: metrics.congestion_level && metrics.congestion_level > 80 ? 'critical' : 'warning',
      title: 'Ùn tắc giao thông cục bộ tại các nút giao',
      description: `Lưu lượng xe tăng đột biến vượt quá công suất thiết kế. Mức độ tắc nghẽn đạt ${metrics.congestion_level || 75}%.`,
      recommendation: 'Sử dụng các tuyến đường thay thế. Ưu tiên sử dụng phương tiện công cộng hoặc Metro Cát Linh - Hà Đông để tiết kiệm thời gian.',
      impact: 'Chậm trễ thời gian di chuyển từ 15-30 phút.',
      affectedPopulation: 'Toàn bộ cư dân tham gia giao thông trong khung giờ cao điểm.'
    },
    {
      type: 'civic',
      severity: 'info',
      title: 'Hệ thống HQC System đang hoạt động tối ưu',
      description: 'Dữ liệu từ 500+ cảm biến đang được truyền tải ổn định. Các sự cố dân sự đang được phân bổ cho các tổ đội xử lý theo đúng tiến độ.',
      recommendation: 'Người dân có thể tiếp tục báo cáo sự cố hạ tầng thông qua ứng dụng di động HQC App.',
      impact: 'Đảm bảo sự an tâm và minh bạch trong quản lý đô thị.',
      affectedPopulation: 'Toàn bộ cư dân thành phố.'
    }
  ];

  return NextResponse.json({
    success: true,
    data: formatAlerts(mockAlertsData),
    is_mock: true,
    message: 'Using simulated smart alerts because Gemini API key is not configured'
  });
}

export async function GET() {
  return NextResponse.json({ success: true, message: 'Smart Alerts API - Use POST to generate alerts' });
}
