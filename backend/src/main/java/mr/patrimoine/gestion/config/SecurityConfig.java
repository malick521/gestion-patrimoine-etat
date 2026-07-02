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
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. configuration CORS
                .cors(cors -> cors.configurationSource(request -> {
                    CorsConfiguration configuration = new CorsConfiguration();
                    configuration.setAllowedOrigins(List.of("http://localhost:3000", "http://localhost:5173"));
                    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                    configuration.setAllowedHeaders(List.of("*"));
                    configuration.setAllowCredentials(true);
                    return configuration;
                }))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // ⭐ OPTIONS (Preflight) libre d'accès
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ===== PUBLIQUE =====
                        .requestMatchers("/api/auth/**").permitAll()

                        // ===== USERS =====
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // ===== MINISTERES =====
                        // Permettre à tout le monde connecté de voir les ministères
                        .requestMatchers(HttpMethod.GET, "/api/ministeres/**").hasAnyRole("ADMIN", "GESTIONNAIRE", "AUDITEUR", "CONSULTANT")
                        .requestMatchers("/api/ministeres/**").hasRole("ADMIN")

                        // ===== CATEGORIES =====
                        // Permettre à tout le monde connecté de voir les catégories
                        .requestMatchers(HttpMethod.GET, "/api/categories/**").hasAnyRole("ADMIN", "GESTIONNAIRE", "AUDITEUR", "CONSULTANT")
                        // 🟢 CORRECTION SYNTAXE : Insertion de hasAnyRole à la place de hasRole
                        .requestMatchers(HttpMethod.POST, "/api/categories/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers("/api/categories/**").hasRole("ADMIN")

                        // ===== BIENS =====
                        // 🟢 LOGIQUE : L'Auditeur et le Consultant doivent pouvoir VOIR les biens
                                .requestMatchers("/api/biens/images/**").permitAll()

// Lecture des biens
                                .requestMatchers(HttpMethod.GET, "/api/biens/**")
                                .hasAnyRole("ADMIN", "GESTIONNAIRE", "AUDITEUR", "CONSULTANT")

// Création
                                .requestMatchers(HttpMethod.POST, "/api/biens/**")
                                .hasAnyRole("ADMIN", "GESTIONNAIRE")

// Modification
                                .requestMatchers(HttpMethod.PUT, "/api/biens/**")
                                .hasAnyRole("ADMIN", "GESTIONNAIRE")

// Patch
                                .requestMatchers(HttpMethod.PATCH, "/api/biens/**")
                                .hasAnyRole("ADMIN", "GESTIONNAIRE")

// Suppression
                                .requestMatchers(HttpMethod.DELETE, "/api/biens/**")
                                .hasRole("ADMIN")
                        // ===== AFFECTATIONS =====
                        .requestMatchers(HttpMethod.GET, "/api/affectations/**").hasAnyRole("ADMIN", "GESTIONNAIRE", "AUDITEUR", "CONSULTANT")
                        .requestMatchers(HttpMethod.POST, "/api/affectations/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.PATCH, "/api/affectations/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/affectations/**").hasRole("ADMIN")

                        // ===== MAINTENANCES =====
                        // Masqué pour le consultant simple (données financières/techniques)
                        .requestMatchers(HttpMethod.GET, "/api/maintenances/**").hasAnyRole("ADMIN", "GESTIONNAIRE", "AUDITEUR")
                        .requestMatchers(HttpMethod.POST, "/api/maintenances/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.PATCH, "/api/maintenances/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers(HttpMethod.DELETE, "/api/maintenances/**").hasRole("ADMIN")

                        // ===== MOUVEMENTS =====
                        .requestMatchers(HttpMethod.GET, "/api/mouvements/**").hasAnyRole("ADMIN", "GESTIONNAIRE", "AUDITEUR", "CONSULTANT")
                        .requestMatchers(HttpMethod.POST, "/api/mouvements/**").hasAnyRole("ADMIN", "GESTIONNAIRE")
                        .requestMatchers("/api/mouvements/**").hasRole("ADMIN") // Bloque PUT/DELETE pour tout le monde sauf ADMIN

                        // ===== AUDIT LOGS =====
                        .requestMatchers("/api/audit-logs/**").hasAnyRole("ADMIN", "AUDITEUR")

                        // ===== TOUT LE RESTE =====
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

                System.out.println("SECURITY CONFIG CHARGEE");

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