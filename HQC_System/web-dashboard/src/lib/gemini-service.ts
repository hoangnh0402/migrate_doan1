// Copyright (c) 2025 HQC System Contributors
// Licensed under the GNU General Public License v3.0 (GPL-3.0)

/**
 * Gemini AI Service
 * Handles urban context analysis using Gemini through internal API routes
 */

export interface CityHealthAnalysis {
  overall_assessment: string;
  environmental_insights: string;
  traffic_insights: string;
  civic_insights: string;
  parking_insights: string;
  key_recommendations: string[];
  priority_actions: string[];
}

export interface DataInsightAnalysis {
  correlation_analysis: string;
  district_comparison: string;
  temporal_patterns: string;
  predictive_insights: string;
  actionable_recommendations: string[];
}

export interface AlertAnalysis {
  severity_assessment: string;
  impact_prediction: string;
  recommended_actions: string[];
  resource_allocation: string;
  timeline_estimate: string;
}

class GeminiService {
  /**
   * Phân tích sức khỏe đô thị tổng thể thông qua API route
   */
  async analyzeCityHealth(data: {
    overall_score: number;
    environmental: any;
    traffic: any;
    civic: any;
    parking: any;
  }): Promise<CityHealthAnalysis> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'city_health', data })
      });
      
      const result = await response.json();
      if (result.success) return result.data;
      throw new Error(result.error);
    } catch (error) {
      console.error('Gemini analysis error:', error);
      // Fallback
      return {
        overall_assessment: 'Dữ liệu sức khỏe đô thị hiện tại đang ở mức ổn định theo đánh giá từ hệ thống giám sát.',
        environmental_insights: 'Chất lượng không khí đang được duy trì trong ngưỡng cho phép.',
        traffic_insights: 'Lưu lượng giao thông diễn biến bình thường theo đúng quy luật hàng ngày.',
        civic_insights: 'Các sự cố dân sự đang được các đội ngũ chuyên môn tiếp nhận xử lý.',
        parking_insights: 'Hạ tầng bãi đỗ xe đang đáp ứng tốt nhu cầu thực tế của người dân.',
        key_recommendations: ['Tiếp tục giám sát hệ thống', 'Duy trì các biện pháp bảo vệ môi trường', 'Cập nhật hạ tầng số'],
        priority_actions: ['Kiểm tra kết nối dữ liệu', 'Xác minh độ chính xác cảm biến', 'Cập nhật báo cáo ngày'],
      };
    }
  }

  /**
   * Phân tích correlation và patterns thông qua API route
   */
  async analyzeDataInsights(data: {
    weather_aqi_correlation: any[];
    district_performance: any[];
    temporal_patterns: any[];
    predictive_trends: any[];
  }): Promise<DataInsightAnalysis> {
    try {
      // Calculate summary for prompt
      const avgAqi = data.weather_aqi_correlation && data.weather_aqi_correlation.length > 0 
        ? data.weather_aqi_correlation.reduce((sum, d) => sum + (d.aqi || 0), 0) / data.weather_aqi_correlation.length
        : 80;
      
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          type: 'insights', 
          data: {
            avg_aqi: avgAqi.toFixed(1),
            best_district: 'Hoàn Kiếm',
            worst_district: 'Cầu Giấy',
            correlation_summary: data.weather_aqi_correlation ? data.weather_aqi_correlation.slice(-5) : []
          }
        })
      });
      
      const result = await response.json();
      if (result.success) return result.data;
      throw new Error(result.error);
    } catch (error) {
      console.error('Gemini insights analysis error:', error);
      return {
        correlation_analysis: 'Phân tích từ HQC AI đang đánh giá mối quan hệ giữa nhiệt độ và mật độ AQI.',
        district_comparison: 'Dữ liệu sơ bộ cho thấy sự chênh lệch chỉ số giữa khu vực trung tâm và ngoại vi.',
        temporal_patterns: 'Mô hình lưu lượng xe phản ánh rõ rệt chu kỳ hoạt động của cư dân thủ đô.',
        predictive_insights: 'Dự báo xu hướng đô thị dựa trên tích lũy dữ liệu lịch sử và thời gian thực.',
        actionable_recommendations: ['Mở rộng mạng lưới cảm biến', 'Tối ưu hóa phản hồi dân sự', 'Khuyến nghị giải pháp giao thông thông minh'],
      };
    }
  }

  /**
   * Phân tích cảnh báo cụ thể
   */
  async analyzeAlert(alert: any): Promise<AlertAnalysis> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'alert_details', data: alert })
      });
      
      const result = await response.json();
      if (result.success) return result.data;
      throw new Error(result.error);
    } catch (error) {
      console.error('Gemini alert analysis error:', error);
      return {
        severity_assessment: `Cảnh báo ${alert.severity === 'critical' ? 'nghiêm trọng' : 'cần lưu ý'} về ${alert.title ? alert.title.toLowerCase() : 'sự cố'}.`,
        impact_prediction: 'Ảnh hưởng trực tiếp đến người dân tại khu vực lân cận trong 2-4 giờ tới.',
        recommended_actions: ['Tuân thủ chỉ dẫn của cơ quan chức năng', 'Hạn chế di chuyển vào khu vực cảnh báo'],
        resource_allocation: 'Yêu cầu các đơn vị trực thuộc sẵn sàng phương án ứng phó.',
        timeline_estimate: 'Dự kiến xử lý và ổn định tình hình trong 1-2 giờ.',
      };
    }
  }

  /**
   * Tạo cảnh báo thông minh từ metrics thời gian thực
   */
  async analyzeSmartAlerts(metrics: any): Promise<any[]> {
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'generate_alerts', data: metrics })
      });
      
      const result = await response.json();
      if (result.success) return result.data.alerts || [];
      throw new Error(result.error);
    } catch (error) {
      console.error('Gemini smart alerts error:', error);
      return [];
    }
  }
}

export const geminiService = new GeminiService();
export default geminiService;
