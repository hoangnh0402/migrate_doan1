package com.citylens.user.application.command.service;

import com.citylens.user.application.command.dto.CreateUserCommand;
import com.citylens.user.application.command.port.in.CreateUserUseCase;
import com.citylens.user.application.command.port.out.SaveUserPort;
import com.citylens.user.domain.model.AdminUser;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CreateUserService implements CreateUserUseCase {

    private final SaveUserPort saveUserPort;

    public CreateUserService(SaveUserPort saveUserPort) {
        this.saveUserPort = saveUserPort;
    }

    @Override
    public AdminUser createAdminUser(CreateUserCommand command) {
        // 1. Validate domain logic/rules
        if (command.getRawPassword().length() < 6) {
            throw new IllegalArgumentException("Password must be at least 6 characters.");
        }

        // 2. Map to Domain Model
        AdminUser newUser = AdminUser.builder()
                .id(UUID.randomUUID().toString())
                .username(command.getUsername())
                .email(command.getEmail())
                .fullName(command.getFullName())
                .role(command.getRole() != null ? command.getRole() : "ADMIN")
                .build();

        // 3. Save via Outgoing Port
        return saveUserPort.saveAdminUser(newUser, command.getRawPassword());
    }
}
