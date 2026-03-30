package com.citylens.user.application.command.dto;

public class UpdateProfileCommand {
    private final String userId;
    private final String fullName;
    private final String phone;
    private final String avatarUrl;
    private final boolean isAdmin;

    private UpdateProfileCommand(Builder builder) {
        this.userId = builder.userId;
        this.fullName = builder.fullName;
        this.phone = builder.phone;
        this.avatarUrl = builder.avatarUrl;
        this.isAdmin = builder.isAdmin;
    }

    public String getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getPhone() { return phone; }
    public String getAvatarUrl() { return avatarUrl; }
    public boolean isAdmin() { return isAdmin; }

    public static class Builder {
        private String userId;
        private String fullName;
        private String phone;
        private String avatarUrl;
        private boolean isAdmin;

        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder avatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; return this; }
        public Builder isAdmin(boolean isAdmin) { this.isAdmin = isAdmin; return this; }

        public UpdateProfileCommand build() { return new UpdateProfileCommand(this); }
    }

    public static Builder builder() { return new Builder(); }
}
