package com.citylens.user.application.command.service;

import com.citylens.user.application.command.dto.UpdateProfileCommand;
import com.citylens.user.application.command.port.in.ProfileCommandUseCase;
import com.citylens.user.application.command.port.out.UpdateUserPort;
import com.citylens.user.application.query.port.out.LoadUserPort;
import com.citylens.user.domain.model.AdminUser;
import com.citylens.user.domain.model.AppUser;
import org.springframework.stereotype.Service;

@Service
public class ProfileCommandService implements ProfileCommandUseCase {

    private final UpdateUserPort updateUserPort;
    private final LoadUserPort loadUserPort;

    public ProfileCommandService(UpdateUserPort updateUserPort, LoadUserPort loadUserPort) {
        this.updateUserPort = updateUserPort;
        this.loadUserPort = loadUserPort;
    }

    @Override
    public void updateProfile(UpdateProfileCommand command) {
        if (command.isAdmin()) {
            AdminUser user = loadUserPort.loadAdminUserByUsername(command.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("Admin User not found"));
                    
            AdminUser updatedUser = AdminUser.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .status(user.getStatus())
                    .fullName(command.getFullName() != null ? command.getFullName() : user.getFullName())
                    .build();
            updateUserPort.updateAdminUser(updatedUser);
        } else {
            AppUser user = loadUserPort.loadAppUserByUsername(command.getUserId())
                    .orElseThrow(() -> new IllegalArgumentException("App User not found"));
                    
            AppUser updatedUser = AppUser.builder()
                    .id(user.getId())
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .status(user.getStatus())
                    .level(user.getLevel())
                    .points(user.getPoints())
                    .reputationScore(user.getReputationScore())
                    .fullName(command.getFullName() != null ? command.getFullName() : user.getFullName())
                    .phone(command.getPhone() != null ? command.getPhone() : user.getPhone())
                    .build();
            updateUserPort.updateAppUser(updatedUser);
        }
    }
}
