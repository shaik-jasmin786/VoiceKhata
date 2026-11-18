package com.voicekhata.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.voicekhata.backend.dto.CustomerRequest;
import com.voicekhata.backend.dto.CustomerResponse;
import com.voicekhata.backend.entity.Customer;
import com.voicekhata.backend.exception.ApiException;
import com.voicekhata.backend.repository.CustomerRepository;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    private CustomerResponse toResponse(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getPhone() == null ? "" : c.getPhone());
    }

    private Customer find(Long vendorId, Long id) {
        return customerRepository.findByIdAndVendorId(id, vendorId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Customer not found."));
    }

    public List<CustomerResponse> list(Long vendorId, String search) {
        String s = search == null ? "" : search.trim().toLowerCase();
        return customerRepository.findByVendorIdOrderByNameAsc(vendorId).stream()
                .filter(c -> c.getName().toLowerCase().contains(s))
                .map(this::toResponse)
                .toList();
    }

    public CustomerResponse add(Long vendorId, CustomerRequest req) {
        String name = req.name().trim();
        if (customerRepository.existsByVendorIdAndNameIgnoreCase(vendorId, name)) {
            throw new ApiException(HttpStatus.CONFLICT, "This customer already exists.");
        }
        Customer c = new Customer();
        c.setVendorId(vendorId);
        c.setName(name);
        c.setPhone(req.phone());
        return toResponse(customerRepository.save(c));
    }

    public CustomerResponse update(Long vendorId, Long id, CustomerRequest req) {
        Customer c = find(vendorId, id);
        c.setPhone(req.phone());
        return toResponse(customerRepository.save(c));
    }

    public void delete(Long vendorId, Long id) {
        customerRepository.delete(find(vendorId, id));
    }
}