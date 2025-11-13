package com.expensetracker.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class ExpenseRequest {
    // When submitted by an authenticated employee these may be omitted
    private Integer userId;
    private Integer departmentId;

    @NotNull(message = "categoryId is required")
    private Integer categoryId;

    @NotNull(message = "amount is required")
    @Positive(message = "amount must be positive")
    private Double amount;

    @NotBlank(message = "date is required")
    private String date;

    private String description;
    private Integer managerId;
}
