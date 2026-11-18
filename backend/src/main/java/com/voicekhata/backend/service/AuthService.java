package com.voicekhata.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.voicekhata.backend.dto.AuthResponse;
import com.voicekhata.backend.dto.LoginRequest;
import com.voicekhata.backend.dto.RegisterRequest;
import com.voicekhata.backend.entity.Vendor;
import com.voicekhata.backend.exception.ApiException;
import com.voicekhata.backend.repository.VendorRepository;

@Service
public class AuthService {

    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;
    private final TokenStore tokenStore;

    public AuthService(VendorRepository vendorRepository, PasswordEncoder passwordEncoder, TokenStore tokenStore) {
        this.vendorRepository = vendorRepository;
        this.passwordEncoder = passwordEncoder;
        this.tokenStore = tokenStore;
    }

    public void register(RegisterRequest req) {
        if (vendorRepository.existsByPhone(req.phone())) {
            throw new ApiException(HttpStatus.CONFLICT, "This phone number is already registered.");
        }
        Vendor v = new Vendor();
        v.setVendorName(req.name().trim());
        v.setPhone(req.phone());
        v.setPinHash(passwordEncoder.encode(req.pin()));   // PIN is scrambled, never stored plain
        vendorRepository.save(v);
    }

    public AuthResponse login(LoginRequest req) {
        Vendor v = vendorRepository.findByPhone(req.phone())
                .filter(x -> passwordEncoder.matches(req.pin(), x.getPinHash()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Wrong phone number or PIN."));

        return new AuthResponse(tokenStore.create(v.getId()), v.getVendorName(), v.getPhone());
    }
}