package com.citylens.user.application.query.port.in;

import com.citylens.user.application.query.dto.LoginQuery;
import com.citylens.user.application.query.dto.JwtResponse;

public interface LoginUseCase {
    JwtResponse authenticateAdmin(LoginQuery query);
    JwtResponse authenticateAppUser(LoginQuery query);
}
