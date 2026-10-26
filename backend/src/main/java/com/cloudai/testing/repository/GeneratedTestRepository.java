package com.cloudai.testing.repository;

import com.cloudai.testing.model.GeneratedTest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GeneratedTestRepository extends JpaRepository<GeneratedTest, UUID> {
    Optional<GeneratedTest> findBySourceFileId(UUID sourceFileId);
}
