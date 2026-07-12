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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Override
    public User register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new DuplicateResourceException("Email already registered: " + request.email());
        }

        User user = User.builder()
                .name(request.name())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.ROLE_USER)
                .build();

        return userRepository.save(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name(), user.getName());
        return new AuthResponse(token, user.getEmail(), user.getRole().name());
    }
}
