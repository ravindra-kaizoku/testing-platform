package com.cloudai.testing.service;

import com.cloudai.testing.dto.FailureAnalysisDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class FailureAnalysisTest {

    private AiService aiService;

    @BeforeEach
    public void setUp() {
        aiService = new MockAiServiceImpl();
    }

    @Test
    public void testAnalyzeCompilationFailure() throws Exception {
        String logs = "[ERROR] /C:/Users/.../com/mock/Calculator.java:[9,43] illegal character: '\\'\n" +
                      "[ERROR] /C:/Users/.../com/mock/Calculator.java:[9,65] illegal escape character\n" +
                      "[ERROR] /C:/Users/.../com/mock/Calculator.java:[9,44] unclosed string literal";
        
        String sourceCode = "public class Calculator { /* syntax error here */ }";
        
        FailureAnalysisDto analysis = aiService.analyzeFailure("Calculator", sourceCode, "", logs);
        
        assertNotNull(analysis);
        assertTrue(analysis.getAnalysisText().contains("Root Cause"));
        assertTrue(analysis.getAnalysisText().contains("Calculator.java"));
        assertTrue(analysis.getAnalysisText().contains("double backslashes"));
        assertTrue(analysis.getSuggestedCode().contains("throw new ArithmeticException(\"Division by zero\");"));
    }

    @Test
    public void testAnalyzeAssertionFailure() throws Exception {
        String logs = "[INFO] Running com.mock.CalculatorTest\n" +
                      "[ERROR] testAddNormal  Time elapsed: 0.01 s  <<< FAILURE!\n" +
                      "org.opentest4j.AssertionFailedError: expected: <99> but was: <5>\n" +
                      "  at org.junit.jupiter.api.AssertionFailureBuilder.build(AssertionFailureBuilder.java:151)";
        
        String sourceCode = "public class Calculator { public int add(int a, int b) { return a + b; } }";
        
        FailureAnalysisDto analysis = aiService.analyzeFailure("Calculator", sourceCode, "CalculatorTestCode", logs);
        
        assertNotNull(analysis);
        assertTrue(analysis.getAnalysisText().contains("expected the addition of 2 and 3 to equal 99"));
        assertEquals(sourceCode, analysis.getSuggestedCode()); // Should remain unchanged since error is in test
    }
}
