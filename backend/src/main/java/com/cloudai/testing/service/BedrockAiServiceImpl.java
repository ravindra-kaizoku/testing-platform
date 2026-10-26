package com.cloudai.testing.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.cloudai.testing.dto.FailureAnalysisDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.core.SdkBytes;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.bedrockruntime.BedrockRuntimeClient;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelRequest;
import software.amazon.awssdk.services.bedrockruntime.model.InvokeModelResponse;

import java.nio.charset.StandardCharsets;

@Service
@ConditionalOnProperty(name = "app.ai.provider", havingValue = "bedrock")
public class BedrockAiServiceImpl implements AiService {

    private static final Logger log = LoggerFactory.getLogger(BedrockAiServiceImpl.class);

    @Value("${app.ai.model-id:anthropic.claude-3-sonnet-20240229-v1:0}")
    private String modelId;

    @Value("${AWS_REGION:us-east-1}")
    private String awsRegion;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public String generateTests(String className, String sourceCode) throws Exception {
        log.info("Generating tests using AWS Bedrock (Model: {}) for class: {}", modelId, className);

        String prompt = "Analyze the following Java class and write a comprehensive JUnit 5 test class for it.\n" +
                "Include normal test cases, boundary cases, negative cases, and edge cases.\n" +
                "Your response MUST contain ONLY the valid Java source code for the test class. " +
                "Do not explain your code, do not add trailing explanations, and do not add markdown packaging unless required, but code must compile directly.\n\n" +
                "Class Name: " + className + "\n" +
                "Source Code:\n" + sourceCode;

        // Construct Anthropic Messages API JSON payload
        ObjectNode rootNode = objectMapper.createObjectNode();
        rootNode.put("anthropic_version", "bedrock-2023-05-31");
        rootNode.put("max_tokens", 4096);
        rootNode.put("temperature", 0.2); // Low temperature for deterministic code generation
        
        ArrayNode messagesNode = rootNode.putArray("messages");
        ObjectNode messageNode = objectMapper.createObjectNode();
        messageNode.put("role", "user");
        ArrayNode contentNode = messageNode.putArray("content");
        ObjectNode textNode = objectMapper.createObjectNode();
        textNode.put("type", "text");
        textNode.put("text", prompt);
        contentNode.add(textNode);
        messagesNode.add(messageNode);

        String payload = objectMapper.writeValueAsString(rootNode);

        // Call AWS Bedrock Runtime Client
        try (BedrockRuntimeClient client = BedrockRuntimeClient.builder()
                .region(Region.of(awsRegion))
                .build()) {

            InvokeModelRequest request = InvokeModelRequest.builder()
                    .modelId(modelId)
                    .contentType("application/json")
                    .accept("application/json")
                    .body(SdkBytes.fromUtf8String(payload))
                    .build();

            log.info("Sending InvokeModelRequest to Bedrock...");
            InvokeModelResponse response = client.invokeModel(request);
            String responseJson = response.body().asUtf8String();
            
            JsonNode responseNode = objectMapper.readTree(responseJson);
            String rawOutput = responseNode.get("content").get(0).get("text").asText();
            
            return cleanGeneratedCode(rawOutput);
        } catch (Exception e) {
            log.error("AWS Bedrock execution failed: {}", e.getMessage(), e);
            throw new Exception("AWS Bedrock execution failed: " + e.getMessage(), e);
        }
    }

    private String cleanGeneratedCode(String rawCode) {
        if (rawCode == null) return "";
        
        // Strip markdown java code blocks if present
        if (rawCode.contains("```java")) {
            rawCode = rawCode.substring(rawCode.indexOf("```java") + 7);
            if (rawCode.contains("```")) {
                rawCode = rawCode.substring(0, rawCode.indexOf("```"));
            }
        } else if (rawCode.contains("```")) {
            rawCode = rawCode.substring(rawCode.indexOf("```") + 3);
            if (rawCode.contains("```")) {
                rawCode = rawCode.substring(0, rawCode.indexOf("```"));
            }
        }
        return rawCode.trim();
    }

    @Override
    public FailureAnalysisDto analyzeFailure(String className, String sourceCode, String testCode, String logs) throws Exception {
        log.info("Analyzing failure using AWS Bedrock (Model: {}) for class: {}", modelId, className);

        String prompt = "You are an expert developer. A unit test run failed for a Java project.\n" +
                "Analyze the following details:\n" +
                "1. Source Code under test:\n" +
                sourceCode + "\n\n" +
                "2. JUnit Test Case Code:\n" +
                testCode + "\n\n" +
                "3. Build & Test Console Logs:\n" +
                logs + "\n\n" +
                "Provide a failure analysis containing:\n" +
                "- Root Cause: A detailed explanation of why the build failed or which test failed and why.\n" +
                "- Suggested Fix: A description of the changes needed to fix the code.\n" +
                "- Corrected Code: Provide the complete corrected source code for the main class (NOT the test class) wrapped in a markdown java block: ```java\n// corrected code\n```";

        // Construct Anthropic Messages API JSON payload
        ObjectNode rootNode = objectMapper.createObjectNode();
        rootNode.put("anthropic_version", "bedrock-2023-05-31");
        rootNode.put("max_tokens", 4096);
        rootNode.put("temperature", 0.3);
        
        ArrayNode messagesNode = rootNode.putArray("messages");
        ObjectNode messageNode = objectMapper.createObjectNode();
        messageNode.put("role", "user");
        ArrayNode contentNode = messageNode.putArray("content");
        ObjectNode textNode = objectMapper.createObjectNode();
        textNode.put("type", "text");
        textNode.put("text", prompt);
        contentNode.add(textNode);
        messagesNode.add(messageNode);

        String payload = objectMapper.writeValueAsString(rootNode);

        try (BedrockRuntimeClient client = BedrockRuntimeClient.builder()
                .region(Region.of(awsRegion))
                .build()) {

            InvokeModelRequest request = InvokeModelRequest.builder()
                    .modelId(modelId)
                    .contentType("application/json")
                    .accept("application/json")
                    .body(SdkBytes.fromUtf8String(payload))
                    .build();

            InvokeModelResponse response = client.invokeModel(request);
            String responseJson = response.body().asUtf8String();
            
            JsonNode responseNode = objectMapper.readTree(responseJson);
            String rawOutput = responseNode.get("content").get(0).get("text").asText();
            
            // Parse rawOutput into analysis text and suggested code
            String suggestedCode = sourceCode;
            String analysisText = rawOutput;

            if (rawOutput.contains("```java")) {
                int startIdx = rawOutput.indexOf("```java");
                int endIdx = rawOutput.indexOf("```", startIdx + 7);
                if (endIdx > startIdx) {
                    suggestedCode = rawOutput.substring(startIdx + 7, endIdx).trim();
                    // Split the analysis around the code block to keep descriptions intact
                    analysisText = rawOutput.substring(0, startIdx) + "\n" + rawOutput.substring(endIdx + 3);
                    analysisText = analysisText.trim();
                }
            }

            return new FailureAnalysisDto(null, null, analysisText, suggestedCode, java.time.LocalDateTime.now());
        } catch (Exception e) {
            log.error("AWS Bedrock failure analysis failed: {}", e.getMessage(), e);
            throw new Exception("AWS Bedrock failure analysis failed: " + e.getMessage(), e);
        }
    }
}
