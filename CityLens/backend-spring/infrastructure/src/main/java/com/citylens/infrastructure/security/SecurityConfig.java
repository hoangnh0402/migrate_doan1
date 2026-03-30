package com.citylens.infrastructure.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // Uses standard BCrypt, fully compatible with Python's passlib bcrypt
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/v1/auth/**").permitAll()
                .requestMatchers("/api/v1/app/auth/**").permitAll()
                .requestMatchers("/api/v1/app/reports/**").permitAll()
                .requestMatchers("/api/v1/realtime/**").permitAll()
                .requestMatchers("/api/v1/statistics/**").permitAll()
                .requestMatchers("/api/v1/admin/dashboard/**").permitAll()
                .requestMatchers("/api/v1/reports/**").permitAll()
                .requestMatchers("/api/v1/users/**").permitAll()
                .requestMatchers("/api/v1/geographic/**").permitAll()
                .requestMatchers("/api/v1/app/alerts/**").permitAll()
                .requestMatchers("/api/v1/notifications/**").permitAll()
                .requestMatchers("/api/v1/media/**").permitAll()
                .requestMatchers("/ngsi-ld/v1/**").permitAll()
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
