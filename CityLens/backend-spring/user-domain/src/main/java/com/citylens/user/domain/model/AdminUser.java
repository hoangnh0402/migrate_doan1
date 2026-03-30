package com.citylens.user.domain.model;

public class AdminUser {
    private final String id;
    private final String username;
    private final String email;
    private final String fullName;
    private final String role;
    
    // Private constructor for builder
    private AdminUser(Builder builder) {
        this.id = builder.id;
        this.username = builder.username;
        this.email = builder.email;
        this.fullName = builder.fullName;
        this.role = builder.role;
    }

    public String getId() {
        return id;
    }

    public String getUsername() {
        return username;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getRole() {
        return role;
    }
    
    // Core domain behavior
    public boolean hasAdminPrivileges() {
        return "ADMIN".equalsIgnoreCase(role) || "GOVERNMENT".equalsIgnoreCase(role);
    }

    // Standard Pure Java Builder
    public static class Builder {
        private String id;
        private String username;
        private String email;
        private String fullName;
        private String role;

        public Builder id(String id) {
            this.id = id;
            return this;
        }

        public Builder username(String username) {
            this.username = username;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder fullName(String fullName) {
            this.fullName = fullName;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public AdminUser build() {
            return new AdminUser(this);
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
