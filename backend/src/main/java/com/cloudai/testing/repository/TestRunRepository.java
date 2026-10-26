package com.cloudai.testing.repository;

import com.cloudai.testing.model.TestRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TestRunRepository extends JpaRepository<TestRun, UUID> {
    List<TestRun> findByProjectIdOrderByCreatedAtDesc(UUID projectId);
    Optional<TestRun> findFirstByProjectIdOrderByCreatedAtDesc(UUID projectId);
}
