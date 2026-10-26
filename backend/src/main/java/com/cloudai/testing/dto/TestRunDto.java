package com.cloudai.testing.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class TestRunDto {
    private UUID id;
    private UUID projectId;
    private String status;
    private Integer testsRun;
    private Integer failures;
    private Integer errors;
    private Integer skipped;
    private String logs;
    private Long executionTimeMs;
    private LocalDateTime createdAt;

    public TestRunDto() {
    }

    public TestRunDto(UUID id, UUID projectId, String status, Integer testsRun, Integer failures, 
                      Integer errors, Integer skipped, String logs, Long executionTimeMs, LocalDateTime createdAt) {
        this.id = id;
        this.projectId = projectId;
        this.status = status;
        this.testsRun = testsRun;
        this.failures = failures;
        this.errors = errors;
        this.skipped = skipped;
        this.logs = logs;
        this.executionTimeMs = executionTimeMs;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getTestsRun() {
        return testsRun;
    }

    public void setTestsRun(Integer testsRun) {
        this.testsRun = testsRun;
    }

    public Integer getFailures() {
        return failures;
    }

    public void setFailures(Integer failures) {
        this.failures = failures;
    }

    public Integer getErrors() {
        return errors;
    }

    public void setErrors(Integer errors) {
        this.errors = errors;
    }

    public Integer getSkipped() {
        return skipped;
    }

    public void setSkipped(Integer skipped) {
        this.skipped = skipped;
    }

    public String getLogs() {
        return logs;
    }

    public void setLogs(String logs) {
        this.logs = logs;
    }

    public Long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(Long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
