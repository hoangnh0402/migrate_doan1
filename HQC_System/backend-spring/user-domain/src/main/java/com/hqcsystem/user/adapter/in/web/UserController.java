package com.hqcsystem.user.adapter.in.web;

import com.hqcsystem.user.application.command.dto.CreateUserCommand;
import com.hqcsystem.user.application.command.port.in.CreateUserUseCase;
import com.hqcsystem.user.domain.model.AdminUser;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/users")
public class UserController {

    private final CreateUserUseCase createUserUseCase;

    public UserController(CreateUserUseCase createUserUseCase) {
        this.createUserUseCase = createUserUseCase;
    }

    // Example DTO inner class for Web payload mapping
    public static class CreateUserRequest {
        public String username;
        public String email;
        public String password;
        public String fullName;
        public String role;
    }

    @PostMapping
    public ResponseEntity<AdminUser> createUser(@RequestBody CreateUserRequest request) {
        
        // Map Web Request to Application Command
        CreateUserCommand command = CreateUserCommand.builder()
                .username(request.username)
                .email(request.email)
                .rawPassword(request.password)
                .fullName(request.fullName)
                .role(request.role)
                .build();
                
        AdminUser createdUser = createUserUseCase.createAdminUser(command);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }
}

