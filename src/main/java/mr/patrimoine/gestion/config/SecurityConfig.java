package mr.patrimoine.gestion.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // ===== PUBLIQUE =====
                        .requestMatchers("/api/auth/**").permitAll()

                        // ===== USERS =====
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasAnyRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/users/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasRole("ADMIN")

                        // ===== MINISTERES =====
                        .requestMatchers(HttpMethod.GET, "/api/ministeres/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/ministeres/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/ministeres/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/ministeres/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/ministeres/**").hasRole("ADMIN")

                        // ===== CATEGORIES =====
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/categories/**").hasRole("ADMIN")

                        // ===== BIENS =====
                        .requestMatchers(HttpMethod.GET, "/api/biens/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/biens/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.PUT, "/api/biens/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.PATCH, "/api/biens/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/biens/**").hasRole("ADMIN")

                        // ===== AFFECTATIONS =====
                        .requestMatchers(HttpMethod.GET, "/api/affectations/**").hasAnyRole("ADMIN", "GESTIONNAIRE", "AUDITEUR")
                        .requestMatchers(HttpMethod.POST, "/api/affectations/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.PATCH, "/api/affectations/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/affectations/**").hasRole("ADMIN")

                        // ===== MAINTENANCES =====
                        .requestMatchers(HttpMethod.GET, "/api/maintenances/**").hasAnyRole("ADMIN", "GESTIONNAIRE", "AUDITEUR")
                        .requestMatchers(HttpMethod.POST, "/api/maintenances/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenances/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/maintenances/**").hasRole("ADMIN")

                        // ===== MOUVEMENTS =====
                        .requestMatchers(HttpMethod.GET, "/api/mouvements/**").hasAnyRole("ADMIN", "GESTIONNAIRE", "AUDITEUR")
                        .requestMatchers(HttpMethod.POST, "/api/mouvements/**").hasAnyRole("ADMIN", "GESTIONNAIRE")

                        // ===== AUDIT LOGS =====
                        .requestMatchers("/api/audit-logs/**").hasAnyRole("ADMIN", "AUDITEUR")

                        // ===== TOUT LE RESTE =====
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}