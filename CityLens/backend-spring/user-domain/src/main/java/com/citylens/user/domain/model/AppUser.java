package com.citylens.user.domain.model;

public class AppUser {
    private final String id;
    private final String username;
    private final String email;
    private final String fullName;
    private final String phone;
    
    private final int level;
    private final int points;
    private final double reputationScore;
    private final String role;

    private AppUser(Builder builder) {
        this.id = builder.id;
        this.username = builder.username;
        this.email = builder.email;
        this.fullName = builder.fullName;
        this.phone = builder.phone;
        this.level = builder.level;
        this.points = builder.points;
        this.reputationScore = builder.reputationScore;
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

    public String getPhone() {
        return phone;
    }

    public int getLevel() {
        return level;
    }

    public int getPoints() {
        return points;
    }

    public double getReputationScore() {
        return reputationScore;
    }

    public String getRole() {
        return role;
    }

    // Core domain behavior
    public boolean canSubmitReport() {
        return reputationScore >= 0.2;
    }

    public static class Builder {
        private String id;
        private String username;
        private String email;
        private String fullName;
        private String phone;
        private int level;
        private int points;
        private double reputationScore;
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

        public Builder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public Builder level(int level) {
            this.level = level;
            return this;
        }

        public Builder points(int points) {
            this.points = points;
            return this;
        }

        public Builder reputationScore(double reputationScore) {
            this.reputationScore = reputationScore;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public AppUser build() {
            return new AppUser(this);
        }
    }

    public static Builder builder() {
        return new Builder();
    }
}
