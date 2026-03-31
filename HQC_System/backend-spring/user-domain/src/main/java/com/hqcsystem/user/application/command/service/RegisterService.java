package com.hqcsystem.user.application.command.service;

import com.hqcsystem.user.application.command.dto.RegisterCommand;
import com.hqcsystem.user.application.command.port.in.RegisterUseCase;
import com.hqcsystem.user.application.command.port.out.SaveUserPort;
import com.hqcsystem.user.domain.model.AdminUser;
import com.hqcsystem.user.domain.model.AppUser;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class RegisterService implements RegisterUseCase {

    private final SaveUserPort saveUserPort;

    public RegisterService(SaveUserPort saveUserPort) {
        this.saveUserPort = saveUserPort;
    }

    @Override
    public AdminUser registerAdmin(RegisterCommand command) {
        if (command.getRawPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters.");
        }

        AdminUser newUser = AdminUser.builder()
                .id(UUID.randomUUID().toString())
                .username(command.getUsername())
                .email(command.getEmail())
                .fullName(command.getFullName())
                .role("ADMIN")
                .status("PENDING") // Pending approval from superadmin
                .build();

        return saveUserPort.saveAdminUser(newUser, command.getRawPassword());
    }

    @Override
    public AppUser registerAppUser(RegisterCommand command) {
        if (command.getRawPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        AppUser newUser = AppUser.builder()
                .id(UUID.randomUUID().toString())
                .username(command.getUsername())
                .email(command.getEmail())
                .fullName(command.getFullName())
                .phone(command.getPhone())
                .role("USER")
                .status("ACTIVE") // Active immediately for mobile app users
                .level(1)
                .points(0)
                .reputationScore(0.5) // Initial reputation
                .build();

        return saveUserPort.saveAppUser(newUser, command.getRawPassword());
    }
}

