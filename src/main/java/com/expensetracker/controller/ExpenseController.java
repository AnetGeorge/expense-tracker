package com.expensetracker.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.expensetracker.dto.ApproveRequest;
import com.expensetracker.dto.ExpenseRequest;
import com.expensetracker.entity.Expense;
import com.expensetracker.entity.User;
import com.expensetracker.service.ExpenseService;
import com.expensetracker.service.UserService;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api/expenses")
@CrossOrigin
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @Autowired
    private UserService userService;

    @PostMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> addExpense(@jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody ExpenseRequest request, HttpServletRequest httpRequest) {
        String email = (String) httpRequest.getAttribute("email");
        User user = null;
        if (email != null) {
            user = userService.findByEmail(email);
        }

        Expense expense = new Expense();
        expense.setAmount(request.getAmount());
        expense.setCategoryId(request.getCategoryId());
        expense.setDate(request.getDate());
        expense.setDescription(request.getDescription());
        // set userId and department from authenticated user if available
        if (user != null) {
            expense.setUserId(user.getUserId());
            expense.setDepartmentId(user.getDepartmentId());
        } else {
            expense.setUserId(request.getUserId());
            expense.setDepartmentId(request.getDepartmentId());
        }

        Expense saved = expenseService.addExpense(expense);
        if (saved != null) saved.setDescription(saved.getDescription());
    return ResponseEntity.status(201).body(com.expensetracker.dto.ApiResponse.success(201, "Expense created", saved));
    }

    @GetMapping("/user/{userId}")
     @PreAuthorize("hasRole('MANAGER') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<Expense>> getExpensesByUser(@PathVariable Integer userId) {
        return ResponseEntity.ok(expenseService.getExpensesByUser(userId));
    }

        @PutMapping("/approve/{id}")
        @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
        public ResponseEntity<?> approveExpense(
            @PathVariable Integer id,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody ApproveRequest request,
            HttpServletRequest httpRequest) {

    // derive approver id from authenticated user (JwtFilter sets attribute "email")
    String approverEmail = (String) httpRequest.getAttribute("email");
    Integer approverId = null;
    if (approverEmail != null) {
        User approver = userService.findByEmail(approverEmail);
        if (approver != null) approverId = approver.getUserId();
    }

    Expense updated = expenseService.approveExpense(id, approverId, request.getStatus());

        if (updated == null) {
            throw new com.expensetracker.exception.ResourceNotFoundException("Expense not found");
        }

    // ✅ Dynamic message based on status
    String message;
    switch (request.getStatus().toLowerCase()) {
        case "approved":
            message = "Expense approved successfully";
            break;
        case "rejected":
            message = "Expense rejected successfully";
            break;
        case "pending":
            message = "Expense marked as pending";
            break;
        default:
            message = "Expense status updated successfully";
    }

    return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, message, updated));
}



}
