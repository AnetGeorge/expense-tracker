package com.expensetracker.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Standard API response shape desired by the user:
 * {
 *   "status": 200,
 *   "message": "...",
 *   "body": { ... }
 * }
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse<T> {
    private int status;
    private String message;
    private T body;
    private long timestamp;

    public static <T> ApiResponse<T> success(int status, String message, T body) {
        return new ApiResponse<>(status, message, body, java.time.Instant.now().toEpochMilli());
    }

    public static <T> ApiResponse<T> error(int status, String message, T body) {
        return new ApiResponse<>(status, message, body, java.time.Instant.now().toEpochMilli());
    }
}
