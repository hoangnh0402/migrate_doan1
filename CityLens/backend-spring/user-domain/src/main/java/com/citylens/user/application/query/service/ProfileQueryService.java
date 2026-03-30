package com.citylens.user.application.query.service;

import com.citylens.user.application.query.dto.UserProfileDto;
import com.citylens.user.application.query.port.in.ProfileQueryUseCase;
import com.citylens.user.application.query.port.out.LoadUserPort;
import com.citylens.user.domain.model.AdminUser;
import com.citylens.user.domain.model.AppUser;
import org.springframework.stereotype.Service;

@Service
public class ProfileQueryService implements ProfileQueryUseCase {

    private final LoadUserPort loadUserPort;

    public ProfileQueryService(LoadUserPort loadUserPort) {
        this.loadUserPort = loadUserPort;
    }

    @Override
    public UserProfileDto getProfileByUsername(String username, boolean isAdmin) {
        UserProfileDto dto = new UserProfileDto();
        if (isAdmin) {
            AdminUser user = loadUserPort.loadAdminUserByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("Admin user not found"));
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setFullName(user.getFullName());
            dto.setRole(user.getRole());
            dto.setStatus(user.getStatus());
        } else {
            AppUser user = loadUserPort.loadAppUserByUsername(username)
                    .orElseThrow(() -> new IllegalArgumentException("App user not found"));
            dto.setId(user.getId());
            dto.setUsername(user.getUsername());
            dto.setEmail(user.getEmail());
            dto.setFullName(user.getFullName());
            dto.setPhone(user.getPhone());
            dto.setRole(user.getRole());
            dto.setStatus(user.getStatus());
        }
        return dto;
    }
}
