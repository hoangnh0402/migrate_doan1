package com.citylens.media.application.service;

import com.citylens.media.adapter.out.persistence.entity.MediaFileEntity;
import com.citylens.media.adapter.out.persistence.entity.ReportMediaEntity;
import com.citylens.media.adapter.out.persistence.repository.MediaFileJpaRepository;
import com.citylens.media.adapter.out.persistence.repository.ReportMediaJpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.*;
import java.util.List;

@Service
public class MediaService {

    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg", "image/png", "image/jpg", "image/webp"
    );
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final int THUMBNAIL_SIZE = 300;
    private static final int MEDIUM_SIZE = 800;

    private final Path uploadDir = Paths.get("uploads");
    private final MediaFileJpaRepository mediaRepo;
    private final ReportMediaJpaRepository reportMediaRepo;

    public MediaService(MediaFileJpaRepository mediaRepo, ReportMediaJpaRepository reportMediaRepo) {
        this.mediaRepo = mediaRepo;
        this.reportMediaRepo = reportMediaRepo;
        ensureUploadDirs();
    }

    private void ensureUploadDirs() {
        try {
            Files.createDirectories(uploadDir.resolve("reports/originals"));
            Files.createDirectories(uploadDir.resolve("reports/thumbnails"));
            Files.createDirectories(uploadDir.resolve("reports/medium"));
            Files.createDirectories(uploadDir.resolve("avatars"));
        } catch (IOException e) {
            throw new RuntimeException("Failed to create upload directories", e);
        }
    }

    @Transactional
    public MediaFileEntity processAndSaveImage(MultipartFile file, UUID userId, String category) throws IOException {
        validateImageFile(file);

        String ext = getExtension(file.getOriginalFilename());
        String uniqueId = UUID.randomUUID().toString();
        String baseFilename = uniqueId + ext;

        LocalDate now = LocalDate.now();
        String datePath = now.getYear() + "/" + String.format("%02d", now.getMonthValue());

        BufferedImage originalImage = ImageIO.read(file.getInputStream());
        if (originalImage == null) {
            throw new IllegalArgumentException("Cannot read image file");
        }

        int width = originalImage.getWidth();
        int height = originalImage.getHeight();

        // Save original
        Path originalDir = uploadDir.resolve(category).resolve("originals").resolve(datePath);
        Files.createDirectories(originalDir);
        Path originalPath = originalDir.resolve(baseFilename);
        ImageIO.write(originalImage, ext.replace(".", "").equals("jpg") ? "jpeg" : ext.replace(".", ""), originalPath.toFile());

        // Generate thumbnail
        Path thumbnailDir = uploadDir.resolve(category).resolve("thumbnails").resolve(datePath);
        Files.createDirectories(thumbnailDir);
        Path thumbnailPath = thumbnailDir.resolve(baseFilename);
        BufferedImage thumbnail = resizeImage(originalImage, THUMBNAIL_SIZE, THUMBNAIL_SIZE);
        ImageIO.write(thumbnail, ext.replace(".", "").equals("jpg") ? "jpeg" : ext.replace(".", ""), thumbnailPath.toFile());

        // Generate medium
        Path mediumDir = uploadDir.resolve(category).resolve("medium").resolve(datePath);
        Files.createDirectories(mediumDir);
        Path mediumPath = mediumDir.resolve(baseFilename);
        BufferedImage medium = resizeImage(originalImage, MEDIUM_SIZE, MEDIUM_SIZE);
        ImageIO.write(medium, ext.replace(".", "").equals("jpg") ? "jpeg" : ext.replace(".", ""), mediumPath.toFile());

        // Create database record
        MediaFileEntity media = new MediaFileEntity();
        media.setFilename(baseFilename);
        media.setOriginalFilename(file.getOriginalFilename());
        media.setFileType("image");
        media.setMimeType(file.getContentType());
        media.setStoragePath(originalPath.toString().replace("\\", "/"));
        media.setStorageType("local");
        media.setFileSize(file.getSize());
        media.setWidth(width);
        media.setHeight(height);
        media.setUploadedBy(userId);
        media.setThumbnailPath("/uploads/" + category + "/thumbnails/" + datePath + "/" + baseFilename);
        media.setMediumPath("/uploads/" + category + "/medium/" + datePath + "/" + baseFilename);

        return mediaRepo.save(media);
    }

    public Optional<MediaFileEntity> getById(UUID mediaId) {
        return mediaRepo.findById(mediaId);
    }

    public List<MediaFileEntity> getReportMedia(UUID reportId) {
        List<ReportMediaEntity> links = reportMediaRepo.findByReportIdOrderByDisplayOrder(reportId);
        List<MediaFileEntity> result = new ArrayList<>();
        for (ReportMediaEntity link : links) {
            mediaRepo.findById(link.getMediaId()).ifPresent(result::add);
        }
        return result;
    }

    @Transactional
    public boolean deleteMedia(UUID mediaId, UUID userId) {
        Optional<MediaFileEntity> opt = mediaRepo.findById(mediaId);
        if (opt.isEmpty()) return false;

        MediaFileEntity media = opt.get();
        if (!media.getUploadedBy().equals(userId)) {
            throw new SecurityException("Not authorized to delete this media");
        }

        // Delete physical files
        try {
            Path filePath = Paths.get(media.getStoragePath());
            Files.deleteIfExists(filePath);
            if (media.getThumbnailPath() != null) {
                Files.deleteIfExists(Paths.get(media.getThumbnailPath().replaceFirst("^/uploads/", "uploads/")));
            }
            if (media.getMediumPath() != null) {
                Files.deleteIfExists(Paths.get(media.getMediumPath().replaceFirst("^/uploads/", "uploads/")));
            }
        } catch (IOException e) {
            // Log but don't fail
        }

        mediaRepo.delete(media);
        return true;
    }

    @Transactional
    public ReportMediaEntity attachToReport(UUID reportId, UUID mediaId, int displayOrder) {
        if (reportMediaRepo.existsByReportIdAndMediaId(reportId, mediaId)) {
            throw new IllegalStateException("Media already attached to this report");
        }

        ReportMediaEntity link = new ReportMediaEntity();
        link.setReportId(reportId);
        link.setMediaId(mediaId);
        link.setDisplayOrder(displayOrder);
        return reportMediaRepo.save(link);
    }

    public Page<MediaFileEntity> getUserMedia(UUID userId, int skip, int limit, String fileType) {
        PageRequest pageable = PageRequest.of(skip / Math.max(limit, 1), limit);
        if (fileType != null && !fileType.isEmpty()) {
            return mediaRepo.findByUploadedByAndFileTypeOrderByCreatedAtDesc(userId, fileType, pageable);
        }
        return mediaRepo.findByUploadedByOrderByCreatedAtDesc(userId, pageable);
    }

    private void validateImageFile(MultipartFile file) {
        if (!ALLOWED_IMAGE_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("Invalid image type. Allowed: " + ALLOWED_IMAGE_TYPES);
        }
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("File too large. Max size: 5MB");
        }
    }

    private BufferedImage resizeImage(BufferedImage original, int maxWidth, int maxHeight) {
        int w = original.getWidth();
        int h = original.getHeight();
        double ratio = Math.min((double) maxWidth / w, (double) maxHeight / h);
        if (ratio >= 1.0) return original;

        int newW = (int) (w * ratio);
        int newH = (int) (h * ratio);
        BufferedImage resized = new BufferedImage(newW, newH, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resized.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(original, 0, 0, newW, newH, null);
        g.dispose();
        return resized;
    }

    private String getExtension(String filename) {
        if (filename == null) return ".jpg";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot).toLowerCase() : ".jpg";
    }
}
