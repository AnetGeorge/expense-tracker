package com.expensetracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.expensetracker.entity.Income;

public interface IncomeRepository extends JpaRepository<Income, Integer> {
}
