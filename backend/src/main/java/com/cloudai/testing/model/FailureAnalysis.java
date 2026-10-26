package com.cloudai.testing.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "failure_analyses")
public class FailureAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "test_run_id", nullable = false)
    private TestRun testRun;

    @Lob
    @Column(name = "analysis_text", nullable = false, length = 10000000)
    private String analysisText;

    @Lob
    @Column(name = "suggested_code", length = 10000000)
    private String suggestedCode;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public FailureAnalysis() {
    }

    public FailureAnalysis(TestRun testRun, String analysisText, String suggestedCode) {
        this.testRun = testRun;
        this.analysisText = analysisText;
        this.suggestedCode = suggestedCode;
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public TestRun getTestRun() {
        return testRun;
    }

    public void setTestRun(TestRun testRun) {
        this.testRun = testRun;
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
