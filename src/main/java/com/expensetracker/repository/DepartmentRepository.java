package com.expensetracker.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.expensetracker.entity.Department;

public interface DepartmentRepository extends JpaRepository<Department, Integer> {
}
