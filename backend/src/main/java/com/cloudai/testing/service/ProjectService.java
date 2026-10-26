package com.cloudai.testing.service;

import com.cloudai.testing.dto.ProjectUploadResponse;
import com.cloudai.testing.dto.SourceFileDto;
import com.cloudai.testing.dto.GeneratedTestDto;
import com.cloudai.testing.dto.FailureAnalysisDto;
import com.cloudai.testing.model.Project;
import com.cloudai.testing.model.SourceFile;
import com.cloudai.testing.model.GeneratedTest;
import com.cloudai.testing.model.TestRun;
import com.cloudai.testing.model.FailureAnalysis;
import com.cloudai.testing.repository.ProjectRepository;
import com.cloudai.testing.repository.SourceFileRepository;
import com.cloudai.testing.repository.GeneratedTestRepository;
import com.cloudai.testing.repository.TestRunRepository;
import com.cloudai.testing.repository.FailureAnalysisRepository;
import com.cloudai.testing.util.ZipSecurity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

@Service
public class ProjectService {

    private static final Logger log = LoggerFactory.getLogger(ProjectService.class);

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SourceFileRepository sourceFileRepository;

    @Autowired
    private GeneratedTestRepository generatedTestRepository;

    @Autowired
    private AiService aiService;

    @Autowired
    private StorageService storageService;

    @Autowired
    private TestRunRepository testRunRepository;

    @Autowired
    private FailureAnalysisRepository failureAnalysisRepository;

    @Value("${app.storage.local-dir:./local-storage}")
    private String baseStorageDir;

    private Path workspaceRoot;

    @PostConstruct
    public void init() {
        this.workspaceRoot = Paths.get(baseStorageDir, "workspaces").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.workspaceRoot);
        } catch (IOException e) {
            throw new RuntimeException("Could not create workspace directory: " + workspaceRoot, e);
        }
    }

    @Transactional
    public ProjectUploadResponse uploadProject(MultipartFile file) throws IOException {
        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".zip")) {
            throw new IllegalArgumentException("Only ZIP files are supported.");
        }

        // 1. Save ZIP using StorageService
        String storedZipPath;
        try (InputStream is = file.getInputStream()) {
            storedZipPath = storageService.storeFile(filename, is);
        }

        // 2. Create Project metadata in DB
        Project project = new Project(filename, storedZipPath);
        project = projectRepository.save(project);
        UUID projectId = project.getId();

        // 3. Extract the ZIP file safely
        File targetWorkspace = workspaceRoot.resolve(projectId.toString()).toFile();
        if (!targetWorkspace.mkdirs()) {
            log.warn("Workspace directory already exists or failed to create: {}", targetWorkspace);
        }

        List<SourceFile> detectedJavaFiles = new ArrayList<>();
        
        try (InputStream fileIs = new FileInputStream(storedZipPath);
             ZipInputStream zis = new ZipInputStream(fileIs)) {
            
            ZipEntry entry;
            byte[] buffer = new byte[4096];
            
            while ((entry = zis.getNextEntry()) != null) {
                // Prevent Zip Slip
                File destFile = ZipSecurity.newFile(targetWorkspace, entry);
                
                boolean isDir = entry.isDirectory() || entry.getName().endsWith("/") || entry.getName().endsWith("\\");
                
                if (isDir) {
                    if (!destFile.isDirectory() && !destFile.mkdirs()) {
                        throw new IOException("Failed to create directory: " + destFile);
                    }
                } else {
                    // Ensure parent directories exist
                    File parent = destFile.getParentFile();
                    if (parent != null && !parent.isDirectory() && !parent.mkdirs()) {
                        throw new IOException("Failed to create parent directories for: " + destFile);
                    }
                    
                    // Write file contents to disk
                    try (FileOutputStream fos = new FileOutputStream(destFile)) {
                        int len;
                        while ((len = zis.read(buffer)) > 0) {
                            fos.write(buffer, 0, len);
                        }
                    }
                    
                    // If it is a Java file, read its code content and register it
                    if (destFile.getName().toLowerCase().endsWith(".java")) {
                        String relativePath = targetWorkspace.toURI().relativize(destFile.toURI()).getPath();
                        String content = Files.readString(destFile.toPath(), StandardCharsets.UTF_8);
                        String className = destFile.getName().substring(0, destFile.getName().length() - 5);
                        
                        SourceFile sourceFile = new SourceFile(project, relativePath, className, content);
                        detectedJavaFiles.add(sourceFile);
                    }
                }
                zis.closeEntry();
            }
        } catch (Exception e) {
            log.error("Failed to safely extract ZIP file: {}", e.getMessage(), e);
            project.setStatus("FAILED");
            projectRepository.save(project);
            throw new IOException("ZIP extraction failed: " + e.getMessage(), e);
        }

        // 4. Store Java file entities in database
        if (!detectedJavaFiles.isEmpty()) {
            sourceFileRepository.saveAll(detectedJavaFiles);
        }

        project.setStatus("COMPLETED");
        projectRepository.save(project);

        log.info("Project '{}' processed successfully. Detected {} java files.", project.getName(), detectedJavaFiles.size());

        return new ProjectUploadResponse(
                project.getId(),
                project.getName(),
                detectedJavaFiles.size(),
                "Project uploaded and parsed successfully."
        );
    }

    public List<SourceFileDto> getProjectFiles(UUID projectId) {
        if (!projectRepository.existsById(projectId)) {
            throw new IllegalArgumentException("Project not found with ID: " + projectId);
        }
        return sourceFileRepository.findDtoByProjectId(projectId);
    }

    public SourceFile getSourceFile(UUID projectId, UUID fileId) {
        SourceFile sourceFile = sourceFileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Source file not found with ID: " + fileId));
        
        if (!sourceFile.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("File does not belong to the specified project.");
        }
        
        return sourceFile;
    }

    @Transactional
    public GeneratedTestDto generateTests(UUID projectId, UUID fileId) throws Exception {
        SourceFile sourceFile = getSourceFile(projectId, fileId);
        
        // 1. Generate JUnit 5 code using AiService
        String testCode = aiService.generateTests(sourceFile.getClassName(), sourceFile.getContent());
        
        // Determine relative test path: src/main/java/... -> src/test/java/...
        String sourcePath = sourceFile.getFilePath();
        String testPath = sourcePath.replace("src/main/java/", "src/test/java/").replace(".java", "Test.java");
        
        // 2. Check if a test already exists in DB
        Optional<GeneratedTest> existing = generatedTestRepository.findBySourceFileId(fileId);
        GeneratedTest generatedTest;
        if (existing.isPresent()) {
            generatedTest = existing.get();
            generatedTest.setContent(testCode);
        } else {
            generatedTest = new GeneratedTest(sourceFile, testPath, testCode);
        }
        
        generatedTest = generatedTestRepository.save(generatedTest);
        log.info("Generated unit tests for file: {}. Saved to path: {}", sourceFile.getClassName(), testPath);

        return new GeneratedTestDto(
                generatedTest.getId(),
                sourceFile.getId(),
                generatedTest.getFilePath(),
                generatedTest.getContent()
        );
    }

    @Transactional
    public GeneratedTestDto saveTests(UUID projectId, UUID fileId, String testCode) throws IOException {
        SourceFile sourceFile = getSourceFile(projectId, fileId);
        
        GeneratedTest generatedTest = generatedTestRepository.findBySourceFileId(fileId)
                .orElseThrow(() -> new IllegalArgumentException("No generated tests exist for this file yet. Generate them first."));
        
        // Update database record
        generatedTest.setContent(testCode);
        generatedTestRepository.save(generatedTest);
        
        // Write file to workspace directory
        File workspaceDir = workspaceRoot.resolve(projectId.toString()).toFile();
        File testFile = new File(workspaceDir, generatedTest.getFilePath());
        
        File parent = testFile.getParentFile();
        if (parent != null && !parent.isDirectory() && !parent.mkdirs()) {
            throw new IOException("Failed to create directories for test file: " + parent);
        }
        
        try (FileWriter writer = new FileWriter(testFile)) {
            writer.write(testCode);
        }
        
        log.info("Committed test code to workspace: {}", testFile.getAbsolutePath());
        
        return new GeneratedTestDto(
                generatedTest.getId(),
                sourceFile.getId(),
                generatedTest.getFilePath(),
                generatedTest.getContent()
        );
    }

    public GeneratedTestDto getGeneratedTest(UUID projectId, UUID fileId) {
        // Validate source file exists and belongs to project
        getSourceFile(projectId, fileId);
        
        Optional<GeneratedTest> generatedTest = generatedTestRepository.findBySourceFileId(fileId);
        if (generatedTest.isEmpty()) {
            return null;
        }
        
        GeneratedTest test = generatedTest.get();
        return new GeneratedTestDto(
                test.getId(),
                fileId,
                test.getFilePath(),
                test.getContent()
        );
    }

    public FailureAnalysisDto getFailureAnalysis(UUID projectId, UUID runId) {
        Optional<FailureAnalysis> analysis = failureAnalysisRepository.findByTestRunId(runId);
        if (analysis.isEmpty()) {
            return null;
        }
        FailureAnalysis a = analysis.get();
        return new FailureAnalysisDto(a.getId(), runId, a.getAnalysisText(), a.getSuggestedCode(), a.getCreatedAt());
    }

    public FailureAnalysisDto analyzeRunFailure(UUID projectId, UUID runId) throws Exception {
        TestRun run = testRunRepository.findById(runId)
                .orElseThrow(() -> new IllegalArgumentException("Test run not found: " + runId));
        
        if (!run.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Test run does not belong to project: " + projectId);
        }

        Optional<FailureAnalysis> existing = failureAnalysisRepository.findByTestRunId(runId);
        if (existing.isPresent()) {
            FailureAnalysis a = existing.get();
            return new FailureAnalysisDto(a.getId(), runId, a.getAnalysisText(), a.getSuggestedCode(), a.getCreatedAt());
        }

        List<SourceFile> sourceFiles = sourceFileRepository.findByProjectId(projectId);
        if (sourceFiles.isEmpty()) {
            throw new IllegalArgumentException("No source files found in project: " + projectId);
        }
        
        SourceFile sourceFile = sourceFiles.get(0);
        String sourceCode = sourceFile.getContent();
        
        Optional<GeneratedTest> genTest = generatedTestRepository.findBySourceFileId(sourceFile.getId());
        String testCode = genTest.isPresent() ? genTest.get().getContent() : "";

        FailureAnalysisDto aiDto = aiService.analyzeFailure(
                sourceFile.getClassName(),
                sourceCode,
                testCode,
                run.getLogs()
        );

        FailureAnalysis analysis = new FailureAnalysis(run, aiDto.getAnalysisText(), aiDto.getSuggestedCode());
        failureAnalysisRepository.save(analysis);

        aiDto.setId(analysis.getId());
        aiDto.setTestRunId(runId);
        aiDto.setCreatedAt(analysis.getCreatedAt());
        return aiDto;
    }

    @Transactional
    public void applySuggestedCodeFix(UUID projectId, UUID fileId, String correctedCode) throws IOException {
        SourceFile sourceFile = sourceFileRepository.findById(fileId)
                .orElseThrow(() -> new IllegalArgumentException("Source file not found: " + fileId));

        if (!sourceFile.getProject().getId().equals(projectId)) {
            throw new IllegalArgumentException("Source file does not belong to project: " + projectId);
        }

        sourceFile.setContent(correctedCode);
        sourceFileRepository.save(sourceFile);

        File workspaceDir = workspaceRoot.resolve(projectId.toString()).toFile();
        File diskFile = new File(workspaceDir, sourceFile.getFilePath());

        File parent = diskFile.getParentFile();
        if (parent != null && !parent.isDirectory() && !parent.mkdirs()) {
            throw new IOException("Failed to create directories for source file: " + parent);
        }

        try (FileWriter writer = new FileWriter(diskFile)) {
            writer.write(correctedCode);
        }

        log.info("Applied AI code fix and wrote back to: {}", diskFile.getAbsolutePath());
    }
}
