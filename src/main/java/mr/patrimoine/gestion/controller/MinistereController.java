package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.Ministere.MinistereRequestDTO;
import mr.patrimoine.gestion.dto.Ministere.MinistereResponseDTO;
import mr.patrimoine.gestion.services.MinistereService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ministeres")
@CrossOrigin(origins = "*")
public class MinistereController {

    @Autowired
    private MinistereService ministereService;

    // POST /api/ministeres
    @PostMapping
    public ResponseEntity<MinistereResponseDTO> creer(
            @RequestBody @Valid MinistereRequestDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ministereService.creer(dto));
    }

    // GET /api/ministeres
    @GetMapping
    public ResponseEntity<List<MinistereResponseDTO>> obtenirTous() {
        return ResponseEntity.ok(ministereService.obtenirTous());
    }

    // GET /api/ministeres/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MinistereResponseDTO> obtenirParId(
            @PathVariable String id) {
        return ResponseEntity.ok(ministereService.obtenirParId(id));
    }

    // GET /api/ministeres/code/{code}
    @GetMapping("/code/{code}")
    public ResponseEntity<MinistereResponseDTO> obtenirParCode(
            @PathVariable String code) {
        return ResponseEntity.ok(ministereService.obtenirParCode(code));
    }

    // GET /api/ministeres/recherche?nom=finance
    @GetMapping("/recherche")
    public ResponseEntity<List<MinistereResponseDTO>> rechercher(
            @RequestParam String nom) {
        return ResponseEntity.ok(ministereService.rechercherParNom(nom));
    }

    // GET /api/ministeres/actifs
    @GetMapping("/actifs")
    public ResponseEntity<List<MinistereResponseDTO>> obtenirActifs() {
        return ResponseEntity.ok(ministereService.obtenirActifs());
    }

    // PUT /api/ministeres/{id}
    @PutMapping("/{id}")
    public ResponseEntity<MinistereResponseDTO> modifier(
            @PathVariable String id,
            @RequestBody @Valid MinistereRequestDTO dto) {
        return ResponseEntity.ok(ministereService.modifier(id, dto));
    }

    // PATCH /api/ministeres/{id}/toggle
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<MinistereResponseDTO> toggleActif(
            @PathVariable String id) {
        return ResponseEntity.ok(ministereService.toggleActif(id));
    }

    // DELETE /api/ministeres/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable String id) {
        ministereService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}