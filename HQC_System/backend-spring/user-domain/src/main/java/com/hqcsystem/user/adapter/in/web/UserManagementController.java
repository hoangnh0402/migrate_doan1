package com.hqcsystem.user.adapter.in.web;

import com.hqcsystem.user.adapter.out.persistence.entity.AppUserProfileDocument;
import com.hqcsystem.user.adapter.out.persistence.repository.AppUserMongoRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users")
public class UserManagementController {

    private final AppUserMongoRepository appUserRepo;
    private final PasswordEncoder passwordEncoder;

    public UserManagementController(AppUserMongoRepository appUserRepo, PasswordEncoder passwordEncoder) {
        this.appUserRepo = appUserRepo;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers(
            @RequestParam(defaultValue = "0") int skip,
            @RequestParam(defaultValue = "100") int limit,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String search) {

        List<AppUserProfileDocument> users = appUserRepo.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        List<Map<String, Object>> result = users.stream()
                .filter(u -> role == null || role.equals(u.getRole()))
                .filter(u -> isActive == null || isActive.equals(u.getIsActive()))
                .filter(u -> search == null || matchesSearch(u, search))
                .skip(skip)
                .limit(limit)
                .map(this::toUserResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getUserStats() {
        long total = appUserRepo.count();
        long active = appUserRepo.countByIsActive(true);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("total", total);
        response.put("dashboard", 0);
        response.put("app", total);
        response.put("active", active);
        response.put("inactive", total - active);
        response.put("by_role", Map.of("citizen", total));
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody CreateUserRequest request) {
        Optional<AppUserProfileDocument> existing = appUserRepo.findByEmail(request.email);
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Email Ä‘Ã£ Ä‘Æ°á»£c Ä‘Äƒng kÃ½"));
        }

        AppUserProfileDocument doc = new AppUserProfileDocument();
        doc.setEmail(request.email);
        doc.setUsername(request.username);
        doc.setPassword(passwordEncoder.encode(request.password));
        doc.setFullName(request.fullName);
        doc.setPhone(request.phone);
        doc.setRole(request.role != null ? request.role : "citizen");
        doc.setIsActive(true);
        doc.setIsVerified(true);
        doc.setPoints(0);
        doc.setLevel(1);
        doc.setCreatedAt(LocalDateTime.now());
        doc.setUpdatedAt(LocalDateTime.now());

        AppUserProfileDocument saved = appUserRepo.save(doc);
        return ResponseEntity.status(HttpStatus.CREATED).body(toUserResponse(saved));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> getUser(@PathVariable String userId) {
        return appUserRepo.findById(userId)
                .map(user -> ResponseEntity.ok(toUserResponse(user)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable String userId, @RequestBody UpdateUserRequest request) {
        Optional<AppUserProfileDocument> opt = appUserRepo.findById(userId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AppUserProfileDocument doc = opt.get();
        if (request.email != null) doc.setEmail(request.email);
        if (request.fullName != null) doc.setFullName(request.fullName);
        if (request.phone != null) doc.setPhone(request.phone);
        if (request.role != null) doc.setRole(request.role);
        if (request.isActive != null) doc.setIsActive(request.isActive);
        doc.setUpdatedAt(LocalDateTime.now());

        AppUserProfileDocument saved = appUserRepo.save(doc);
        return ResponseEntity.ok(toUserResponse(saved));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        Optional<AppUserProfileDocument> opt = appUserRepo.findById(userId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AppUserProfileDocument doc = opt.get();
        doc.setIsActive(false);
        doc.setUpdatedAt(LocalDateTime.now());
        appUserRepo.save(doc);

        return ResponseEntity.ok(Map.of("success", true, "message", "ÄÃ£ xÃ³a ngÆ°á»i dÃ¹ng"));
    }

    @PutMapping("/{userId}/toggle-status")
    public ResponseEntity<Map<String, Object>> toggleStatus(@PathVariable String userId) {
        Optional<AppUserProfileDocument> opt = appUserRepo.findById(userId);
        if (opt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        AppUserProfileDocument doc = opt.get();
        boolean newActive = !Boolean.TRUE.equals(doc.getIsActive());
        doc.setIsActive(newActive);
        doc.setUpdatedAt(LocalDateTime.now());
        appUserRepo.save(doc);

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("success", true);
        response.put("message", newActive ? "ÄÃ£ má»Ÿ khÃ³a tÃ i khoáº£n" : "ÄÃ£ khÃ³a tÃ i khoáº£n");
        response.put("is_active", newActive);
        return ResponseEntity.ok(response);
    }

    private boolean matchesSearch(AppUserProfileDocument user, String search) {
        String s = search.toLowerCase();
        String email = user.getEmail() != null ? user.getEmail().toLowerCase() : "";
        String username = user.getUsername() != null ? user.getUsername().toLowerCase() : "";
        String fullName = user.getFullName() != null ? user.getFullName().toLowerCase() : "";
        return email.contains(s) || username.contains(s) || fullName.contains(s);
    }

    private Map<String, Object> toUserResponse(AppUserProfileDocument user) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", user.getId());
        map.put("email", user.getEmail());
        map.put("username", user.getUsername());
        map.put("full_name", user.getFullName());
        map.put("phone", user.getPhone());
        map.put("role", user.getRole());
        map.put("source", "app");
        map.put("is_active", Boolean.TRUE.equals(user.getIsActive()));
        map.put("is_verified", Boolean.TRUE.equals(user.getIsVerified()));
        map.put("reports_count", 0);
        map.put("points", user.getPoints());
        map.put("level", user.getLevel());
        map.put("created_at", user.getCreatedAt());
        map.put("last_login", user.getLastLogin());
        map.put("status", Boolean.TRUE.equals(user.getIsActive()) ? "active" : "inactive");
        return map;
    }

    public static class CreateUserRequest {
        public String email;
        public String username;
        public String fullName;
        public String phone;
        public String password;
        public String role;
    }

    public static class UpdateUserRequest {
        public String email;
        public String fullName;
        public String phone;
        public String role;
        public Boolean isActive;
    }
}

