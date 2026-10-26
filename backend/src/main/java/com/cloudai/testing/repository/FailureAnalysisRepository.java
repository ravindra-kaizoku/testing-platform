package com.cloudai.testing.repository;

import com.cloudai.testing.model.FailureAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FailureAnalysisRepository extends JpaRepository<FailureAnalysis, UUID> {
    Optional<FailureAnalysis> findByTestRunId(UUID testRunId);
}
