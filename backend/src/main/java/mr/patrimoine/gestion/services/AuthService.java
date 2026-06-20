package mr.patrimoine.gestion.services;

import mr.patrimoine.gestion.config.JwtUtil;
import mr.patrimoine.gestion.dto.Auth.LoginRequestDTO;
import mr.patrimoine.gestion.dto.Auth.LoginResponseDTO;
import mr.patrimoine.gestion.dto.User.UserRequestDTO;
import mr.patrimoine.gestion.dto.User.UserResponseDTO;
import mr.patrimoine.gestion.exceptions.BusinessException;
import mr.patrimoine.gestion.exceptions.ResourceNotFoundException;
import mr.patrimoine.gestion.model.entity.UserEntity;
import mr.patrimoine.gestion.model.enums.UserRole;
import mr.patrimoine.gestion.repository.MinistereRepository;
import mr.patrimoine.gestion.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MinistereRepository ministereRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    // ==================== LOGIN ====================
    public LoginResponseDTO login(LoginRequestDTO dto) {

        UserEntity user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() -> new BusinessException("Email ou mot de passe incorrect"));

        if (!user.isActif()) {
            throw new BusinessException("Compte désactivé, contactez l'administrateur");
        }

        if (!passwordEncoder.matches(dto.getMotDePasse(), user.getMotDePasse())) {
            throw new BusinessException("Email ou mot de passe incorrect");
        }

        user.setDerniereConnexion(LocalDateTime.now());
        userRepository.save(user);

        auditLogService.log(user.getId(), user.getEmail(),
                "CONNEXION", "User", user.getId(),
                "Connexion de " + user.getEmail());

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name(),
                user.getId()
        );

        return LoginResponseDTO.builder()
                .token(token)
                .id(user.getId())
                .nom(user.getNom())
                .prenom(user.getPrenom())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }

    // ==================== REGISTER ====================
    public UserResponseDTO register(UserRequestDTO dto) {

        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new BusinessException("Email déjà utilisé");
        }

        UserEntity user = UserEntity.builder()
                .nom(dto.getNom())
                .prenom(dto.getPrenom())
                .email(dto.getEmail())
                .motDePasse(passwordEncoder.encode(dto.getMotDePasse()))
                .ministereId(dto.getMinistereId())
                .role(dto.getRole() != null ? dto.getRole() : UserRole.ADMIN)
                .actif(true)
                .dateCreation(LocalDateTime.now())
                .build();

        UserEntity saved = userRepository.save(user);

        return UserResponseDTO.builder()
                .id(saved.getId())
                .nom(saved.getNom())
                .prenom(saved.getPrenom())
                .email(saved.getEmail())
                .userRole(saved.getRole())
                .ministereId(saved.getMinistereId())
                .ministereNom("Ministère par défaut")
                .actif(saved.isActif())
                .dateCreation(saved.getDateCreation())
                .build();
    }

    // ==================== LOGOUT (NOUVEAU) ====================
    public void logout(String email) {
        UserEntity user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            auditLogService.log(user.getId(), user.getEmail(),
                    "DECONNEXION", "User", user.getId(),
                    "Déconnexion de " + user.getEmail());
        }
    }
}