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
    public User registerUser(com.expensetracker.dto.RegisterRequest request) {
        // Check duplicate email
        if (request.getEmail() != null && userRepository.findFirstByEmail(request.getEmail()).isPresent()) {
            throw new com.expensetracker.exception.DuplicateResourceException("User with email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        // Map/normalize role if provided, default to EMPLOYEE
        if (request.getRole() != null) {
            try {
                user.setRole(com.expensetracker.entity.Role.valueOf(request.getRole().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                user.setRole(com.expensetracker.entity.Role.EMPLOYEE);
            }
        } else {
            user.setRole(com.expensetracker.entity.Role.EMPLOYEE);
        }

        user.setDepartmentId(request.getDepartmentId());

        return userRepository.save(user);
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
    public User createEmployee(com.expensetracker.dto.RegisterRequest request, String callerEmail) {
        // If departmentId not present in request, try to derive from caller (manager)
        Integer deptId = request.getDepartmentId();
        if (deptId == null && callerEmail != null) {
            var callerOpt = userRepository.findFirstByEmail(callerEmail);
            if (callerOpt.isPresent()) {
                deptId = callerOpt.get().getDepartmentId();
            }
        }

        // Force role to EMPLOYEE regardless of request
        com.expensetracker.dto.RegisterRequest modReq = new com.expensetracker.dto.RegisterRequest();
        modReq.setName(request.getName());
        modReq.setEmail(request.getEmail());
        modReq.setPassword(request.getPassword());
        modReq.setRole(com.expensetracker.entity.Role.EMPLOYEE.name());
        modReq.setDepartmentId(deptId);

        return registerUser(modReq);
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
