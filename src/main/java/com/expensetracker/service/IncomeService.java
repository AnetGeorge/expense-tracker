package com.expensetracker.service;

import java.util.List;

import com.expensetracker.entity.Income;

public interface IncomeService {
    Income addIncome(Income income);
    List<Income> getAllIncome();
}
