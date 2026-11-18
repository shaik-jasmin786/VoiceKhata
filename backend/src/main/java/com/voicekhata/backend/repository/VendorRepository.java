package com.voicekhata.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voicekhata.backend.entity.Vendor;

public interface VendorRepository extends JpaRepository<Vendor, Long> {
    Optional<Vendor> findByPhone(String phone);
    boolean existsByPhone(String phone);
}