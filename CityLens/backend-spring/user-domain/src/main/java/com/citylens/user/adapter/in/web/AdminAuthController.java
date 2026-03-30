package com.citylens.user.adapter.in.web;

import com.citylens.user.application.query.dto.JwtResponse;
import com.citylens.user.application.query.dto.LoginQuery;
import com.citylens.user.application.query.port.in.LoginUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AdminAuthController {

    private final LoginUseCase loginUseCase;

    public AdminAuthController(LoginUseCase loginUseCase) {
        this.loginUseCase = loginUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        LoginQuery query = LoginQuery.builder()
                .username(request.email)
                .password(request.password)
                .build();

        JwtResponse response = loginUseCase.authenticateAdmin(query);

        Map<String, Object> tokenData = new HashMap<>();
        tokenData.put("access_token", response.getAccessToken());
        // For compatibility with the FastAPI response structure, we add a mock refresh_token 
        // until we implement full refresh logic.
        tokenData.put("refresh_token", "mock_refresh_token_for_now");
        tokenData.put("token_type", response.getTokenType().toLowerCase());
        tokenData.put("expires_in", 3600);

        Map<String, Object> responseBody = new HashMap<>();
        // Mock user details for compatibility. In a real scenario, the use case should retrieve this.
        Map<String, Object> userDict = new HashMap<>();
        userDict.put("email", request.email);
        
        responseBody.put("user", userDict);
        responseBody.put("token", tokenData);
        responseBody.put("message", "Đăng nhập thành công");

        return ResponseEntity.ok(responseBody);
    }

    public static class LoginRequest {
        public String email;
        public String password;
    }
}
