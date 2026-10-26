package com.cloudai.testing.dto;

import java.util.UUID;

public class SourceFileDetailDto {
    private UUID id;
    private String filePath;
    private String className;
    private String content;

    public SourceFileDetailDto() {
    }

    public SourceFileDetailDto(UUID id, String filePath, String className, String content) {
        this.id = id;
        this.filePath = filePath;
        this.className = className;
        this.content = content;
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

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
