package com.voicekhata.backend.service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import com.voicekhata.backend.exception.ApiException;

@Component
public class TokenStore {

    private record Session(Long userId, String role) { }

    private final Map<String, Session> tokens = new ConcurrentHashMap<>();

    public String create(Long userId, String role) {
        String token = UUID.randomUUID().toString();
        tokens.put(token, new Session(userId, role));
        return token;
    }

    // Reads "Authorization: Bearer <token>" and finds the session
    private Session session(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Please login first.");
        }
        Session s = tokens.get(authHeader.substring(7));
        if (s == null) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Session expired. Please login again.");
        }
        return s;
    }

    // For the shop owner APIs: only OWNER accounts are allowed
    public Long requireVendorId(String authHeader) {
        Session s = session(authHeader);
        if (!"OWNER".equals(s.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This page is only for shop owners.");
        }
        return s.userId();
    }

    // For the customer APIs: only CUSTOMER accounts are allowed
    public Long requireCustomerId(String authHeader) {
        Session s = session(authHeader);
        if (!"CUSTOMER".equals(s.role())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This page is only for customers.");
        }
        return s.userId();
    }

    public void remove(String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            tokens.remove(authHeader.substring(7));
        }
    }
}