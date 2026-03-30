package com.citylens.user.application.command.port.in;

import com.citylens.user.application.command.dto.UpdateProfileCommand;

public interface ProfileCommandUseCase {
    void updateProfile(UpdateProfileCommand command);
}
