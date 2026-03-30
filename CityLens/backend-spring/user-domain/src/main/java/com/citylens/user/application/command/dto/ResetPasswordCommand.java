package com.citylens.user.application.command.dto;

public class ResetPasswordCommand {
    private final String token;
    private final String newPassword;
    private final boolean isAdmin;

    private ResetPasswordCommand(Builder builder) {
        this.token = builder.token;
        this.newPassword = builder.newPassword;
        this.isAdmin = builder.isAdmin;
    }

    public String getToken() { return token; }
    public String getNewPassword() { return newPassword; }
    public boolean isAdmin() { return isAdmin; }

    public static class Builder {
        private String token;
        private String newPassword;
        private boolean isAdmin;

        public Builder token(String token) { this.token = token; return this; }
        public Builder newPassword(String newPassword) { this.newPassword = newPassword; return this; }
        public Builder isAdmin(boolean isAdmin) { this.isAdmin = isAdmin; return this; }

        public ResetPasswordCommand build() { return new ResetPasswordCommand(this); }
    }

    public static Builder builder() { return new Builder(); }
}
