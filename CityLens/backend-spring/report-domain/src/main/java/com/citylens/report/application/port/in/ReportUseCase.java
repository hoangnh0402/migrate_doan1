package com.citylens.report.application.port.in;

import com.citylens.report.application.dto.CreateReportCommand;
import com.citylens.report.application.dto.UpdateReportCommand;
import com.citylens.report.domain.model.Report;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ReportUseCase {
    Report createReport(CreateReportCommand command);
    Optional<Report> getReportById(String reportId);
    List<Report> getReports(String status, String userId, int limit, int skip);
    long getReportsCount(String status, String userId);
    Report updateReport(String reportId, UpdateReportCommand command);
    boolean deleteReport(String reportId);
    Map<String, Long> getReportStats(String userId);
}
