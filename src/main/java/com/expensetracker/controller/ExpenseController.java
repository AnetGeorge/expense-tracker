package com.expensetracker.controller;

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
import com.expensetracker.dto.ExpenseResponse;
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
        
        if (user != null) {
            expense.setUserId(user.getUserId());
            expense.setDepartmentId(user.getDepartmentId());
        } else {
            expense.setUserId(request.getUserId());
            expense.setDepartmentId(request.getDepartmentId());
        }

        Expense saved = expenseService.addExpense(expense);
        ExpenseResponse resp = toResponse(saved);
        return ResponseEntity.status(201).body(com.expensetracker.dto.ApiResponse.success(201, "Expense created", resp));
    }

    @GetMapping("/user/{userId}")
     @PreAuthorize("hasRole('MANAGER') or hasRole('EMPLOYEE')")
    public ResponseEntity<?> getExpensesByUser(@PathVariable Integer userId) {
        java.util.List<Expense> list = expenseService.getExpensesByUser(userId);
        java.util.List<ExpenseResponse> out = list.stream().map(this::toResponse).toList();
        return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, "Expenses fetched", out));
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

    return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, message, toResponse(updated)));
}

    // Employee: update own expense
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> updateExpense(
        @PathVariable Integer id,
        @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody ExpenseRequest request,
        HttpServletRequest httpRequest) {

        String callerEmail = (String) httpRequest.getAttribute("email");
        Integer callerId = null;
        if (callerEmail != null) {
            User caller = userService.findByEmail(callerEmail);
            if (caller != null) callerId = caller.getUserId();
        }

        Expense updated = expenseService.updateExpense(id, request, callerId);

        return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, "Expense updated", toResponse(updated)));
    }

    // Employee: delete own expense
    @org.springframework.web.bind.annotation.DeleteMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<?> deleteExpense(@PathVariable Integer id, HttpServletRequest httpRequest) {
        String callerEmail = (String) httpRequest.getAttribute("email");
        Integer callerId = null;
        if (callerEmail != null) {
            User caller = userService.findByEmail(callerEmail);
            if (caller != null) callerId = caller.getUserId();
        }

        expenseService.deleteExpense(id, callerId);
        return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, "Expense deleted", null));
    }

    // Manager: list expenses by status, optionally scoped to department
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('MANAGER') or hasRole('ADMIN')")
    public ResponseEntity<?> getExpensesByStatus(@PathVariable String status, @org.springframework.web.bind.annotation.RequestParam(required = false) Integer departmentId, HttpServletRequest httpRequest) {
        // If departmentId not provided, infer from manager's profile
        Integer deptId = departmentId;
        if (deptId == null) {
            String callerEmail = (String) httpRequest.getAttribute("email");
            if (callerEmail != null) {
                User caller = userService.findByEmail(callerEmail);
                if (caller != null) deptId = caller.getDepartmentId();
            }
        }

        java.util.List<Expense> list = expenseService.getExpensesByStatus(status, deptId);
        java.util.List<ExpenseResponse> out = list.stream().map(this::toResponse).toList();
        return ResponseEntity.ok(com.expensetracker.dto.ApiResponse.success(200, "Expenses fetched", out));
    }

    // mapper: Expense -> ExpenseResponse (intentionally exclude approvedBy, remarks, receiptUrl)
    private ExpenseResponse toResponse(Expense e) {
        if (e == null) return null;
        ExpenseResponse r = new ExpenseResponse();
        r.setExpenseId(e.getExpenseId());
        r.setUserId(e.getUserId());
        r.setDepartmentId(e.getDepartmentId());
        r.setCategoryId(e.getCategoryId());
        r.setAmount(e.getAmount());
        r.setDate(e.getDate());
        r.setDescription(e.getDescription());
        r.setStatus(e.getStatus());
        return r;
    }


}
