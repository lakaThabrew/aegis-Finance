package com.aegis.core.service;

import com.aegis.core.entity.TrustedDevice;
import com.aegis.core.repository.TrustedDeviceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class TrustedDeviceService {
    private final TrustedDeviceRepository repository;

    public TrustedDeviceService(TrustedDeviceRepository repository) { this.repository = repository; }

    @Transactional
    public TrustedDevice recordLogin(String customerId, String userAgent) {
        String safeUserAgent = userAgent == null || userAgent.isBlank() ? "Unknown device" : userAgent.substring(0, Math.min(userAgent.length(), 1000));
        TrustedDevice device = repository.findByCustomerIdAndUserAgent(customerId, safeUserAgent).orElseGet(TrustedDevice::new);
        if (device.getId() == null) {
            device.setCustomerId(customerId);
            device.setUserAgent(safeUserAgent);
            device.setDeviceName(describe(safeUserAgent));
            device.setTrusted(true);
        }
        device.setLastSeen(LocalDateTime.now());
        return repository.save(device);
    }

    public List<TrustedDevice> getForCustomer(String customerId) { return repository.findByCustomerIdOrderByLastSeenDesc(customerId); }

    @Transactional
    public TrustedDevice updateTrust(String customerId, UUID id, boolean trusted) {
        TrustedDevice device = repository.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Device not found"));
        if (!customerId.equals(device.getCustomerId())) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You cannot change this device");
        device.setTrusted(trusted);
        return repository.save(device);
    }

    private String describe(String userAgent) {
        String browser = userAgent.contains("Edg/") ? "Microsoft Edge" : userAgent.contains("Firefox/") ? "Firefox" : userAgent.contains("Chrome/") ? "Chrome" : userAgent.contains("Safari/") ? "Safari" : "Browser";
        String platform = userAgent.contains("Windows") ? "Windows" : userAgent.contains("Android") ? "Android" : userAgent.contains("iPhone") || userAgent.contains("iPad") ? "iOS" : userAgent.contains("Mac OS") ? "macOS" : userAgent.contains("Linux") ? "Linux" : "Unknown platform";
        return browser + " on " + platform;
    }
}
