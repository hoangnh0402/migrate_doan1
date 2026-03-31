package com.hqcsystem.user.application.command.port.in;

import com.hqcsystem.user.application.command.dto.UpdateProfileCommand;

public interface ProfileCommandUseCase {
    void updateProfile(UpdateProfileCommand command);
}

