package com.expensetracker.security;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.expensetracker.entity.User;
import com.expensetracker.repository.UserRepository;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Unwrap the Optional<User> using orElseThrow
    User user = userRepository.findFirstByEmail(email)
        .orElseThrow(() -> new UsernameNotFoundException(
            "User not found with email: " + email));

    // Provide authority in Spring Security format: ROLE_<NAME>
    String authority = "ROLE_" + (user.getRole() != null ? user.getRole().name() : "EMPLOYEE");

    return org.springframework.security.core.userdetails.User.builder()
        .username(user.getEmail())
        .password(user.getPassword())
        .authorities(authority)
        .build();
    }
}
