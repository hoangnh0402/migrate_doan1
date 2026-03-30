package com.citylens.report.domain.model;

import java.time.Instant;
import java.util.List;

public class Report {
    private final String id;
    private final String reportType;
    private final String ward;
    private final String addressDetail;
    private final Double locationLat;
    private final Double locationLng;
    private final String title;
    private final String content;
    private final List<String> mediaUrls;
    private final String userId;
    private final String status;
    private final String adminNote;
    private final Instant createdAt;
    private final Instant updatedAt;

    private Report(Builder builder) {
        this.id = builder.id;
        this.reportType = builder.reportType;
        this.ward = builder.ward;
        this.addressDetail = builder.addressDetail;
        this.locationLat = builder.locationLat;
        this.locationLng = builder.locationLng;
        this.title = builder.title;
        this.content = builder.content;
        this.mediaUrls = builder.mediaUrls;
        this.userId = builder.userId;
        this.status = builder.status;
        this.adminNote = builder.adminNote;
        this.createdAt = builder.createdAt;
        this.updatedAt = builder.updatedAt;
    }

    public String getId() { return id; }
    public String getReportType() { return reportType; }
    public String getWard() { return ward; }
    public String getAddressDetail() { return addressDetail; }
    public Double getLocationLat() { return locationLat; }
    public Double getLocationLng() { return locationLng; }
    public String getTitle() { return title; }
    public String getContent() { return content; }
    public List<String> getMediaUrls() { return mediaUrls; }
    public String getUserId() { return userId; }
    public String getStatus() { return status; }
    public String getAdminNote() { return adminNote; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    public boolean isPending() { return "pending".equals(status); }
    public boolean isResolved() { return "resolved".equals(status); }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private String id;
        private String reportType;
        private String ward;
        private String addressDetail;
        private Double locationLat;
        private Double locationLng;
        private String title;
        private String content;
        private List<String> mediaUrls;
        private String userId;
        private String status;
        private String adminNote;
        private Instant createdAt;
        private Instant updatedAt;

        public Builder id(String id) { this.id = id; return this; }
        public Builder reportType(String reportType) { this.reportType = reportType; return this; }
        public Builder ward(String ward) { this.ward = ward; return this; }
        public Builder addressDetail(String addressDetail) { this.addressDetail = addressDetail; return this; }
        public Builder locationLat(Double locationLat) { this.locationLat = locationLat; return this; }
        public Builder locationLng(Double locationLng) { this.locationLng = locationLng; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder mediaUrls(List<String> mediaUrls) { this.mediaUrls = mediaUrls; return this; }
        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder status(String status) { this.status = status; return this; }
        public Builder adminNote(String adminNote) { this.adminNote = adminNote; return this; }
        public Builder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(Instant updatedAt) { this.updatedAt = updatedAt; return this; }

        public Report build() { return new Report(this); }
    }
}
