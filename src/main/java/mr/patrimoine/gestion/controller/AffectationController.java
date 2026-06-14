package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.Affectation.AffectationRequestDTO;
import mr.patrimoine.gestion.dto.Affectation.AffectationResponseDTO;
import mr.patrimoine.gestion.model.enums.StatutAffectation;
import mr.patrimoine.gestion.services.AffectationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/affectations")
@CrossOrigin(origins = "*")
public class AffectationController {

    @Autowired
    private AffectationService affectationService;

    // POST /api/affectations
    @PostMapping
    public ResponseEntity<AffectationResponseDTO> affecter(
            @RequestBody @Valid AffectationRequestDTO dto,
            Authentication authentication) {

        // Email extrait du token JWT
        String userEmail = authentication.getName();

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(affectationService.affecter(dto, userEmail));
    }

    // GET /api/affectations
    @GetMapping
    public ResponseEntity<List<AffectationResponseDTO>> obtenirTous() {
        return ResponseEntity.ok(affectationService.obtenirTous());
    }

    // GET /api/affectations/{id}
    @GetMapping("/{id}")
    public ResponseEntity<AffectationResponseDTO> obtenirParId(
            @PathVariable String id) {
        return ResponseEntity.ok(affectationService.obtenirParId(id));
    }

    // GET /api/affectations/bien/{bienId}
    @GetMapping("/bien/{bienId}")
    public ResponseEntity<List<AffectationResponseDTO>> obtenirParBien(
            @PathVariable String bienId) {
        return ResponseEntity.ok(affectationService.obtenirParBien(bienId));
    }

    // GET /api/affectations/user/{userId}
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<AffectationResponseDTO>> obtenirParUser(
            @PathVariable String userId) {
        return ResponseEntity.ok(affectationService.obtenirParUser(userId));
    }

    // GET /api/affectations/ministere/{ministereId}
    @GetMapping("/ministere/{ministereId}")
    public ResponseEntity<List<AffectationResponseDTO>> obtenirParMinistere(
            @PathVariable String ministereId) {
        return ResponseEntity.ok(affectationService.obtenirParMinistere(ministereId));
    }

    // GET /api/affectations/statut/{statut}
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<AffectationResponseDTO>> obtenirParStatut(
            @PathVariable StatutAffectation statut) {
        return ResponseEntity.ok(affectationService.obtenirParStatut(statut));
    }

    // PATCH /api/affectations/{id}/cloturer
    @PatchMapping("/{id}/cloturer")
    public ResponseEntity<AffectationResponseDTO> cloturer(
            @PathVariable String id, Authentication authentication) {

        String userEmail = authentication.getName();

        return ResponseEntity.ok(affectationService.cloturer(id, userEmail));
    }

    // DELETE /api/affectations/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable String id, Authentication authentication) {

        String userEmail = authentication.getName();
        affectationService.supprimer(id,  userEmail);
        return ResponseEntity.noContent().build();
    }
}