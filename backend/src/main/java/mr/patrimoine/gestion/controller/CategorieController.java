package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.Categorie.CategorieRequestDTO;
import mr.patrimoine.gestion.dto.Categorie.CategorieResponseDTO;
import mr.patrimoine.gestion.model.enums.TypeBien;
import mr.patrimoine.gestion.services.CategorieService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin(origins = "*")
public class CategorieController {

    @Autowired
    private CategorieService categorieService;

    // POST /api/categories
    @PostMapping
    public ResponseEntity<CategorieResponseDTO> creer(
            @RequestBody @Valid CategorieRequestDTO dto) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(categorieService.creer(dto));
    }

    // GET /api/categories
    @GetMapping
    public ResponseEntity<List<CategorieResponseDTO>> obtenirTous() {
        return ResponseEntity.ok(categorieService.obtenirTous());
    }

    // GET /api/categories/{id}
    @GetMapping("/{id}")
    public ResponseEntity<CategorieResponseDTO> obtenirParId(
            @PathVariable String id) {
        return ResponseEntity.ok(categorieService.obtenirParId(id));
    }

    // GET /api/categories/code/{code}
    @GetMapping("/code/{code}")
    public ResponseEntity<CategorieResponseDTO> obtenirParCode(
            @PathVariable String code) {
        return ResponseEntity.ok(categorieService.obtenirParCode(code));
    }

    // GET /api/categories/type/{type}
    @GetMapping("/type/{type}")
    public ResponseEntity<List<CategorieResponseDTO>> obtenirParType(
            @PathVariable TypeBien type) {
        return ResponseEntity.ok(categorieService.obtenirParType(type));
    }

    // GET /api/categories/recherche?nom=vehicule
    @GetMapping("/recherche")
    public ResponseEntity<List<CategorieResponseDTO>> rechercher(
            @RequestParam String nom) {
        return ResponseEntity.ok(categorieService.rechercherParNom(nom));
    }

    // PUT /api/categories/{id}
    @PutMapping("/{id}")
    public ResponseEntity<CategorieResponseDTO> modifier(
            @PathVariable String id,
            @RequestBody @Valid CategorieRequestDTO dto) {
        return ResponseEntity.ok(categorieService.modifier(id, dto));
    }

    // DELETE /api/categories/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable String id) {
        categorieService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}