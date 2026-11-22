
package com.voicekhata.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.voicekhata.backend.dto.DashboardResponse;
import com.voicekhata.backend.dto.TransactionRequest;
import com.voicekhata.backend.dto.TransactionResponse;
import com.voicekhata.backend.entity.Customer;
import com.voicekhata.backend.entity.Transaction;
import com.voicekhata.backend.exception.ApiException;
import com.voicekhata.backend.repository.CustomerRepository;
import com.voicekhata.backend.repository.TransactionRepository;

@Service
public class TransactionService {

    private final TransactionRepository txRepo;
    private final CustomerRepository customerRepo;

    public TransactionService(TransactionRepository txRepo,
                            CustomerRepository customerRepo) {
        this.txRepo = txRepo;
        this.customerRepo = customerRepo;
    }

    // Customer ID -> Customer Name
    private Map<Long, String> nameMap(Long vendorId) {
        Map<Long, String> map = new HashMap<>();

        customerRepo.findByVendorIdOrderByNameAsc(vendorId)
                .forEach(c -> map.put(c.getId(), c.getName()));

        return map;
    }

    private TransactionResponse toResponse(Transaction t,
                                          Map<Long, String> names) {
        boolean payment = "PAYMENT".equals(t.getType());

        return new TransactionResponse(
                t.getId(),
                names.getOrDefault(t.getCustomerId(), "?"),
                t.getItemName() == null ? "" : t.getItemName(),
                t.getQuantity(),
                t.getAmount(),
                t.getType(),
                payment ? "PAID" : "PENDING",
                t.getTransactionDate());
    }

    // Find customer using ID or name
    private Customer findOrCreateCustomer(Long vendorId,
                                        TransactionRequest req) {

        // Use customer ID if provided
        if (req.customerId() != null) {
            return customerRepo.findByIdAndVendorId(req.customerId(), vendorId)
                    .orElseThrow(() -> new ApiException(
                            HttpStatus.NOT_FOUND,
                            "Customer not found."));
        }

        String clean = req.customer().trim();

        List<Customer> matches =
                customerRepo.findByVendorIdOrderByNameAsc(vendorId)
                        .stream()
                        .filter(c -> c.getName().equalsIgnoreCase(clean))
                        .toList();

        // Prevent wrong customer selection when duplicate names exist
        if (matches.size() > 1) {
            throw new ApiException(
                    HttpStatus.CONFLICT,
                    "Multiple customers have this name. Please select the correct customer.");
        }

        // Return existing customer
        if (matches.size() == 1) {
            return matches.get(0);
        }

        // Create a new customer if not found
        Customer c = new Customer();
        c.setVendorId(vendorId);
        c.setName(clean);

        return customerRepo.save(c);
    }

    private void fill(Transaction t,
                     TransactionRequest req,
                     Long customerId) {

        boolean payment = "PAYMENT".equals(req.type());

        t.setCustomerId(customerId);
        t.setType(req.type());
        t.setItemName(payment || req.item() == null
                ? ""
                : req.item().trim());
        t.setQuantity(payment ? 0 : req.quantity());
        t.setAmount(req.amount());
    }

    public List<TransactionResponse> list(Long vendorId) {

        Map<Long, String> names = nameMap(vendorId);

        return txRepo.findByVendorIdOrderByTransactionDateDesc(vendorId)
                .stream()
                .map(t -> toResponse(t, names))
                .toList();
    }

    public TransactionResponse add(Long vendorId,
                                 TransactionRequest req) {

        Customer c = findOrCreateCustomer(vendorId, req);

        Transaction t = new Transaction();
        t.setVendorId(vendorId);

        fill(t, req, c.getId());
        txRepo.save(t);

        return toResponse(t, nameMap(vendorId));
    }

    public TransactionResponse update(Long vendorId,
                                     Long id,
                                     TransactionRequest req) {

        Transaction t = txRepo.findByIdAndVendorId(id, vendorId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found."));

        Customer c = findOrCreateCustomer(vendorId, req);

        fill(t, req, c.getId());
        txRepo.save(t);

        return toResponse(t, nameMap(vendorId));
    }

    public void delete(Long vendorId, Long id) {

        Transaction t = txRepo.findByIdAndVendorId(id, vendorId)
                .orElseThrow(() -> new ApiException(
                        HttpStatus.NOT_FOUND,
                        "Transaction not found."));

        txRepo.delete(t);
    }

    // Dashboard: balance = credit - payments
    public DashboardResponse dashboard(Long vendorId) {

        List<Transaction> all =
                txRepo.findByVendorIdOrderByTransactionDateDesc(vendorId);

        Map<Long, String> names = nameMap(vendorId);

        Map<Long, BigDecimal> balances = new HashMap<>();

        BigDecimal monthCredit = BigDecimal.ZERO;
        BigDecimal monthPayment = BigDecimal.ZERO;
        int monthCount = 0;

        LocalDateTime now = LocalDateTime.now();

        for (Transaction t : all) {

            boolean credit = "CREDIT".equals(t.getType());

            BigDecimal signed = credit
                    ? t.getAmount()
                    : t.getAmount().negate();

            balances.merge(t.getCustomerId(), signed, BigDecimal::add);

            // Safe handling for missing transaction dates
            LocalDateTime d = t.getTransactionDate();

            if (d != null
                    && d.getMonth() == now.getMonth()
                    && d.getYear() == now.getYear()) {

                monthCount++;

                if (credit) {
                    monthCredit = monthCredit.add(t.getAmount());
                } else {
                    monthPayment = monthPayment.add(t.getAmount());
                }
            }
        }

        BigDecimal pending = balances.values().stream()
                .filter(b -> b.signum() > 0)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        List<TransactionResponse> recent = all.stream()
                .limit(5)
                .map(t -> toResponse(t, names))
                .toList();

        return new DashboardResponse(
                pending,
                names.size(),
                monthCount,
                monthCredit,
                monthPayment,
                recent);
    }
}
