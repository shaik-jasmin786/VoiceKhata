package com.voicekhata.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.voicekhata.backend.entity.Transaction;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByVendorIdOrderByTransactionDateDesc(Long vendorId);
    Optional<Transaction> findByIdAndVendorId(Long id, Long vendorId);
}