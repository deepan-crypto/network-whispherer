package com.hackathon.controller;

import com.hackathon.dto.AnalysisResponse;
import com.hackathon.dto.TrafficLog;
import com.hackathon.service.AiExplanationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrafficAnalysisController {

    private final AiExplanationService aiExplanationService;

    @PostMapping("/analyze")
    public ResponseEntity<AnalysisResponse> analyzeTraffic(@RequestBody TrafficLog trafficLog) {
        try {
            log.info("Received traffic log for analysis - IP: {}, Size: {} bytes", 
                    trafficLog.getDestinationIp(), trafficLog.getPacketSize());

            String explanation = aiExplanationService.analyzeTraffic(trafficLog);
            String riskScore = aiExplanationService.determineRiskScore(trafficLog, explanation);

            AnalysisResponse response = AnalysisResponse.builder()
                    .riskScore(riskScore)
                    .explanation(explanation)
                    .build();

            log.info("Analysis complete - Risk Score: {}", riskScore);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error analyzing traffic", e);
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(AnalysisResponse.builder()
                            .riskScore("Error")
                            .explanation("An error occurred while analyzing the traffic. Please try again.")
                            .build());
        }
    }

    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Backend is running");
    }
}
