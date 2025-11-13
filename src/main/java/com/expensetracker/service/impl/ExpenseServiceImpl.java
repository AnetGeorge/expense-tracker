package com.expensetracker.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.expensetracker.entity.Expense;
import com.expensetracker.exception.BadRequestException;
import com.expensetracker.exception.ResourceNotFoundException;
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

    @Override
    @Transactional
    public Expense updateExpense(Integer expenseId, com.expensetracker.dto.ExpenseRequest request, Integer callerId) {
        Expense exp = expenseRepository.findById(expenseId).orElse(null);
        if (exp == null) throw new ResourceNotFoundException("Expense not found");

        // Only owner can update their expense
        if (callerId == null || !callerId.equals(exp.getUserId())) {
            throw new AccessDeniedException("You are not allowed to update this expense");
        }

        // If expense already processed, prevent updates
        if (exp.getStatus() != null && !exp.getStatus().equalsIgnoreCase("Pending")) {
            throw new BadRequestException("Only pending expenses can be updated");
        }

        // Apply allowed updates (approval fields like status/approvedBy are not changed here)
        if (request.getAmount() != null) exp.setAmount(request.getAmount());
        if (request.getCategoryId() != null) exp.setCategoryId(request.getCategoryId());
        if (request.getDate() != null) exp.setDate(request.getDate());
        if (request.getDescription() != null) exp.setDescription(request.getDescription());
        return expenseRepository.save(exp);
    }

    @Override
    @Transactional
    public void deleteExpense(Integer expenseId, Integer callerId) {
        Expense exp = expenseRepository.findById(expenseId).orElse(null);
        if (exp == null) throw new ResourceNotFoundException("Expense not found");

        if (callerId == null || !callerId.equals(exp.getUserId())) {
            throw new AccessDeniedException("You are not allowed to delete this expense");
        }

        // Prevent deleting processed expenses
        if (exp.getStatus() != null && !exp.getStatus().equalsIgnoreCase("Pending")) {
            throw new BadRequestException("Only pending expenses can be deleted");
        }

        expenseRepository.delete(exp);
    }

    @Override
    public List<Expense> getExpensesByStatus(String status, Integer departmentId) {
        if (departmentId != null) {
            return expenseRepository.findByStatusIgnoreCaseAndDepartmentId(status, departmentId);
        }
        return expenseRepository.findByStatusIgnoreCase(status);
    }
}
