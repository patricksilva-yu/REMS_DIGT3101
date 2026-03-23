package com.rems.backend.repository;

import com.rems.backend.domain.RentalApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RentalApplicationRepository extends JpaRepository<RentalApplication, UUID> {

    List<RentalApplication> findAllByOrderByCreatedAtDesc();
}
