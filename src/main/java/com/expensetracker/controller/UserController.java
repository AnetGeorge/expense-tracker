package com.expensetracker.controller;

 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expensetracker.dto.LoginRequest;
import com.expensetracker.dto.LoginResponse;
import com.expensetracker.dto.RegisterRequest;
import com.expensetracker.entity.User;
import com.expensetracker.security.JwtUtil;
import com.expensetracker.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/users")
@CrossOrigin
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody RegisterRequest request) {
        User created = userService.registerUser(request); // service maps DTO -> entity and persists
        if (created != null) created.setPassword(null);

        return ResponseEntity.status(201).body(com.expensetracker.dto.ApiResponse.success(201, "User registered successfully", created));
    }



   @Autowired
private JwtUtil jwtUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody LoginRequest request) {

    User user = userService.login(request.getEmail(), request.getPassword());

        // Generate token with role name (e.g. MANAGER)
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole() != null ? user.getRole().name() : "EMPLOYEE");

        LoginResponse response = new LoginResponse();
        response.setMessage("Login successful");
        response.setToken(token);
        // hide password
        user.setPassword(null);
        response.setUser(user);

    return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, "Login successful", response));
    }

    @GetMapping("/managers/{deptId}")
    public ResponseEntity<?> getManagers(@PathVariable Integer deptId) {
        java.util.List<User> list = userService.getManagersByDepartment(deptId);
        if (list != null) {
            list.forEach(u -> { if (u != null) u.setPassword(null); });
        }
    return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, "Managers fetched", list));
    }

    // Manager or Admin can create an employee
    @PostMapping("/employee")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> addEmployee(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody RegisterRequest request, HttpServletRequest httpRequest) {
        // Derive caller email (if present) so service can infer department when needed
        String callerEmail = (String) httpRequest.getAttribute("email");

        User created = userService.createEmployee(request, callerEmail);
        if (created != null) created.setPassword(null);

        return ResponseEntity.status(201).body(com.expensetracker.dto.ApiResponse.success(201, "Employee created successfully", created));
    }

    @GetMapping("/employees")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> getEmployees() {
        java.util.List<User> list = userService.getAllEmployees();
        if (list != null) list.forEach(u -> { if (u != null) u.setPassword(null); });
    return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, "Employees fetched", list));
    }

    // Manager: delete an employee they created (or ADMIN can delete any employee)
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteEmployee(@PathVariable Integer id, HttpServletRequest request) {
        String callerEmail = (String) request.getAttribute("email");
        userService.deleteEmployee(id, callerEmail);
        return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, "Employee deleted", null));
    }
}
