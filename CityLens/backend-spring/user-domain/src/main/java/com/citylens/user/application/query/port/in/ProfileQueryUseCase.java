package com.citylens.user.application.query.port.in;

import com.citylens.user.application.query.dto.UserProfileDto;

public interface ProfileQueryUseCase {
    UserProfileDto getProfileByUsername(String username, boolean isAdmin);
}
