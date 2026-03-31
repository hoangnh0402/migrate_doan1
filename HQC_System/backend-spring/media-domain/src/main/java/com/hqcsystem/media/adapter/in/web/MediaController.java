package com.hqcsystem.media.adapter.in.web;

import com.hqcsystem.media.adapter.out.persistence.entity.MediaFileEntity;
import com.hqcsystem.media.adapter.out.persistence.entity.ReportMediaEntity;
import com.hqcsystem.media.application.service.MediaService;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(defaultValue = "reports") String category,
            @RequestParam(name = "user_id") UUID userId) {
        try {
            MediaFileEntity media = mediaService.processAndSaveImage(file, userId, category);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", "File uploaded successfully");
            response.put("media", toMediaMap(media));
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Upload failed: " + e.getMessage()));
        }
    }

    @PostMapping("/upload-multiple")
    public ResponseEntity<Map<String, Object>> uploadMultiple(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(defaultValue = "reports") String category,
            @RequestParam(name = "user_id") UUID userId) {
        if (files.size() > 5) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", "Maximum 5 files per upload"));
        }

        List<Map<String, Object>> uploaded = new ArrayList<>();
        List<Map<String, Object>> errors = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                MediaFileEntity media = mediaService.processAndSaveImage(file, userId, category);
                uploaded.add(toMediaMap(media));
            } catch (Exception e) {
                errors.add(Map.of("file", Objects.toString(file.getOriginalFilename(), "unknown"), "error", e.getMessage()));
            }
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", !uploaded.isEmpty());
        response.put("uploaded", uploaded);
        response.put("errors", errors);
        response.put("total_uploaded", uploaded.size());
        response.put("total_errors", errors.size());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{mediaId}")
    public ResponseEntity<?> getMedia(@PathVariable UUID mediaId) {
        Optional<MediaFileEntity> media = mediaService.getById(mediaId);
        if (media.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "Media not found"));
        }
        return ResponseEntity.ok(toMediaMap(media.get()));
    }

    @GetMapping("/reports/{reportId}/media")
    public ResponseEntity<Map<String, Object>> getReportMedia(@PathVariable UUID reportId) {
        List<MediaFileEntity> mediaList = mediaService.getReportMedia(reportId);
        List<Map<String, Object>> items = mediaList.stream().map(this::toMediaMap).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("total", items.size(), "media", items));
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<?> deleteMedia(
            @PathVariable UUID mediaId,
            @RequestParam(name = "user_id") UUID userId) {
        try {
            boolean deleted = mediaService.deleteMedia(mediaId, userId);
            if (!deleted) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("detail", "Media not found"));
            }
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("detail", e.getMessage()));
        }
    }

    @PostMapping("/reports/{reportId}/attach")
    public ResponseEntity<?> attachMediaToReport(
            @PathVariable UUID reportId,
            @RequestParam(name = "media_id") UUID mediaId,
            @RequestParam(name = "display_order", defaultValue = "0") int displayOrder) {
        try {
            ReportMediaEntity link = mediaService.attachToReport(reportId, mediaId, displayOrder);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("success", true);
            response.put("message", "Media attached to report");
            response.put("report_media_id", link.getId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @GetMapping("/my-media")
    public ResponseEntity<Map<String, Object>> getMyMedia(
            @RequestParam(name = "user_id") UUID userId,
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(name = "file_type", required = false) String fileType) {
        Page<MediaFileEntity> page = mediaService.getUserMedia(userId, skip, limit, fileType);
        List<Map<String, Object>> items = page.getContent().stream().map(this::toMediaMap).collect(Collectors.toList());
        return ResponseEntity.ok(Map.of("total", page.getTotalElements(), "media", items));
    }

    private Map<String, Object> toMediaMap(MediaFileEntity media) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", media.getId());
        map.put("file_type", media.getFileType());
        map.put("file_url", "/uploads/" + media.getStoragePath());
        map.put("thumbnail_url", media.getThumbnailPath());
        map.put("file_size", media.getFileSize());
        map.put("width", media.getWidth());
        map.put("height", media.getHeight());
        map.put("original_filename", media.getOriginalFilename());
        map.put("created_at", media.getCreatedAt() != null ? media.getCreatedAt().toString() : null);
        return map;
    }
}

