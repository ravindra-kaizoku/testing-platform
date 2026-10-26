package com.cloudai.testing.controller;

import com.cloudai.testing.dto.ProjectUploadResponse;
import com.cloudai.testing.dto.SourceFileDetailDto;
import com.cloudai.testing.dto.SourceFileDto;
import com.cloudai.testing.dto.GeneratedTestDto;
import com.cloudai.testing.dto.TestRunDto;
import com.cloudai.testing.dto.FailureAnalysisDto;
import com.cloudai.testing.model.SourceFile;
import com.cloudai.testing.service.ProjectService;
import com.cloudai.testing.service.TestExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @Autowired
    private TestExecutionService testExecutionService;

    @PostMapping("/upload")
    public ResponseEntity<ProjectUploadResponse> uploadProject(@RequestParam("file") MultipartFile file) {
        try {
            ProjectUploadResponse response = projectService.uploadProject(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ProjectUploadResponse(null, null, 0, e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ProjectUploadResponse(null, null, 0, "ZIP processing failed: " + e.getMessage()));
        }
    }

    @GetMapping("/{projectId}/files")
    public ResponseEntity<List<SourceFileDto>> getProjectFiles(@PathVariable("projectId") UUID projectId) {
        try {
            List<SourceFileDto> files = projectService.getProjectFiles(projectId);
            return ResponseEntity.ok(files);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/{projectId}/files/{fileId}")
    public ResponseEntity<SourceFileDetailDto> getSourceFile(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("fileId") UUID fileId) {
        try {
            SourceFile sourceFile = projectService.getSourceFile(projectId, fileId);
            SourceFileDetailDto dto = new SourceFileDetailDto(
                    sourceFile.getId(),
                    sourceFile.getFilePath(),
                    sourceFile.getClassName(),
                    sourceFile.getContent()
            );
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/{projectId}/files/{fileId}/generate-tests")
    public ResponseEntity<GeneratedTestDto> generateTests(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("fileId") UUID fileId) {
        try {
            GeneratedTestDto testDto = projectService.generateTests(projectId, fileId);
            return ResponseEntity.status(HttpStatus.CREATED).body(testDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PostMapping("/{projectId}/files/{fileId}/save-tests")
    public ResponseEntity<GeneratedTestDto> saveTests(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("fileId") UUID fileId,
            @RequestBody Map<String, String> payload) {
        try {
            String testCode = payload.get("content");
            if (testCode == null || testCode.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }
            GeneratedTestDto testDto = projectService.saveTests(projectId, fileId, testCode);
            return ResponseEntity.ok(testDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{projectId}/files/{fileId}/tests")
    public ResponseEntity<GeneratedTestDto> getGeneratedTest(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("fileId") UUID fileId) {
        try {
            GeneratedTestDto testDto = projectService.getGeneratedTest(projectId, fileId);
            if (testDto == null) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
            }
            return ResponseEntity.ok(testDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/{projectId}/run-tests")
    public ResponseEntity<TestRunDto> runTests(@PathVariable("projectId") UUID projectId) {
        try {
            TestRunDto runDto = testExecutionService.triggerTestRun(projectId);
            return ResponseEntity.status(HttpStatus.ACCEPTED).body(runDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/{projectId}/runs/{runId}")
    public ResponseEntity<TestRunDto> getTestRun(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("runId") UUID runId) {
        try {
            TestRunDto runDto = testExecutionService.getTestRun(projectId, runId);
            return ResponseEntity.ok(runDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/{projectId}/runs/latest")
    public ResponseEntity<TestRunDto> getLatestRun(@PathVariable("projectId") UUID projectId) {
        try {
            TestRunDto runDto = testExecutionService.getLatestRun(projectId);
            if (runDto == null) {
                return ResponseEntity.status(HttpStatus.NO_CONTENT).body(null);
            }
            return ResponseEntity.ok(runDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @GetMapping("/{projectId}/runs")
    public ResponseEntity<List<TestRunDto>> getRunHistory(@PathVariable("projectId") UUID projectId) {
        try {
            List<TestRunDto> history = testExecutionService.getHistory(projectId);
            return ResponseEntity.ok(history);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/{projectId}/runs/{runId}/analyze")
    public ResponseEntity<FailureAnalysisDto> analyzeFailure(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("runId") UUID runId) {
        try {
            FailureAnalysisDto analysis = projectService.analyzeRunFailure(projectId, runId);
            return ResponseEntity.ok(analysis);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{projectId}/runs/{runId}/analysis")
    public ResponseEntity<FailureAnalysisDto> getFailureAnalysis(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("runId") UUID runId) {
        try {
            FailureAnalysisDto analysis = projectService.getFailureAnalysis(projectId, runId);
            if (analysis == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
            }
            return ResponseEntity.ok(analysis);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @PostMapping("/{projectId}/files/{fileId}/apply-fix")
    public ResponseEntity<Void> applyFix(
            @PathVariable("projectId") UUID projectId,
            @PathVariable("fileId") UUID fileId,
            @RequestBody Map<String, String> payload) {
        try {
            String correctedCode = payload.get("content");
            if (correctedCode == null || correctedCode.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            projectService.applySuggestedCodeFix(projectId, fileId, correctedCode);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
