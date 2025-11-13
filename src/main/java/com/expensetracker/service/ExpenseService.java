package com.expensetracker.service;

import java.util.List;

import com.expensetracker.entity.Expense;

public interface ExpenseService {
    Expense addExpense(Expense expense);
    List<Expense> getExpensesByUser(Integer userId);
    Expense approveExpense(Integer expenseId, Integer managerId, String status);
}
