package com.hackathon.service;

import com.google.generativeai.GenerativeModel;
import com.google.generativeai.model.Content;
import com.google.generativeai.model.GenerateContentResponse;
import com.hackathon.dto.TrafficLog;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiExplanationService {

    private final GenerativeModel generativeModel;

    public String analyzeTraffic(TrafficLog log) {
        try {
            String systemPrompt = "You are a friendly IT expert. A home device is sending " + 
                                log.getPacketSize() + " bytes to " + 
                                log.getDestinationIp() + 
                                ". Is this safe? Explain in one short sentence for a non-technical parent.";

            log.info("Sending prompt to Gemini API for IP: {}", log.getDestinationIp());

            GenerateContentResponse response = generativeModel.generateContent(systemPrompt);
            
            String explanation = response.getText();
            log.info("Received response from Gemini API: {}", explanation);
            
            return explanation;
        } catch (Exception e) {
            log.error("Error calling Gemini API", e);
            throw new RuntimeException("Failed to analyze traffic with AI", e);
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
