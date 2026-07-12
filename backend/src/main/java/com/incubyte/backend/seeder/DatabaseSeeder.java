package com.incubyte.backend.seeder;

import com.incubyte.backend.user.Role;
import com.incubyte.backend.user.User;
import com.incubyte.backend.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public DatabaseSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_EMAIL:admin@cardealership.com}") String adminEmail,
            @Value("${ADMIN_PASSWORD:admin123}") String adminPassword
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = User.builder()
                    .name("System Admin")
                    .email(adminEmail)
                    .password(passwordEncoder.encode(adminPassword))
                    .role(Role.ROLE_ADMIN)
                    .build();

            userRepository.save(admin);
            System.out.println("Default admin seeded: " + adminEmail);
        } else {
            System.out.println("Admin user already exists. Skipping seeding.");
        }
    }
}
