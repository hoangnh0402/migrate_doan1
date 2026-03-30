package com.citylens.user.application.command.dto;

public class RegisterCommand {
    private final String username;
    private final String email;
    private final String rawPassword;
    private final String fullName;
    private final String phone;
    private final boolean isAdmin;

    private RegisterCommand(Builder builder) {
        this.username = builder.username;
        this.email = builder.email;
        this.rawPassword = builder.rawPassword;
        this.fullName = builder.fullName;
        this.phone = builder.phone;
        this.isAdmin = builder.isAdmin;
    }

    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRawPassword() { return rawPassword; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public boolean isAdmin() { return isAdmin; }

    public static class Builder {
        private String username;
        private String email;
        private String rawPassword;
        private String fullName;
        private String phone;
        private boolean isAdmin;

        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder rawPassword(String rawPassword) { this.rawPassword = rawPassword; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder isAdmin(boolean isAdmin) { this.isAdmin = isAdmin; return this; }

        public RegisterCommand build() { return new RegisterCommand(this); }
    }

    public static Builder builder() { return new Builder(); }
}
