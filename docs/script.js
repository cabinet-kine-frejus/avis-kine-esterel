/* ==========================================
   CABINET DE KINÉSITHÉRAPIE DE L'ESTÉREL
   Logique V0 - Redirection conditionnelle
   ========================================== */

// Configuration
const CONFIG = {
    googleReviewUrl: 'https://search.google.com/local/writereview?placeid=ChIJw1uI0e-XzhIR1dsGLSN1EFs',
    redirectDelay: 1500,
    storageKey: 'esterel_avis_given',
};

let selectedRating = 0;

const stars = document.querySelectorAll('.star');
const ratingText = document.getElementById('rating-text');
const commentSection = document.getElementById('comment-section');
const commentTextarea = document.getElementById('comment');
const charCount = document.getElementById('char-count');
const submitBtn = document.getElementById('submit-btn');
const ratingSection = document.getElementById('rating-section');
const thankYouSection = document.getElementById('thank-you-section');
const thankYouMessage = document.getElementById('thank-you-message');

const ratingTexts = {
    1: 'Très insatisfait 😞',
    2: 'Insatisfait 😕',
    3: 'Moyen 😐',
    4: 'Satisfait 😊',
    5: 'Très satisfait 🤩'
};

const thankYouMessages = {
    5: 'Votre avis va être publié sur Google. Merci infiniment !',
    default: 'Votre retour constructif nous aide à progresser.'
};

document.addEventListener('DOMContentLoaded', () => {
    checkIfAlreadyVoted();
    
    stars.forEach(star => {
        star.addEventListener('click', handleStarClick);
        star.addEventListener('mouseenter', handleStarHover);
    });
    
    document.querySelector('.stars').addEventListener('mouseleave', resetStarHover);
    commentTextarea.addEventListener('input', updateCharCount);
    submitBtn.addEventListener('click', handleSubmit);
});

function handleStarClick(event) {
    const rating = parseInt(event.target.dataset.rating);
    selectedRating = rating;
    
    updateStarsDisplay(rating);
    ratingText.textContent = ratingTexts[rating];
    ratingText.style.color = rating >= 4 ? '#10b981' : '#f59e0b';
    
    if (rating < 5) {
        commentSection.style.display = 'block';
        commentTextarea.focus();
    } else {
        commentSection.style.display = 'none';
    }
    
    submitBtn.disabled = false;
    
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

function updateCharCount() {
    const count = commentTextarea.value.length;
    charCount.textContent = count;
    
    if (count > 450) {
        charCount.style.color = '#ef4444';
    } else if (count > 400) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#9ca3af';
    }
}

function handleSubmit() {
    if (selectedRating === 0) {
        return;
    }
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi en cours...';
    
    markAsVoted();
    
    if (selectedRating === 5) {
        handlePerfectRating();
    } else {
        handleLowerRating();
    }
}

function handlePerfectRating() {
    thankYouMessage.textContent = thankYouMessages[5];
    showThankYouSection();
    
    setTimeout(() => {
        window.location.href = CONFIG.googleReviewUrl;
    }, CONFIG.redirectDelay);
}

function handleLowerRating() {
    const comment = commentTextarea.value.trim();
    
    thankYouMessage.textContent = thankYouMessages.default;
    showThankYouSection();
    
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
    ratingSection.style.display = 'none';
    thankYouSection.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function checkIfAlreadyVoted() {
    const hasVoted = localStorage.getItem(CONFIG.storageKey);
    
    if (hasVoted) {
        const votedDate = new Date(parseInt(hasVoted));
        const now = new Date();
        const daysSinceVote = (now - votedDate) / (1000 * 60 * 60 * 24);
        
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

console.log('QR Avis System V0.1 - Cabinet de Kinésithérapie de l\'Estérel - Initialisé');
