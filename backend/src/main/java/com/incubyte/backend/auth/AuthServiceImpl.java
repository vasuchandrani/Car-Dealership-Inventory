package com.incubyte.backend.auth;

import com.incubyte.backend.auth.dto.request.LoginRequest;
import com.incubyte.backend.auth.dto.request.RegisterRequest;
import com.incubyte.backend.auth.dto.response.AuthResponse;
import com.incubyte.backend.user.User;
import org.springframework.stereotype.Service;

@Service
public class AuthServiceImpl implements AuthService {

    @Override
    public User register(RegisterRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        throw new UnsupportedOperationException("Not implemented yet");
    }
}
