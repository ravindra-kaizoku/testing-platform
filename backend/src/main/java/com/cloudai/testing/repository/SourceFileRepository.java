package com.cloudai.testing.repository;

import com.cloudai.testing.model.SourceFile;
import com.cloudai.testing.dto.SourceFileDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface SourceFileRepository extends JpaRepository<SourceFile, UUID> {

    @Query("SELECT new com.cloudai.testing.dto.SourceFileDto(s.id, s.filePath, s.className) " +
           "FROM SourceFile s WHERE s.project.id = :projectId")
    List<SourceFileDto> findDtoByProjectId(@Param("projectId") UUID projectId);

    List<SourceFile> findByProjectId(UUID projectId);
}
