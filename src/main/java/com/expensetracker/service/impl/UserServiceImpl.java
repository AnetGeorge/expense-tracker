package com.expensetracker.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;
import com.expensetracker.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public User registerUser(User user) {
        // Check duplicate email
        if (user.getEmail() != null && userRepository.findFirstByEmail(user.getEmail()).isPresent()) {
            throw new com.expensetracker.exception.DuplicateResourceException("User with email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // default role if not provided
        if (user.getRole() == null) {
            user.setRole(com.expensetracker.entity.Role.EMPLOYEE);
        }

        return userRepository.save(user); // Transaction commits automatically
    }

    @Override
    public User login(String email, String password) {
        var opt = userRepository.findFirstByEmail(email);
        if (opt.isEmpty()) {
            // translate to Spring Security exception so it maps to 401
            throw new org.springframework.security.core.userdetails.UsernameNotFoundException("User not found");
        }

        User user = opt.get();
        // verify password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            // incorrect password -> treat as bad request per your preference
            throw new com.expensetracker.exception.BadRequestException("Incorrect password");
        }

        return user;
    }

    @Override
    public List<User> getManagersByDepartment(Integer departmentId) {
        return userRepository.findManagersByDept(departmentId);
    }

    @Override
    public User createEmployee(User user) {
        user.setRole(com.expensetracker.entity.Role.EMPLOYEE);
        return registerUser(user);
    }

    @Override
    public List<User> getAllEmployees() {
        return userRepository.findByRole(com.expensetracker.entity.Role.EMPLOYEE);
    }

    @Override
    public User findByEmail(String email) {
    return userRepository.findFirstByEmail(email).orElse(null);
    }
}
