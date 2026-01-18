/* ==========================================
   CABINET DE KINÉSITHÉRAPIE DE L'ESTÉREL
   Logique V0 - Redirection conditionnelle
   ========================================== */

// Configuration
const CONFIG = {
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJw1uI0e-XzhIR1dsGLSN1EFs',
    redirectDelay: 1500, // Délai avant redirection (ms)
    storageKey: 'esterel_avis_given', // Clé localStorage
};

// État global
let selectedRating = 0;

// Éléments DOM
const stars = document.querySelectorAll('.star');
const ratingText = document.getElementById('rating-text');
const commentSection = document.getElementById('comment-section');
const commentTextarea = document.getElementById('comment');
const charCount = document.getElementById('char-count');
const submitBtn = document.getElementById('submit-btn');
const ratingSection = document.getElementById('rating-section');
const thankYouSection = document.getElementById('thank-you-section');
const thankYouMessage = document.getElementById('thank-you-message');

// Textes de notation
const ratingTexts = {
    1: 'Très insatisfait 😞',
    2: 'Insatisfait 😕',
    3: 'Moyen 😐',
    4: 'Satisfait 😊',
    5: 'Très satisfait 🤩'
};

// Messages de remerciement
const thankYouMessages = {
    5: 'Votre avis va être publié sur Google. Merci infiniment !',
    default: 'Votre retour constructif nous aide à progresser.'
};

/* ==========================================
   INITIALISATION
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si l'utilisateur a déjà donné son avis
    checkIfAlreadyVoted();
    
    // Événements étoiles
    stars.forEach(star => {
        star.addEventListener('click', handleStarClick);
        star.addEventListener('mouseenter', handleStarHover);
    });
    
    // Événement survol sortie
    document.querySelector('.stars').addEventListener('mouseleave', resetStarHover);
    
    // Événement compteur caractères
    commentTextarea.addEventListener('input', updateCharCount);
    
    // Événement bouton submit
    submitBtn.addEventListener('click', handleSubmit);
});

/* ==========================================
   GESTION DES ÉTOILES
   ========================================== */

function handleStarClick(event) {
    const rating = parseInt(event.target.dataset.rating);
    selectedRating = rating;
    
    // Mettre à jour l'affichage des étoiles
    updateStarsDisplay(rating);
    
    // Mettre à jour le texte
    ratingText.textContent = ratingTexts[rating];
    ratingText.style.color = rating >= 4 ? '#10b981' : '#f59e0b';
    
    // Afficher la section commentaire pour notes < 5
    if (rating < 5) {
        commentSection.style.display = 'block';
        commentTextarea.focus();
    } else {
        commentSection.style.display = 'none';
    }
    
    // Activer le bouton submit
    submitBtn.disabled = false;
    
    // Petite vibration sur mobile
    if (navigator.vibrate) {
        navigator.vibrate(50);
    }
}

function handleStarHover(event) {
    if (selectedRating === 0) {
        const rating = parseInt(event.target.dataset.rating);
        updateStarsDisplay(rating);
        ratingText.textContent = ratingTexts[rating];
    }
}

function resetStarHover() {
    if (selectedRating === 0) {
        updateStarsDisplay(0);
        ratingText.textContent = 'Cliquez sur les étoiles';
        ratingText.style.color = '';
    } else {
        updateStarsDisplay(selectedRating);
    }
}

function updateStarsDisplay(rating) {
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

/* ==========================================
   GESTION COMMENTAIRE
   ========================================== */

function updateCharCount() {
    const count = commentTextarea.value.length;
    charCount.textContent = count;
    
    // Changer la couleur si proche de la limite
    if (count > 450) {
        charCount.style.color = '#ef4444';
    } else if (count > 400) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#9ca3af';
    }
}

/* ==========================================
   SOUMISSION ET REDIRECTION
   ========================================== */

function handleSubmit() {
    if (selectedRating === 0) {
        return;
    }
    
    // Désactiver le bouton pour éviter double-clic
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    
    // Marquer comme ayant voté (localStorage)
    markAsVoted();
    
    // Logique de redirection selon la note
    if (selectedRating === 5) {
        // Note 5/5 : Redirection vers Google
        handlePerfectRating();
    } else {
        // Note < 5 : Afficher message remerciement
        handleLowerRating();
    }
}

function handlePerfectRating() {
    // Afficher message temporaire
    thankYouMessage.textContent = thankYouMessages[5];
    showThankYouSection();
    
    // Redirection vers Google après délai
    setTimeout(() => {
        window.location.href = CONFIG.googleReviewUrl;
    }, CONFIG.redirectDelay);
}

function handleLowerRating() {
    // Récupérer le commentaire (optionnel)
    const comment = commentTextarea.value.trim();
    
    // Note : en V0, on ne stocke rien côté serveur
    // Le commentaire est juste perdu (volontairement pour RGPD)
    
    // Afficher message remerciement
    thankYouMessage.textContent = thankYouMessages.default;
    showThankYouSection();
    
    // Log analytics local (optionnel, non envoyé)
    if (window.console) {
        console.log('Avis reçu (non stocké) :', {
            rating: selectedRating,
            hasComment: comment.length > 0,
            commentLength: comment.length,
            timestamp: new Date().toISOString()
        });
    }
}

function showThankYouSection() {
    // Animation de transition
    ratingSection.style.display = 'none';
    thankYouSection.style.display = 'block';
    
    // Scroll vers le haut
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ==========================================
   GESTION LOCALSTORAGE (anti-spam)
   ========================================== */

function checkIfAlreadyVoted() {
    const hasVoted = localStorage.getItem(CONFIG.storageKey);
    
    if (hasVoted) {
        const votedDate = new Date(parseInt(hasVoted));
        const now = new Date();
        const daysSinceVote = (now - votedDate) / (1000 * 60 * 60 * 24);
        
        // Permettre un nouvel avis après 30 jours
        if (daysSinceVote < 30) {
            showAlreadyVotedMessage(votedDate);
        }
    }
}

function markAsVoted() {
    const timestamp = Date.now();
    localStorage.setItem(CONFIG.storageKey, timestamp.toString());
}

function showAlreadyVotedMessage(votedDate) {
    // Message personnalisé si déjà voté récemment
    const formattedDate = votedDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    ratingSection.innerHTML = `
        <div class="icon">ℹ️</div>
        <h2>Merci pour votre fidélité !</h2>
        <p class="subtitle">
            Vous avez déjà partagé votre avis le ${formattedDate}.<br>
            Pour éviter les doublons, nous limitons à un avis par mois.
        </p>
        <div class="benefits">
            <div class="benefit">✓ Votre précédent avis est bien pris en compte</div>
            <div class="benefit">✓ Vous pourrez donner un nouvel avis dans 30 jours</div>
        </div>
        <div class="additional-info" style="margin-top: 30px;">
            <p><strong>Cabinet de Kinésithérapie de l'Estérel</strong></p>
            <p>Stéphane Régnault - Kinésithérapeute</p>
            <p>📍 Fréjus (83600)</p>
        </div>
    `;
}

/* ==========================================
   ANALYTICS ANONYMES (optionnel)
   ========================================== */

// Fonction pour tracker les événements côté client uniquement
function trackEvent(eventName, eventData) {
    // En V0, on ne track rien côté serveur
    // Mais tu peux ajouter Google Analytics ici si souhaité
    
    if (window.gtag) {
        window.gtag('event', eventName, eventData);
    }
}

/* ==========================================
   GESTION ERREURS
   ========================================== */

window.addEventListener('error', (event) => {
    console.error('Erreur détectée :', event.error);
    // En production, tu pourrais envoyer l'erreur à un service de monitoring
});

/* ==========================================
   UTILITAIRES
   ========================================== */

// Détection mobile
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Log version (aide au debug)
console.log('QR Avis System V0.1 - Cabinet de Kinésithérapie de l\'Estérel - Initialisé');
```

---

## ✅ CHECKPOINT : Vérifie ton dossier

Tu dois maintenant avoir dans ton dossier `qr-avis-esterel-v0` :
```
qr-avis-esterel-v0/
├── index.html     ✅
├── styles.css     ✅
└── script.js      ✅