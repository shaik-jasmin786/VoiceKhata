//package com.voicekhata.backend.dto;
//
//import java.math.BigDecimal;
//
//import jakarta.validation.constraints.DecimalMin;
//import jakarta.validation.constraints.Min;
//import jakarta.validation.constraints.NotBlank;
//import jakarta.validation.constraints.NotNull;
//import jakarta.validation.constraints.Pattern;
//import jakarta.validation.constraints.Size;
//
//public record TransactionRequest(
//        @NotBlank(message = "Customer name is required.")
//        @Size(max = 40, message = "Customer name is too long.")
//        String customer,
//
//        @Pattern(regexp = "CREDIT|PAYMENT", message = "Type must be CREDIT or PAYMENT.")
//        String type,
//
//        @Size(max = 40, message = "Item name is too long.")
//        String item,
//
//        @Min(value = 0, message = "Quantity cannot be negative.")
//        int quantity,
//
//        @NotNull(message = "Amount is required.")
//        @DecimalMin(value = "0.01", message = "Amount must be above 0.")
//        BigDecimal amount) {
//}

package com.voicekhata.backend.dto;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record TransactionRequest(

        @NotBlank(message = "Customer name is required.")
        @Size(max = 40, message = "Customer name is too long.")
        String customer,

        Long customerId,

        @Pattern(regexp = "CREDIT|PAYMENT", message = "Type must be CREDIT or PAYMENT.")
        String type,

        @Size(max = 40, message = "Item name is too long.")
        String item,

        @Min(value = 0, message = "Quantity cannot be negative.")
        int quantity,

        @NotNull(message = "Amount is required.")
        @DecimalMin(value = "0.01", message = "Amount must be above 0.")
        BigDecimal amount) {
}