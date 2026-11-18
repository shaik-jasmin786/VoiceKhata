package com.voicekhata.backend.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.voicekhata.backend.exception.ApiException;

@Component
public class TokenStore {

    private final Map<String, Long> tokens = new ConcurrentHashMap<>();

    public String create(Long vendorId) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, vendorId);
        return token;
    }

    // Reads "Authorization: Bearer <token>" and returns the vendor's id
    public Long requireVendorId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Please login first.");
        }
        Long vendorId = tokens.get(authHeader.substring(7));
        if (vendorId == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Session expired. Please login again.");
        }
        return vendorId;
    }

    public void remove(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            tokens.remove(authHeader.substring(7));
        }
    }
}