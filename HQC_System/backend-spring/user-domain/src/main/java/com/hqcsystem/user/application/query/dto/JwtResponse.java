package com.hqcsystem.user.application.query.dto;

public class JwtResponse {
    private final String accessToken;
    private final String tokenType;

    private JwtResponse(Builder builder) {
        this.accessToken = builder.accessToken;
        this.tokenType = builder.tokenType != null ? builder.tokenType : "Bearer";
    }

    public String getAccessToken() { return accessToken; }
    public String getTokenType() { return tokenType; }

    public static class Builder {
        private String accessToken;
        private String tokenType;

        public Builder accessToken(String accessToken) { this.accessToken = accessToken; return this; }
        public Builder tokenType(String tokenType) { this.tokenType = tokenType; return this; }

        public JwtResponse build() { return new JwtResponse(this); }
    }

    public static Builder builder() { return new Builder(); }
}

