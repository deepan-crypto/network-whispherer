package com.hackathon.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrafficLog {
    
    @JsonProperty("destinationIp")
    private String destinationIp;
    
    @JsonProperty("packetSize")
    private Long packetSize;
    
    @JsonProperty("timestamp")
    private String timestamp;
}
