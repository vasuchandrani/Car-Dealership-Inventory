package com.incubyte.backend.auth;

import com.incubyte.backend.auth.dto.request.LoginRequest;
import com.incubyte.backend.auth.dto.request.RegisterRequest;
import com.incubyte.backend.auth.dto.response.AuthResponse;
import com.incubyte.backend.common.ApiResponse;
import com.incubyte.backend.user.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<User>> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.register(request);
        ApiResponse<User> response = ApiResponse.success("User registered successfully", user);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        ApiResponse<AuthResponse> response = ApiResponse.success("Login successful", authResponse);
        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
