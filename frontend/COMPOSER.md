# 🎵 Compositeur UTAU

## Fonctionnalités

Le compositeur permet de créer des mélodies en plaçant des notes sur une grille et en les jouant avec des voicebanks.

### Interface

#### Panneau Projet (Gauche)
- **Titre** : Nom de votre composition
- **Banque vocale** : Sélectionnez la voix à utiliser (ex: Kasane Teto)
- **Phonème** : Choisissez le son à placer (a, i, u, e, o, ka, ki, etc.)
- **BPM** : Régl age du tempo (40-240)

#### Contrôles de lecture
- **Lecture/Pause** : Démarre ou met en pause la composition
- **Stop** : Arrête et réinitialise la position
- **Initialiser** : Remet la position au début

#### Grille de composition (Droite)
- **Lignes** : Représentent les hauteurs de notes (B5 à C4)
- **Colonnes** : Représentent les mesures temporelles
- **Cliquer** : Place ou supprime une note
- **Notes bleues** : Notes placées avec leur phonème affiché

## Utilisation

### 1. Sélectionner une voicebank
Choisissez "Kasane Teto" ou une autre voicebank disponible dans le menu déroulant.

### 2. Choisir un phonème
Sélectionnez le son que vous voulez placer (par exemple "a" pour あ, "ka" pour か, etc.)

### 3. Placer des notes
Cliquez sur une cellule de la grille pour placer une note avec le phonème sélectionné.
- La note apparaît en bleu avec le phonème affiché
- Recliquer sur une note la supprime
- Le son est joué immédiatement pour prévisualisation

### 4. Jouer la composition
Appuyez sur "Lecture" pour entendre votre composition.
- Les notes sont jouées automatiquement au bon moment
- La position actuelle est affichée
- Utilisez "Stop" pour revenir au début

## Phonèmes disponibles

### Voyelles de base
- `a` → あ
- `i` → い
- `u` → う
- `e` → え
- `o` → お

### Consonnes K
- `ka`, `ki`, `ku`, `ke`, `ko`

### Consonnes S
- `sa`, `shi`, `su`, `se`, `so`

### Consonnes T
- `ta`, `chi`, `tsu`, `te`, `to`

### Consonnes N
- `na`, `ni`, `nu`, `ne`, `no`

### Consonnes H
- `ha`, `hi`, `fu`, `he`, `ho`

### Consonnes M
- `ma`, `mi`, `mu`, `me`, `mo`

### Consonnes Y
- `ya`, `yu`, `yo`

### Consonnes R
- `ra`, `ri`, `ru`, `re`, `ro`

### Consonnes W
- `wa`, `wo`

### Nasal
- `n` → ん

## Notes techniques

- Les fichiers audio sont chargés depuis l'API Directus
- Le cache audio optimise les performances
- La grille utilise une résolution de 1/4 de temps par mesure
- Le BPM détermine la vitesse de lecture

## Raccourcis futurs (à implémenter)

- Espace : Lecture/Pause
- Échap : Stop
- Flèches : Navigation dans la grille
- Suppr : Supprimer la note sélectionnée
- Ctrl+Z : Annuler
- Ctrl+S : Sauvegarder
