package com.expensetracker.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.expensetracker.entity.Expense;

public interface ExpenseRepository extends JpaRepository<Expense, Integer> {
    List<Expense> findByUserId(Integer userId);

    List<Expense> findByStatusIgnoreCase(String status);

    List<Expense> findByStatusIgnoreCaseAndDepartmentId(String status, Integer departmentId);
}

