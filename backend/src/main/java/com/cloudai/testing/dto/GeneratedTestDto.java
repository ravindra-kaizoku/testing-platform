package com.cloudai.testing.dto;

import java.util.UUID;

public class GeneratedTestDto {
    private UUID id;
    private UUID sourceFileId;
    private String filePath;
    private String content;

    public GeneratedTestDto() {
    }

    public GeneratedTestDto(UUID id, UUID sourceFileId, String filePath, String content) {
        this.id = id;
        this.sourceFileId = sourceFileId;
        this.filePath = filePath;
        this.content = content;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getSourceFileId() {
        return sourceFileId;
    }

    public void setSourceFileId(UUID sourceFileId) {
        this.sourceFileId = sourceFileId;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
