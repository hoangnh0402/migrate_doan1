package com.hqcsystem.user.application.query.port.in;

import com.hqcsystem.user.application.query.dto.UserProfileDto;

public interface ProfileQueryUseCase {
    UserProfileDto getProfileByUsername(String username, boolean isAdmin);
}

