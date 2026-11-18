package com.voicekhata.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CustomerRequest(
        @NotBlank(message = "Customer name is required.")
        @Size(min = 2, max = 40, message = "Name must be 2 to 40 letters.")
        String name,

        @Pattern(regexp = "^$|^[6-9]\\d{9}$", message = "Enter a valid 10-digit mobile number, or leave it empty.")
        String phone) {
}