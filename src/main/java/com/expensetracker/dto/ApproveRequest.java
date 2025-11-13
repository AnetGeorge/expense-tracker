package com.expensetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ApproveRequest {
    @NotBlank(message = "status is required")
    @Pattern(regexp = "(?i)approved|rejected|pending", message = "status must be one of: approved, rejected, pending")
    private String status;
}
