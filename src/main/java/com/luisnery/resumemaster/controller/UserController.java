package com.luisnery.resumemaster.controller;

import com.luisnery.resumemaster.dto.CreateUserRequest;
import com.luisnery.resumemaster.dto.UpdateUserRequest;
import com.luisnery.resumemaster.dto.UserResponse;
import com.luisnery.resumemaster.model.User;
import com.luisnery.resumemaster.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {
    public final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers().stream().
                map(UserResponse::fromEntity).
                collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Long id) {
        User user = userService.getUserById(id);
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponse> updateUser(@PathVariable Long id,@Valid @RequestBody UpdateUserRequest request) {
        User updatedUser = userService.updateUser(id,request);
        return ResponseEntity.ok(UserResponse.fromEntity(updatedUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUserById(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
