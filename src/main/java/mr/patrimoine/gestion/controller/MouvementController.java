package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.Mouvement.MouvementRequestDTO;
import mr.patrimoine.gestion.dto.Mouvement.MouvementResponseDTO;
import mr.patrimoine.gestion.model.enums.TypeMouvement;
import mr.patrimoine.gestion.services.MouvementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/mouvements")
@CrossOrigin(origins = "*")
public class MouvementController {

    @Autowired
    private MouvementService mouvementService;

    // POST /api/mouvements
    @PostMapping
    public ResponseEntity<MouvementResponseDTO> creer(
            @RequestBody @Valid MouvementRequestDTO dto,
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mouvementService.creer(dto, userEmail));
    }

    // GET /api/mouvements
    @GetMapping
    public ResponseEntity<List<MouvementResponseDTO>> obtenirTous() {
        return ResponseEntity.ok(mouvementService.obtenirTous());
    }

    // GET /api/mouvements/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MouvementResponseDTO> obtenirParId(
            @PathVariable String id) {
        return ResponseEntity.ok(mouvementService.obtenirParId(id));
    }

    // GET /api/mouvements/bien/{bienId}
    @GetMapping("/bien/{bienId}")
    public ResponseEntity<List<MouvementResponseDTO>> obtenirParBien(
            @PathVariable String bienId) {
        return ResponseEntity.ok(mouvementService.obtenirParBien(bienId));
    }

    // GET /api/mouvements/type/{type}
    @GetMapping("/type/{type}")
    public ResponseEntity<List<MouvementResponseDTO>> obtenirParType(
            @PathVariable TypeMouvement type) {
        return ResponseEntity.ok(mouvementService.obtenirParType(type));
    }

    // GET /api/mouvements/source/{ministereId}
    @GetMapping("/source/{ministereId}")
    public ResponseEntity<List<MouvementResponseDTO>> obtenirParSource(
            @PathVariable String ministereId) {
        return ResponseEntity.ok(mouvementService.obtenirParMinistereSource(ministereId));
    }

    // GET /api/mouvements/destination/{ministereId}
    @GetMapping("/destination/{ministereId}")
    public ResponseEntity<List<MouvementResponseDTO>> obtenirParDestination(
            @PathVariable String ministereId) {
        return ResponseEntity.ok(mouvementService.obtenirParMinistereDestination(ministereId));
    }
}