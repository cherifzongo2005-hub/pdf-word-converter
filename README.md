# DocShift — Convertisseur PDF ↔ Word

Site web de conversion de documents entièrement côté client (100% dans le navigateur).

## 🚀 Déploiement sur Vercel

### Option 1 : Via GitHub (recommandé)

1. **Créer un repo GitHub** et pousser ce dossier :
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/VOTRE_USER/pdf-word-converter.git
   git push -u origin main
   ```

2. **Aller sur [vercel.com](https://vercel.com)** → "Add New Project"

3. **Importer le repo GitHub** → Vercel détecte automatiquement Next.js

4. Cliquer **"Deploy"** — c'est tout !

### Option 2 : Via CLI Vercel

```bash
npm install -g vercel
cd pdf-word-converter
npm install
vercel
# Suivre les instructions
```

---

## 🛠 Installation locale

```bash
npm install
npm run dev
# Ouvrir http://localhost:3000
```

## 📦 Build de production

```bash
npm run build
npm start
```

---

## 🧰 Technologies

| Bibliothèque | Rôle |
|---|---|
| `next.js 14` | Framework React + déploiement Vercel |
| `mammoth` | Lecture .docx → HTML |
| `jsPDF` + `html2canvas` | HTML → PDF |
| `pdfjs-dist` | Lecture PDF → texte |
| `docx` | Génération de fichiers .docx |
| `react-dropzone` | Zone de glisser-déposer |

## ⚙️ Architecture

Tout le traitement est **côté client** : aucun API route, aucun serveur ne manipule les fichiers. C'est ce qui permet d'héberger gratuitement sur Vercel (plan Hobby) sans dépassement de ressources.

```
pdf-word-converter/
├── pages/
│   ├── _app.tsx          # Wrapper global
│   ├── _document.tsx     # HTML document
│   ├── index.tsx         # Page principale
│   └── index.module.css  # Styles
├── utils/
│   └── converter.ts      # Logique de conversion
├── styles/
│   └── globals.css       # Styles globaux
├── vercel.json           # Config Vercel
├── next.config.js        # Config Next.js
└── package.json
```

## 📋 Limitations connues

- **PDF → Word** : extrait le texte brut (mise en page complexe non préservée)
- **Word → PDF** : rendu via canvas (fidèle visuellement mais non sélectionnable)
- Taille max : 20 MB par fichier
- Fichiers `.doc` anciens non supportés (uniquement `.docx`)

## 🎨 Design

Interface sombre de style industriel avec :
- Police d'affichage : **Syne** (bold, géométrique)
- Police monospace : **Space Mono**
- Palette : fond `#0a0a0b`, accent `#e8ff5a`
