// Prestations de Coiffure Uniquement
const products = [
    {
        id: 1,
        title: "Tresses en boite avec boucles",
        duration: "3h30",
        price: 5000,
        image: "https://i.pinimg.com/1200x/97/1b/6e/971b6e7c7ad1d104f4fe3ed86347e84b.jpg"
    },
    {
        id: 2,
        title: "Ponytail",
        duration: "1h30",
        price: 5000,
        image: "https://i.pinimg.com/736x/43/8a/e9/438ae9a95afe868ac5ac4377b4d925c6.jpg"
    },
    {
        id: 3,
        title: "Nattes",
        duration: "2h00",
        price: 5000,
        image: "https://i.pinimg.com/736x/e6/e0/4a/e6e04a2a617ef0924f5bcffe8a5c66e7.jpg"
    },
    {
        id: 4,
        title: "Rasta",
        duration: "3h00",
        price: 5000,
        image: "https://i.pinimg.com/736x/10/4b/f1/104bf1fdd44f1f35a9167e419b1b2d0e.jpg"
    }

];

// Numéro WhatsApp (Remplacez par le numéro réel, ex: 237692832319)
const WHATSAPP_NUMBER = "237692832319"; 

let cart = [];

// Liste des quartiers pour l'autocomplétion (Douala / Garoua ou autre)
const quartiersList = [
    "Yelwa", "Roumde Adja", "Djamboutou", "Plateau", "Djoumassi", 
    "Base", "Takasko", "Marouare", "Galbidje", "Poumpoumre", 
    "Soweto", "Nigeriare", "Kanadi"
];

// Chargement initial
document.addEventListener("DOMContentLoaded", () => {
    displayProducts(products);
    
    const dateInput = document.getElementById("booking-date");
    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }
});

// Affichage des prestations
function displayProducts(items) {
    const grid = document.getElementById("products-grid");
    grid.innerHTML = "";

    items.forEach(product => {
        const card = document.createElement("div");
        card.className = "product-card";
        card.innerHTML = `
            <span class="product-badge"><i class="fa-solid fa-clock"></i> ${product.duration}</span>
            <img src="${product.image}" alt="${product.title}" class="product-img" onclick="openImageModal('${product.image}', '${product.title}')" title="Cliquer pour agrandir">
            <div class="product-info">
                <h3 class="product-title">${product.title}</h3>
                <div class="product-meta"><i class="fa-solid fa-tag"></i> COIFFURE</div>
                <div class="product-price">${product.price.toLocaleString()} FCFA</div>
                <button class="add-cart-btn" onclick="addToCart(${product.id})">
                    <i class="fa-solid fa-plus"></i> Choisir cette prestation
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Autocomplétion des quartiers
function showSuggestions(value) {
    const container = document.getElementById("suggestions-list");
    container.innerHTML = "";

    if (!value) return;

    const inputVal = value.toLowerCase();
    const filtered = quartiersList.filter(q => q.toLowerCase().includes(inputVal));

    filtered.forEach(quartier => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.innerText = quartier;
        item.onclick = () => {
            document.getElementById("booking-location").value = quartier;
            container.innerHTML = "";
        };
        container.appendChild(item);
    });
}

// Cacher les suggestions au clic ailleurs
document.addEventListener("click", (e) => {
    if (!e.target.closest("#booking-location") && !e.target.closest("#suggestions-list")) {
        const container = document.getElementById("suggestions-list");
        if (container) container.innerHTML = "";
    }
});

// Ajouter au panier sans l'ouvrir automatiquement
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const exists = cart.find(item => item.id === productId);
    if (!exists) {
        cart.push(product);
        updateCartUI();
    } else {
        alert("Cette prestation est déjà dans votre panier de réservation.");
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// Mise à jour de l'interface du panier et des frais de transport
function updateCartUI() {
    const cartCount = document.getElementById("cart-count");
    const cartItems = document.getElementById("cart-items");
    const cartTotalPrice = document.getElementById("cart-total-price");
    const bookingForm = document.getElementById("booking-form");

    cartCount.innerText = cart.length;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart-msg">Aucune prestation sélectionnée pour l\'instant.</p>';
        cartTotalPrice.innerText = "0 FCFA";
        bookingForm.style.display = "none";
        return;
    }

    bookingForm.style.display = "block";
    cartItems.innerHTML = "";
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price;
        const itemElement = document.createElement("div");
        itemElement.className = "cart-item";
        itemElement.innerHTML = `
            <div>
                <div class="cart-item-title">${item.title}</div>
                <div class="cart-item-price">${item.price.toLocaleString()} FCFA</div>
            </div>
            <i class="fa-solid fa-trash remove-item" onclick="removeFromCart(${item.id})"></i>
        `;
        cartItems.appendChild(itemElement);
    });

    const travelSelect = document.getElementById("travel-option");
    let travelCost = (travelSelect && travelSelect.value === "coiffeuse") ? 500 : 0;
    const finalTotal = subtotal + travelCost;

    cartTotalPrice.innerText = `${finalTotal.toLocaleString()} FCFA`;
}

function toggleCart() {
    document.getElementById("cart-modal").classList.toggle("open");
}

// Envoi de la réservation vers WhatsApp (Garanti sans losanges noirs)
function sendWhatsAppOrder() {
    if (cart.length === 0) {
        alert("Veuillez sélectionner au moins une prestation !");
        return;
    }

    const dateVal = document.getElementById("booking-date").value;
    const timeVal = document.getElementById("booking-time").value;
    const locationVal = document.getElementById("booking-location").value.trim();
    const travelOption = document.getElementById("travel-option").value;

    if (!locationVal) {
        alert("Veuillez préciser votre quartier/adresse !");
        document.getElementById("booking-location").focus();
        return;
    }

    // Calcul du sous-total
    let subtotal = 0;
    cart.forEach(item => {
        subtotal += item.price;
    });

    // Frais de déplacement
    let travelCost = (travelOption === "coiffeuse") ? 500 : 0;
    const finalTotal = subtotal + travelCost;

    // Construction du message identique à l'image
    let message = "Bonjour ! Je souhaite réserver une séance de coiffure à domicile :\n\n";

    cart.forEach(item => {
        message += `- Prestation : ${item.title} (${item.price.toLocaleString()} FCFA)\n`;
    });

    if (travelCost > 0) {
        message += `- Déplacement : +500 FCFA\n`;
    }

    message += `\n*Total Estimé : ${finalTotal.toLocaleString()} FCFA*\n\n`;
    message += `*Date :* ${dateVal}\n`;
    message += `*Heure :* ${timeVal}\n`;
    message += `*Quartier :* ${locationVal}\n`;
    message += `*Paiement :* Orange Money\n\n`;
    message += "Merci de me confirmer votre disponibilité pour ce créneau !";

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, '_blank');
}
// Fonction de recherche en temps réel
function filterProductsBySearch(query) {
    const searchTerm = query.toLowerCase().trim();
    
    if (!searchTerm) {
        displayProducts(products);
        return;
    }

    const filtered = products.filter(product => 
        product.title.toLowerCase().includes(searchTerm)
    );

    displayProducts(filtered);
}
// Liste initiale des avis
let reviewsList = [
    {
        name: "Stéphanie",
        location: "Yelwa",
        rating: 4,
        comment: "Franchement top ! Les tresses sont super propres et tiennent super bien. Le fait qu'elle se déplace à la maison m'a fait gagner tellement de temps !"
    },
    {
        name: "Brenda",
        location: "Nassarao",
        rating: 4,
        comment: "Le résultat est juste magnifique, très professionnelle et minutieuse. Merci encore Marthe !"
    }
];

let selectedRating = 5; // Note par défaut

// Charger les avis au démarrage
document.addEventListener("DOMContentLoaded", () => {
    // Si des avis sont déjà enregistrés localement, on les charge
    const savedReviews = localStorage.getItem("chic_reviews");
    if (savedReviews) {
        reviewsList = JSON.parse(savedReviews);
    }
    displayReviews();
    setRating(5); // Activer 5 étoiles par défaut
});

// Afficher les avis dans la grille
function displayReviews() {
    const grid = document.getElementById("testimonials-grid");
    if (!grid) return;
    
    grid.innerHTML = "";

    reviewsList.forEach(rev => {
        let starsHTML = "";
        for (let i = 1; i <= 5; i++) {
            if (i <= rev.rating) {
                starsHTML += '<i class="fa-solid fa-star"></i> ';
            } else {
                starsHTML += '<i class="fa-regular fa-star" style="color:#ccc;"></i> ';
            }
        }

        const card = document.createElement("div");
        card.className = "testimonial-card";
        card.innerHTML = `
            <div class="stars">${starsHTML}</div>
            <p class="testimonial-text">"${rev.comment}"</p>
            <div class="client-info">
                <strong>${rev.name}</strong>
                <span>${rev.location}</span>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Afficher / Masquer le formulaire
function toggleReviewForm() {
    const container = document.getElementById("review-form-container");
    container.style.display = container.style.display === "none" ? "block" : "none";
}

// Sélectionner la note en étoiles
function setRating(rating) {
    selectedRating = rating;
    const stars = document.querySelectorAll(".star-rating-input .star-btn");
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add("active");
        } else {
            star.classList.remove("active");
        }
    });
}

// Soumission du formulaire d'avis
function submitReview(event) {
    event.preventDefault();

    const name = document.getElementById("reviewer-name").value.trim();
    const location = document.getElementById("reviewer-location").value.trim();
    const comment = document.getElementById("reviewer-comment").value.trim();

    if (!name || !location || !comment) return;

    const newReview = {
        name: name,
        location: location,
        rating: selectedRating,
        comment: comment
    };

    // Ajouter le nouvel avis au début de la liste
    reviewsList.unshift(newReview);

    // Sauvegarder dans le navigateur
    localStorage.setItem("chic_reviews", JSON.stringify(reviewsList));

    // Réinitialiser et mettre à jour l'affichage
    displayReviews();
    document.getElementById("review-form").reset();
    setRating(5);
    toggleReviewForm();

    alert("Merci ! Votre avis a été publié avec succès.");
}
// Fonction pour ouvrir l'image en grand
function openImageModal(imgSrc, title) {
    const modal = document.getElementById("image-modal");
    const modalImg = document.getElementById("img-modal-target");
    const captionText = document.getElementById("image-modal-caption");

    modal.style.display = "block";
    modalImg.src = imgSrc;
    captionText.innerHTML = title;
}

// Fonction pour fermer la vue grand écran
function closeImageModal() {
    document.getElementById("image-modal").style.display = "none";
}
// Fonction pour afficher une notification Toast
function showToast(message) {
    let toast = document.getElementById("toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast";
        toast.className = "toast-notification";
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #d4af37;"></i> ${message}`;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000);
}