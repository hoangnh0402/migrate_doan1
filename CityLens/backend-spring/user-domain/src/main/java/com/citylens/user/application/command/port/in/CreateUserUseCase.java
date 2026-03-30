package com.citylens.user.application.command.port.in;

import com.citylens.user.application.command.dto.CreateUserCommand;
import com.citylens.user.domain.model.AdminUser;

public interface CreateUserUseCase {
    AdminUser createAdminUser(CreateUserCommand command);
}
