package com.cloudai.testing.service;

import com.cloudai.testing.dto.TestRunDto;
import com.cloudai.testing.model.Project;
import com.cloudai.testing.model.TestRun;
import com.cloudai.testing.repository.ProjectRepository;
import com.cloudai.testing.repository.TestRunRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import java.io.BufferedReader;
import java.io.File;
import java.io.InputStreamReader;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class TestExecutionService {

    private static final Logger log = LoggerFactory.getLogger(TestExecutionService.class);

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TestRunRepository testRunRepository;

    @Value("${app.storage.local-dir:./local-storage}")
    private String localDir;

    @Value("${app.maven-path:}")
    private String configuredMavenPath;

    private ExecutorService executorService;
    private Path workspaceRoot;

    @PostConstruct
    public void init() {
        this.executorService = Executors.newFixedThreadPool(4);
        this.workspaceRoot = Paths.get(localDir, "workspaces").toAbsolutePath().normalize();
    }

    private File findProjectRootDir(File workspaceDir) {
        if (new File(workspaceDir, "pom.xml").exists()) {
            return workspaceDir;
        }
        File[] subdirs = workspaceDir.listFiles(File::isDirectory);
        if (subdirs != null) {
            for (File sub : subdirs) {
                if (new File(sub, "pom.xml").exists()) {
                    return sub;
                }
            }
        }
        return workspaceDir;
    }

    private void ensurePomExists(File projectDir) {
        File pom = new File(projectDir, "pom.xml");
        if (!pom.exists()) {
            log.info("No pom.xml found in {}. Generating default JUnit 5 POM.", projectDir);
            String defaultPom = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
                    "<project xmlns=\"http://maven.apache.org/POM/4.0.0\"\n" +
                    "         xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"\n" +
                    "         xsi:schemaLocation=\"http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd\">\n" +
                    "    <modelVersion>4.0.0</modelVersion>\n" +
                    "    <groupId>com.cloudai</groupId>\n" +
                    "    <artifactId>sandbox-project</artifactId>\n" +
                    "    <version>1.0.0</version>\n" +
                    "    <properties>\n" +
                    "        <maven.compiler.source>17</maven.compiler.source>\n" +
                    "        <maven.compiler.target>17</maven.compiler.target>\n" +
                    "        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>\n" +
                    "    </properties>\n" +
                    "    <dependencies>\n" +
                    "        <dependency>\n" +
                    "            <groupId>org.junit.jupiter</groupId>\n" +
                    "            <artifactId>junit-jupiter</artifactId>\n" +
                    "            <version>5.10.2</version>\n" +
                    "            <scope>test</scope>\n" +
                    "        </dependency>\n" +
                    "    </dependencies>\n" +
                    "</project>\n";
            try {
                java.nio.file.Files.writeString(pom.toPath(), defaultPom);
            } catch (Exception e) {
                log.warn("Failed to generate default POM: {}", e.getMessage());
            }
        }
    }

    private String resolveMavenExecutable(File projectDir) {
        boolean isWindows = System.getProperty("os.name", "").toLowerCase().contains("win");

        // 1. Check for maven wrapper inside project
        if (isWindows) {
            File winWrapper = new File(projectDir, "mvnw.cmd");
            if (winWrapper.exists()) return winWrapper.getAbsolutePath();
        } else {
            File nixWrapper = new File(projectDir, "mvnw");
            if (nixWrapper.exists()) {
                nixWrapper.setExecutable(true);
                return nixWrapper.getAbsolutePath();
            }
        }

        // 2. Check if a custom valid path was specified
        if (configuredMavenPath != null && !configuredMavenPath.isBlank()) {
            File custom = new File(configuredMavenPath);
            if (custom.exists()) {
                return configuredMavenPath;
            }
        }

        // 3. Fallback to standard system PATH executable
        return isWindows ? "mvn.cmd" : "mvn";
    }

    @PreDestroy
    public void cleanup() {
        if (executorService != null) {
            executorService.shutdown();
            try {
                if (!executorService.awaitTermination(5, TimeUnit.SECONDS)) {
                    executorService.shutdownNow();
                }
            } catch (InterruptedException e) {
                executorService.shutdownNow();
            }
        }
    }

    public TestRunDto triggerTestRun(UUID projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new IllegalArgumentException("Project not found with ID: " + projectId));

        // 1. Create a TestRun entry in PENDING state
        TestRun testRun = new TestRun(project, "PENDING");
        testRun = testRunRepository.save(testRun);

        final UUID runId = testRun.getId();

        // 2. Submit test execution task to the thread pool
        executorService.submit(() -> executeTestsTask(projectId, runId));

        return convertToDto(testRun);
    }

    private void executeTestsTask(UUID projectId, UUID runId) {
        long startTime = System.currentTimeMillis();
        
        Optional<TestRun> runOpt = testRunRepository.findById(runId);
        if (runOpt.isEmpty()) return;
        TestRun testRun = runOpt.get();
        
        testRun.setStatus("RUNNING");
        testRun.setLogs("Starting test execution environment...\n");
        testRunRepository.save(testRun);

        StringBuilder logBuffer = new StringBuilder();
        logBuffer.append("[SYSTEM INFO] Initializing test runner sandbox...\n");

        File workspaceDir = workspaceRoot.resolve(projectId.toString()).toFile();
        if (!workspaceDir.exists() || !workspaceDir.isDirectory()) {
            finalizeRun(runId, "FAILED", 0, 0, 0, 0, 
                logBuffer.append("[ERROR] Workspace directory not found on host disk.\n").toString(), 0L);
            return;
        }

        File projectDir = findProjectRootDir(workspaceDir);
        ensurePomExists(projectDir);
        String mavenExecutable = resolveMavenExecutable(projectDir);

        logBuffer.append("[SYSTEM INFO] Working directory: ").append(projectDir.getAbsolutePath()).append("\n");
        logBuffer.append("[SYSTEM INFO] Launching build: ").append(mavenExecutable).append(" clean test\n\n");

        Process process = null;
        try {
            // Setup maven process
            ProcessBuilder pb = new ProcessBuilder(mavenExecutable, "clean", "test");
            pb.directory(projectDir);
            pb.redirectErrorStream(true); // combine stdout and stderr

            process = pb.start();

            try (BufferedReader reader = new BufferedReader(new InputStreamReader(process.getInputStream()))) {
                String line;
                long lastDbUpdate = System.currentTimeMillis();
                
                while ((line = reader.readLine()) != null) {
                    logBuffer.append(line).append("\n");
                    
                    // Periodic updates to database for live logs rendering
                    if (System.currentTimeMillis() - lastDbUpdate > 1200) {
                        updateLogsInDatabase(runId, logBuffer.toString());
                        lastDbUpdate = System.currentTimeMillis();
                    }
                }
            }

            // Enforce process timeout (60 seconds)
            boolean finished = process.waitFor(60, TimeUnit.SECONDS);
            long executionTime = System.currentTimeMillis() - startTime;

            if (!finished) {
                process.destroyForcibly();
                logBuffer.append("\n[TIMEOUT ERROR] Test execution exceeded the 60-second limit and was aborted.\n");
                finalizeRun(runId, "TIMEOUT", 0, 0, 0, 0, logBuffer.toString(), executionTime);
                return;
            }

            int exitCode = process.exitValue();
            String finalLogs = logBuffer.toString();

            // Parse Surefire test summary metrics from stdout
            int testsRun = 0;
            int failures = 0;
            int errors = 0;
            int skipped = 0;

            // Pattern matching Maven Surefire results line
            // e.g. [INFO] Tests run: 4, Failures: 1, Errors: 0, Skipped: 0
            Pattern surefirePattern = Pattern.compile("Tests run:\\s*(\\d+),\\s*Failures:\\s*(\\d+),\\s*Errors:\\s*(\\d+),\\s*Skipped:\\s*(\\d+)");
            Matcher matcher = surefirePattern.matcher(finalLogs);
            while (matcher.find()) {
                testsRun = Integer.parseInt(matcher.group(1));
                failures = Integer.parseInt(matcher.group(2));
                errors = Integer.parseInt(matcher.group(3));
                skipped = Integer.parseInt(matcher.group(4));
            }

            // Determine test run status
            String finalStatus = "COMPLETED";
            if (exitCode != 0 || failures > 0 || errors > 0 || finalLogs.contains("BUILD FAILURE")) {
                finalStatus = "FAILED";
            }

            finalizeRun(runId, finalStatus, testsRun, failures, errors, skipped, finalLogs, executionTime);

        } catch (Exception e) {
            log.error("Failed to execute Maven build: {}", e.getMessage(), e);
            long executionTime = System.currentTimeMillis() - startTime;
            logBuffer.append("\n[SYSTEM ERROR] Failed to launch execution framework: ").append(e.getMessage()).append("\n");
            finalizeRun(runId, "FAILED", 0, 0, 0, 0, logBuffer.toString(), executionTime);
            if (process != null && process.isAlive()) {
                process.destroyForcibly();
            }
        }
    }

    private synchronized void updateLogsInDatabase(UUID runId, String currentLogs) {
        testRunRepository.findById(runId).ifPresent(run -> {
            run.setLogs(currentLogs);
            testRunRepository.saveAndFlush(run);
        });
    }

    private synchronized void finalizeRun(UUID runId, String status, int testsRun, int failures, int errors, int skipped, String finalLogs, long executionTimeMs) {
        testRunRepository.findById(runId).ifPresent(run -> {
            run.setStatus(status);
            run.setTestsRun(testsRun);
            run.setFailures(failures);
            run.setErrors(errors);
            run.setSkipped(skipped);
            run.setLogs(finalLogs);
            run.setExecutionTimeMs(executionTimeMs);
            testRunRepository.saveAndFlush(run);
            log.info("TestRun {} finalized as {} in {}ms (Run: {}, Failures: {})", runId, status, executionTimeMs, testsRun, failures);
        });
    }

    public TestRunDto getTestRun(UUID projectId, UUID runId) {
        TestRun run = testRunRepository.findById(runId)
                .orElseThrow(() -> new IllegalArgumentException("Test run not found with ID: " + runId));
        
        if (!run.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Test run does not belong to specified project.");
        }
        return convertToDto(run);
    }

    public TestRunDto getLatestRun(UUID projectId) {
        Optional<TestRun> run = testRunRepository.findFirstByProjectIdOrderByCreatedAtDesc(projectId);
        return run.map(this::convertToDto).orElse(null);
    }

    public List<TestRunDto> getHistory(UUID projectId) {
        List<TestRun> runs = testRunRepository.findByProjectIdOrderByCreatedAtDesc(projectId);
        return runs.stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private TestRunDto convertToDto(TestRun run) {
        return new TestRunDto(
                run.getId(),
                run.getProject().getId(),
                run.getStatus(),
                run.getTestsRun(),
                run.getFailures(),
                run.getErrors(),
                run.getSkipped(),
                run.getLogs(),
                run.getExecutionTimeMs(),
                run.getCreatedAt()
        );
    }
}
