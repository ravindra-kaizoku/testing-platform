package com.cloudai.testing.service;

import org.junit.jupiter.api.Test;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import static org.junit.jupiter.api.Assertions.*;

public class TestExecutionServiceTest {

    @Test
    public void testSurefireResultsRegexParsing() {
        String logOutput = "[INFO] Running com.mock.CalculatorTest\n" +
                "[INFO] Tests run: 4, Failures: 1, Errors: 0, Skipped: 0, Time elapsed: 0.12 s -- in com.mock.CalculatorTest\n" +
                "[INFO] \n" +
                "[INFO] Results:\n" +
                "[INFO] \n" +
                "[INFO] Tests run: 4, Failures: 1, Errors: 0, Skipped: 0\n" +
                "[INFO] \n" +
                "[INFO] ------------------------------------------------------------------------\n" +
                "[INFO] BUILD FAILURE\n";

        int testsRun = 0;
        int failures = 0;
        int errors = 0;
        int skipped = 0;

        Pattern surefirePattern = Pattern.compile("Tests run:\\s*(\\d+),\\s*Failures:\\s*(\\d+),\\s*Errors:\\s*(\\d+),\\s*Skipped:\\s*(\\d+)");
        Matcher matcher = surefirePattern.matcher(logOutput);
        
        while (matcher.find()) {
            testsRun = Integer.parseInt(matcher.group(1));
            failures = Integer.parseInt(matcher.group(2));
            errors = Integer.parseInt(matcher.group(3));
            skipped = Integer.parseInt(matcher.group(4));
        }

        assertEquals(4, testsRun);
        assertEquals(1, failures);
        assertEquals(0, errors);
        assertEquals(0, skipped);
    }
}
