package com.voicekhata.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record ShopDues(String shopName, String shopPhone, BigDecimal balance,
                       List<TransactionResponse> transactions) {
}