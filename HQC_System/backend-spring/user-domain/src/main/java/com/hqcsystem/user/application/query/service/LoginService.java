package com.hqcsystem.user.application.query.service;

import com.hqcsystem.user.application.query.dto.JwtResponse;
import com.hqcsystem.user.application.query.dto.LoginQuery;
import com.hqcsystem.user.application.query.port.in.LoginUseCase;
import com.hqcsystem.user.application.query.port.out.GenerateTokenPort;
import com.hqcsystem.user.application.query.port.out.LoadUserPort;
import com.hqcsystem.user.domain.model.AdminUser;
import com.hqcsystem.user.domain.model.AppUser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class LoginService implements LoginUseCase {

    private final LoadUserPort loadUserPort;
    private final GenerateTokenPort generateTokenPort;
    private final PasswordEncoder passwordEncoder;

    public LoginService(LoadUserPort loadUserPort, GenerateTokenPort generateTokenPort, PasswordEncoder passwordEncoder) {
        this.loadUserPort = loadUserPort;
        this.generateTokenPort = generateTokenPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public JwtResponse authenticateAdmin(LoginQuery query) {
        Optional<AdminUser> userOpt = loadUserPort.loadAdminUserByUsername(query.getUsername());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        AdminUser user = userOpt.get();
        String hashedPassword = loadUserPort.getAdminHashedPassword(query.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(query.getPassword(), hashedPassword)) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = generateTokenPort.generateToken(user.getUsername(), user.getRole(), "dashboard");
        
        return JwtResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }

    @Override
    public JwtResponse authenticateAppUser(LoginQuery query) {
        Optional<AppUser> userOpt = loadUserPort.loadAppUserByUsername(query.getUsername());
        if (userOpt.isEmpty()) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        AppUser user = userOpt.get();
        String hashedPassword = loadUserPort.getAppUserHashedPassword(query.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!passwordEncoder.matches(query.getPassword(), hashedPassword)) {
            throw new IllegalArgumentException("Invalid username or password");
        }

        String token = generateTokenPort.generateToken(user.getUsername(), "USER", "mobile_app");

        return JwtResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .build();
    }
}

