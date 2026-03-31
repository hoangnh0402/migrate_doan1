package com.hqcsystem.user.application.query.port.in;

import com.hqcsystem.user.application.query.dto.LoginQuery;
import com.hqcsystem.user.application.query.dto.JwtResponse;

public interface LoginUseCase {
    JwtResponse authenticateAdmin(LoginQuery query);
    JwtResponse authenticateAppUser(LoginQuery query);
}

