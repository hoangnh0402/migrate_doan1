package com.hqcsystem.user.application.command.port.in;

import com.hqcsystem.user.application.command.dto.RegisterCommand;
import com.hqcsystem.user.domain.model.AdminUser;
import com.hqcsystem.user.domain.model.AppUser;

public interface RegisterUseCase {
    AdminUser registerAdmin(RegisterCommand command);
    AppUser registerAppUser(RegisterCommand command);
}

