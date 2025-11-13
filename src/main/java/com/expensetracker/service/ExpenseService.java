package com.expensetracker.service;

import java.util.List;

import com.expensetracker.entity.Expense;

public interface ExpenseService {
    Expense addExpense(Expense expense);
    List<Expense> getExpensesByUser(Integer userId);
    Expense approveExpense(Integer expenseId, Integer managerId, String status);
    
    // Allow employee to update their own expense (cannot change approval fields)
    Expense updateExpense(Integer expenseId, com.expensetracker.dto.ExpenseRequest request, Integer callerId);

    // Allow employee to delete their own expense if business rules allow
    void deleteExpense(Integer expenseId, Integer callerId);

    // Manager filter: get expenses by status, optionally limited to a department
    List<Expense> getExpensesByStatus(String status, Integer departmentId);
}
