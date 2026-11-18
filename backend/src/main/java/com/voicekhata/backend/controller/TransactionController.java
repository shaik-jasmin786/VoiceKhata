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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.voicekhata.backend.dto.DashboardResponse;
import com.voicekhata.backend.dto.TransactionRequest;
import com.voicekhata.backend.dto.TransactionResponse;
import com.voicekhata.backend.service.TokenStore;
import com.voicekhata.backend.service.TransactionService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class TransactionController {

    private final TransactionService service;
    private final TokenStore tokenStore;

    public TransactionController(TransactionService service, TokenStore tokenStore) {
        this.service = service;
        this.tokenStore = tokenStore;
    }

    @GetMapping("/transactions")
    public List<TransactionResponse> list(@RequestHeader(value = "Authorization", required = false) String auth) {
        return service.list(tokenStore.requireVendorId(auth));
    }

    @PostMapping("/transactions")
    @ResponseStatus(HttpStatus.CREATED)
    public TransactionResponse add(@RequestHeader(value = "Authorization", required = false) String auth,
                                   @Valid @RequestBody TransactionRequest req) {
        return service.add(tokenStore.requireVendorId(auth), req);
    }

    @PutMapping("/transactions/{id}")
    public TransactionResponse update(@RequestHeader(value = "Authorization", required = false) String auth,
                                      @PathVariable Long id, @Valid @RequestBody TransactionRequest req) {
        return service.update(tokenStore.requireVendorId(auth), id, req);
    }

    @DeleteMapping("/transactions/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@RequestHeader(value = "Authorization", required = false) String auth,
                       @PathVariable Long id) {
        service.delete(tokenStore.requireVendorId(auth), id);
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard(@RequestHeader(value = "Authorization", required = false) String auth) {
        return service.dashboard(tokenStore.requireVendorId(auth));
    }
}