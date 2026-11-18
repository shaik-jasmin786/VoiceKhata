package com.voicekhata.backend.dto;

import jakarta.validation.constraints.Pattern;

public record LoginRequest(
        @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number.")
        String phone,

        @Pattern(regexp = "^\\d{4}$", message = "PIN must be exactly 4 digits.")
        String pin) {
}