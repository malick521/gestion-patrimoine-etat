// --- ÉNUMÉRATIONS ---
export enum EtatBien {
  NEUF = 'NEUF',
  BON = 'BON',
  MAUVAIS = 'MAUVAIS',
  HORS_SERVICE = 'HORS_SERVICE'
}

export enum StatutAffectation {
  EN_COURS = 'EN_COURS',
  CLOTUREE = 'CLOTUREE'
}

export enum StatutMaintenance {
  PLANIFIEE = 'PLANIFIEE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE'
}

export enum TypeBien {
  IMMEUBLE = 'IMMEUBLE',
  VEHICULE = 'VEHICULE',
  MOBILIER = 'MOBILIER',
  INFORMATIQUE = 'INFORMATIQUE',
  EQUIPEMENT = 'EQUIPEMENT',
  AUTRE = 'AUTRE'
}

export enum TypeMaintenance {
  PREVENTIVE = 'PREVENTIVE',
  CURATIVE = 'CURATIVE'
}

export enum TypeMouvement {
  AFFECTATION = 'AFFECTATION',
  TRANSFERT = 'TRANSFERT',
  REFORME = 'REFORME'
}

export enum UserRole {
  ADMIN = 'ADMIN',
  GESTIONNAIRE = 'GESTIONNAIRE',
  AUDITEUR = 'AUDITEUR',
  CONSULTANT = 'CONSULTANT'
}

// --- DTOS ---

export interface LoginRequestDTO {
  email: string;
  motDePasse: string;
}

export interface LoginResponseDTO {
  token: string;
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
}

export interface UserRequestDTO {
  nom: string;
  prenom: string;
  email: string;
  motDePasse: string;
  ministereId: string;
  role: UserRole;
}

export interface UserResponseDTO {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  userRole: UserRole;
  ministereId: string;
  ministereNom: string;
  actif: boolean;
  dateCreation: string;
}

export interface BienRequestDTO {
  code: string;
  designation: string;
  description?: string;
  valeurAcquisition: number;
  dateAcquisition: string;
  etat: EtatBien;
  localisation: string;
  latitude: number | null;
  longitude: number | null;
  categorieId: string;
  ministereId: string;
  fournisseur?: string;
  numeroSerie?: string;
  observations?: string;
}

export interface BienResponseDTO {
  id: string;
  code: string;
  designation: string;
  description?: string;
  valeurAcquisition: number;
  valeurActuelle: number;
  dateAcquisition: string;
  etat: EtatBien;
  localisation: string;
  latitude: number | null;
  longitude: number | null;
  imageUrl?: string;

  categorieId: string;
  categorieNom: string;
  ministereId: string;
  ministereNom: string;
  fournisseur?: string;
  numeroSerie?: string;
  observations?: string;
  dateCreation: string;
  dateModification: string;
}

export interface AffectationRequestDTO {
  bienId: string;
  ministereId: string;
  dateDebut: string;
  dateFin?: string;
  motif: string;
  observations?: string;
}

export interface AffectationResponseDTO {
  id: string;
  bienId: string;
  bienDesignation: string;
  ministereId: string;
  ministereNom: string;
  dateDebut: string;
  dateFin?: string;
  motif: string;
  observations?: string;
  statut: StatutAffectation;
  dateCreation: string;
  creePar: string;
}

export interface CategorieRequestDTO {
  nom: string;
  code: string;
  type: TypeBien;
  description?: string;
}

export interface CategorieResponseDTO {
  id: string;
  nom: string;
  code: string;
  type: TypeBien;
  description?: string;
}

export interface MaintenanceRequestDTO {
  bienId: string;
  type: TypeMaintenance;
  dateIntervention: string;
  dateFinIntervention?: string;
  prestataire: string;
  cout?: number;
  description: string;
  observations?: string;
  statut: StatutMaintenance;
}

export interface MaintenanceResponseDTO {
  id: string;
  bienId: string;
  bienDesignation: string;
  type: TypeMaintenance;
  dateIntervention: string;
  dateFinIntervention?: string;
  prestataire: string;
  cout?: number;
  description: string;
  observations?: string;
  statut: StatutMaintenance;
  dateCreation: string;
  creePar: string;
  creeParNom: string;
}

export interface MinistereRequestDTO {
  nom: string;
  code: string;
  responsable: string;
  description?: string;
  telephone?: string;
  adresse?: string;
  email?: string;
}

export interface MinistereResponseDTO {
  id: string;
  nom: string;
  code: string;
  responsable: string;
  email?: string;
  description?: string;
  adresse?: string;
  telephone?: string;
  actif: boolean;
  dateCreation: string;
}

export interface MouvementRequestDTO {
  bienId: string;
  type: TypeMouvement;
  ministereSourceId?: string;
  ministereDestinationId?: string;
  motif?: string;
  observations?: string;
  raisonReforme?: string;
  valeurResiduelle?: number;
}

export interface MouvementResponseDTO {
  id: string;
  bienId: string;
  bienDesignation: string;
  type: TypeMouvement;
  dateMouvement: string;
  ministereSourceId?: string;
  ministereSourceNom?: string;
  ministereDestinationId?: string;
  ministereDestinationNom?: string;
  motif?: string;
  observations?: string;
  raisonReforme?: string;
  valeurResiduelle?: number;
  dateCreation: string;
  creePar: string;
  creeParNom: string;
}

export interface AuditLogResponseDTO {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  entite: string;
  entiteId: string;
  details: string;
  ancienneValeur: string;
  nouvelleValeur: string;
  dateAction: string;
}