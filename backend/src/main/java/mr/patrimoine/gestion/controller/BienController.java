package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.Bien.BienRequestDTO;
import mr.patrimoine.gestion.dto.Bien.BienResponseDTO;
import mr.patrimoine.gestion.model.enums.EtatBien;
import mr.patrimoine.gestion.services.BienService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/biens")
@CrossOrigin(origins = "*")
public class BienController {

    @Autowired
    private BienService bienService;

    // POST /api/biens
    // ✅ CORRECTION ICI : Ajout de l'objet Authentication pour extraire l'utilisateur
    @PostMapping
    public ResponseEntity<BienResponseDTO> creer(
            @RequestBody @Valid BienRequestDTO dto,
            Authentication authentication) {
        
        String userEmail = (authentication != null) ? authentication.getName() : null;
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bienService.creer(dto, userEmail));
    }

    // GET /api/biens
    @GetMapping
    public ResponseEntity<List<BienResponseDTO>> obtenirTous() {
        return ResponseEntity.ok(bienService.obtenirTous());
    }

    // GET /api/biens/{id}
    @GetMapping("/{id}")
    public ResponseEntity<BienResponseDTO> obtenirParId(
            @PathVariable String id) {
        return ResponseEntity.ok(bienService.obtenirParId(id));
    }

    // GET /api/biens/code/{code}
    @GetMapping("/code/{code}")
    public ResponseEntity<BienResponseDTO> obtenirParCode(
            @PathVariable String code) {
        return ResponseEntity.ok(bienService.obtenirParCode(code));
    }

    // GET /api/biens/ministere/{ministereId}
    @GetMapping("/ministere/{ministereId}")
    public ResponseEntity<List<BienResponseDTO>> obtenirParMinistere(
            @PathVariable String ministereId) {
        return ResponseEntity.ok(bienService.obtenirParMinistere(ministereId));
    }

    // GET /api/biens/etat/{etat}
    @GetMapping("/etat/{etat}")
    public ResponseEntity<List<BienResponseDTO>> obtenirParEtat(
            @PathVariable EtatBien etat) {
        return ResponseEntity.ok(bienService.obtenirParEtat(etat));
    }

    // GET /api/biens/recherche?keyword=toyota
    @GetMapping("/recherche")
    public ResponseEntity<List<BienResponseDTO>> rechercher(
            @RequestParam String keyword) {
        return ResponseEntity.ok(bienService.rechercher(keyword));
    }

    // PUT /api/biens/{id}
    @PutMapping("/{id}")
    public ResponseEntity<BienResponseDTO> modifier(
            @PathVariable String id,
            @RequestBody @Valid BienRequestDTO dto) {
        return ResponseEntity.ok(bienService.modifier(id, dto));
    }

    // PATCH /api/biens/{id}/etat
    @PatchMapping("/{id}/etat")
    public ResponseEntity<BienResponseDTO> modifierEtat(
            @PathVariable String id,
            @RequestParam EtatBien etat,
            Authentication authentication)
    {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(bienService.modifierEtat(id, etat, userEmail));
    }

    // DELETE /api/biens/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable String id, Authentication authentication) {

        String userEmail = authentication.getName();

        bienService.supprimer(id, userEmail);
        return ResponseEntity.noContent().build();
    }
}