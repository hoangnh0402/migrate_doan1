package com.citylens.user.application.command.port.in;

import com.citylens.user.application.command.dto.RegisterCommand;
import com.citylens.user.domain.model.AdminUser;
import com.citylens.user.domain.model.AppUser;

public interface RegisterUseCase {
    AdminUser registerAdmin(RegisterCommand command);
    AppUser registerAppUser(RegisterCommand command);
}
