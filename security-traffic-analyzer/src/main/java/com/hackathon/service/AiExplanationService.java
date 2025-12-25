package com.hackathon.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hackathon.dto.TrafficLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiExplanationService {

    private final OkHttpClient okHttpClient;
    private final String geminiApiKey;
    private final String geminiModelName;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models";

    public String analyzeTraffic(TrafficLog log) {
        try {
            String systemPrompt = "You are a friendly IT expert. A home device is sending " + 
                                log.getPacketSize() + " bytes to " + 
                                log.getDestinationIp() + 
                                ". Is this safe? Explain in one short sentence for a non-technical parent.";

            log.info("Sending prompt to Gemini API for IP: {}", log.getDestinationIp());

            String response = callGeminiApi(systemPrompt);
            log.info("Received response from Gemini API: {}", response);
            
            return response;
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            throw new RuntimeException("Failed to analyze traffic with AI", e);
        }
    }

    private String callGeminiApi(String prompt) throws Exception {
        String requestBody = objectMapper.writeValueAsString(
            objectMapper.createObjectNode()
                .putArray("contents")
                .addObject()
                .putArray("parts")
                .addObject()
                .put("text", prompt)
        );

        Request request = new Request.Builder()
            .url(String.format("%s/%s:generateContent?key=%s", GEMINI_API_URL, geminiModelName, geminiApiKey))
            .post(RequestBody.create(requestBody, MediaType.get("application/json")))
            .build();

        try (Response response = okHttpClient.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                throw new RuntimeException("Gemini API error: " + response.code());
            }

            String responseBody = response.body().string();
            JsonNode jsonNode = objectMapper.readTree(responseBody);
            
            return jsonNode
                .path("candidates")
                .get(0)
                .path("content")
                .path("parts")
                .get(0)
                .path("text")
                .asText();
        }
    }

    public String determineRiskScore(TrafficLog log, String explanation) {
        String lowerExplanation = explanation.toLowerCase();
        
        if (lowerExplanation.contains("safe") || 
            lowerExplanation.contains("normal") || 
            lowerExplanation.contains("legitimate")) {
            return "Low";
        } else if (lowerExplanation.contains("suspicious") || 
                   lowerExplanation.contains("unusual") ||
                   lowerExplanation.contains("caution")) {
            return "Medium";
        } else if (lowerExplanation.contains("dangerous") || 
                   lowerExplanation.contains("malware") ||
                   lowerExplanation.contains("threat")) {
            return "High";
        }
        
        return "Medium";
    }
}
