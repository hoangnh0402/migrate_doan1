package com.hqcsystem.user.application.command.port.in;

import com.hqcsystem.user.application.command.dto.CreateUserCommand;
import com.hqcsystem.user.domain.model.AdminUser;

public interface CreateUserUseCase {
    AdminUser createAdminUser(CreateUserCommand command);
}

