package com.hackathon.config;

import com.google.generativeai.GenerativeModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeminiConfig {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model}")
    private String modelName;

    @Bean
    public GenerativeModel generativeModel() {
        return new GenerativeModel(modelName, apiKey);
    }
}
