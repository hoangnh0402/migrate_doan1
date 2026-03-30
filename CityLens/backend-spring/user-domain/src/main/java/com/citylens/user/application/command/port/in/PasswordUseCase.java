package com.citylens.user.application.command.port.in;

import com.citylens.user.application.command.dto.ChangePasswordCommand;
import com.citylens.user.application.command.dto.ResetPasswordCommand;

public interface PasswordUseCase {
    void changePassword(ChangePasswordCommand command);
    String generateResetToken(String email, boolean isAdmin);
    void resetPassword(ResetPasswordCommand command);
}
