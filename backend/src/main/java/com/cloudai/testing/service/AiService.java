package com.cloudai.testing.service;

import com.cloudai.testing.dto.FailureAnalysisDto;

public interface AiService {
    /**
     * Generates a JUnit 5 test class from the provided Java class source code.
     */
    String generateTests(String className, String sourceCode) throws Exception;

    /**
     * Analyzes compilation or test assertion failures and returns diagnosis + suggested fix.
     */
    FailureAnalysisDto analyzeFailure(String className, String sourceCode, String testCode, String logs) throws Exception;
}
