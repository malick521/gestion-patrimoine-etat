package mr.patrimoine.gestion.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expiration;

    // Générer un token JWT
    public String generateToken(String email, String role, String userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("userId", userId);

        return Jwts.builder()
                .claims(claims)                          // ← changé dans 0.12.x
                .subject(email)                          // ← changé dans 0.12.x
                .issuedAt(new Date())                    // ← changé dans 0.12.x
                .expiration(new Date(System.currentTimeMillis() + expiration)) // ← changé
                .signWith(getSigningKey())               // ← simplifié dans 0.12.x
                .compact();
    }

    // Extraire l'email
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Extraire le userId
    public String extractUserId(String token) {
        return extractAllClaims(token).get("userId", String.class);
    }

    // Extraire le role
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // Vérifier si le token est valide
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return !isTokenExpired(token);
        } catch (JwtException e) {
            return false;
        }
    }

    // Vérifier si le token est expiré
    private boolean isTokenExpired(String token) {
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    // Extraire tous les claims
    private Claims extractAllClaims(String token) {
        return Jwts.parser()                         // ← changé dans 0.12.x
                .verifyWith(getSigningKey())             // ← changé dans 0.12.x
                .build()
                .parseSignedClaims(token)               // ← changé dans 0.12.x
                .getPayload();                           // ← changé dans 0.12.x
    }

    // Clé de signature
    private SecretKey getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}