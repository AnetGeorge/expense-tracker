package com.expensetracker.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.expensetracker.entity.Role;
import com.expensetracker.entity.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    
    Optional<User> findByEmail(String email);
    // in case DB accidentally contains duplicates, provide a safe first-result lookup
    Optional<User> findFirstByEmail(String email);
    
    Optional<User> findByEmailAndPassword(String email, String password);
    
    @Query("SELECT u FROM User u WHERE u.role = 'MANAGER' AND u.departmentId = :deptId")
    List<User> findManagersByDept(@Param("deptId") Integer deptId);

    List<User> findByRole(Role role);
}
