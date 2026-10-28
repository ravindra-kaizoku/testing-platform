package com.cloudai.testing.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@ConditionalOnProperty(name = "app.storage.s3-enabled", havingValue = "false", matchIfMissing = true)
public class LocalStorageServiceImpl implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageServiceImpl.class);

    @Value("${app.storage.local-dir:./local-storage}")
    private String uploadDir;

    private Path rootPath;

    @PostConstruct
    public void init() {
        try {
            this.rootPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(this.rootPath);
            log.info("Initialized local storage directory at: {}", rootPath);
        } catch (Exception e) {
            log.warn("Could not initialize local storage at '{}', falling back to system temp dir: {}", uploadDir, e.getMessage());
            try {
                this.rootPath = Paths.get(System.getProperty("java.io.tmpdir"), "cloud-ai-storage").toAbsolutePath().normalize();
                Files.createDirectories(this.rootPath);
                log.info("Initialized fallback storage directory at: {}", rootPath);
            } catch (Exception ex) {
                throw new RuntimeException("Could not initialize local storage directory or temp fallback", ex);
            }
        }
    }

    @Override
    public String storeFile(String filename, InputStream inputStream) throws IOException {
        String uniqueName = UUID.randomUUID().toString() + "_" + filename;
        Path targetLocation = this.rootPath.resolve(uniqueName);
        Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
        log.info("Saved file locally at: {}", targetLocation);
        return targetLocation.toString();
    }

    @Override
    public InputStream getFile(String path) throws IOException {
        Path filePath = Paths.get(path);
        if (!Files.exists(filePath)) {
            throw new IOException("File not found at path: " + path);
        }
        return new FileInputStream(filePath.toFile());
    }

    @Override
    public void deleteFile(String path) throws IOException {
        Path filePath = Paths.get(path);
        if (Files.exists(filePath)) {
            Files.delete(filePath);
            log.info("Deleted file at: {}", path);
        }
    }
}
