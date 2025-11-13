package com.expensetracker.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.expensetracker.entity.Income;
import com.expensetracker.repository.IncomeRepository;
import com.expensetracker.service.IncomeService;

@Service
public class IncomeServiceImpl implements IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Override
    public Income addIncome(Income income) {
        return incomeRepository.save(income);
    }

    @Override
    public List<Income> getAllIncome() {
        return incomeRepository.findAll();
    }
}
