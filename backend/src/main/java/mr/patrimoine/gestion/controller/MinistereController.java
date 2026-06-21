package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.Ministere.MinistereRequestDTO;
import mr.patrimoine.gestion.dto.Ministere.MinistereResponseDTO;
import mr.patrimoine.gestion.services.MinistereService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    // ==================== UPLOAD PDF (ADMIN UNIQUEMENT) ====================
    @PostMapping("/{id}/upload-pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> uploadPDF(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) {
        
        if (file.isEmpty() || !file.getContentType().equals("application/pdf")) {
            return ResponseEntity.badRequest().body("Veuillez fournir un fichier PDF valide.");
        }

        try {
            ministereService.sauvegarderFichierPdf(id, file);
            return ResponseEntity.ok("Fichier PDF inséré avec succès dans la base de données.");
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erreur lors de l'enregistrement du PDF : " + e.getMessage());
        }
    }
}