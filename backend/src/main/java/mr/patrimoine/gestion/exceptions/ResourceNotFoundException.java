package mr.patrimoine.gestion.exceptions;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String entite, String id) {
        super(entite + " introuvable avec l'id : " + id);
    }
}