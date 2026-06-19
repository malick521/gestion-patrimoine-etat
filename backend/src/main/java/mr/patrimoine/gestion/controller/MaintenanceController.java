package mr.patrimoine.gestion.controller;

import mr.patrimoine.gestion.dto.Maintenance.MaintenanceRequestDTO;
import mr.patrimoine.gestion.dto.Maintenance.MaintenanceResponseDTO;
import mr.patrimoine.gestion.model.enums.StatutMaintenance;
import mr.patrimoine.gestion.model.enums.TypeMaintenance;
import mr.patrimoine.gestion.services.MaintenanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenances")
@CrossOrigin(origins = "*")
public class MaintenanceController {

    @Autowired
    private MaintenanceService maintenanceService;

    // POST /api/maintenances
    @PostMapping
    public ResponseEntity<MaintenanceResponseDTO> creer(
            @RequestBody @Valid MaintenanceRequestDTO dto,
            Authentication authentication) {
        String userEmail = authentication.getName();
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(maintenanceService.creer(dto, userEmail));
    }

    // GET /api/maintenances
    @GetMapping
    public ResponseEntity<List<MaintenanceResponseDTO>> obtenirTous() {
        return ResponseEntity.ok(maintenanceService.obtenirTous());
    }

    // GET /api/maintenances/{id}
    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceResponseDTO> obtenirParId(
            @PathVariable String id) {
        return ResponseEntity.ok(maintenanceService.obtenirParId(id));
    }

    // GET /api/maintenances/bien/{bienId}
    @GetMapping("/bien/{bienId}")
    public ResponseEntity<List<MaintenanceResponseDTO>> obtenirParBien(
            @PathVariable String bienId) {
        return ResponseEntity.ok(maintenanceService.obtenirParBien(bienId));
    }

    // GET /api/maintenances/type/{type}
    @GetMapping("/type/{type}")
    public ResponseEntity<List<MaintenanceResponseDTO>> obtenirParType(
            @PathVariable TypeMaintenance type) {
        return ResponseEntity.ok(maintenanceService.obtenirParType(type));
    }

    // GET /api/maintenances/statut/{statut}
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<MaintenanceResponseDTO>> obtenirParStatut(
            @PathVariable StatutMaintenance statut) {
        return ResponseEntity.ok(maintenanceService.obtenirParStatut(statut));
    }

    // PATCH /api/maintenances/{id}/terminer
    @PatchMapping("/{id}/terminer")
    public ResponseEntity<MaintenanceResponseDTO> terminer(
            @PathVariable String id, Authentication authentication) {

        String userEmail = authentication.getName();
        return ResponseEntity.ok(maintenanceService.terminer(id, userEmail));
    }

    // PATCH /api/maintenances/{id}/annuler
    @PatchMapping("/{id}/annuler")
    public ResponseEntity<MaintenanceResponseDTO> annuler(
            @PathVariable String id) {
        return ResponseEntity.ok(maintenanceService.annuler(id));
    }

    // DELETE /api/maintenances/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> supprimer(@PathVariable String id) {
        maintenanceService.supprimer(id);
        return ResponseEntity.noContent().build();
    }
}