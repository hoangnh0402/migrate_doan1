package com.citylens.user.adapter.in.web;

import com.citylens.user.application.query.dto.JwtResponse;
import com.citylens.user.application.query.dto.LoginQuery;
import com.citylens.user.application.query.port.in.LoginUseCase;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/app/auth")
public class AppAuthController {

    private final LoginUseCase loginUseCase;

    public AppAuthController(LoginUseCase loginUseCase) {
        this.loginUseCase = loginUseCase;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        LoginQuery query = LoginQuery.builder()
                .username(request.username)
                .password(request.password)
                .build();

        JwtResponse response = loginUseCase.authenticateAppUser(query);

        Map<String, Object> data = new HashMap<>();
        // Mocking user profile for mobile compatibility temporarily
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

    public static class LoginRequest {
        public String username;
        public String password;
    }
}
