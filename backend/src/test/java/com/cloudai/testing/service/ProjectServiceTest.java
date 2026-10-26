package com.cloudai.testing.service;

import com.cloudai.testing.dto.ProjectUploadResponse;
import com.cloudai.testing.model.Project;
import com.cloudai.testing.repository.ProjectRepository;
import com.cloudai.testing.repository.SourceFileRepository;
import com.cloudai.testing.util.ZipSecurity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.mock.web.MockMultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

public class ProjectServiceTest {

    @TempDir
    Path tempDir;

    @Test
    public void testZipSlipSecurityBlock() {
        File targetDir = tempDir.toFile();
        
        // entry pointing outside targetDir
        ZipEntry maliciousEntry = new ZipEntry("../malicious.java");
        
        IOException exception = assertThrows(IOException.class, () -> {
            ZipSecurity.newFile(targetDir, maliciousEntry);
        });
        
        assertTrue(exception.getMessage().contains("Zip Slip attempt"));
    }

    @Test
    public void testZipSlipSecurityPass() throws IOException {
        File targetDir = tempDir.toFile();
        
        ZipEntry safeEntry = new ZipEntry("src/main/java/Calculator.java");
        File resolved = ZipSecurity.newFile(targetDir, safeEntry);
        
        assertNotNull(resolved);
        assertTrue(resolved.getCanonicalPath().startsWith(targetDir.getCanonicalPath()));
    }

    @Test
    public void testMockAiTestGeneration() throws Exception {
        AiService mockAiService = new MockAiServiceImpl();
        String sourceCode = "package com.mock;\npublic class Calculator {\n}";
        String testCode = mockAiService.generateTests("Calculator", sourceCode);
        
        assertNotNull(testCode);
        assertTrue(testCode.contains("package com.mock;"));
        assertTrue(testCode.contains("public class CalculatorTest"));
        assertTrue(testCode.contains("testAddNormal"));
        assertTrue(testCode.contains("testDivideByZeroNegative"));
    }
}
