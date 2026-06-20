package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.Auth.LoginRequestDTO;
import mr.patrimoine.gestion.dto.Auth.LoginResponseDTO;
import mr.patrimoine.gestion.dto.User.UserRequestDTO;
import mr.patrimoine.gestion.dto.User.UserResponseDTO;
import mr.patrimoine.gestion.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(
            @RequestBody @Valid UserRequestDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(dto));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity
                .ok(authService.login(dto));
    }

    // NOUVEAU ENDPOINT POUR LA DÉCONNEXION
    @PostMapping("/logout")
    public ResponseEntity<?> logout(Authentication authentication) {
        if (authentication != null) {
            authService.logout(authentication.getName());
        }
        return ResponseEntity.ok().body(Map.of("message", "Déconnexion réussie"));
    }
}