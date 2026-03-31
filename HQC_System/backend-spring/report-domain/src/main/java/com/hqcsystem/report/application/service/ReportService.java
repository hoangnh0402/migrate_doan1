package com.hqcsystem.report.application.service;

import com.hqcsystem.report.application.dto.CreateReportCommand;
import com.hqcsystem.report.application.dto.UpdateReportCommand;
import com.hqcsystem.report.application.port.in.ReportUseCase;
import com.hqcsystem.report.application.port.out.ReportPersistencePort;
import com.hqcsystem.report.domain.model.Report;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportService implements ReportUseCase {

    private final ReportPersistencePort reportPersistencePort;

    public ReportService(ReportPersistencePort reportPersistencePort) {
        this.reportPersistencePort = reportPersistencePort;
    }

    @Override
    public Report createReport(CreateReportCommand command) {
        Report report = Report.builder()
                .reportType(command.getReportType())
                .ward(command.getWard())
                .addressDetail(command.getAddressDetail() != null ? command.getAddressDetail() : "")
                .locationLat(command.getLocationLat())
                .locationLng(command.getLocationLng())
                .title(command.getTitle() != null ? command.getTitle() : "")
                .content(command.getContent())
                .userId(command.getUserId())
                .status("pending")
                .build();

        return reportPersistencePort.save(report, command.getMedia());
    }

    @Override
    public Optional<Report> getReportById(String reportId) {
        return reportPersistencePort.findById(reportId);
    }

    @Override
    public List<Report> getReports(String status, String userId, int limit, int skip) {
        return reportPersistencePort.findAll(status, userId, limit, skip);
    }

    @Override
    public long getReportsCount(String status, String userId) {
        return reportPersistencePort.count(status, userId);
    }

    @Override
    public Report updateReport(String reportId, UpdateReportCommand command) {
        return reportPersistencePort.update(
                reportId,
                command.getStatus(),
                command.getAdminNote(),
                command.getTitle(),
                command.getContent(),
                command.getReportType(),
                command.getWard(),
                command.getAddressDetail()
        );
    }

    @Override
    public boolean deleteReport(String reportId) {
        return reportPersistencePort.deleteById(reportId);
    }

    @Override
    public Map<String, Long> getReportStats(String userId) {
        Map<String, Long> stats = new LinkedHashMap<>();
        stats.put("total", reportPersistencePort.count(null, userId));
        stats.put("pending", reportPersistencePort.count("pending", userId));
        stats.put("processing", reportPersistencePort.count("processing", userId));
        stats.put("resolved", reportPersistencePort.count("resolved", userId));
        stats.put("rejected", reportPersistencePort.count("rejected", userId));
        return stats;
    }
}

