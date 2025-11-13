package com.expensetracker.dto;

import lombok.Data;

@Data
public class RevenueRequest {
    private Double amount;
    private String source;
    private String date;
    private String description;
   
}
