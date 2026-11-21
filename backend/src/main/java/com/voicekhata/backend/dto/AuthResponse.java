package com.voicekhata.backend.dto;

public record AuthResponse(String token, String name, String phone, String role) {
}