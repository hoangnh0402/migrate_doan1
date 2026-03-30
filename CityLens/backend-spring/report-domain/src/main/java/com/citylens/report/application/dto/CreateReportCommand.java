package com.citylens.report.application.dto;

import java.util.List;
import java.util.Map;

public class CreateReportCommand {
    private final String reportType;
    private final String ward;
    private final String addressDetail;
    private final Double locationLat;
    private final Double locationLng;
    private final String title;
    private final String content;
    private final List<Map<String, String>> media;
    private final String userId;

    private CreateReportCommand(Builder builder) {
        this.reportType = builder.reportType;
        this.ward = builder.ward;
        this.addressDetail = builder.addressDetail;
        this.locationLat = builder.locationLat;
        this.locationLng = builder.locationLng;
        this.title = builder.title;
        this.content = builder.content;
        this.media = builder.media;
        this.userId = builder.userId;
    }

    public String getReportType() { return reportType; }
    public String getWard() { return ward; }
    public String getAddressDetail() { return addressDetail; }
    public Double getLocationLat() { return locationLat; }
    public Double getLocationLng() { return locationLng; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public List<Map<String, String>> getMedia() { return media; }
    public String getUserId() { return userId; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String reportType;
        private String ward;
        private String addressDetail;
        private Double locationLat;
        private Double locationLng;
        private String title;
        private String content;
        private List<Map<String, String>> media;
        private String userId;

        public Builder reportType(String reportType) { this.reportType = reportType; return this; }
        public Builder ward(String ward) { this.ward = ward; return this; }
        public Builder addressDetail(String addressDetail) { this.addressDetail = addressDetail; return this; }
        public Builder locationLat(Double locationLat) { this.locationLat = locationLat; return this; }
        public Builder locationLng(Double locationLng) { this.locationLng = locationLng; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder media(List<Map<String, String>> media) { this.media = media; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }

        public CreateReportCommand build() { return new CreateReportCommand(this); }
    }
}
