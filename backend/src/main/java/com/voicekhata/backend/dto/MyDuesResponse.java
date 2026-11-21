package com.voicekhata.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record MyDuesResponse(String customerName, BigDecimal totalOwed, List<ShopDues> shops) {
}