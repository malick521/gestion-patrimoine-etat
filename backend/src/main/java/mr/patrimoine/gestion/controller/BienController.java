package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.Bien.BienRequestDTO;
import mr.patrimoine.gestion.dto.Bien.BienResponseDTO;
import mr.patrimoine.gestion.model.enums.EtatBien;
import mr.patrimoine.gestion.services.BienService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/biens")
@CrossOrigin(origins = "*")
public class BienController {

    @Autowired
    private BienService bienService;

    // POST /api/biens (CRÉATION AVEC IMAGE OPTIONNELLE VIA FORMDATA)
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BienResponseDTO> creer(
            @RequestPart("bien") @Valid BienRequestDTO dto, 
            @RequestPart(value = "file", required = false) MultipartFile imageFile, 
            Authentication authentication) {
        
        String userEmail = (authentication != null) ? authentication.getName() : null;
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(bienService.creer(dto, imageFile, userEmail)); 
    }

    // GET /api/biens
    @GetMapping
    public ResponseEntity<List<BienResponseDTO>> obtenirTous() {
        return ResponseEntity.ok(bienService.obtenirTous());
    }

    // GET /api/biens/{id}
    @GetMapping("/{id}")
    public ResponseEntity<BienResponseDTO> obtenirParId(@PathVariable String id) {
        return ResponseEntity.ok(bienService.obtenirParId(id));
    }

    // GET /api/biens/code/{code}
    @GetMapping("/code/{code}")
    public ResponseEntity<BienResponseDTO> obtenirParCode(@PathVariable String code) {
        return ResponseEntity.ok(bienService.obtenirParCode(code));
    }

    // GET /api/biens/ministere/{ministereId}
    @GetMapping("/ministere/{ministereId}")
    public ResponseEntity<List<BienResponseDTO>> obtenirParMinistere(@PathVariable String ministereId) {
        return ResponseEntity.ok(bienService.obtenirParMinistere(ministereId));
    }

    // GET /api/biens/etat/{etat}
    @GetMapping("/etat/{etat}")
    public ResponseEntity<List<BienResponseDTO>> obtenirParEtat(@PathVariable EtatBien etat) {
        return ResponseEntity.ok(bienService.obtenirParEtat(etat));
    }

    // GET /api/biens/recherche?keyword=toyota
    @GetMapping("/recherche")
    public ResponseEntity<List<BienResponseDTO>> rechercher(@RequestParam String keyword) {
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
            Authentication authentication) {
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

    // POST /api/biens/{id}/image (METTRE À JOUR UNIQUEMENT L'IMAGE)
    @PostMapping("/{id}/image")
    public ResponseEntity<BienResponseDTO> uploadImage(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity.ok(bienService.uploadImage(id, file, userEmail));
    }

    // GET /api/biens/images/{filename}
    @GetMapping("/images/{filename}")
    public ResponseEntity<Resource> getImage(@PathVariable String filename) throws IOException {
        Path filePath = Paths.get("uploads/biens/").resolve(filename);
        Resource resource = new UrlResource(filePath.toUri());

        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}