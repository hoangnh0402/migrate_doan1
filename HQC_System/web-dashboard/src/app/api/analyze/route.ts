// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

/**
 * Urban Analysis API Route
 * Handles City Health and Data Insights analysis using Gemini AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;
    
    if (!type || !data) {
      return NextResponse.json({ success: false, error: 'Missing type or data' }, { status: 400 });
    }

    // Mock fallback if API key is invalid or placeholder
    const isPlaceholder = !GEMINI_API_KEY || GEMINI_API_KEY === 'your-gemini-api-key-here';
    
    if (isPlaceholder) {
      return getMockAnalysis(type, data);
    }

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      let prompt = '';
      if (type === 'city_health') {
        prompt = `
Bạn là chuyên gia phân tích đô thị thông minh HQC System. Phân tích dữ liệu sức khỏe đô thị sau và đưa ra nhận định chuyên sâu bằng tiếng Việt:

**DỮ LIỆU ĐÔ THỊ:**
- Điểm tổng: ${data.overall_score}/100
- Môi trường: AQI ${data.environmental?.aqi_value} (${data.environmental?.aqi_status}), Nhiệt độ ${data.environmental?.temperature}°C
- Giao thông: Lưu lượng ${data.traffic?.congestion_level}, Tốc độ ${data.traffic?.average_speed} km/h
- Dân sự: ${data.civic?.pending_issues} sự cố đang chờ, Tỷ lệ giải quyết ${data.civic?.resolution_rate}%

Hãy trả về JSON format:
{
  "overall_assessment": "Nhận định chung 2-3 câu",
  "environmental_insights": "Phân tích môi trường 1-2 câu",
  "traffic_insights": "Phân tích giao thông 1-2 câu",
  "civic_insights": "Phân tích dân sự 1-2 câu",
  "key_recommendations": ["Khuyến nghị 1", "Khuyến nghị 2", "Khuyến nghị 3"],
  "priority_actions": ["Hành động 1", "Hành động 2"]
}
`;
      } else if (type === 'insights') {
        prompt = `
Bạn là nhà khoa học dữ liệu đô thị HQC System. Phân tích xu hướng và tương quan từ dữ liệu sau bằng tiếng Việt:

**DỮ LIỆU PHÂN TÍCH:**
- AQI trung bình: ${data.avg_aqi}
- Quận tốt nhất: ${data.best_district}
- Quận cần cải thiện: ${data.worst_district}
- Tương quan Temp-AQI: ${JSON.stringify(data.correlation_summary)}

Hãy trả về JSON format:
{
  "correlation_analysis": "Phân tích tương quan 2-3 câu",
  "district_comparison": "So sánh các quận 2-3 câu",
  "temporal_patterns": "Mẫu hình theo thời gian 2-3 câu",
  "predictive_insights": "Dự báo và xu hướng 2-3 câu",
  "actionable_recommendations": ["Hành động 1", "Hành động 2", "Hành động 3"]
}
`;
      } else if (type === 'generate_alerts') {
        prompt = `
Bạn là hệ thống cảnh báo sớm HQC Smart City. Dựa vào metrics thời gian thực sau, hãy tạo các cảnh báo PROACTIVE để ngăn chặn sự cố.

**METRICS THỜI GIAN THỰC:**
${JSON.stringify(data)}

Yêu cầu:
1. Chỉ tạo cảnh báo nếu thực sự có bất thường hoặc xu hướng xấu (AQI > 100, tắc đường, v.v.).
2. Trả về tối đa 3 cảnh báo quan trọng nhất.
3. Ngôn ngữ: Tiếng Việt.

Hãy trả về JSON format:
{
  "alerts": [
    {
      "id": "ai-gen-[timestamp]",
      "type": "environment|traffic|civic|parking|health|safety",
      "severity": "critical|warning|info",
      "title": "Tiêu đề ngắn gọn",
      "description": "Mô tả chi tiết và lý do cảnh báo",
      "location": "Vị trí cụ thể (Quận/Phường tại Hà Nội)",
      "ward": "Tên phường cụ thể",
      "timestamp": "[ISO string]",
      "recommendation": "Hành động cụ thể để xử lý",
      "impact": "Tác động dự kiến nếu không xử lý",
      "affectedPopulation": "Số người ảnh hưởng ước tính",
      "isAIGenerated": true
    }
  ]
}
`;
      } else if (type === 'alert_details') {
        prompt = `
Bạn là chuyên gia ứng phó khẩn cấp HQC System. Hãy phân tích chi tiết cảnh báo sau và đưa ra phương án xử lý tối ưu.

**CẢNH BÁO:**
${JSON.stringify(data)}

Hãy trả về JSON format:
{
  "severity_assessment": "Đánh giá mức độ nghiêm trọng thực tế",
  "impact_prediction": "Dự báo tác động lan tỏa trong 6 giờ tới",
  "recommended_actions": ["Hành động 1", "Hành động 2", "Hành động 3"],
  "resource_allocation": "Đề xuất điều động nhân lực/vật lực cụ thể",
  "timeline_estimate": "Ước tính thời gian xử lý và phục hồi"
}
`;
      }

      const result = await model.generateContent(prompt);
      const response = result.response.text();
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      
      if (jsonMatch) {
        return NextResponse.json({
          success: true,
          data: JSON.parse(jsonMatch[0]),
          is_mock: false
        });
      }
      
      throw new Error('Invalid Gemini response format');
      
    } catch (aiError) {
      console.warn('Gemini AI error, using mock fallback:', aiError);
      return getMockAnalysis(type, data);
    }

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

function getMockAnalysis(type: string, data: any) {
  let mockData = {};
  
  if (type === 'city_health') {
    const score = data.overall_score || 70;
    mockData = {
      overall_assessment: `Hệ thống HQC System nhận định sức khỏe đô thị đang ở mức ${score >= 80 ? 'TỐT' : score >= 60 ? 'TRUNG BÌNH' : 'CẦN CHÚ Ý'}. Các chỉ số hạ tầng đang hoạt động ổn định nhưng cần tối ưu hóa tại các điểm nóng.`,
      environmental_insights: `Chất lượng không khí đang ở mức ${data.environmental?.aqi_status || 'ổn định'}. Cần theo dõi sự gia tăng nồng độ bụi mịn PM2.5 vào giờ cao điểm.`,
      traffic_insights: `Lưu lượng giao thông ở mức ${data.traffic?.congestion_level || 'vừa phải'}. Tốc độ di chuyển trung bình ${data.traffic?.average_speed || 40} km/h cho thấy sự thông thoáng tương đối.`,
      civic_insights: `Khả năng phản hồi sự cố dân sự đạt ${data.civic?.resolution_rate || 80}%. Cần ưu tiên giải quyết các vấn đề hạ tầng chiếu sáng và thoát nước.`,
      key_recommendations: [
        'Triển khai thêm cảm biến không khí tại các nút giao chính',
        'Tối ưu hóa chu kỳ đèn tín hiệu dựa trên lưu lượng thực tế',
        'Tăng cường tần suất thu gom rác thải tại các quận trung tâm'
      ],
      priority_actions: [
        'Kiểm soát khí thải xe buýt cũ',
        'Nâng cấp hệ thống thoát nước tại điểm ngập úng'
      ]
    };
  } else if (type === 'insights') {
    mockData = {
      correlation_analysis: 'Phân tích từ HQC AI cho thấy sự tương quan thuận (0.75) giữa nhiệt độ và nồng độ Ozone mặt đất. Khi nhiệt độ tăng trên 32°C, AQI có xu hướng tăng nhanh.',
      district_comparison: `Quận ${data.best_district || 'Hoàn Kiếm'} đang dẫn đầu về chỉ số môi trường, trong khi các quận có tốc độ đô thị hóa nhanh cần chú trọng hơn vào mảng xanh.`,
      temporal_patterns: 'Dữ liệu ghi nhận hai đỉnh ùn tắc và ô nhiễm rõ rệt vào 07:30 và 17:45, gắn liền với chu kỳ đi làm và tan sở của người dân.',
      predictive_insights: 'Dự báo trong 72 giờ tới, chỉ số AQI sẽ cải thiện do có gió mùa. Tuy nhiên, lưu lượng giao thông có thể tăng nhẹ vào dịp cuối tuần.',
      actionable_recommendations: [
        'Số hóa hoàn toàn quy trình báo cáo sự cố dân sự',
        'Xây dựng bản đồ nhiệt ô nhiễm thời gian thực',
        'Khuyến khích sử dụng phương tiện công cộng vào khung giờ đỏ'
      ]
    };
  } else if (type === 'generate_alerts') {
    mockData = {
      alerts: [
        {
          id: `ai-gen-${Date.now()}`,
          type: 'environment',
          severity: 'warning',
          title: 'Dự báo ô nhiễm cục bộ',
          description: 'Dựa trên tốc độ gió và lưu lượng xe, dự báo nồng độ PM2.5 tại khu vực Cầu Giấy sẽ tăng 20% trong 2 giờ tới.',
          location: 'Quận Cầu Giấy',
          ward: 'Phường Dịch Vọng Hậu',
          timestamp: new Date().toISOString(),
          recommendation: 'Kích hoạt hệ thống phun sương dập bụi, điều tiết giảm lưu lượng xe tải đi vào khu vực.',
          impact: 'AQI có thể vượt ngưỡng 150, ảnh hưởng đến 50,000 cư dân.',
          affectedPopulation: '50,000',
          isAIGenerated: true
        }
      ]
    };
  } else if (type === 'alert_details') {
    mockData = {
      severity_assessment: 'Mức độ nghiêm trọng CAO do nằm tại nút giao trọng yếu và trong giờ cao điểm.',
      impact_prediction: 'Có thể gây ùn tắc kéo dài 3km sang các tuyến đường lân cận như Nguyễn Trãi, Khuất Duy Tiến.',
      recommended_actions: [
        'Điều động ngay 2 tổ CSGT để phân luồng từ xa',
        'Cập nhật thông báo lên bảng điện tử VMS trong bán kính 2km',
        'Bố trí xe cứu hộ thường trực tại điểm nóng'
      ],
      resource_allocation: 'Yêu cầu Đội CSGT số 7 tăng cường 4 cán bộ, Đội Thanh tra Giao thông quận Thanh Xuân hỗ trợ.',
      timeline_estimate: 'Dự kiến giải tỏa hiện trường trong 45 phút, phục hồi lưu thông bình thường sau 90 phút.'
    };
  }

  return NextResponse.json({
    success: true,
    data: mockData,
    is_mock: true,
    message: 'Using simulated smart analysis because Gemini API key is not configured'
  });
}
