package com.cloudai.testing.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import com.cloudai.testing.dto.FailureAnalysisDto;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "mock", matchIfMissing = true)
public class MockAiServiceImpl implements AiService {

    private static final Logger log = LoggerFactory.getLogger(MockAiServiceImpl.class);

    @Override
    public String generateTests(String className, String sourceCode) throws Exception {
        log.info("Generating mock tests for class: {}", className);
        
        // Extract package name
        String packageName = "";
        Pattern packagePattern = Pattern.compile("package\\s+([a-zA-Z0-9_\\.]+);");
        Matcher packageMatcher = packagePattern.matcher(sourceCode);
        if (packageMatcher.find()) {
            packageName = packageMatcher.group(1);
        }

        StringBuilder sb = new StringBuilder();
        if (!packageName.isEmpty()) {
            sb.append("package ").append(packageName).append(";\n\n");
        }

        sb.append("import org.junit.jupiter.api.Test;\n");
        sb.append("import org.junit.jupiter.api.BeforeEach;\n");
        sb.append("import static org.junit.jupiter.api.Assertions.*;\n\n");

        if (className.equals("Calculator")) {
            // High-quality concrete mock tests for our test Calculator
            sb.append("public class CalculatorTest {\n\n");
            sb.append("    private Calculator calculator;\n\n");
            sb.append("    @BeforeEach\n");
            sb.append("    public void setUp() {\n");
            sb.append("        calculator = new Calculator();\n");
            sb.append("    }\n\n");
            sb.append("    @Test\n");
            sb.append("    public void testAddNormal() {\n");
            sb.append("        assertEquals(5, calculator.add(2, 3), \"2 + 3 should equal 5\");\n");
            sb.append("    }\n\n");
            sb.append("    @Test\n");
            sb.append("    public void testDivideNormal() {\n");
            sb.append("        assertEquals(2, calculator.divide(6, 3), \"6 / 3 should equal 2\");\n");
            sb.append("    }\n\n");
            sb.append("    @Test\n");
            sb.append("    public void testDivideByZeroNegative() {\n");
            sb.append("        assertThrows(ArithmeticException.class, () -> {\n");
            sb.append("            calculator.divide(5, 0);\n");
            sb.append("        }, \"Dividing by zero should throw ArithmeticException\");\n");
            sb.append("    }\n\n");
            sb.append("    @Test\n");
            sb.append("    public void testBoundaryValues() {\n");
            sb.append("        // Verify behavior around boundary values\n");
            sb.append("        assertEquals(0, calculator.add(Integer.MAX_VALUE, Integer.MIN_VALUE + 1));\n");
            sb.append("    }\n");
            sb.append("}\n");
        } else {
            // General compile-ready test outline
            sb.append("public class ").append(className).append("Test {\n\n");
            sb.append("    @Test\n");
            sb.append("    public void testNormalScenario() {\n");
            sb.append("        // TODO: Implement standard inputs and expected assertions\n");
            sb.append("        assertTrue(true, \"Placeholder assertion\");\n");
            sb.append("    }\n\n");
            sb.append("    @Test\n");
            sb.append("    public void testBoundaryConditions() {\n");
            sb.append("        // TODO: Test overflow conditions, empty arrays, or minimum limits\n");
            sb.append("        assertNotNull(new Object(), \"Placeholder assertion\");\n");
            sb.append("    }\n\n");
            sb.append("    @Test\n");
            sb.append("    public void testNegativeScenario() {\n");
            sb.append("        // TODO: Assert expected exceptions and invalid parameter rejections\n");
            sb.append("        assertTrue(true);\n");
            sb.append("    }\n\n");
            sb.append("    @Test\n");
            sb.append("    public void testEdgeCases() {\n");
            sb.append("        // TODO: Test null parameters and extreme limits\n");
            sb.append("        assertTrue(true);\n");
            sb.append("    }\n");
            sb.append("}\n");
        }

        return sb.toString();
    }

    @Override
    public FailureAnalysisDto analyzeFailure(String className, String sourceCode, String testCode, String logs) throws Exception {
        log.info("Generating mock failure analysis for class: {}", className);
        
        String analysisText;
        String suggestedCode = sourceCode;

        if (logs.contains("unclosed string literal") || logs.contains("illegal character: '\\'") || logs.contains("illegal character: '\\'")) {
            analysisText = "### Root Cause\n" +
                    "The build failed due to syntax compilation errors inside **Calculator.java** at line 9.\n" +
                    "Specifically, double backslashes were incorrectly written during the escaping process, causing the compiler to throw 'illegal character', 'illegal escape character', and 'unclosed string literal'.\n\n" +
                    "### Suggested Fix\n" +
                    "Restore standard double quote escaping around the `ArithmeticException` message string: `\"Division by zero\"`.";
            
            suggestedCode = "package com.mock;\n\n" +
                    "public class Calculator {\n" +
                    "    public int add(int a, int b) {\n" +
                    "        return a + b;\n" +
                    "    }\n" +
                    "    public int divide(int a, int b) {\n" +
                    "        if (b == 0) {\n" +
                    "            throw new ArithmeticException(\"Division by zero\");\n" +
                    "        }\n" +
                    "        return a / b;\n" +
                    "    }\n" +
                    "}\n";
        } else if (logs.contains("expected: <99>") || logs.contains("expected: 99") || logs.contains("CalculatorTest.testAddNormal")) {
            analysisText = "### Root Cause\n" +
                    "The test suite failed because an assertion inside **CalculatorTest** failed.\n" +
                    "Specifically, `testAddNormal` expected the addition of 2 and 3 to equal 99. However, the `Calculator.add` method correctly returned 5.\n\n" +
                    "### Suggested Fix\n" +
                    "To align the assertions with correct mathematical rules, the unit test assertion in `CalculatorTest.java` should be corrected to expect `5` instead of `99`. The Calculator implementation class itself is mathematically correct.";
            
            // Keep source code as-is since the error is in the unit test itself!
            suggestedCode = sourceCode;
        } else {
            analysisText = "### Root Cause\n" +
                    "The build or test suite failed. Review the compilation error stack traces or JUnit assertions output in the terminal below.\n\n" +
                    "### Suggested Fix\n" +
                    "Inspect the failing line references and adjust code constraints accordingly.";
            suggestedCode = sourceCode;
        }

        return new FailureAnalysisDto(null, null, analysisText, suggestedCode, java.time.LocalDateTime.now());
    }
}
