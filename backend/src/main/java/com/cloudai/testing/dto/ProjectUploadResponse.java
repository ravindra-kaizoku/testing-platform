package com.cloudai.testing.dto;

import java.util.UUID;

public class ProjectUploadResponse {
    private UUID projectId;
    private String projectName;
    private int detectedFilesCount;
    private String message;

    public ProjectUploadResponse() {
    }

    public ProjectUploadResponse(UUID projectId, String projectName, int detectedFilesCount, String message) {
        this.projectId = projectId;
        this.projectName = projectName;
        this.detectedFilesCount = detectedFilesCount;
        this.message = message;
    }

    // Getters and Setters
    public UUID getProjectId() {
        return projectId;
    }

    public void setProjectId(UUID projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public int getDetectedFilesCount() {
        return detectedFilesCount;
    }

    public void setDetectedFilesCount(int detectedFilesCount) {
        this.detectedFilesCount = detectedFilesCount;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
