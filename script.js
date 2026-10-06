// ===== 1. Les données : la liste des produits =====
// Dans la phase 2, ces produits viendront d'une base de données.
const products = [
  { id: 1, name: "Tajine en terre cuite", category: "poterie", price: 3500, emoji: "🏺", description: "Tajine traditionnel fait main, idéal pour la cuisson lente." },
  { id: 2, name: "Vase kabyle peint", category: "poterie", price: 4200, emoji: "⚱️", description: "Vase décoré de motifs berbères aux couleurs naturelles." },
  { id: 3, name: "Tapis berbère", category: "tapis", price: 18000, emoji: "🧶", description: "Tapis tissé à la main dans la tradition des Aurès." },
  { id: 4, name: "Coussin en laine", category: "tapis", price: 2800, emoji: "🛋️", description: "Housse de coussin en laine aux motifs géométriques." },
  { id: 5, name: "Bracelet en argent", category: "bijoux", price: 6500, emoji: "📿", description: "Bracelet berbère en argent ciselé, émail et corail." },
  { id: 6, name: "Fibule traditionnelle", category: "bijoux", price: 5200, emoji: "✨", description: "Broche triangulaire symbole de l'élégance kabyle." },
  { id: 7, name: "Savon à l'huile d'olive", category: "cosmetique", price: 450, emoji: "🧼", description: "Savon naturel à l'huile d'olive de Kabylie." },
  { id: 8, name: "Huile d'argan pure", category: "cosmetique", price: 2200, emoji: "🌿", description: "Huile 100 % naturelle pour la peau et les cheveux." }
];

// ===== 2. Le panier =====
// On essaie de récupérer le panier enregistré dans le navigateur.
let cart = [];
try {
  cart = JSON.parse(localStorage.getItem("cart")) || [];
} catch (error) {
  cart = [];
}

function saveCart() {
  try {
    localStorage.setItem("cart", JSON.stringify(cart));
  } catch (error) {
    // Si le navigateur bloque l'enregistrement, le panier marche quand même.
  }
}

// ===== 3. Raccourcis vers les éléments de la page =====
const productList = document.getElementById("product-list");
const cartElement = document.getElementById("cart");
const cartItems = document.getElementById("cart-items");
const cartCount = document.getElementById("cart-count");
const cartTotal = document.getElementById("cart-total");

// Formate un prix : 18000 -> "18 000 DA"
function formatPrice(price) {
  return price.toLocaleString("fr-FR") + " DA";
}

// ===== 4. Afficher les produits (avec filtre) =====
function displayProducts(category) {
  const filtered = category === "tous"
    ? products
    : products.filter(product => product.category === category);

  productList.innerHTML = filtered.map(product => `
    <article class="product">
      <div class="product-image">${product.emoji}</div>
      <div class="product-info">
        <span class="product-category">${product.category}</span>
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <div class="product-bottom">
          <span class="price">${formatPrice(product.price)}</span>
          <button class="add-to-cart" data-id="${product.id}">Ajouter</button>
        </div>
      </div>
    </article>
  `).join("");
}

// ===== 5. Gérer le panier =====
function addToCart(id) {
  const item = cart.find(item => item.id === id);
  if (item) {
    item.quantity++;                 // déjà dans le panier : +1
  } else {
    cart.push({ id: id, quantity: 1 }); // nouveau produit
  }
  updateCart();
}

function changeQuantity(id, change) {
  const item = cart.find(item => item.id === id);
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter(item => item.id !== id); // retirer si quantité = 0
  }
  updateCart();
}

function updateCart() {
  saveCart();

  // Nombre total d'articles (affiché dans le bouton du haut)
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  cartCount.textContent = count;

  // Panier vide
  if (cart.length === 0) {
    cartItems.innerHTML = `<li class="empty-cart">Votre panier est vide.</li>`;
    cartTotal.textContent = formatPrice(0);
    return;
  }

  // Liste des articles + calcul du total
  let total = 0;
  cartItems.innerHTML = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    const subtotal = product.price * item.quantity;
    total += subtotal;
    return `
      <li class="cart-item">
        <span>${product.emoji}</span>
        <div class="cart-item-info">
          <strong>${product.name}</strong><br>
          <small>${formatPrice(product.price)} × ${item.quantity} = ${formatPrice(subtotal)}</small>
        </div>
        <div class="quantity">
          <button data-id="${item.id}" data-change="-1">−</button>
          <span>${item.quantity}</span>
          <button data-id="${item.id}" data-change="1">+</button>
        </div>
      </li>
    `;
  }).join("");

  cartTotal.textContent = formatPrice(total);
}

// ===== 6. Les événements (clics) =====

// Clic sur "Ajouter"
productList.addEventListener("click", event => {
  if (event.target.classList.contains("add-to-cart")) {
    addToCart(Number(event.target.dataset.id));
    cartElement.classList.add("open"); // ouvre le panier
  }
});

// Clic sur + ou − dans le panier
cartItems.addEventListener("click", event => {
  const button = event.target;
  if (button.dataset.change) {
    changeQuantity(Number(button.dataset.id), Number(button.dataset.change));
  }
});

// Ouvrir / fermer le panier
document.getElementById("cart-button").addEventListener("click", () => {
  cartElement.classList.add("open");
});
document.getElementById("close-cart").addEventListener("click", () => {
  cartElement.classList.remove("open");
});

// Filtres par catégorie
document.querySelectorAll(".filter").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach(b => b.classList.remove("active"));
    button.classList.add("active");
    displayProducts(button.dataset.category);
  });
});

// Bouton "Commander" (boutique fictive : pas de vrai paiement)
document.getElementById("checkout").addEventListener("click", () => {
  if (cart.length === 0) {
    alert("Votre panier est vide.");
    return;
  }
  alert("Merci pour votre commande ! (Boutique de démonstration : aucun paiement n'est effectué.)");
  cart = [];
  updateCart();
  cartElement.classList.remove("open");
});

// ===== 7. Au chargement de la page =====
displayProducts("tous");
updateCart();
