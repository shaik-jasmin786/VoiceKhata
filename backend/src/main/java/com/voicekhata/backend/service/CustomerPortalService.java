package com.voicekhata.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.voicekhata.backend.dto.MyDuesResponse;
import com.voicekhata.backend.dto.ShopDues;
import com.voicekhata.backend.dto.TransactionResponse;
import com.voicekhata.backend.entity.Customer;
import com.voicekhata.backend.entity.Transaction;
import com.voicekhata.backend.entity.Vendor;
import com.voicekhata.backend.exception.ApiException;
import com.voicekhata.backend.repository.CustomerRepository;
import com.voicekhata.backend.repository.TransactionRepository;
import com.voicekhata.backend.repository.VendorRepository;

@Service
public class CustomerPortalService {

    private final VendorRepository vendorRepo;
    private final CustomerRepository customerRepo;
    private final TransactionRepository txRepo;

    public CustomerPortalService(VendorRepository vendorRepo, CustomerRepository customerRepo,
                                 TransactionRepository txRepo) {
        this.vendorRepo = vendorRepo;
        this.customerRepo = customerRepo;
        this.txRepo = txRepo;
    }

    // Finds every shop that has this customer's phone number, and adds up what is owed
    public MyDuesResponse myDues(Long userId) {
        Vendor me = vendorRepo.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Account not found."));

        List<ShopDues> shops = new ArrayList<>();
        BigDecimal total = BigDecimal.ZERO;

        for (Customer c : customerRepo.findByPhone(me.getPhone())) {
            Vendor shop = vendorRepo.findById(c.getVendorId()).orElse(null);
            if (shop == null) continue;

            BigDecimal balance = BigDecimal.ZERO;
            List<TransactionResponse> list = new ArrayList<>();

            for (Transaction t : txRepo.findByCustomerIdOrderByTransactionDateDesc(c.getId())) {
                boolean credit = "CREDIT".equals(t.getType());
                balance = credit ? balance.add(t.getAmount()) : balance.subtract(t.getAmount());
                list.add(new TransactionResponse(t.getId(), c.getName(),
                        t.getItemName() == null ? "" : t.getItemName(),
                        t.getQuantity(), t.getAmount(), t.getType(),
                        credit ? "PENDING" : "PAID", t.getTransactionDate()));
            }

            if (balance.signum() > 0) total = total.add(balance);
            shops.add(new ShopDues(shop.getVendorName(), shop.getPhone(), balance, list));
        }
        return new MyDuesResponse(me.getVendorName(), total, shops);
    }
}