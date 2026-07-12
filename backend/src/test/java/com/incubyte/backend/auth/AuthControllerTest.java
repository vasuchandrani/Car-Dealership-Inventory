package com.incubyte.backend.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.incubyte.backend.auth.dto.request.LoginRequest;
import com.incubyte.backend.auth.dto.request.RegisterRequest;
import com.incubyte.backend.auth.dto.response.AuthResponse;
import com.incubyte.backend.common.BadRequestException;
import com.incubyte.backend.common.DuplicateResourceException;
import com.incubyte.backend.user.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @Test
    void register_success() throws Exception {
        RegisterRequest request = new RegisterRequest("Test User", "register@example.com", "password123");
        User user = User.builder().id(1L).name("Test User").email("register@example.com").build();
        when(authService.register(any(RegisterRequest.class))).thenReturn(user);

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("User registered successfully"));
    }

    @Test
    void register_validationFailure() throws Exception {
        RegisterRequest request = new RegisterRequest("", "invalid-email", "123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.name").exists())
                .andExpect(jsonPath("$.errors.email").exists())
                .andExpect(jsonPath("$.errors.password").exists());
    }

    @Test
    void register_duplicateEmail() throws Exception {
        RegisterRequest request = new RegisterRequest("Test User", "duplicate@example.com", "password123");
        when(authService.register(any(RegisterRequest.class))).thenThrow(new DuplicateResourceException("Email already registered"));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email already registered"));
    }

    @Test
    void login_success() throws Exception {
        LoginRequest request = new LoginRequest("login@example.com", "password123");
        AuthResponse response = new AuthResponse("token-123", "login@example.com", "ROLE_USER");
        when(authService.login(any(LoginRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Login successful"))
                .andExpect(jsonPath("$.data.token").value("token-123"))
                .andExpect(jsonPath("$.data.email").value("login@example.com"))
                .andExpect(jsonPath("$.data.role").value("ROLE_USER"));
    }

    @Test
    void login_invalidCredentials() throws Exception {
        LoginRequest request = new LoginRequest("login@example.com", "wrong-password");
        when(authService.login(any(LoginRequest.class))).thenThrow(new BadRequestException("Invalid email or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }
}
