package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.User.UserRequestDTO;
import mr.patrimoine.gestion.dto.User.UserResponseDTO;
import mr.patrimoine.gestion.model.enums.UserRole;
import mr.patrimoine.gestion.services.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    // POST /api/users -> Enregistrement d'un nouvel agent par l'ADMIN
    @PostMapping
    public ResponseEntity<UserResponseDTO> creer(
            @RequestBody @Valid UserRequestDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(userService.creer(dto));
    }

    // GET /api/users
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> obtenirTous() {
        return ResponseEntity.ok(userService.obtenirTous());
    }

    // GET /api/users/{id}
    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> obtenirParId(
            @PathVariable String id) {
        return ResponseEntity.ok(userService.obtenirParId(id));
    }

    // GET /api/users/email/{email}
    @GetMapping("/email/{email}")
    public ResponseEntity<UserResponseDTO> obtenirParEmail(
            @PathVariable String email) {
        return ResponseEntity.ok(userService.obtenirParEmail(email));
    }

    // GET /api/users/role/{role}
    @GetMapping("/role/{role}")
    public ResponseEntity<List<UserResponseDTO>> obtenirParRole(
            @PathVariable UserRole role) {
        return ResponseEntity.ok(userService.obtenirParRole(role));
    }

    // GET /api/users/ministere/{ministereId}
    @GetMapping("/ministere/{ministereId}")
    public ResponseEntity<List<UserResponseDTO>> obtenirParMinistere(
            @PathVariable String ministereId) {
        return ResponseEntity.ok(userService.obtenirParMinistere(ministereId));
    }

    // PUT /api/users/{id}
    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> modifier(
            @PathVariable String id,
            @RequestBody @Valid UserRequestDTO dto) {
        return ResponseEntity.ok(userService.modifier(id, dto));
    }

    // PATCH /api/users/{id}/toggle
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<UserResponseDTO> toggleActif(
            @PathVariable String id) {
        return ResponseEntity.ok(userService.toggleActif(id));
    }

    // DELETE /api/users/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable String id) {
        userService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}