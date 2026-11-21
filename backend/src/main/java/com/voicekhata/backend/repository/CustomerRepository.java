package com.voicekhata.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voicekhata.backend.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    List<Customer> findByVendorIdOrderByNameAsc(Long vendorId);
    Optional<Customer> findByIdAndVendorId(Long id, Long vendorId);
    boolean existsByVendorIdAndNameIgnoreCase(Long vendorId, String name);
    List<Customer> findByPhone(String phone);
}