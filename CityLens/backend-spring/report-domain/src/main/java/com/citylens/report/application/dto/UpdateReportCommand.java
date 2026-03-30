package com.citylens.report.application.dto;

public class UpdateReportCommand {
    private String status;
    private String adminNote;
    private String title;
    private String content;
    private String reportType;
    private String ward;
    private String addressDetail;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getAdminNote() { return adminNote; }
    public void setAdminNote(String adminNote) { this.adminNote = adminNote; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public String getReportType() { return reportType; }
    public void setReportType(String reportType) { this.reportType = reportType; }
    public String getWard() { return ward; }
    public void setWard(String ward) { this.ward = ward; }
    public String getAddressDetail() { return addressDetail; }
    public void setAddressDetail(String addressDetail) { this.addressDetail = addressDetail; }
}
