package com.voicekhata.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.voicekhata.backend.dto.CustomerRequest;
import com.voicekhata.backend.dto.CustomerResponse;
import com.voicekhata.backend.service.CustomerService;
import com.voicekhata.backend.service.TokenStore;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/customers")
public class CustomerController {

    private final CustomerService customerService;
    private final TokenStore tokenStore;

    public CustomerController(CustomerService customerService, TokenStore tokenStore) {
        this.customerService = customerService;
        this.tokenStore = tokenStore;
    }

    @GetMapping
    public List<CustomerResponse> list(@RequestHeader(value = "Authorization", required = false) String auth,
                                       @RequestParam(required = false) String search) {
        return customerService.list(tokenStore.requireVendorId(auth), search);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerResponse add(@RequestHeader(value = "Authorization", required = false) String auth,
                                @Valid @RequestBody CustomerRequest req) {
        return customerService.add(tokenStore.requireVendorId(auth), req);
    }

    @PutMapping("/{id}")
    public CustomerResponse update(@RequestHeader(value = "Authorization", required = false) String auth,
                                   @PathVariable Long id, @Valid @RequestBody CustomerRequest req) {
        return customerService.update(tokenStore.requireVendorId(auth), id, req);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = "Authorization", required = false) String auth,
                       @PathVariable Long id) {
        customerService.delete(tokenStore.requireVendorId(auth), id);
    }
}