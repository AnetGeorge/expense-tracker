package com.expensetracker.service;

import java.util.List;

import com.expensetracker.entity.User;

public interface UserService {
    User registerUser(User user);
    User login(String email, String password);
    List<User> getManagersByDepartment(Integer departmentId);
    
    // New APIs
    User createEmployee(User user);
    List<User> getAllEmployees();
    User findByEmail(String email);
}
