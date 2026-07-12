package com.incubyte.backend.auth;

import com.incubyte.backend.auth.dto.request.LoginRequest;
import com.incubyte.backend.auth.dto.request.RegisterRequest;
import com.incubyte.backend.auth.dto.response.AuthResponse;
import com.incubyte.backend.common.BadRequestException;
import com.incubyte.backend.common.DuplicateResourceException;
import com.incubyte.backend.config.JwtUtil;
import com.incubyte.backend.user.Role;
import com.incubyte.backend.user.User;
import com.incubyte.backend.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void register_success() {
        RegisterRequest request = new RegisterRequest("Test User", "test@example.com", "password123");
        when(userRepository.existsByEmail(request.email())).thenReturn(false);
        when(passwordEncoder.encode(request.password())).thenReturn("encodedPassword");

        User savedUser = User.builder()
                .id(1L)
                .name(request.name())
                .email(request.email())
                .password("encodedPassword")
                .role(Role.ROLE_USER)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        User result = authService.register(request);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(Role.ROLE_USER, result.getRole());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    void register_duplicateEmail_throws() {
        RegisterRequest request = new RegisterRequest("Test User", "test@example.com", "password123");
        when(userRepository.existsByEmail(request.email())).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void login_success() {
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        User user = User.builder()
                .id(1L)
                .email(request.email())
                .password("encodedPassword")
                .role(Role.ROLE_USER)
                .build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName())).thenReturn("jwt.token.here");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt.token.here", response.token());
        assertEquals("test@example.com", response.email());
        assertEquals("ROLE_USER", response.role());
    }

    @Test
    void login_wrongEmail_throws() {
        LoginRequest request = new LoginRequest("nonexistent@example.com", "password123");
        when(userRepository.findByEmail(request.email())).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> authService.login(request));
    }

    @Test
    void login_wrongPassword_throws() {
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");
        User user = User.builder()
                .id(1L)
                .email(request.email())
                .password("encodedPassword")
                .role(Role.ROLE_USER)
                .build();

        when(userRepository.findByEmail(request.email())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(request.password(), user.getPassword())).thenReturn(false);

        assertThrows(BadRequestException.class, () -> authService.login(request));
    }
}
