package com.citylens.application.adapter;

import com.citylens.user.application.query.port.out.GenerateTokenPort;
import com.citylens.infrastructure.security.JwtTokenProvider;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
public class JwtTokenAdapter implements GenerateTokenPort {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtTokenAdapter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    public String generateToken(String username, String role, String type) {
        SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role.toUpperCase());
        User principal = new User(username, "", Collections.singletonList(authority));
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, Collections.singletonList(authority));

        // The JwtTokenProvider uses the authentication details to forge a JWT.
        // It seamlessly bridges our domain requirements with spring-security.
        return jwtTokenProvider.generateToken(authentication);
    }
}
