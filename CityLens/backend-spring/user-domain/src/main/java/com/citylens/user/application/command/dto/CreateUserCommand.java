package com.citylens.user.application.command.dto;



public class CreateUserCommand {
    private final String username;
    private final String email;
    private final String rawPassword;
    private final String fullName;
    private final String role;

    private CreateUserCommand(Builder builder) {
        this.username = builder.username;
        this.email = builder.email;
        this.rawPassword = builder.rawPassword;
        this.fullName = builder.fullName;
        this.role = builder.role;
    }

    public String getUsername() { return username; }
    public String getEmail() { return email; }
    public String getRawPassword() { return rawPassword; }
    public String getFullName() { return fullName; }
    public String getRole() { return role; }

    public static class Builder {
        private String username;
        private String email;
        private String rawPassword;
        private String fullName;
        private String role;

        public Builder username(String username) { this.username = username; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder rawPassword(String rawPassword) { this.rawPassword = rawPassword; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder role(String role) { this.role = role; return this; }

        public CreateUserCommand build() { return new CreateUserCommand(this); }
    }

    public static Builder builder() { return new Builder(); }
}
