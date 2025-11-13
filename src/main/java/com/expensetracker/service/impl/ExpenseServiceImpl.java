package com.expensetracker.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.expensetracker.entity.Expense;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.service.ExpenseService;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Override
    public Expense addExpense(Expense expense) {
        expense.setStatus("Pending");
        return expenseRepository.save(expense);
    }

    @Override
    public List<Expense> getExpensesByUser(Integer userId) {
        return expenseRepository.findByUserId(userId);
    }

   
    @Override

    @Transactional
    public Expense approveExpense(Integer expenseId, Integer managerId, String status) {
        Expense exp = expenseRepository.findById(expenseId).orElse(null);
        if (exp == null) return null;

        exp.setStatus(status);     
        exp.setApprovedBy(managerId);

        return expenseRepository.save(exp);
    }
}
