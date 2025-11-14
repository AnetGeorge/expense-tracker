package com.expensetracker.dto;

import lombok.Data;

@Data
public class ExpenseResponse {
    private Integer expenseId;
    private Integer userId;
    private Integer departmentId;
    private Integer categoryId;
    private Double amount;
    private String date;
    private String description;
    private String status;
    
}
