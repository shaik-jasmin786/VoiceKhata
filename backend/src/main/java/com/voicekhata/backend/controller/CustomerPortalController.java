package com.voicekhata.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.voicekhata.backend.dto.MyDuesResponse;
import com.voicekhata.backend.service.CustomerPortalService;
import com.voicekhata.backend.service.TokenStore;

@RestController
@RequestMapping("/api/my")
public class CustomerPortalController {

    private final CustomerPortalService service;
    private final TokenStore tokenStore;

    public CustomerPortalController(CustomerPortalService service, TokenStore tokenStore) {
        this.service = service;
        this.tokenStore = tokenStore;
    }

    @GetMapping("/dues")
    public MyDuesResponse dues(@RequestHeader(value = "Authorization", required = false) String auth) {
        return service.myDues(tokenStore.requireCustomerId(auth));
    }
}