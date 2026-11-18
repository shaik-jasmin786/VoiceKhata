package com.voicekhata.backend.dto;

import java.math.BigDecimal;
import java.util.List;

public record DashboardResponse(BigDecimal pendingDues, int totalCustomers,
                                int monthCount, BigDecimal monthCredit, BigDecimal monthPayment,
                                List<TransactionResponse> recent) {
}