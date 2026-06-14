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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private AuthService authService;

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<UserResponseDTO> register(
            @RequestBody @Valid UserRequestDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(authService.register(dto));
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<LoginResponseDTO> login(
            @RequestBody @Valid LoginRequestDTO dto) {
        return ResponseEntity
                .ok(authService.login(dto));
    }
}