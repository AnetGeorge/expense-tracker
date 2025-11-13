package com.expensetracker.dto;

import com.expensetracker.entity.User;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor          // ✅ Add this
@AllArgsConstructor         // ✅ Keep this
public class LoginResponse {
    private String message;
    private String token;
    private User user;
}
