package com.cloudai.testing.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public class FailureAnalysisDto {
    private UUID id;
    private UUID testRunId;
    private String analysisText;
    private String suggestedCode;
    private LocalDateTime createdAt;

    public FailureAnalysisDto() {
    }

    public FailureAnalysisDto(UUID id, UUID testRunId, String analysisText, String suggestedCode, LocalDateTime createdAt) {
        this.id = id;
        this.testRunId = testRunId;
        this.analysisText = analysisText;
        this.suggestedCode = suggestedCode;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getTestRunId() {
        return testRunId;
    }

    public void setTestRunId(UUID testRunId) {
        this.testRunId = testRunId;
    }

    public String getAnalysisText() {
        return analysisText;
    }

    public void setAnalysisText(String analysisText) {
        this.analysisText = analysisText;
    }

    public String getSuggestedCode() {
        return suggestedCode;
    }

    public void setSuggestedCode(String suggestedCode) {
        this.suggestedCode = suggestedCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
