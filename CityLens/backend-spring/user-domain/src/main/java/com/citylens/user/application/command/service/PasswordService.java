package com.citylens.user.application.command.service;

import com.citylens.user.application.command.dto.ChangePasswordCommand;
import com.citylens.user.application.command.dto.ResetPasswordCommand;
import com.citylens.user.application.command.port.in.PasswordUseCase;
import com.citylens.user.application.command.port.out.UpdateUserPort;
import com.citylens.user.application.query.port.out.GenerateTokenPort;
import com.citylens.user.application.query.port.out.LoadUserPort;
import com.citylens.user.domain.model.AdminUser;
import com.citylens.user.domain.model.AppUser;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class PasswordService implements PasswordUseCase {

    private final LoadUserPort loadUserPort;
    private final UpdateUserPort updateUserPort;
    private final GenerateTokenPort generateTokenPort;
    private final PasswordEncoder passwordEncoder;

    public PasswordService(LoadUserPort loadUserPort, UpdateUserPort updateUserPort,
                           GenerateTokenPort generateTokenPort, PasswordEncoder passwordEncoder) {
        this.loadUserPort = loadUserPort;
        this.updateUserPort = updateUserPort;
        this.generateTokenPort = generateTokenPort;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void changePassword(ChangePasswordCommand command) {
        // command.getUserId() actually holds the username from JWT
        String username = command.getUserId();
        if (command.isAdmin()) {
            AdminUser user = loadUserPort.loadAdminUserByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            String hashedOld = loadUserPort.getAdminHashedPassword(username)
                    .orElseThrow(() -> new IllegalArgumentException("Password not found"));

            if (!passwordEncoder.matches(command.getOldPassword(), hashedOld)) {
                throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
            }

            updateUserPort.updatePassword(user.getId(), command.getNewPassword(), true);
        } else {
            AppUser user = loadUserPort.loadAppUserByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));

            String hashedOld = loadUserPort.getAppUserHashedPassword(username)
                    .orElseThrow(() -> new IllegalArgumentException("Password not found"));

            if (!passwordEncoder.matches(command.getOldPassword(), hashedOld)) {
                throw new IllegalArgumentException("Mật khẩu cũ không chính xác");
            }

            updateUserPort.updatePassword(user.getId(), command.getNewPassword(), false);
        }
    }

    @Override
    public String generateResetToken(String email, boolean isAdmin) {
        if (isAdmin) {
            AdminUser user = loadUserPort.loadAdminUserByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với email này"));
            return generateTokenPort.generateToken(user.getUsername(), user.getRole(), "reset_password");
        } else {
            AppUser user = loadUserPort.loadAppUserByEmail(email)
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người dùng với email này"));
            return generateTokenPort.generateToken(user.getUsername(), user.getRole(), "reset_password");
        }
    }

    @Override
    public void resetPassword(ResetPasswordCommand command) {
        String username = generateTokenPort.verifyTokenAndGetUsername(command.getToken());

        if (command.isAdmin()) {
            AdminUser user = loadUserPort.loadAdminUserByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            updateUserPort.updatePassword(user.getId(), command.getNewPassword(), true);
        } else {
            AppUser user = loadUserPort.loadAppUserByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("User not found"));
            updateUserPort.updatePassword(user.getId(), command.getNewPassword(), false);
        }
    }
}
