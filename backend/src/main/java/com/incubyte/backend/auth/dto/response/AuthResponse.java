package com.incubyte.backend.auth.dto.response;

public record AuthResponse(
    String token,
    String email,
    String role
) {}
