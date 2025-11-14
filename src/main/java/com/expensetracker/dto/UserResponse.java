package com.expensetracker.dto;

import com.expensetracker.entity.Role;

import lombok.Data;

@Data
public class UserResponse {
    private Integer userId;
    private String name;
    private String email;
    private Role role;
    private Integer departmentId;
    // intentionally exclude password and createdBy
}
