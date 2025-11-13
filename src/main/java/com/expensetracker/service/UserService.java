package com.expensetracker.service;

import java.util.List;

import com.expensetracker.dto.RegisterRequest;
import com.expensetracker.entity.User;

public interface UserService {
    // Register a user based on a RegisterRequest DTO (service handles mapping & persistence)
    User registerUser(RegisterRequest request);

    // Authenticate a user and return the user entity (password checked)
    User login(String email, String password);

    List<User> getManagersByDepartment(Integer departmentId);
    
    // Create an employee from a RegisterRequest. If callerEmail is provided and departmentId
    // is missing, the service may derive the department from the caller (e.g. manager).
    User createEmployee(RegisterRequest request, String callerEmail);

    List<User> getAllEmployees();
    User findByEmail(String email);
    // number of users in the system (used for bootstrap checks)
    long countUsers();
    
    // Delete an employee created by the calling manager. CallerEmail is used to verify ownership.
    void deleteEmployee(Integer employeeId, String callerEmail);
}
