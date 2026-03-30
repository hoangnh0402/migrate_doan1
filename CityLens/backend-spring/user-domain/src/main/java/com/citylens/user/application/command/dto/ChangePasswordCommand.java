package com.citylens.user.application.command.dto;

public class ChangePasswordCommand {
    private final String userId;
    private final String oldPassword;
    private final String newPassword;
    private final boolean isAdmin;

    private ChangePasswordCommand(Builder builder) {
        this.userId = builder.userId;
        this.oldPassword = builder.oldPassword;
        this.newPassword = builder.newPassword;
        this.isAdmin = builder.isAdmin;
    }

    public String getUserId() { return userId; }
    public String getOldPassword() { return oldPassword; }
    public String getNewPassword() { return newPassword; }
    public boolean isAdmin() { return isAdmin; }

    public static class Builder {
        private String userId;
        private String oldPassword;
        private String newPassword;
        private boolean isAdmin;

        public Builder userId(String userId) { this.userId = userId; return this; }
        public Builder oldPassword(String oldPassword) { this.oldPassword = oldPassword; return this; }
        public Builder newPassword(String newPassword) { this.newPassword = newPassword; return this; }
        public Builder isAdmin(boolean isAdmin) { this.isAdmin = isAdmin; return this; }

        public ChangePasswordCommand build() { return new ChangePasswordCommand(this); }
    }

    public static Builder builder() { return new Builder(); }
}
