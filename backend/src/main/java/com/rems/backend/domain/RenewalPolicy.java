package com.rems.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.util.UUID;

@Entity
@Table(name = "renewal_policies")
public class RenewalPolicy {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer noticeDays;

    @Column(nullable = false)
    private Integer renewalTermMonths;

    @Column(nullable = false)
    private boolean enabled;

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getNoticeDays() {
        return noticeDays;
    }

    public void setNoticeDays(Integer noticeDays) {
        this.noticeDays = noticeDays;
    }

    public Integer getRenewalTermMonths() {
        return renewalTermMonths;
    }

    public void setRenewalTermMonths(Integer renewalTermMonths) {
        this.renewalTermMonths = renewalTermMonths;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
