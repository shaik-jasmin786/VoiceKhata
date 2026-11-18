package com.voicekhata.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionResponse(Long id, String customer, String item, int quantity,
                                  BigDecimal amount, String type, String status,
                                  LocalDateTime date) {
}