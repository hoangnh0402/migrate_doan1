package com.citylens.user.adapter.in.web;

import com.citylens.user.application.command.dto.ChangePasswordCommand;
import com.citylens.user.application.command.dto.RegisterCommand;
import com.citylens.user.application.command.dto.ResetPasswordCommand;
import com.citylens.user.application.command.dto.UpdateProfileCommand;
import com.citylens.user.application.command.port.in.PasswordUseCase;
import com.citylens.user.application.command.port.in.ProfileCommandUseCase;
import com.citylens.user.application.command.port.in.RegisterUseCase;
import com.citylens.user.application.query.dto.JwtResponse;
import com.citylens.user.application.query.dto.LoginQuery;
import com.citylens.user.application.query.dto.UserProfileDto;
import com.citylens.user.application.query.port.in.LoginUseCase;
import com.citylens.user.application.query.port.in.ProfileQueryUseCase;
import com.citylens.user.domain.model.AppUser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/app/auth")
@Tag(name = "App Auth", description = "Mobile App Authentication & User Management")
public class AppAuthController {

    private final LoginUseCase loginUseCase;
    private final RegisterUseCase registerUseCase;
    private final ProfileQueryUseCase profileQueryUseCase;
    private final ProfileCommandUseCase profileCommandUseCase;
    private final PasswordUseCase passwordUseCase;

    public AppAuthController(LoginUseCase loginUseCase,
                              RegisterUseCase registerUseCase,
                              ProfileQueryUseCase profileQueryUseCase,
                              ProfileCommandUseCase profileCommandUseCase,
                              PasswordUseCase passwordUseCase) {
        this.loginUseCase = loginUseCase;
        this.registerUseCase = registerUseCase;
        this.profileQueryUseCase = profileQueryUseCase;
        this.profileCommandUseCase = profileCommandUseCase;
        this.passwordUseCase = passwordUseCase;
    }

    @PostMapping("/login")
    @Operation(summary = "Mobile App user login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        LoginQuery query = LoginQuery.builder()
                .username(request.username)
                .password(request.password)
                .build();

        JwtResponse response = loginUseCase.authenticateAppUser(query);

        Map<String, Object> data = new HashMap<>();
        Map<String, Object> userDict = new HashMap<>();
        userDict.put("username", request.username);

        data.put("user", userDict);
        data.put("access_token", response.getAccessToken());
        data.put("token_type", response.getTokenType().toLowerCase());

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("data", data);

        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/register")
    @Operation(summary = "Mobile App user registration")
    public ResponseEntity<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        RegisterCommand command = RegisterCommand.builder()
                .username(request.username)
                .email(request.email)
                .rawPassword(request.password)
                .fullName(request.fullName)
                .phone(request.phone)
                .isAdmin(false)
                .build();

        AppUser user = registerUseCase.registerAppUser(command);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Đăng ký thành công");

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("username", user.getUsername());
        userData.put("email", user.getEmail());
        userData.put("full_name", user.getFullName());
        userData.put("phone", user.getPhone());
        userData.put("role", user.getRole());
        userData.put("status", user.getStatus());
        responseBody.put("user", userData);

        return ResponseEntity.ok(responseBody);
    }

    @GetMapping("/me")
    @Operation(summary = "Get current app user profile")
    public ResponseEntity<Map<String, Object>> getProfile(Authentication authentication) {
        String username = authentication.getName();
        UserProfileDto profile = profileQueryUseCase.getProfileByUsername(username, false);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("data", profile);

        return ResponseEntity.ok(responseBody);
    }

    @PutMapping("/me")
    @Operation(summary = "Update current app user profile")
    public ResponseEntity<Map<String, Object>> updateProfile(Authentication authentication,
                                                              @RequestBody UpdateProfileRequest request) {
        String username = authentication.getName();
        UpdateProfileCommand command = UpdateProfileCommand.builder()
                .userId(username)
                .fullName(request.fullName)
                .phone(request.phone)
                .isAdmin(false)
                .build();

        profileCommandUseCase.updateProfile(command);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Cập nhật thành công");

        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change app user password")
    public ResponseEntity<Map<String, Object>> changePassword(Authentication authentication,
                                                               @RequestBody ChangePasswordRequest request) {
        String username = authentication.getName();
        ChangePasswordCommand command = ChangePasswordCommand.builder()
                .userId(username)
                .oldPassword(request.oldPassword)
                .newPassword(request.newPassword)
                .isAdmin(false)
                .build();

        passwordUseCase.changePassword(command);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Đổi mật khẩu thành công");

        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/forgot-password")
    @Operation(summary = "Request password reset token for app user")
    public ResponseEntity<Map<String, Object>> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String resetToken = passwordUseCase.generateResetToken(request.email, false);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Token đặt lại mật khẩu đã được gửi");
        responseBody.put("reset_token", resetToken);

        return ResponseEntity.ok(responseBody);
    }

    @PostMapping("/reset-password")
    @Operation(summary = "Reset password with token for app user")
    public ResponseEntity<Map<String, Object>> resetPassword(@RequestBody ResetPasswordRequest request) {
        ResetPasswordCommand command = ResetPasswordCommand.builder()
                .token(request.token)
                .newPassword(request.newPassword)
                .isAdmin(false)
                .build();

        passwordUseCase.resetPassword(command);

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("success", true);
        responseBody.put("message", "Đặt lại mật khẩu thành công");

        return ResponseEntity.ok(responseBody);
    }

    // Request DTOs
    public static class LoginRequest {
        public String username;
        public String password;
    }

    public static class RegisterRequest {
        public String username;
        public String email;
        public String password;
        public String fullName;
        public String phone;
    }

    public static class UpdateProfileRequest {
        public String fullName;
        public String phone;
    }

    public static class ChangePasswordRequest {
        public String oldPassword;
        public String newPassword;
    }

    public static class ForgotPasswordRequest {
        public String email;
    }

    public static class ResetPasswordRequest {
        public String token;
        public String newPassword;
    }
}
