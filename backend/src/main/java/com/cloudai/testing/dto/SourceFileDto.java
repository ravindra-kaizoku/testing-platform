package com.cloudai.testing.dto;

import java.util.UUID;

public class SourceFileDto {
    private UUID id;
    private String filePath;
    private String className;

    public SourceFileDto() {
    }

    public SourceFileDto(UUID id, String filePath, String className) {
        this.id = id;
        this.filePath = filePath;
        this.className = className;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getClassName() {
        return className;
    }

    public void setClassName(String className) {
        this.className = className;
    }
}
