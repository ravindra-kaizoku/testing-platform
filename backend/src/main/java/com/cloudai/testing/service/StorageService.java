package com.cloudai.testing.service;

import java.io.IOException;
import java.io.InputStream;

public interface StorageService {
    /**
     * Stores a file and returns its storage location path/URL.
     */
    String storeFile(String filename, InputStream inputStream) throws IOException;

    /**
     * Retrieves the stored file as an InputStream.
     */
    InputStream getFile(String path) throws IOException;

    /**
     * Deletes a stored file.
     */
    void deleteFile(String path) throws IOException;
}
