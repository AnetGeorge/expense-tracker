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
import com.expensetracker.dto.ResponseMessage;
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
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<?> register(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody RegisterRequest request) {
        User created = userService.registerUser(request); // service maps DTO -> entity and persists
        if (created != null) created.setPassword(null);

        return ResponseEntity.status(201).body(com.expensetracker.dto.ApiResponse.success(201, "User registered successfully", created));
    }

    /**
     * Bootstrap endpoint: create the very first user (manager/admin) when the system has no users yet.
     * This endpoint is public but will only succeed when user count == 0. After the first user is created
     * it becomes a no-op and returns 403.
     */
    @PostMapping("/bootstrap")
    public ResponseEntity<?> bootstrap(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody RegisterRequest request) {
        long count = userService.countUsers();
        if (count > 0) {
            return ResponseEntity.status(403).body(com.expensetracker.dto.ApiResponse.error(403, "Bootstrap not allowed: users already exist", null));
        }

        // Ensure role from request is manager/admin; otherwise default to MANAGER for bootstrap safety
        if (request.getRole() == null) {
            request.setRole(com.expensetracker.entity.Role.MANAGER.name());
        }

        User created = userService.registerUser(request);
        if (created != null) created.setPassword(null);
        return ResponseEntity.status(201).body(com.expensetracker.dto.ApiResponse.success(201, "Bootstrap user created", created));
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

    // Debug endpoint: return authenticated user's basic info and authorities
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpServletRequest request) {
        String email = (String) request.getAttribute("email");
        if (email == null) {
            return ResponseEntity.status(401).body(new ResponseMessage("Unauthenticated"));
        }

        User user = userService.findByEmail(email);
        if (user == null) {
            return ResponseEntity.status(404).body(new ResponseMessage("User not found"));
        }

        // get authorities from security context
        var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        java.util.List<String> authorities = new java.util.ArrayList<>();
        if (auth != null && auth.getAuthorities() != null) {
            auth.getAuthorities().forEach(a -> authorities.add(a.getAuthority()));
        }

        java.util.Map<String, Object> payload = new java.util.HashMap<>();
        payload.put("userId", user.getUserId());
        payload.put("email", user.getEmail());
        payload.put("role", user.getRole());
        payload.put("authorities", authorities);

        return ResponseEntity.ok(payload);
    }
}
