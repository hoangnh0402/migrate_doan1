package com.citylens.user.application.query.dto;

public class LoginQuery {
    private final String username; // can be username or email
    private final String password;

    private LoginQuery(Builder builder) {
        this.username = builder.username;
        this.password = builder.password;
    }

    public String getUsername() { return username; }
    public String getPassword() { return password; }

    public static class Builder {
        private String username;
        private String password;

        public Builder username(String username) { this.username = username; return this; }
        public Builder password(String password) { this.password = password; return this; }

        public LoginQuery build() { return new LoginQuery(this); }
    }

    public static Builder builder() { return new Builder(); }
}
