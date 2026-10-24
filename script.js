// ================================
// BHARAPUR QUICK - MAIN JAVASCRIPT
// ================================

// ---------- PRODUCTS ----------
const products = [
    { id: 1, name: "Fresh Milk", category: "Dairy", price: 50, emoji: "🥛", ownerType: "owner" },
    { id: 2, name: "Bread", category: "Bakery", price: 40, emoji: "🍞", ownerType: "owner" },
    { id: 3, name: "Eggs", category: "Dairy", price: 72, emoji: "🥚", ownerType: "owner" },
    { id: 4, name: "Potato", category: "Vegetables", price: 35, emoji: "🥔", ownerType: "owner" },
    { id: 5, name: "Tomato", category: "Vegetables", price: 40, emoji: "🍅", ownerType: "owner" },
    { id: 6, name: "Banana", category: "Fruits", price: 50, emoji: "🍌", ownerType: "owner" },
    { id: 7, name: "Apple", category: "Fruits", price: 120, emoji: "🍎", ownerType: "owner" },
    { id: 8, name: "Biscuits", category: "Snacks", price: 30, emoji: "🍪", ownerType: "owner" },
    { id: 9, name: "Potato Chips", category: "Snacks", price: 20, emoji: "🥔", ownerType: "owner" },
    { id: 10, name: "Soap", category: "Personal Care", price: 35, emoji: "🧼", ownerType: "owner" },
    { id: 11, name: "Shampoo", category: "Personal Care", price: 95, emoji: "🧴", ownerType: "owner" },
    { id: 12, name: "Rice 5kg", category: "Grocery", price: 350, emoji: "🍚", ownerType: "owner" }
];

// ---------- CATEGORIES ----------
const categories = [
    { name: "All", emoji: "🛍️" },
    { name: "Grocery", emoji: "🛒" },
    { name: "Dairy", emoji: "🥛" },
    { name: "Fruits", emoji: "🍎" },
    { name: "Vegetables", emoji: "🥕" },
    { name: "Bakery", emoji: "🍞" },
    { name: "Snacks", emoji: "🍪" },
    { name: "Personal Care", emoji: "🧴" }
];

// ---------- APP STATE ----------
let cart = [];
let wishlist = [];
let orders = [];
let currentCategory = "All";
let currentPage = "homePage";

// ---------- OWNER ----------
const ADMIN_PASSWORD = "CHANGE_THIS_PASSWORD";

let ownerProducts =
    JSON.parse(localStorage.getItem("ownerProducts")) || [];

// ---------- MANAGER ----------
const MANAGER_CODE = "BHARAPUR-MANAGER";

let managerProducts =
    JSON.parse(localStorage.getItem("managerProducts")) || [];

let managerMode =
    localStorage.getItem("managerMode") === "true";

let managerId =
    localStorage.getItem("managerId");

let managerProfile =
    JSON.parse(localStorage.getItem("managerProfile")) || {
        name: "",
        shopName: "",
        storeType: "",
        description: ""
    };

if (!managerId) {
    managerId =
        "manager_" +
        Date.now() +
        "_" +
        Math.random().toString(36).slice(2);

    localStorage.setItem("managerId", managerId);
}

// ---------- EDIT IMAGE ----------
let editManagerImage = "";

// ---------- HELPER ----------
function get(id) {
    return document.getElementById(id);
}

function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function getAllProducts() {
    const managerOwned =
        managerProducts.filter(
            product => product.ownerType === "manager"
        );

    return [
        ...products,
        ...ownerProducts,
        ...managerOwned
    ];
}

function findProduct(productId) {
    return getAllProducts().find(
        product =>
            Number(product.id) === Number(productId)
    );
}

function saveOwnerProducts() {
    localStorage.setItem(
        "ownerProducts",
        JSON.stringify(ownerProducts)
    );
}

function saveManagerProducts() {
    localStorage.setItem(
        "managerProducts",
        JSON.stringify(managerProducts)
    );
}

function saveManagerProfile() {
    localStorage.setItem(
        "managerProfile",
        JSON.stringify(managerProfile)
    );
}

// ==========================================
// PAGE NAVIGATION
// ==========================================

function showPage(pageId) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
        page.style.display = "none";
    });

    const selectedPage = get(pageId);

    if (selectedPage) {
        selectedPage.style.display = "block";
        selectedPage.classList.add("active");
    }

    currentPage = pageId;

    document.querySelectorAll(".nav-button").forEach(button => {
        button.classList.remove("active");

        if (button.dataset.page === pageId) {
            button.classList.add("active");
        }
    });

    closeCart();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

window.showPage = showPage;

// ==========================================
// BOTTOM NAVIGATION
// ==========================================

function setupNavigation() {
    document.querySelectorAll(".nav-button").forEach(button => {
        button.addEventListener("click", function () {
            const pageId = this.dataset.page;

            if (!pageId) return;

            showPage(pageId);
        });
    });
}

// ==========================================
// CATEGORIES
// ==========================================

function getCategoryList() {
    const list = [...categories];

    getAllProducts().forEach(product => {
        if (!product.category) return;

        const exists = list.some(
            category =>
                category.name === product.category
        );

        if (!exists) {
            list.push({
                name: product.category,
                emoji: "📦"
            });
        }
    });

    return list;
}

function renderCategories() {
    const container = get("categoryContainer");

    if (!container) return;

    container.innerHTML = "";

    getCategoryList().forEach(category => {
        const button = document.createElement("button");

        button.className = "category";

        if (category.name === currentCategory) {
            button.classList.add("selected");
        }

        button.innerHTML = `
            <div class="category-icon">
                ${category.emoji}
            </div>

            <div class="category-name">
                ${escapeHTML(category.name)}
            </div>
        `;

        button.addEventListener("click", () => {
            currentCategory = category.name;

            renderCategories();
            renderProducts();
        });

        container.appendChild(button);
    });
}

// ==========================================
// PRODUCTS
// ==========================================

function renderProducts(list = null) {
    const container = get("productContainer");

    if (!container) return;

    let productList = list;

    if (!productList) {
        const allProducts = getAllProducts();

        if (currentCategory === "All") {
            productList = allProducts;
        } else {
            productList = allProducts.filter(
                product =>
                    product.category === currentCategory
            );
        }
    }

    container.innerHTML = "";

    if (productList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>😕</div>
                <h3>No products found</h3>
                <p>Try another category or search.</p>
            </div>
        `;
        return;
    }

    productList.forEach(product => {
        const isWishlisted =
            wishlist.includes(product.id);

        const card =
            document.createElement("div");

        card.className = "product-card";

        const imageHTML =
            product.image
                ? `
                    <img
                        src="${escapeHTML(product.image)}"
                        alt="${escapeHTML(product.name)}"
                        style="
                            width:100%;
                            height:100%;
                            object-fit:contain;
                            border-radius:14px;
                        "
                    >
                `
                : (
                    product.emoji || "📦"
                );

        card.innerHTML = `
            <button
                class="wishlist-button ${isWishlisted ? "active" : ""}"
                data-id="${product.id}"
                type="button"
            >
                ${isWishlisted ? "♥" : "♡"}
            </button>

            <div class="product-image">
                ${imageHTML}
            </div>

            <div class="product-name">
                ${escapeHTML(product.name)}
            </div>

            <div class="product-unit">
                ${escapeHTML(product.category)}
            </div>

            ${
                product.description
                    ? `
                        <div style="
                            font-size:11px;
                            opacity:.6;
                            margin:4px 0 8px;
                        ">
                            ${escapeHTML(product.description)}
                        </div>
                    `
                    : ""
            }

            <div class="product-bottom">
                <strong class="product-price">
                    ₹${Number(product.price)}
                </strong>

                <button
                    class="add-button"
                    data-id="${product.id}"
                    type="button"
                >
                    + Add
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    container
        .querySelectorAll(".add-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                addToCart(
                    Number(button.dataset.id)
                );
            });
        });

    container
        .querySelectorAll(".wishlist-button")
        .forEach(button => {
            button.addEventListener("click", () => {
                toggleWishlist(
                    Number(button.dataset.id)
                );
            });
        });
}

// ==========================================
// CART
// ==========================================

function addToCart(productId) {
    const product = findProduct(productId);

    if (!product) return;

    const existing =
        cart.find(
            item => item.id === productId
        );

    if (existing) {
        existing.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    renderCart();
    updateCartCount();
    openCart();
}

function updateCartCount() {
    const countElement = get("cartCount");

    if (!countElement) return;

    const count =
        cart.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

    countElement.textContent = count;
}

function renderCart() {
    const container = get("cartItems");
    const totalElement = get("cartTotal");

    if (!container) return;

    container.innerHTML = "";

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to continue.</p>
            </div>
        `;

        if (totalElement) {
            totalElement.textContent = "0";
        }

        updateCartCount();
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total +=
            Number(item.price) *
            item.quantity;

        const row =
            document.createElement("div");

        row.className = "cart-item";

        row.innerHTML = `
            <div class="cart-item-image">
                ${
                    item.image
                        ? `<img src="${escapeHTML(item.image)}"
                            style="width:100%;height:100%;object-fit:contain;border-radius:10px;">`
                        : (item.emoji || "📦")
                }
            </div>

            <div class="cart-item-info">
                <strong>
                    ${escapeHTML(item.name)}
                </strong>

                <span>
                    ₹${Number(item.price)}
                </span>

                <div class="quantity-controls">
                    <button
                        data-action="minus"
                        data-id="${item.id}"
                        type="button"
                    >
                        −
                    </button>

                    <span>
                        ${item.quantity}
                    </span>

                    <button
                        data-action="plus"
                        data-id="${item.id}"
                        type="button"
                    >
                        +
                    </button>
                </div>
            </div>
        `;

        container.appendChild(row);
    });

    if (totalElement) {
        totalElement.textContent = total;
    }

    container
        .querySelectorAll(
            ".quantity-controls button"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    changeQuantity(
                        Number(button.dataset.id),
                        button.dataset.action
                    );
                }
            );
        });

    updateCartCount();
}

function changeQuantity(productId, action) {
    const item =
        cart.find(
            product =>
                product.id === productId
        );

    if (!item) return;

    if (action === "plus") {
        item.quantity++;
    }

    if (action === "minus") {
        item.quantity--;

        if (item.quantity <= 0) {
            cart =
                cart.filter(
                    product =>
                        product.id !== productId
                );
        }
    }

    renderCart();
    updateCartCount();
}

// ==========================================
// CART OPEN / CLOSE
// ==========================================

function openCart() {
    const cartPanel = get("cartPanel");
    const overlay = get("overlay");

    if (cartPanel) {
        cartPanel.classList.add("open");
    }

    if (overlay) {
        overlay.classList.add("show");
    }
}

function closeCart() {
    const cartPanel = get("cartPanel");
    const overlay = get("overlay");

    if (cartPanel) {
        cartPanel.classList.remove("open");
    }

    if (overlay) {
        overlay.classList.remove("show");
    }
}

// ==========================================
// WISHLIST
// ==========================================

function toggleWishlist(productId) {
    if (wishlist.includes(productId)) {
        wishlist =
            wishlist.filter(
                id => id !== productId
            );
    } else {
        wishlist.push(productId);
    }

    renderProducts();
    renderWishlist();
}

function renderWishlist() {
    const container =
        get("wishlistProducts");

    if (!container) return;

    const items =
        getAllProducts().filter(
            product =>
                wishlist.includes(product.id)
        );

    container.innerHTML = "";

    if (items.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>♡</div>
                <h3>Your wishlist is empty</h3>
                <p>Products you like will appear here.</p>
            </div>
        `;

        return;
    }

    items.forEach(product => {
        const card =
            document.createElement("div");

        card.className = "product-card";

        card.innerHTML = `
            <div class="product-image">
                ${
                    product.image
                        ? `<img src="${escapeHTML(product.image)}"
                            style="width:100%;height:100%;object-fit:contain;border-radius:14px;">`
                        : (product.emoji || "📦")
                }
            </div>

            <div class="product-name">
                ${escapeHTML(product.name)}
            </div>

            <div class="product-unit">
                ${escapeHTML(product.category)}
            </div>

            <div class="product-bottom">
                <strong class="product-price">
                    ₹${Number(product.price)}
                </strong>

                <button
                    class="add-button"
                    data-id="${product.id}"
                    type="button"
                >
                    + Add
                </button>
            </div>
        `;

        container.appendChild(card);
    });

    container
        .querySelectorAll(".add-button")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    addToCart(
                        Number(button.dataset.id)
                    );
                }
            );
        });
}

// ==========================================
// SEARCH
// ==========================================

function setupSearch() {
    const searchInput =
        get("searchInput");

    if (!searchInput) return;

    searchInput.addEventListener(
        "input",
        () => {
            const query =
                searchInput.value
                    .trim()
                    .toLowerCase();

            if (!query) {
                renderProducts();
                return;
            }

            const results =
                getAllProducts().filter(
                    product =>
                        product.name
                            .toLowerCase()
                            .includes(query)
                        ||
                        product.category
                            .toLowerCase()
                            .includes(query)
                        ||
                        String(
                            product.description || ""
                        )
                            .toLowerCase()
                            .includes(query)
                );

            renderProducts(results);
        }
    );
}

// ==========================================
// ORDERS
// ==========================================

function renderOrders() {
    const container =
        get("ordersList");

    if (!container) return;

    container.innerHTML = "";

    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div>📦</div>
                <h3>No orders yet</h3>
                <p>Your placed orders will appear here.</p>
            </div>
        `;

        return;
    }

    orders.forEach(order => {
        const card =
            document.createElement("div");

        card.className = "order-card";

        const itemsText =
            order.items
                .map(
                    item =>
                        `${escapeHTML(item.name)} × ${item.quantity}`
                )
                .join(", ");

        card.innerHTML = `
            <div class="order-top">
                <strong>
                    Order #${order.id}
                </strong>

                <span class="order-status">
                    Confirmed
                </span>
            </div>

            <p class="order-products">
                ${itemsText}
            </p>

            <div class="order-bottom">
                <strong>
                    ₹${order.total}
                </strong>

                <span>
                    ${order.date}
                </span>
            </div>
        `;

        container.appendChild(card);
    });
}

// ==========================================
// ORDER TOAST
// ==========================================

function showOrderToast(productName) {
    const toast = get("orderToast");
    const toastText = get("toastText");

    if (!toast) return;

    if (toastText) {
        toastText.textContent =
            `Your ${productName} order has been confirmed.`;
    }

    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 5000);
}

// ==========================================
// PLACE ORDER
// ==========================================

function placeOrder() {
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    let total = 0;

    cart.forEach(item => {
        total +=
            Number(item.price) *
            item.quantity;
    });

    const order = {
        id: Date.now(),
        items: [...cart],
        total: total,
        date: new Date().toLocaleString()
    };

    orders.unshift(order);

    const firstProduct = cart[0];

    cart = [];

    renderCart();
    renderOrders();
    updateCartCount();

    showOrderToast(firstProduct.name);
}

// ==========================================
// ORDER TOAST CLICK
// ==========================================

function setupOrderToast() {
    const toast = get("orderToast");

    if (!toast) return;

    toast.addEventListener(
        "click",
        () => {
            toast.classList.remove("show");

            showPage("ordersPage");

            renderOrders();
        }
    );
}

// ==========================================
// MENU CATEGORY BUTTONS
// ==========================================

function setupMenuCategories() {
    document
        .querySelectorAll("[data-category]")
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    const category =
                        button.dataset.category;

                    if (!category) return;

                    currentCategory =
                        category;

                    renderCategories();
                    renderProducts();

                    showPage("homePage");
                }
            );
        });
}

// ==========================================
// VIEW ALL
// ==========================================

function setupViewAll() {
    const viewAll =
        get("viewAllButton");

    if (!viewAll) return;

    viewAll.addEventListener(
        "click",
        () => {
            currentCategory = "All";

            renderCategories();
            renderProducts();

            showPage("homePage");
        }
    );
}

// ==========================================
// OWNER MANAGEMENT
// ==========================================

function openAdmin() {
    const modal =
        get("ownerLoginModal");

    if (!modal) return;

    modal.classList.add("show");

    const input =
        get("ownerPasswordInput");

    const error =
        get("ownerLoginError");

    if (input) {
        input.value = "";

        setTimeout(
            () => input.focus(),
            100
        );
    }

    if (error) {
        error.textContent = "";
    }
}

function loginToAdmin() {
    const input =
        get("ownerPasswordInput");

    const error =
        get("ownerLoginError");

    const modal =
        get("ownerLoginModal");

    if (!input) return;

    if (
        input.value !==
        ADMIN_PASSWORD
    ) {
        if (error) {
            error.textContent =
                "Incorrect owner password.";
        }

        input.value = "";
        input.focus();

        return;
    }

    if (modal) {
        modal.classList.remove("show");
    }

    showOwnerPage();
}

function showOwnerPage() {
    document
        .querySelectorAll(".page")
        .forEach(page => {
            page.classList.remove("active");
            page.style.display = "none";
        });

    const adminPage =
        get("adminPage");

    if (adminPage) {
        adminPage.style.display = "block";
        adminPage.classList.add("active");
    }

    document
        .querySelectorAll(".nav-button")
        .forEach(button =>
            button.classList.remove("active")
        );

    renderAdminProducts();
    renderOwnerManagerControl();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function closeOwnerLogin() {
    const modal =
        get("ownerLoginModal");

    if (modal) {
        modal.classList.remove("show");
    }
}

// ---------- OWNER ADD PRODUCT ----------

function addOwnerProduct() {
    const nameInput =
        get("adminProductName");

    const priceInput =
        get("adminProductPrice");

    const categoryInput =
        get("adminProductCategory");

    const imageInput =
        get("adminProductImage");

    if (
        !nameInput ||
        !priceInput ||
        !categoryInput ||
        !imageInput
    ) return;

    const name =
        nameInput.value.trim();

    const price =
        Number(priceInput.value);

    const category =
        categoryInput.value.trim();

    const image =
        imageInput.value.trim();

    if (
        !name ||
        price <= 0 ||
        !category
    ) {
        alert(
            "Please enter product name, price and category."
        );

        return;
    }

    const product = {
        id: Date.now(),
        name,
        price,
        category,
        image,
        description: "",
        emoji: "🛍️",
        ownerType: "owner"
    };

    ownerProducts.push(product);

    saveOwnerProducts();

    nameInput.value = "";
    priceInput.value = "";
    categoryInput.value = "";
    imageInput.value = "";

    renderAdminProducts();
    refreshStore();

    alert(
        "Product added successfully!"
    );
}

// ---------- OWNER PRODUCTS ----------

function renderAdminProducts() {
    const list =
        get("adminProductList");

    if (!list) return;

    list.innerHTML = "";

    if (ownerProducts.length === 0) {
        list.innerHTML =
            "<p>No products added yet.</p>";

        return;
    }

    ownerProducts.forEach(product => {
        const item =
            document.createElement("div");

        item.className =
            "admin-product";

        item.innerHTML = `
            ${
                product.image
                    ? `
                        <img
                            src="${escapeHTML(product.image)}"
                            alt="${escapeHTML(product.name)}"
                        >
                    `
                    : `
                        <div
                            style="
                                width:55px;
                                height:55px;
                                background:#eee;
                                border-radius:10px;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                            "
                        >
                            🛍️
                        </div>
                    `
            }

            <div>
                <strong>
                    ${escapeHTML(product.name)}
                </strong>

                <br>

                ₹${Number(product.price)}

                <br>

                <small>
                    ${escapeHTML(product.category)}
                </small>
            </div>
        `;

        list.appendChild(item);
    });
}

// ==========================================
// OWNER MANAGER CONTROL
// ==========================================

function renderOwnerManagerControl() {
    const adminPage =
        get("adminPage");

    if (!adminPage) return;

    let box =
        get("ownerManagerControl");

    if (!box) {
        box =
            document.createElement("div");

        box.id =
            "ownerManagerControl";

        box.className =
            "admin-box";

        adminPage.appendChild(box);
    }

    box.innerHTML = `
        <h3>Manager Products</h3>

        <p style="opacity:.65;font-size:13px;">
            Owner control: remove products created by managers.
        </p>

        <div id="ownerManagerProductList"></div>
    `;

    const list =
        get("ownerManagerProductList");

    const managerItems =
        managerProducts.filter(
            product =>
                product.ownerType === "manager"
        );

    if (managerItems.length === 0) {
        list.innerHTML =
            "<p>No manager products yet.</p>";
        return;
    }

    managerItems.forEach(product => {
        const managerName =
            managerProfile.name ||
            "Manager";

        const item =
            document.createElement("div");

        item.style.cssText = `
            padding:12px 0;
            border-bottom:1px solid #eee;
            display:flex;
            align-items:center;
            gap:10px;
        `;

        item.innerHTML = `
            ${
                product.image
                    ? `
                        <img
                            src="${escapeHTML(product.image)}"
                            style="
                                width:50px;
                                height:50px;
                                object-fit:contain;
                                border-radius:10px;
                            "
                        >
                    `
                    : `
                        <div
                            style="
                                width:50px;
                                height:50px;
                                border-radius:10px;
                                background:#f2f2f2;
                                display:flex;
                                align-items:center;
                                justify-content:center;
                                font-size:24px;
                            "
                        >
                            📦
                        </div>
                    `
            }

            <div style="flex:1;">
                <strong>
                    ${escapeHTML(product.name)}
                </strong>

                <div>
                    ₹${Number(product.price)}
                </div>

                <small style="opacity:.6;">
                    ${escapeHTML(managerName)}
                </small>
            </div>

            <button
                class="owner-delete-manager-product"
                data-id="${product.id}"
                type="button"
                style="
                    border:none;
                    background:#ffe7e7;
                    color:#b00000;
                    border-radius:10px;
                    padding:8px 10px;
                    font-weight:700;
                "
            >
                Delete
            </button>
        `;

        list.appendChild(item);
    });

    list
        .querySelectorAll(
            ".owner-delete-manager-product"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    ownerDeleteManagerProduct(
                        Number(button.dataset.id)
                    );
                }
            );
        });
}

function ownerDeleteManagerProduct(productId) {
    const product =
        managerProducts.find(
            item =>
                Number(item.id) ===
                Number(productId)
        );

    if (!product) return;

    const confirmed =
        confirm(
            `Owner control:\nDelete "${product.name}"?`
        );

    if (!confirmed) return;

    managerProducts =
        managerProducts.filter(
            item =>
                Number(item.id) !==
                Number(productId)
        );

    saveManagerProducts();

    renderOwnerManagerControl();
    refreshStore();

    alert("Manager product deleted.");
}

// ==========================================
// MANAGER BUTTON
// ==========================================

function createManagerUI() {
    const accountCard =
        document.querySelector(
            ".account-card"
        );

    if (
        !accountCard ||
        get("managerModeButton")
    ) return;

    const button =
        document.createElement("button");

    button.id =
        "managerModeButton";

    button.className =
        "owner-access-button";

    button.innerHTML = `
        <div class="owner-icon">
            🧑‍💼
        </div>

        <div class="owner-info">
            <strong>
                ${managerMode
                    ? "Manager Mode"
                    : "Manager Access"
                }
            </strong>

            <small>
                ${
                    managerMode
                        ? "Add and manage your own products"
                        : "Enter manager code"
                }
            </small>
        </div>

        <span class="owner-arrow">
            ›
        </span>
    `;

    accountCard.appendChild(button);

    button.addEventListener(
        "click",
        () => {
            if (managerMode) {
                openManagerPage();
            } else {
                openManagerLogin();
            }
        }
    );
}

// ==========================================
// MANAGER LOGIN
// ==========================================

function openManagerLogin() {
    const old =
        get("managerLoginModal");

    if (old) {
        old.classList.add("show");

        const input =
            get("managerCodeInput");

        if (input) {
            input.focus();
        }

        return;
    }

    const modal =
        document.createElement("div");

    modal.id =
        "managerLoginModal";

    modal.className =
        "owner-login-modal show";

    modal.innerHTML = `
        <div class="owner-login-card">

            <button
                id="managerLoginClose"
                class="owner-login-close"
                type="button"
            >
                ×
            </button>

            <div class="owner-login-icon">
                🧑‍💼
            </div>

            <h2>
                Manager Access
            </h2>

            <p>
                Enter the manager code given by the owner.
            </p>

            <label>
                Manager code
            </label>

            <input
                id="managerCodeInput"
                type="password"
                placeholder="Enter manager code"
                autocomplete="off"
            >

            <button
                id="managerLoginButton"
                class="owner-login-button"
                type="button"
            >
                Continue
            </button>

            <p
                id="managerLoginError"
                class="owner-login-error"
            ></p>

        </div>
    `;

    document.body.appendChild(modal);

    const input =
        get("managerCodeInput");

    const loginButton =
        get("managerLoginButton");

    const closeButton =
        get("managerLoginClose");

    closeButton.addEventListener(
        "click",
        () => {
            modal.classList.remove("show");
        }
    );

    modal.addEventListener(
        "click",
        event => {
            if (event.target === modal) {
                modal.classList.remove("show");
            }
        }
    );

    loginButton.addEventListener(
        "click",
        loginManager
    );

    input.addEventListener(
        "keydown",
        event => {
            if (event.key === "Enter") {
                loginManager();
            }
        }
    );

    setTimeout(
        () => input.focus(),
        100
    );
}

function loginManager() {
    const input =
        get("managerCodeInput");

    const error =
        get("managerLoginError");

    if (!input) return;

    if (
        input.value.trim() !==
        MANAGER_CODE
    ) {
        if (error) {
            error.textContent =
                "Incorrect manager code.";
        }

        input.value = "";
        input.focus();

        return;
    }

    managerMode = true;

    localStorage.setItem(
        "managerMode",
        "true"
    );

    const modal =
        get("managerLoginModal");

    if (modal) {
        modal.classList.remove("show");
    }

    updateManagerButton();
    openManagerPage();
}

function updateManagerButton() {
    const button =
        get("managerModeButton");

    if (!button) return;

    const strong =
        button.querySelector("strong");

    const small =
        button.querySelector("small");

    if (strong) {
        strong.textContent =
            managerMode
                ? "Manager Mode"
                : "Manager Access";
    }

    if (small) {
        small.textContent =
            managerMode
                ? "Add and manage your own products"
                : "Enter manager code";
    }
}

// ==========================================
// MANAGER PAGE
// ==========================================

function openManagerPage() {
    let page =
        get("managerPage");

    if (!page) {
        page =
            document.createElement("section");

        page.id =
            "managerPage";

        page.className =
            "page";

        page.style.padding =
            "20px 12px 120px";

        page.innerHTML = `
            <div
                style="
                    display:flex;
                    align-items:center;
                    gap:12px;
                    margin-bottom:20px;
                "
            >
                <button
                    id="managerBackButton"
                    type="button"
                    style="
                        border:none;
                        background:#f2f2f2;
                        border-radius:12px;
                        padding:10px 14px;
                        font-size:20px;
                    "
                >
                    ←
                </button>

                <div>
                    <h2 style="margin:0;">
                        Manager Mode
                    </h2>

                    <small style="opacity:.6;">
                        Manage your own products
                    </small>
                </div>
            </div>

            <!-- MANAGER PROFILE -->
            <div
                style="
                    background:#fff;
                    border-radius:20px;
                    padding:18px;
                    box-shadow:0 6px 24px rgba(0,0,0,.07);
                    margin-bottom:18px;
                "
            >
                <h3>
                    Manager & Shop Details
                </h3>

                <input
                    id="managerName"
                    type="text"
                    placeholder="Your name"
                    style="width:100%;box-sizing:border-box;padding:13px;margin:6px 0;border:1px solid #ddd;border-radius:12px;"
                >

                <input
                    id="managerShopName"
                    type="text"
                    placeholder="Shop name"
                    style="width:100%;box-sizing:border-box;padding:13px;margin:6px 0;border:1px solid #ddd;border-radius:12px;"
                >

                <input
                    id="managerStoreType"
                    type="text"
                    placeholder="Store type e.g. Grocery, Bakery"
                    style="width:100%;box-sizing:border-box;padding:13px;margin:6px 0;border:1px solid #ddd;border-radius:12px;"
                >

                <textarea
                    id="managerShopDescription"
                    placeholder="Shop description"
                    rows="3"
                    style="width:100%;box-sizing:border-box;padding:13px;margin:6px 0;border:1px solid #ddd;border-radius:12px;resize:vertical;"
                ></textarea>

                <button
                    id="saveManagerProfileButton"
                    type="button"
                    style="
                        width:100%;
                        padding:14px;
                        border:none;
                        border-radius:14px;
                        background:#111;
                        color:white;
                        font-size:15px;
                        font-weight:700;
                        margin-top:8px;
                    "
                >
                    Save Shop Details
                </button>
            </div>

            <!-- ADD PRODUCT -->
            <div
                style="
                    background:#fff;
                    border-radius:20px;
                    padding:18px;
                    box-shadow:0 6px 24px rgba(0,0,0,.07);
                    margin-bottom:18px;
                "
            >
                <h3>
                    Add Product
                </h3>

                <input
                    id="managerProductName"
                    type="text"
                    placeholder="Product name"
                    style="width:100%;box-sizing:border-box;padding:13px;margin:6px 0;border:1px solid #ddd;border-radius:12px;"
                >

                <input
                    id="managerProductPrice"
                    type="number"
                    placeholder="Price"
                    style="width:100%;box-sizing:border-box;padding:13px;margin:6px 0;border:1px solid #ddd;border-radius:12px;"
                >

                <input
                    id="managerProductCategory"
                    type="text"
                    placeholder="Category"
                    style="width:100%;box-sizing:border-box;padding:13px;margin:6px 0;border:1px solid #ddd;border-radius:12px;"
                >

                <textarea
                    id="managerProductDescription"
                    placeholder="Product description"
                    rows="3"
                    style="width:100%;box-sizing:border-box;padding:13px;margin:6px 0;border:1px solid #ddd;border-radius:12px;resize:vertical;"
                ></textarea>

                <input
                    id="managerProductImage"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    style="width:100%;box-sizing:border-box;padding:10px;margin:8px 0;"
                >

                <small
                    style="display:block;opacity:.6;margin-bottom:10px;"
                >
                    📷 Choose camera to capture the product photo.
                </small>

                <div
                    id="managerImagePreview"
                    style="margin:10px 0;"
                ></div>

                <button
                    id="managerAddProductButton"
                    type="button"
                    style="
                        width:100%;
                        padding:14px;
                        border:none;
                        border-radius:14px;
                        background:#111;
                        color:white;
                        font-size:15px;
                        font-weight:700;
                    "
                >
                    + Add Product
                </button>
            </div>

            <!-- MY PRODUCTS -->
            <div
                style="
                    background:#fff;
                    border-radius:20px;
                    padding:18px;
                    box-shadow:0 6px 24px rgba(0,0,0,.07);
                "
            >
                <h3>
                    My Products
                </h3>

                <div
                    id="managerProductList"
                ></div>
            </div>
        `;

        document.body.appendChild(page);

        get("managerBackButton")
            .addEventListener(
                "click",
                () => {
                    page.classList.remove("active");
                    page.style.display = "none";

                    showPage("accountPage");
                }
            );

        get("saveManagerProfileButton")
            .addEventListener(
                "click",
                saveManagerProfileFromForm
            );

        get("managerAddProductButton")
            .addEventListener(
                "click",
                addManagerProduct
            );

        get("managerProductImage")
            .addEventListener(
                "change",
                previewManagerImage
            );
    }

    loadManagerProfileIntoForm();

    document
        .querySelectorAll(".page")
        .forEach(otherPage => {
            otherPage.classList.remove("active");
            otherPage.style.display = "none";
        });

    page.style.display = "block";
    page.classList.add("active");

    document
        .querySelectorAll(".nav-button")
        .forEach(button =>
            button.classList.remove("active")
        );

    renderManagerProducts();

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// ==========================================
// MANAGER PROFILE
// ==========================================

function loadManagerProfileIntoForm() {
    const name =
        get("managerName");

    const shop =
        get("managerShopName");

    const type =
        get("managerStoreType");

    const description =
        get("managerShopDescription");

    if (name) {
        name.value =
            managerProfile.name || "";
    }

    if (shop) {
        shop.value =
            managerProfile.shopName || "";
    }

    if (type) {
        type.value =
            managerProfile.storeType || "";
    }

    if (description) {
        description.value =
            managerProfile.description || "";
    }
}

function saveManagerProfileFromForm() {
    const name = get("managerName");
    const shop = get("managerShopName");
    const type = get("managerStoreType");
    const description = get("managerShopDescription");

    const managerName = name
        ? name.value.trim()
        : "";

    const shopName = shop
        ? shop.value.trim()
        : "";

    const storeType = type
        ? type.value.trim()
        : "";

    const shopDescription = description
        ? description.value.trim()
        : "";

    if (!managerName || !shopName || !storeType) {
        showOfficialPopup(
            "Missing Shop Details",
            "Please enter your name, shop name and store type before saving."
        );
        return;
    }

    managerProfile = {
        name: managerName,
        shopName: shopName,
        storeType: storeType,
        description: shopDescription
    };

    saveManagerProfile();
    renderManagerProducts();

    showOfficialPopup(
        "Shop Details Saved",
        `"${shopName}" details have been saved successfully.`
    );
}

// ==========================================
// CAMERA PREVIEW
// ==========================================

let managerCapturedImage = "";

function previewManagerImage(event) {
    const file =
        event.target.files[0];

    const preview =
        get("managerImagePreview");

    if (!file || !preview) return;

    const reader =
        new FileReader();

    reader.onload = function () {
        managerCapturedImage =
            reader.result;

        preview.innerHTML = `
            <img
                src="${escapeHTML(managerCapturedImage)}"
                alt="Product preview"
                style="
                    width:110px;
                    height:110px;
                    object-fit:contain;
                    border-radius:16px;
                    border:1px solid #eee;
                "
            >
        `;
    };

    reader.readAsDataURL(file);
}

// ==========================================
// ADD MANAGER PRODUCT
// ==========================================

function addManagerProduct() {
    const nameInput =
        get("managerProductName");

    const priceInput =
        get("managerProductPrice");

    const categoryInput =
        get("managerProductCategory");

    const descriptionInput =
        get("managerProductDescription");

    if (
        !nameInput ||
        !priceInput ||
        !categoryInput
    ) return;

    const name =
        nameInput.value.trim();

    const price =
        Number(priceInput.value);

    const category =
        categoryInput.value.trim();

    const description =
        descriptionInput
            ? descriptionInput.value.trim()
            : "";

    if (
        !name ||
        price <= 0 ||
        !category
    ) {
        alert(
            "Please enter product name, price and category."
        );

        return;
    }

    const product = {
        id:
            Date.now() +
            Math.floor(
                Math.random() * 1000
            ),

        name,
        price,
        category,
        description,

        image:
            managerCapturedImage,

        emoji: "📦",

        ownerType: "manager",

        managerId:
            managerId,

        managerName:
            managerProfile.name || "",

        shopName:
            managerProfile.shopName || ""
    };

    managerProducts.push(product);

    saveManagerProducts();

    nameInput.value = "";
    priceInput.value = "";
    categoryInput.value = "";

    if (descriptionInput) {
        descriptionInput.value = "";
    }

    const imageInput =
        get("managerProductImage");

    if (imageInput) {
        imageInput.value = "";
    }

    managerCapturedImage = "";

    const preview =
        get("managerImagePreview");

    if (preview) {
        preview.innerHTML = "";
    }

    renderManagerProducts();
    refreshStore();

showOfficialPopup(
    "Product Added",
    `"${product.name}" has been added to your store successfully.`
);
        
    
}

// ==========================================
// MANAGER OWN PRODUCTS
// ==========================================

function getMyManagerProducts() {
    return managerProducts.filter(
        product =>
            product.ownerType === "manager" &&
            product.managerId === managerId
    );
}

function renderManagerProducts() {
    const list =
        get("managerProductList");

    if (!list) return;

    list.innerHTML = "";

    const myProducts =
        getMyManagerProducts();

    if (myProducts.length === 0) {
        list.innerHTML = `
            <div
                style="
                    padding:20px 0;
                    opacity:.6;
                "
            >
                You haven't added any products yet.
            </div>
        `;

        return;
    }

    myProducts.forEach(product => {
        const item =
            document.createElement("div");

        item.style.cssText = `
            padding:14px 0;
            border-bottom:1px solid #eee;
            display:flex;
            align-items:center;
            gap:12px;
        `;

        const image =
            product.image
                ? `
                    <img
                        src="${escapeHTML(product.image)}"
                        style="
                            width:58px;
                            height:58px;
                            object-fit:contain;
                            border-radius:12px;
                            border:1px solid #eee;
                        "
                    >
                `
                : `
                    <div
                        style="
                            width:58px;
                            height:58px;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:#f3f3f3;
                            border-radius:12px;
                            font-size:28px;
                        "
                    >
                        📦
                    </div>
                `;

        item.innerHTML = `
            ${image}

            <div
                style="
                    flex:1;
                    min-width:0;
                "
            >
                <strong>
                    ${escapeHTML(product.name)}
                </strong>

                <div
                    style="
                        margin-top:3px;
                        font-weight:700;
                    "
                >
                    ₹${Number(product.price)}
                </div>

                <small style="opacity:.6;">
                    ${escapeHTML(product.category)}
                </small>

                ${
                    product.description
                        ? `
                            <div
                                style="
                                    font-size:11px;
                                    opacity:.55;
                                    margin-top:3px;
                                "
                            >
                                ${escapeHTML(product.description)}
                            </div>
                        `
                        : ""
                }
            </div>

            <div
                style="
                    display:flex;
                    flex-direction:column;
                    gap:6px;
                "
            >
                <button
                    class="manager-edit-button"
                    data-id="${product.id}"
                    type="button"
                    style="
                        border:none;
                        border-radius:9px;
                        padding:7px 10px;
                        background:#f1f1f1;
                    "
                >
                    ✏️ Edit
                </button>

                <button
                    class="manager-delete-button"
                    data-id="${product.id}"
                    type="button"
                    style="
                        border:none;
                        border-radius:9px;
                        padding:7px 10px;
                        background:#ffe8e8;
                        color:#b00000;
                    "
                >
                    🗑️ Delete
                </button>
            </div>
        `;

        list.appendChild(item);
    });

    list
        .querySelectorAll(
            ".manager-edit-button"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    editManagerProduct(
                        Number(
                            button.dataset.id
                        )
                    );
                }
            );
        });

    list
        .querySelectorAll(
            ".manager-delete-button"
        )
        .forEach(button => {
            button.addEventListener(
                "click",
                () => {
                    deleteManagerProduct(
                        Number(
                            button.dataset.id
                        )
                    );
                }
            );
        });
}

// ==========================================
// PROPER MANAGER EDIT
// ==========================================

function editManagerProduct(productId) {
    const product =
        managerProducts.find(
            item =>
                Number(item.id) ===
                    Number(productId) &&
                item.ownerType === "manager" &&
                item.managerId === managerId
        );

    if (!product) {
        alert(
            "You can only edit your own products."
        );
        return;
    }

    const oldModal =
        get("managerEditModal");

    if (oldModal) {
        oldModal.remove();
    }

    editManagerImage =
        product.image || "";

    const modal =
        document.createElement("div");

    modal.id =
        "managerEditModal";

    modal.style.cssText = `
        position:fixed;
        inset:0;
        z-index:10000;
        background:rgba(0,0,0,.48);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:18px;
    `;

    modal.innerHTML = `
        <div
            style="
                width:min(100%,390px);
                max-height:90vh;
                overflow-y:auto;
                background:#fff;
                border-radius:24px;
                padding:20px;
                box-shadow:0 20px 60px rgba(0,0,0,.2);
            "
        >
            <div
                style="
                    display:flex;
                    align-items:center;
                    justify-content:space-between;
                    gap:10px;
                "
            >
                <h2 style="margin:0;">
                    Edit Product
                </h2>

                <button
                    id="closeManagerEdit"
                    type="button"
                    style="
                        border:none;
                        background:#f2f2f2;
                        border-radius:10px;
                        width:38px;
                        height:38px;
                        font-size:22px;
                    "
                >
                    ×
                </button>
            </div>

            <label
                style="
                    display:block;
                    margin-top:18px;
                    font-size:13px;
                    font-weight:700;
                "
            >
                Product name
            </label>

            <input
                id="editManagerName"
                type="text"
                value="${escapeHTML(product.name)}"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:13px;
                    margin-top:6px;
                    border:1px solid #ddd;
                    border-radius:12px;
                "
            >

            <label
                style="
                    display:block;
                    margin-top:12px;
                    font-size:13px;
                    font-weight:700;
                "
            >
                Price
            </label>

            <input
                id="editManagerPrice"
                type="number"
                value="${Number(product.price)}"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:13px;
                    margin-top:6px;
                    border:1px solid #ddd;
                    border-radius:12px;
                "
            >

            <label
                style="
                    display:block;
                    margin-top:12px;
                    font-size:13px;
                    font-weight:700;
                "
            >
                Category
            </label>

            <input
                id="editManagerCategory"
                type="text"
                value="${escapeHTML(product.category)}"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:13px;
                    margin-top:6px;
                    border:1px solid #ddd;
                    border-radius:12px;
                "
            >

            <label
                style="
                    display:block;
                    margin-top:12px;
                    font-size:13px;
                    font-weight:700;
                "
            >
                Description
            </label>

            <textarea
                id="editManagerDescription"
                rows="3"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:13px;
                    margin-top:6px;
                    border:1px solid #ddd;
                    border-radius:12px;
                    resize:vertical;
                "
            >${escapeHTML(product.description || "")}</textarea>

            <label
                style="
                    display:block;
                    margin-top:12px;
                    font-size:13px;
                    font-weight:700;
                "
            >
                Change image
            </label>

            <input
                id="editManagerImage"
                type="file"
                accept="image/*"
                capture="environment"
                style="
                    width:100%;
                    box-sizing:border-box;
                    padding:10px;
                    margin-top:6px;
                "
            >

            <div
                id="editManagerImagePreview"
                style="
                    margin-top:12px;
                    text-align:center;
                "
            >
                ${
                    product.image
                        ? `
                            <img
                                src="${escapeHTML(product.image)}"
                                style="
                                    width:120px;
                                    height:120px;
                                    object-fit:contain;
                                    border-radius:16px;
                                    border:1px solid #eee;
                                "
                            >
                        `
                        : `
                            <div
                                style="
                                    opacity:.5;
                                    padding:20px;
                                "
                            >
                                No image
                            </div>
                        `
                }
            </div>

            <button
                id="saveManagerEdit"
                type="button"
                style="
                    width:100%;
                    padding:14px;
                    margin-top:18px;
                    border:none;
                    border-radius:14px;
                    background:#111;
                    color:#fff;
                    font-size:15px;
                    font-weight:700;
                "
            >
                💾 Save Changes
            </button>

            <button
                id="deleteFromEdit"
                type="button"
                style="
                    width:100%;
                    padding:13px;
                    margin-top:8px;
                    border:none;
                    border-radius:14px;
                    background:#ffe7e7;
                    color:#b00000;
                    font-size:14px;
                    font-weight:700;
                "
            >
                🗑️ Delete Product
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    get("closeManagerEdit")
        .addEventListener(
            "click",
            () => modal.remove()
        );

    modal.addEventListener(
        "click",
        event => {
            if (event.target === modal) {
                modal.remove();
            }
        }
    );

    get("editManagerImage")
        .addEventListener(
            "change",
            event => {
                const file =
                    event.target.files[0];

                if (!file) return;

                const reader =
                    new FileReader();

                reader.onload = function () {
                    editManagerImage =
                        reader.result;

                    get(
                        "editManagerImagePreview"
                    ).innerHTML = `
                        <img
                            src="${escapeHTML(editManagerImage)}"
                            style="
                                width:120px;
                                height:120px;
                                object-fit:contain;
                                border-radius:16px;
                                border:1px solid #eee;
                            "
                        >
                    `;
                };

                reader.readAsDataURL(file);
            }
        );

    get("saveManagerEdit")
        .addEventListener(
            "click",
            () => {
                saveManagerProductEdit(
                    productId
                );
            }
        );

    get("deleteFromEdit")
        .addEventListener(
            "click",
            () => {
                modal.remove();
                deleteManagerProduct(productId);
            }
        );
}

// ==========================================
// SAVE MANAGER EDIT
// ==========================================

function saveManagerProductEdit(productId) {
    const product =
        managerProducts.find(
            item =>
                Number(item.id) ===
                    Number(productId) &&
                item.ownerType === "manager" &&
                item.managerId === managerId
        );

    if (!product) {
        alert(
            "You can only edit your own products."
        );
        return;
    }

    const name =
        get("editManagerName");

    const price =
        get("editManagerPrice");

    const category =
        get("editManagerCategory");

    const description =
        get("editManagerDescription");

    if (!name || !price || !category) {
        return;
    }

    const newName =
        name.value.trim();

    const newPrice =
        Number(price.value);

    const newCategory =
        category.value.trim();

    const newDescription =
        description
            ? description.value.trim()
            : "";

    if (
        !newName ||
        newPrice <= 0 ||
        !newCategory
    ) {
        alert(
            "Please enter a valid name, price and category."
        );
        return;
    }

    product.name =
        newName;

    product.price =
        newPrice;

    product.category =
        newCategory;

    product.description =
        newDescription;

    product.image =
        editManagerImage;

    product.managerName =
        managerProfile.name || "";

    product.shopName =
        managerProfile.shopName || "";

    saveManagerProducts();

    const modal =
        get("managerEditModal");

    if (modal) {
        modal.remove();
    }

    renderManagerProducts();
    refreshStore();

    alert(
        "Product updated successfully!"
    );
}

// ==========================================
// DELETE MANAGER PRODUCT
// ==========================================

function deleteManagerProduct(productId) {

    const product = managerProducts.find(
        item =>
            Number(item.id) === Number(productId) &&
            item.ownerType === "manager" &&
            item.managerId === managerId
    );

    if (!product) {
        alert("Product not found.");
        return;
    }

    managerProducts = managerProducts.filter(
        item =>
            !(
                Number(item.id) === Number(productId) &&
                item.ownerType === "manager" &&
                item.managerId === managerId
            )
    );

    saveManagerProducts();

    renderManagerProducts();
    refreshStore();

    showOfficialPopup(
    "Product Deleted",
    `"${product.name}" has been removed from your products.`
);
}
// ==========================================
// REFRESH STORE
// ==========================================

function refreshStore() {
    renderCategories();
    renderProducts();
    renderWishlist();
}

// ==========================================
// CART BUTTON SETUP
// ==========================================

function setupCartButtons() {
    const cartButton =
        get("cartButton");

    const closeButton =
        get("closeCartButton");

    const overlay =
        get("overlay");

    const checkoutButton =
        get("checkoutButton");

    if (cartButton) {
        cartButton.addEventListener(
            "click",
            openCart
        );
    }

    if (closeButton) {
        closeButton.addEventListener(
            "click",
            closeCart
        );
    }

    if (overlay) {
        overlay.addEventListener(
            "click",
            closeCart
        );
    }

    if (checkoutButton) {
        checkoutButton.addEventListener(
            "click",
            placeOrder
        );
    }
}

// ==========================================
// APP START
// ==========================================

function initApp() {
    renderCategories();
    renderProducts();
    renderCart();
    renderWishlist();
    renderOrders();

    setupNavigation();
    setupSearch();
    setupOrderToast();
    setupMenuCategories();
    setupViewAll();
    setupCartButtons();

    // OWNER BUTTON
    const ownerAccessButton =
        get("ownerAccessButton");

    if (ownerAccessButton) {
        ownerAccessButton.addEventListener(
            "click",
            openAdmin
        );
    }

    // OWNER LOGIN
    const ownerLoginButton =
        get("ownerLoginButton");

    if (ownerLoginButton) {
        ownerLoginButton.addEventListener(
            "click",
            loginToAdmin
        );
    }

    // CLOSE OWNER LOGIN
    const closeOwnerLoginButton =
        get("closeOwnerLogin");

    if (closeOwnerLoginButton) {
        closeOwnerLoginButton.addEventListener(
            "click",
            closeOwnerLogin
        );
    }

    // OWNER PASSWORD ENTER
    const ownerPasswordInput =
        get("ownerPasswordInput");

    if (ownerPasswordInput) {
        ownerPasswordInput.addEventListener(
            "keydown",
            event => {
                if (event.key === "Enter") {
                    loginToAdmin();
                }
            }
        );
    }

    // OWNER ADD PRODUCT
    const addProductButton =
        get("addProductButton");

    if (addProductButton) {
        addProductButton.addEventListener(
            "click",
            addOwnerProduct
        );
    }

    // OWNER BACK
    const adminBackButton =
        get("adminBackButton");

    if (adminBackButton) {
        adminBackButton.addEventListener(
            "click",
            () => {
                const adminPage =
                    get("adminPage");

                if (adminPage) {
                    adminPage.classList.remove(
                        "active"
                    );

                    adminPage.style.display =
                        "none";
                }

                showPage("accountPage");
            }
        );
    }
const bqSuccessButton = get("bqSuccessButton");

if (bqSuccessButton) {
    bqSuccessButton.addEventListener("click", () => {
        const popup = get("bqSuccessPopup");

        if (popup) {
            popup.classList.remove("show");
        }
    });
}
    // MANAGER
    createManagerUI();

    // HOME
    showPage("homePage");

    updateCartCount();
}

// ==========================================
// START
// ==========================================
function showOfficialPopup(title, message) {
    const popup = get("bqSuccessPopup");
    const titleElement = get("bqSuccessTitle");
    const messageElement = get("bqSuccessMessage");

    if (!popup) return;

    if (titleElement) {
        titleElement.textContent = title;
    }

    if (messageElement) {
        messageElement.textContent = message;
    }

    popup.classList.add("show");
}

document.addEventListener(
    "DOMContentLoaded",
    initApp
);
// ==========================================
// PRODUCT DETAILS PATCH
// ==========================================

let productDetailQuantity = 1;
let productDetailCurrentId = null;


// ---------- PRODUCT UNIT ----------

function getDetailUnit(product) {

    const name =
        product.name.toLowerCase();

    if (name.includes("rice")) {
        return "1 kg";
    }

    if (name.includes("egg")) {
        return "1 egg";
    }

    if (name.includes("milk")) {
        return "1 packet";
    }

    if (name.includes("oil")) {
        return "1 litre";
    }

    if (name.includes("bread")) {
        return "1 packet";
    }

    if (name.includes("shampoo")) {
        return "1 bottle";
    }

    if (name.includes("soap")) {
        return "1 piece";
    }

    return "1 unit";
}


// ---------- DESCRIPTION ----------

function getDetailDescription(product) {

    if (product.description) {
        return product.description;
    }

    const name =
        product.name.toLowerCase();

    if (name.includes("milk")) {
        return "Fresh quality milk for your everyday needs.";
    }

    if (name.includes("bread")) {
        return "Fresh and soft bread, perfect for breakfast and snacks.";
    }

    if (name.includes("egg")) {
        return "Fresh eggs for breakfast and everyday cooking.";
    }

    if (name.includes("potato")) {
        return "Fresh potatoes for your everyday meals.";
    }

    if (name.includes("tomato")) {
        return "Fresh tomatoes selected for everyday cooking.";
    }

    if (name.includes("banana")) {
        return "Fresh bananas, naturally sweet and ready to enjoy.";
    }

    if (name.includes("apple")) {
        return "Fresh and delicious apples for a tasty snack.";
    }

    if (name.includes("biscuit")) {
        return "Tasty biscuits perfect for tea-time snacks.";
    }

    if (name.includes("chips")) {
        return "Crunchy potato chips for your snack time.";
    }

    if (name.includes("soap")) {
        return "Everyday personal-care soap.";
    }

    if (name.includes("shampoo")) {
        return "Hair-care shampoo for everyday use.";
    }

    if (name.includes("rice")) {
        return "Quality rice for everyday family meals.";
    }

    return `Good quality ${product.name} available from your local store.`;
}


// ---------- OPEN DETAILS ----------

function openProductDetails(productId) {

    const product =
        findProduct(productId);

    if (!product) return;

    productDetailCurrentId =
        Number(productId);

    productDetailQuantity = 1;

    let overlay =
        get("productDetailOverlay");

    if (!overlay) {

        overlay =
            document.createElement("div");

        overlay.id =
            "productDetailOverlay";

        overlay.className =
            "product-detail-overlay";

        document.body.appendChild(
            overlay
        );

        overlay.addEventListener(
            "click",
            function(event) {

                if (
                    event.target === overlay
                ) {
                    closeProductDetails();
                }
            }
        );
    }

    renderProductDetailScreen(product);

    overlay.classList.add("show");
}


// ---------- DETAIL SCREEN ----------

function renderProductDetailScreen(product) {

    const overlay =
        get("productDetailOverlay");

    if (!overlay) return;

    const similarProducts =
        getAllProducts()
            .filter(
                item =>
                    Number(item.id) !==
                        Number(product.id) &&
                    item.category ===
                        product.category
            )
            .slice(0, 6);


    const imageHTML =
        product.image
            ? `
                <img
                    src="${escapeHTML(product.image)}"
                    alt="${escapeHTML(product.name)}"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:contain;
                        border-radius:20px;
                    "
                >
            `
            : `
                <div
                    style="
                        font-size:90px;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        width:100%;
                        height:100%;
                    "
                >
                    ${product.emoji || "📦"}
                </div>
            `;


    overlay.innerHTML = `

        <div class="product-detail-card">

            <button
                id="productDetailClose"
                type="button"
                style="
                    position:absolute;
                    top:14px;
                    right:14px;
                    width:40px;
                    height:40px;
                    border:none;
                    border-radius:50%;
                    background:#fff;
                    box-shadow:0 4px 15px rgba(0,0,0,.12);
                    font-size:25px;
                    z-index:5;
                "
            >
                ×
            </button>


            <div
                style="
                    height:300px;
                    background:#f7f7f7;
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    padding:20px;
                    box-sizing:border-box;
                "
            >
                ${imageHTML}
            </div>


            <div
                style="
                    padding:20px;
                "
            >

                <div
                    style="
                        font-size:12px;
                        color:#777;
                        margin-bottom:6px;
                    "
                >
                    ${escapeHTML(product.category)}
                </div>


                <h2
                    style="
                        margin:0 0 8px;
                        font-size:25px;
                    "
                >
                    ${escapeHTML(product.name)}
                </h2>


                <div
                    style="
                        display:flex;
                        align-items:center;
                        gap:8px;
                        margin-bottom:12px;
                    "
                >
                    <span
                        style="
                            color:#f5a623;
                            font-size:17px;
                        "
                    >
                        ★★★★★
                    </span>

                    <span
                        style="
                            font-size:13px;
                            color:#777;
                        "
                    >
                        4.8 · 120+ ratings
                    </span>
                </div>


                <div
                    style="
                        font-size:26px;
                        font-weight:800;
                        margin-bottom:4px;
                    "
                >
                    ₹${Number(product.price)}
                </div>


                <div
                    style="
                        color:#777;
                        font-size:13px;
                        margin-bottom:18px;
                    "
                >
                    ${getDetailUnit(product)}
                </div>


                <p
                    style="
                        line-height:1.6;
                        color:#555;
                        margin-bottom:20px;
                    "
                >
                    ${escapeHTML(
                        getDetailDescription(product)
                    )}
                </p>


                <div
                    style="
                        display:flex;
                        align-items:center;
                        justify-content:space-between;
                        margin-bottom:18px;
                    "
                >

                    <strong>
                        Quantity
                    </strong>


                    <div
                        style="
                            display:flex;
                            align-items:center;
                            border:1px solid #ddd;
                            border-radius:12px;
                            overflow:hidden;
                        "
                    >

                        <button
                            id="detailQuantityMinus"
                            type="button"
                            style="
                                width:42px;
                                height:40px;
                                border:none;
                                background:#f5f5f5;
                                font-size:20px;
                            "
                        >
                            −
                        </button>


                        <span
                            id="detailQuantityNumber"
                            style="
                                width:40px;
                                text-align:center;
                                font-weight:700;
                            "
                        >
                            1
                        </span>


                        <button
                            id="detailQuantityPlus"
                            type="button"
                            style="
                                width:42px;
                                height:40px;
                                border:none;
                                background:#f5f5f5;
                                font-size:20px;
                            "
                        >
                            +
                        </button>

                    </div>

                </div>


                <div
                    style="
                        display:flex;
                        gap:10px;
                    "
                >

                    <button
                        id="detailAddToCart"
                        type="button"
                        style="
                            flex:1;
                            padding:15px 10px;
                            border:none;
                            border-radius:14px;
                            background:#f1f1f1;
                            font-weight:700;
                            font-size:14px;
                        "
                    >
                        🛒 Add to Cart
                    </button>


                    <button
                        id="detailOrderNow"
                        type="button"
                        style="
                            flex:1;
                            padding:15px 10px;
                            border:none;
                            border-radius:14px;
                            background:#111;
                            color:#fff;
                            font-weight:700;
                            font-size:14px;
                        "
                    >
                        Order Now
                    </button>

                </div>


                ${
                    similarProducts.length
                        ? `

                            <div
                                style="
                                    margin-top:28px;
                                "
                            >

                                <h3
                                    style="
                                        margin-bottom:14px;
                                    "
                                >
                                    You may also like
                                </h3>


                                <div
                                    style="
                                        display:grid;
                                        grid-template-columns:
                                            repeat(2, minmax(0,1fr));
                                        gap:10px;
                                    "
                                >

                                    ${
                                        similarProducts
                                            .map(
                                                item => `

                                                    <div
                                                        class="detail-similar-product"
                                                        data-product-id="${item.id}"
                                                        style="
                                                            border:1px solid #eee;
                                                            border-radius:15px;
                                                            padding:10px;
                                                            background:#fff;
                                                            cursor:pointer;
                                                        "
                                                    >

                                                        <div
                                                            style="
                                                                height:100px;
                                                                background:#f7f7f7;
                                                                border-radius:12px;
                                                                display:flex;
                                                                align-items:center;
                                                                justify-content:center;
                                                                overflow:hidden;
                                                                margin-bottom:8px;
                                                            "
                                                        >

                                                            ${
                                                                item.image
                                                                    ? `
                                                                        <img
                                                                            src="${escapeHTML(item.image)}"
                                                                            alt="${escapeHTML(item.name)}"
                                                                            style="
                                                                                width:100%;
                                                                                height:100%;
                                                                                object-fit:contain;
                                                                            "
                                                                        >
                                                                    `
                                                                    : `
                                                                        <span
                                                                            style="
                                                                                font-size:45px;
                                                                            "
                                                                        >
                                                                            ${item.emoji || "📦"}
                                                                        </span>
                                                                    `
                                                            }

                                                        </div>


                                                        <strong
                                                            style="
                                                                display:block;
                                                                font-size:14px;
                                                            "
                                                        >
                                                            ${escapeHTML(item.name)}
                                                        </strong>


                                                        <span
                                                            style="
                                                                display:block;
                                                                margin-top:5px;
                                                                font-weight:700;
                                                            "
                                                        >
                                                            ₹${Number(item.price)}
                                                        </span>

                                                    </div>
                                                `
                                            )
                                            .join("")
                                    }

                                </div>

                            </div>

                        `
                        : ""
                }

            </div>

        </div>
    `;


    // CLOSE

    get("productDetailClose")
        ?.addEventListener(
            "click",
            closeProductDetails
        );


    // MINUS

    get("detailQuantityMinus")
        ?.addEventListener(
            "click",
            function() {

                if (
                    productDetailQuantity > 1
                ) {

                    productDetailQuantity--;

                    updateProductDetailQuantity();
                }
            }
        );


    // PLUS

    get("detailQuantityPlus")
        ?.addEventListener(
            "click",
            function() {

                productDetailQuantity++;

                updateProductDetailQuantity();
            }
        );


    // ADD TO CART

    get("detailAddToCart")
        ?.addEventListener(
            "click",
            function() {

                for (
                    let i = 0;
                    i < productDetailQuantity;
                    i++
                ) {

                    addToCart(
                        product.id
                    );
                }

                closeProductDetails();
            }
        );


    // ORDER NOW

    get("detailOrderNow")
        ?.addEventListener(
            "click",
            function() {

                for (
                    let i = 0;
                    i < productDetailQuantity;
                    i++
                ) {

                    addToCart(
                        product.id
                    );
                }

                closeProductDetails();

                openCart();
            }
        );


    // SIMILAR PRODUCTS

    overlay
        .querySelectorAll(
            ".detail-similar-product"
        )
        .forEach(card => {

            card.addEventListener(
                "click",
                function() {

                    openProductDetails(
                        Number(
                            card.dataset.productId
                        )
                    );
                }
            );
        });
}


// ---------- QUANTITY ----------

function updateProductDetailQuantity() {

    const number =
        get("detailQuantityNumber");

    if (number) {

        number.textContent =
            productDetailQuantity;
    }
}


// ---------- CLOSE ----------

function closeProductDetails() {

    const overlay =
        get("productDetailOverlay");

    if (overlay) {

        overlay.classList.remove(
            "show"
        );
    }

    productDetailCurrentId =
        null;

    productDetailQuantity =
        1;
}


// ==========================================
// CONNECT PRODUCT CARDS
// ==========================================
//
// This wraps your EXISTING renderProducts()
// so we don't replace your working product,
// cart, wishlist or manager code.
//

const originalBharapurRenderProducts =
    renderProducts;


renderProducts = function(list = null) {

    originalBharapurRenderProducts(list);

    const container =
        get("productContainer");

    if (!container) return;


    container
        .querySelectorAll(
            ".product-card"
        )
        .forEach(card => {

            if (
                card.dataset.detailReady ===
                "true"
            ) {
                return;
            }

            card.dataset.detailReady =
                "true";


            card.addEventListener(
                "click",
                function(event) {

                    // Don't open details when
                    // Add button is pressed.

                    if (
                        event.target.closest(
                            ".add-button"
                        )
                    ) {
                        return;
                    }


                    // Don't open details when
                    // Wishlist is pressed.

                    if (
                        event.target.closest(
                            ".wishlist-button"
                        )
                    ) {
                        return;
                    }


                    const addButton =
                        card.querySelector(
                            ".add-button"
                        );

                    if (!addButton) return;


                    const productId =
                        Number(
                            addButton.dataset.id
                        );


                    if (
                        Number.isFinite(
                            productId
                        )
                    ) {

                        openProductDetails(
                            productId
                        );
                    }
                }
            );
        });
};


// ==========================================
// MAKE WISHLIST CARDS OPEN DETAILS TOO
// ==========================================

const originalBharapurRenderWishlist =
    renderWishlist;


renderWishlist = function() {

    originalBharapurRenderWishlist();

    const container =
        get("wishlistProducts");

    if (!container) return;


    container
        .querySelectorAll(
            ".product-card"
        )
        .forEach(card => {

            if (
                card.dataset.detailReady ===
                "true"
            ) {
                return;
            }

            card.dataset.detailReady =
                "true";


            card.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target.closest(
                            ".add-button"
                        )
                    ) {
                        return;
                    }


                    const addButton =
                        card.querySelector(
                            ".add-button"
                        );

                    if (!addButton) return;


                    const productId =
                        Number(
                            addButton.dataset.id
                        );


                    if (
                        Number.isFinite(
                            productId
                        )
                    ) {

                        openProductDetails(
                            productId
                        );
                    }
                }
            );
        });
};    
/* =========================================================
   BHARAPUR QUICK - FINAL BUTTON FIX
   Paste this whole block at the VERY BOTTOM of script.js
   ========================================================= */

(function () {
    "use strict";

    function BQget(id) {
        return document.getElementById(id);
    }

    function BQpopup(title, message) {
        const popup = BQget("bqSuccessPopup");
        const titleEl = BQget("bqSuccessTitle");
        const messageEl = BQget("bqSuccessMessage");
        const button = BQget("bqSuccessButton");

        if (!popup) {
            console.error("Bharapur Quick: bqSuccessPopup not found.");
            return;
        }

        if (titleEl) {
            titleEl.textContent = title;
        }

        if (messageEl) {
            messageEl.textContent = message;
        }

        popup.classList.add("show");
        popup.style.display = "flex";

        if (button) {
            button.onclick = function () {
                popup.classList.remove("show");
                popup.style.display = "";
            };
        }
    }


    /* ---------------------------------------------------------
       SAVE SHOP DETAILS
       --------------------------------------------------------- */

    window.saveManagerProfileFromForm = function () {
        const name = BQget("managerName");
        const shop = BQget("managerShopName");
        const type = BQget("managerStoreType");
        const description = BQget("managerShopDescription");

        const managerName = name ? name.value.trim() : "";
        const shopName = shop ? shop.value.trim() : "";
        const storeType = type ? type.value.trim() : "";
        const shopDescription = description
            ? description.value.trim()
            : "";

        if (!managerName || !shopName || !storeType) {
            BQpopup(
                "Missing Shop Details",
                "Please enter your name, shop name and store type before saving."
            );
            return;
        }

        /* Save shop information */
        if (typeof managerProfile !== "undefined") {
            managerProfile = {
                name: managerName,
                shopName: shopName,
                storeType: storeType,
                description: shopDescription
            };

            if (typeof saveManagerProfile === "function") {
                saveManagerProfile();
            }
        } else {
            localStorage.setItem(
                "bharapurManagerProfile",
                JSON.stringify({
                    name: managerName,
                    shopName: shopName,
                    storeType: storeType,
                    description: shopDescription
                })
            );
        }

        /* Refresh products if available */
        if (typeof renderManagerProducts === "function") {
            renderManagerProducts();
        }

        /* SUCCESS POPUP */
        BQpopup(
            "Shop Details Saved",
            '"' + shopName + '" details have been saved successfully.'
        );
    };


    /* ---------------------------------------------------------
       CUSTOM PRODUCT VALIDATION
       --------------------------------------------------------- */

    window.addManagerProduct = function () {
        const nameEl = BQget("managerProductName");
        const priceEl = BQget("managerProductPrice");
        const categoryEl = BQget("managerProductCategory");
        const descriptionEl = BQget("managerProductDescription");

        const name = nameEl ? nameEl.value.trim() : "";
        const price = priceEl ? priceEl.value.trim() : "";
        const category = categoryEl ? categoryEl.value.trim() : "";
        const description = descriptionEl
            ? descriptionEl.value.trim()
            : "";

        /* Missing details */
        if (!name || !price || !category) {
            BQpopup(
                "Missing Product Details",
                "Please enter the product name, price and category before adding it."
            );
            return;
        }

        /* Find existing product array */
        if (typeof managerProducts === "undefined") {
            window.managerProducts = [];
        }

        const product = {
            id: Date.now(),
            name: name,
            price: Number(price),
            category: category,
            description: description
        };

        managerProducts.push(product);

        /* Save products */
        try {
            localStorage.setItem(
                "bharapurManagerProducts",
                JSON.stringify(managerProducts)
            );
        } catch (error) {
            console.error(
                "Bharapur Quick: Could not save product.",
                error
            );
        }

        /* Refresh product list */
        if (typeof renderManagerProducts === "function") {
            renderManagerProducts();
        }

        /* Clear fields */
        if (nameEl) nameEl.value = "";
        if (priceEl) priceEl.value = "";
        if (categoryEl) categoryEl.value = "";
        if (descriptionEl) descriptionEl.value = "";

        /* SUCCESS POPUP */
        BQpopup(
            "Product Added",
            '"' + name + '" has been added to your shop successfully.'
        );
    };


    /* ---------------------------------------------------------
       MAKE POPUP FUNCTION AVAILABLE
       --------------------------------------------------------- */

    window.showOfficialPopup = BQpopup;


    /* ---------------------------------------------------------
       FORCE SAVE BUTTON TO USE NEW FUNCTION
       --------------------------------------------------------- */

    document.addEventListener("click", function (event) {

        const button = event.target.closest("#saveManagerProfileButton");

        if (button) {
            event.preventDefault();
            event.stopImmediatePropagation();

            window.saveManagerProfileFromForm();
        }

    }, true);


    /* ---------------------------------------------------------
       FORCE ADD PRODUCT BUTTON TO USE NEW FUNCTION
       --------------------------------------------------------- */

    document.addEventListener("click", function (event) {

        const button = event.target.closest(
            "#addManagerProductButton"
        );

        if (button) {
            event.preventDefault();
            event.stopImmediatePropagation();

            window.addManagerProduct();
        }

    }, true);


    console.log(
        "Bharapur Quick: Final button fix loaded successfully."
    );

})();
/* BHARAPUR QUICK - BUTTON & POPUP FIX */

(function () {
    function getBQ(id) {
        return document.getElementById(id);
    }

    window.showOfficialPopup = function (title, message) {
        const popup = getBQ("bqSuccessPopup");
        const titleEl = getBQ("bqSuccessTitle");
        const messageEl = getBQ("bqSuccessMessage");

        if (!popup) return;

        if (titleEl) titleEl.textContent = title;
        if (messageEl) messageEl.textContent = message;

        popup.classList.add("show");
    };

    function setupPopup() {
        const button = getBQ("bqSuccessButton");
        if (!button || button.dataset.bqReady) return;

        button.dataset.bqReady = "true";

        button.addEventListener("click", function () {
            const popup = getBQ("bqSuccessPopup");
            if (popup) popup.classList.remove("show");
        });
    }

    window.saveManagerProfileFromForm = function () {
        const name = getBQ("managerName");
        const shop = getBQ("managerShopName");
        const type = getBQ("managerStoreType");
        const description = getBQ("managerShopDescription");

        const managerName = name ? name.value.trim() : "";
        const shopName = shop ? shop.value.trim() : "";
        const storeType = type ? type.value.trim() : "";
        const shopDescription = description
            ? description.value.trim()
            : "";

        if (!managerName || !shopName || !storeType) {
            showOfficialPopup(
                "Missing Shop Details",
                "Please enter your name, shop name and store type before saving."
            );
            return;
        }

        managerProfile = {
            name: managerName,
            shopName: shopName,
            storeType: storeType,
            description: shopDescription
        };

        saveManagerProfile();

        if (typeof renderManagerProducts === "function") {
            renderManagerProducts();
        }

        showOfficialPopup(
            "Shop Details Saved",
            '"' + shopName + '" details have been saved successfully.'
        );
    };

    function setupButtons() {
        setupPopup();

        const saveButton = getBQ("saveManagerProfileButton");

        if (saveButton && !saveButton.dataset.bqReady) {
            saveButton.dataset.bqReady = "true";

            saveButton.addEventListener("click", function () {
                window.saveManagerProfileFromForm();
            });
        }

        const addButton = getBQ("addProductButton");

        if (addButton && !addButton.dataset.bqReady) {
            addButton.dataset.bqReady = "true";

            addButton.addEventListener("click", function () {
                const nameInput = getBQ("adminProductName");
                const priceInput = getBQ("adminProductPrice");
                const categoryInput = getBQ("adminProductCategory");
                const imageInput = getBQ("adminProductImage");

                const name = nameInput ? nameInput.value.trim() : "";
                const price = priceInput ? priceInput.value.trim() : "";
                const category = categoryInput
                    ? categoryInput.value.trim()
                    : "";
                const image = imageInput ? imageInput.value.trim() : "";

                if (!name || !price || !category) {
                    showOfficialPopup(
                        "Missing Product Details",
                        "Please enter the product name, price and category."
                    );
                    return;
                }

                const numericPrice = Number(price);

                if (!Number.isFinite(numericPrice) || numericPrice <= 0) {
                    showOfficialPopup(
                        "Invalid Price",
                        "Please enter a valid price greater than zero."
                    );
                    return;
                }

                const product = {
                    id: Date.now(),
                    name: name,
                    price: numericPrice,
                    category: category,
                    image: image,
                    emoji: "📦",
                    ownerType: "manager",
                    managerId: managerId
                };

                managerProducts.push(product);
                saveManagerProducts();

                if (nameInput) nameInput.value = "";
                if (priceInput) priceInput.value = "";
                if (categoryInput) categoryInput.value = "";
                if (imageInput) imageInput.value = "";

                if (typeof renderManagerProducts === "function") {
                    renderManagerProducts();
                }

                if (typeof renderProducts === "function") {
                    renderProducts();
                }

                if (typeof renderCategories === "function") {
                    renderCategories();
                }

                showOfficialPopup(
                    "Product Added",
                    '"' + name + '" has been added successfully.'
                );
            });
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", setupButtons);
    } else {
        setupButtons();
    }

    const observer = new MutationObserver(function () {
        setupButtons();
    });

    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
})();
/* =========================================================
   BHARAPUR QUICK - ADDRESS + ORDER SYSTEM
   ========================================================= */

(function () {
    "use strict";

    function BQOrderGet(id) {
        return document.getElementById(id);
    }

    function BQOrderDeliveryCharge(subtotal) {
        if (subtotal < 60) return 5;
        if (subtotal < 100) return 7;
        return 10;
    }

    function BQOrderAddressPopup() {
        const old = BQOrderGet("bqOrderAddressModal");

        if (old) {
            old.remove();
        }

        const modal = document.createElement("div");

        modal.id = "bqOrderAddressModal";

        modal.style.cssText = `
            position:fixed;
            inset:0;
            z-index:100000;
            background:rgba(0,0,0,.55);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:18px;
            box-sizing:border-box;
        `;

        modal.innerHTML = `
            <div style="
                width:min(100%,420px);
                max-height:90vh;
                overflow:auto;
                background:#fff;
                border-radius:22px;
                padding:22px;
                box-sizing:border-box;
                box-shadow:0 20px 60px rgba(0,0,0,.25);
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:18px;
                ">
                    <div>
                        <h2 style="margin:0 0 5px;">
                            📍 Delivery Address
                        </h2>

                        <p style="
                            margin:0;
                            color:#777;
                            font-size:13px;
                        ">
                            Enter your address for this order.
                        </p>
                    </div>

                    <button
                        id="bqOrderAddressClose"
                        type="button"
                        style="
                            border:none;
                            background:#f2f2f2;
                            width:38px;
                            height:38px;
                            border-radius:50%;
                            font-size:22px;
                        "
                    >
                        ×
                    </button>
                </div>

                <label style="
                    display:block;
                    font-weight:700;
                    margin-bottom:6px;
                ">
                    Full address
                </label>

                <textarea
                    id="bqOrderAddressInput"
                    rows="5"
                    placeholder="House/Flat number, street, area, landmark..."
                    style="
                        width:100%;
                        box-sizing:border-box;
                        padding:14px;
                        border:1px solid #ddd;
                        border-radius:14px;
                        resize:vertical;
                        font-size:15px;
                        outline:none;
                    "
                ></textarea>

                <p
                    id="bqOrderAddressError"
                    style="
                        display:none;
                        color:#c62828;
                        font-size:13px;
                        margin:7px 0 0;
                    "
                ></p>

                <button
                    id="bqContinueAddressButton"
                    type="button"
                    style="
                        width:100%;
                        margin-top:16px;
                        padding:15px;
                        border:none;
                        border-radius:14px;
                        background:#111;
                        color:#fff;
                        font-size:16px;
                        font-weight:700;
                    "
                >
                    Continue
                </button>

            </div>
        `;

        document.body.appendChild(modal);

        const input =
            BQOrderGet("bqOrderAddressInput");

        const close =
            BQOrderGet("bqOrderAddressClose");

        const continueButton =
            BQOrderGet("bqContinueAddressButton");

        if (close) {
            close.addEventListener("click", () => {
                modal.remove();
            });
        }

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                modal.remove();
            }
        });

        if (continueButton) {
            continueButton.addEventListener(
                "click",
                () => {
                    const address =
                        input
                            ? input.value.trim()
                            : "";

                    const error =
                        BQOrderGet(
                            "bqOrderAddressError"
                        );

                    if (!address) {
                        if (error) {
                            error.textContent =
                                "Please enter your delivery address.";
                            error.style.display =
                                "block";
                        }

                        if (input) {
                            input.focus();
                        }

                        return;
                    }

                    modal.remove();

                    BQShowOrderSummary(address);
                }
            );
        }

        setTimeout(() => {
            if (input) input.focus();
        }, 100);
    }

    function BQShowOrderSummary(address) {
        if (!Array.isArray(cart) || cart.length === 0) {
            if (typeof showOfficialPopup === "function") {
                showOfficialPopup(
                    "Cart is Empty",
                    "Please add products before placing an order."
                );
            }

            return;
        }

        let subtotal = 0;

        cart.forEach(item => {
            subtotal +=
                Number(item.price) *
                Number(item.quantity);
        });

        const delivery =
            BQOrderDeliveryCharge(subtotal);

        const finalTotal =
            subtotal + delivery;

        const old =
            BQOrderGet("bqOrderSummaryModal");

        if (old) {
            old.remove();
        }

        const modal =
            document.createElement("div");

        modal.id =
            "bqOrderSummaryModal";

        modal.style.cssText = `
            position:fixed;
            inset:0;
            z-index:100001;
            background:rgba(0,0,0,.55);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:18px;
            box-sizing:border-box;
        `;

        const itemsHTML =
            cart.map(item => `
                <div style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    padding:8px 0;
                    border-bottom:1px solid #eee;
                ">
                    <span>
                        ${BQOrderEscape(item.name)}
                        × ${Number(item.quantity)}
                    </span>

                    <strong>
                        ₹${Number(item.price) * Number(item.quantity)}
                    </strong>
                </div>
            `).join("");

        modal.innerHTML = `
            <div style="
                width:min(100%,430px);
                max-height:90vh;
                overflow:auto;
                background:#fff;
                border-radius:22px;
                padding:22px;
                box-sizing:border-box;
                box-shadow:0 20px 60px rgba(0,0,0,.25);
            ">

                <h2 style="
                    margin:0 0 18px;
                ">
                    🧾 Order Summary
                </h2>

                <div style="
                    background:#f7f7f7;
                    border-radius:14px;
                    padding:12px;
                    margin-bottom:16px;
                    font-size:14px;
                    line-height:1.5;
                ">
                    <strong>📍 Delivery Address</strong>
                    <div style="
                        margin-top:5px;
                        color:#555;
                    ">
                        ${BQOrderEscape(address)}
                    </div>
                </div>

                <div style="
                    margin-bottom:16px;
                ">
                    ${itemsHTML}
                </div>

                <div style="
                    padding-top:8px;
                ">
                    <div style="
                        display:flex;
                        justify-content:space-between;
                        margin:8px 0;
                    ">
                        <span>Items total</span>
                        <strong>₹${subtotal}</strong>
                    </div>

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        margin:8px 0;
                    ">
                        <span>Delivery charge</span>
                        <strong>₹${delivery}</strong>
                    </div>

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        margin-top:14px;
                        padding-top:14px;
                        border-top:1px solid #ddd;
                        font-size:19px;
                    ">
                        <strong>Total</strong>
                        <strong>₹${finalTotal}</strong>
                    </div>
                </div>

                <button
                    id="bqConfirmOrderButton"
                    type="button"
                    style="
                        width:100%;
                        margin-top:18px;
                        padding:15px;
                        border:none;
                        border-radius:14px;
                        background:#111;
                        color:#fff;
                        font-size:16px;
                        font-weight:700;
                    "
                >
                    Confirm Order · ₹${finalTotal}
                </button>

                <button
                    id="bqBackToAddressButton"
                    type="button"
                    style="
                        width:100%;
                        margin-top:9px;
                        padding:13px;
                        border:none;
                        border-radius:14px;
                        background:#f1f1f1;
                        color:#111;
                        font-size:15px;
                        font-weight:700;
                    "
                >
                    Change Address
                </button>

            </div>
        `;

        document.body.appendChild(modal);

        const confirmButton =
            BQOrderGet("bqConfirmOrderButton");

        const backButton =
            BQOrderGet("bqBackToAddressButton");

        if (backButton) {
            backButton.addEventListener(
                "click",
                () => {
                    modal.remove();
                    BQOrderAddressPopup();
                }
            );
        }

        if (confirmButton) {
            confirmButton.addEventListener(
                "click",
                () => {
                    BQConfirmOrder(
                        address,
                        subtotal,
                        delivery,
                        finalTotal
                    );
                }
            );
        }
    }

    function BQConfirmOrder(
        address,
        subtotal,
        delivery,
        finalTotal
    ) {
        if (!Array.isArray(cart) || cart.length === 0) {
            return;
        }

        const order = {
            id:
                "BQ-" +
                Date.now(),

            items:
                JSON.parse(
                    JSON.stringify(cart)
                ),

            address:
                address,

            subtotal:
                subtotal,

            deliveryCharge:
                delivery,

            total:
                finalTotal,

            date:
                new Date().toLocaleString(),

            status:
                "Confirmed"
        };

        if (!Array.isArray(orders)) {
            orders = [];
        }

        orders.unshift(order);

        localStorage.setItem(
            "bharapurOrders",
            JSON.stringify(orders)
        );

        cart = [];

        localStorage.setItem(
            "bharapurCart",
            JSON.stringify(cart)
        );

        const summary =
            BQOrderGet(
                "bqOrderSummaryModal"
            );

        if (summary) {
            summary.remove();
        }

        if (typeof renderCart === "function") {
            renderCart();
        }

        if (typeof updateCartCount === "function") {
            updateCartCount();
        }

        if (typeof renderOrders === "function") {
            renderOrders();
        }

        if (typeof closeCart === "function") {
            closeCart();
        }

        if (typeof showOfficialPopup === "function") {
            showOfficialPopup(
                "Order Confirmed 🎉",
                `Your order ${order.id} has been placed successfully. Total: ₹${finalTotal}`
            );
        }
    }

    function BQOrderEscape(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    /*
       Replace the existing checkout action.
       The cart button still uses the same HTML button.
    */
    document.addEventListener(
        "click",
        function (event) {
            const button =
                event.target.closest(
                    "#checkoutButton"
                );

            if (!button) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            if (
                !Array.isArray(cart) ||
                cart.length === 0
            ) {
                if (
                    typeof showOfficialPopup ===
                    "function"
                ) {
                    showOfficialPopup(
                        "Cart is Empty",
                        "Please add products before placing an order."
                    );
                }

                return;
            }

            BQOrderAddressPopup();
        },
        true
    );

})();
/* =========================================================
   BHARAPUR QUICK - FULL CHECKOUT + PAYMENT + CANCELLATION
   ========================================================= */

(function () {
    "use strict";

    function BQ(id) {
        return document.getElementById(id);
    }

    function esc(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function closeCheckout() {
        const old = BQ("bqCheckoutPopup");
        if (old) old.remove();
    }

    function deliveryCharge(subtotal) {
        if (subtotal < 60) return 5;
        if (subtotal < 100) return 7;
        return 10;
    }

    /* =====================================================
       MAIN CHECKOUT POPUP
       ===================================================== */

    function openCheckout() {

        if (!Array.isArray(cart) || cart.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        closeCheckout();

        const popup = document.createElement("div");

        popup.id = "bqCheckoutPopup";

        popup.style.cssText = `
            position:fixed;
            inset:0;
            z-index:999999;
            background:rgba(0,0,0,.60);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:15px;
            box-sizing:border-box;
        `;

        popup.innerHTML = `
            <div style="
                width:100%;
                max-width:450px;
                max-height:94vh;
                overflow:auto;
                background:#fff;
                border-radius:22px;
                padding:20px;
                box-sizing:border-box;
                box-shadow:0 20px 70px rgba(0,0,0,.35);
            ">

                <div style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    margin-bottom:18px;
                ">
                    <h2 style="margin:0;">
                        🛒 Checkout
                    </h2>

                    <button
                        id="bqCheckoutCancel"
                        type="button"
                        style="
                            border:0;
                            background:#f1f1f1;
                            width:38px;
                            height:38px;
                            border-radius:50%;
                            font-size:20px;
                        "
                    >
                        ×
                    </button>
                </div>


                <!-- =========================
                     SECTION 1
                     PERSONAL DETAILS
                     ========================= -->

                <div style="
                    border:1px solid #e5e5e5;
                    border-radius:16px;
                    padding:16px;
                    margin-bottom:14px;
                ">

                    <h3 style="margin:0 0 14px;">
                        1️⃣ Personal Details
                    </h3>

                    <label style="
                        display:block;
                        font-weight:700;
                        margin-bottom:6px;
                    ">
                        Full Name
                    </label>

                    <input
                        id="bqName"
                        type="text"
                        placeholder="Enter your full name"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:13px;
                            border:1px solid #ddd;
                            border-radius:11px;
                            font-size:16px;
                            margin-bottom:14px;
                        "
                    >

                    <label style="
                        display:block;
                        font-weight:700;
                        margin-bottom:6px;
                    ">
                        Sub-address / Town
                    </label>

                    <input
                        id="bqTown"
                        type="text"
                        placeholder="Town / village / locality"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:13px;
                            border:1px solid #ddd;
                            border-radius:11px;
                            font-size:16px;
                        "
                    >

                </div>


                <!-- =========================
                     SECTION 2
                     FULL ADDRESS
                     ========================= -->

                <div style="
                    border:1px solid #e5e5e5;
                    border-radius:16px;
                    padding:16px;
                    margin-bottom:14px;
                ">

                    <h3 style="margin:0 0 14px;">
                        2️⃣ Delivery Address
                    </h3>

                    <label style="
                        display:block;
                        font-weight:700;
                        margin-bottom:6px;
                    ">
                        Street / Road
                    </label>

                    <input
                        id="bqStreet"
                        type="text"
                        placeholder="Street or road name"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:13px;
                            border:1px solid #ddd;
                            border-radius:11px;
                            font-size:16px;
                            margin-bottom:14px;
                        "
                    >

                    <label style="
                        display:block;
                        font-weight:700;
                        margin-bottom:6px;
                    ">
                        Area / Locality
                    </label>

                    <input
                        id="bqArea"
                        type="text"
                        placeholder="Area / colony / mohalla"
                        style="
                            width:100%;
                            box-sizing:border-box;
                            padding:13px;
                            border:1px solid #ddd;
                            border-radius:11px;
                            font-size:16px;
                        "
                    >

                </div>


                <!-- =========================
                     SECTION 3
                     PAYMENT
                     ========================= -->

                <div style="
                    border:1px solid #e5e5e5;
                    border-radius:16px;
                    padding:16px;
                    margin-bottom:14px;
                ">

                    <h3 style="margin:0 0 14px;">
                        3️⃣ Payment Method
                    </h3>

                    <label style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        padding:14px;
                        border:1px solid #ddd;
                        border-radius:12px;
                        margin-bottom:10px;
                        cursor:pointer;
                    ">

                        <input
                            type="radio"
                            name="bqPayment"
                            value="Cash on Delivery"
                            checked
                        >

                        <span>
                            💵 <strong>Cash on Delivery</strong>
                            <br>
                            <small style="color:#777;">
                                Pay when your order arrives
                            </small>
                        </span>

                    </label>


                    <label style="
                        display:flex;
                        align-items:center;
                        gap:10px;
                        padding:14px;
                        border:1px solid #ddd;
                        border-radius:12px;
                        cursor:pointer;
                    ">

                        <input
                            type="radio"
                            name="bqPayment"
                            value="Online Payment"
                        >

                        <span>
                            💳 <strong>Online Payment</strong>
                            <br>
                            <small style="color:#777;">
                                Pay online
                            </small>
                        </span>

                    </label>

                </div>


                <button
                    id="bqReviewOrder"
                    type="button"
                    style="
                        width:100%;
                        padding:15px;
                        border:0;
                        border-radius:13px;
                        background:#111;
                        color:#fff;
                        font-size:17px;
                        font-weight:700;
                    "
                >
                    Proceed to Order Review
                </button>


                <button
                    id="bqCancelCheckout"
                    type="button"
                    style="
                        width:100%;
                        margin-top:10px;
                        padding:13px;
                        border:0;
                        border-radius:13px;
                        background:#f1f1f1;
                        color:#333;
                        font-size:15px;
                        font-weight:700;
                    "
                >
                    Cancel Checkout
                </button>

            </div>
        `;

        document.body.appendChild(popup);


        BQ("bqCheckoutCancel").onclick =
        BQ("bqCancelCheckout").onclick =
            function () {
                closeCheckout();
            };


        BQ("bqReviewOrder").addEventListener(
            "click",
            function () {

                const name =
                    BQ("bqName").value.trim();

                const town =
                    BQ("bqTown").value.trim();

                const street =
                    BQ("bqStreet").value.trim();

                const area =
                    BQ("bqArea").value.trim();

                const payment =
                    document.querySelector(
                        'input[name="bqPayment"]:checked'
                    );

                if (!name) {
                    alert("Please enter your full name.");
                    return;
                }

                if (!town) {
                    alert("Please enter your town or sub-address.");
                    return;
                }

                if (!street) {
                    alert("Please enter your street or road.");
                    return;
                }

                if (!area) {
                    alert("Please enter your area or locality.");
                    return;
                }

                if (!payment) {
                    alert("Please select a payment method.");
                    return;
                }

                const customer = {
                    name: name,
                    town: town,
                    street: street,
                    area: area,
                    payment: payment.value
                };

                showOrderReview(customer);
            }
        );
    }


    /* =====================================================
       ORDER REVIEW
       ===================================================== */

    function showOrderReview(customer) {

        closeCheckout();

        let subtotal = 0;
        let itemsHTML = "";

        cart.forEach(function (item) {

            const quantity =
                Number(item.quantity) || 1;

            const price =
                Number(item.price) || 0;

            const itemTotal =
                price * quantity;

            subtotal += itemTotal;

            itemsHTML += `
                <div style="
                    display:flex;
                    justify-content:space-between;
                    gap:10px;
                    padding:8px 0;
                    border-bottom:1px solid #eee;
                ">
                    <span>
                        ${esc(item.name)}
                        × ${quantity}
                    </span>

                    <strong>
                        ₹${itemTotal}
                    </strong>
                </div>
            `;
        });

        const delivery =
            deliveryCharge(subtotal);

        const total =
            subtotal + delivery;


        const popup = document.createElement("div");

        popup.id = "bqCheckoutPopup";

        popup.style.cssText = `
            position:fixed;
            inset:0;
            z-index:999999;
            background:rgba(0,0,0,.60);
            display:flex;
            align-items:center;
            justify-content:center;
            padding:15px;
            box-sizing:border-box;
        `;

        popup.innerHTML = `
            <div style="
                width:100%;
                max-width:450px;
                max-height:94vh;
                overflow:auto;
                background:#fff;
                border-radius:22px;
                padding:20px;
                box-sizing:border-box;
                box-shadow:0 20px 70px rgba(0,0,0,.35);
            ">

                <h2 style="margin:0 0 18px;">
                    🧾 Order Review
                </h2>


                <div style="
                    background:#f7f7f7;
                    border-radius:15px;
                    padding:14px;
                    margin-bottom:15px;
                    line-height:1.6;
                ">

                    <strong>📍 Delivery Details</strong>

                    <br>
                    👤 ${esc(customer.name)}

                    <br>
                    🏘️ ${esc(customer.town)}

                    <br>
                    🛣️ ${esc(customer.street)}

                    <br>
                    📍 ${esc(customer.area)}

                </div>


                <h3 style="margin:0 0 8px;">
                    Items
                </h3>

                ${itemsHTML}


                <div style="
                    margin-top:15px;
                    line-height:1.7;
                ">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                    ">
                        <span>Subtotal</span>
                        <strong>₹${subtotal}</strong>
                    </div>

                    <div style="
                        display:flex;
                        justify-content:space-between;
                    ">
                        <span>Delivery Charge</span>
                        <strong>₹${delivery}</strong>
                    </div>

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        font-size:21px;
                        margin-top:8px;
                    ">
                        <strong>Total</strong>
                        <strong>₹${total}</strong>
                    </div>

                </div>


                <div style="
                    margin-top:15px;
                    padding:12px;
                    border-radius:12px;
                    background:#eef7ff;
                ">
                    <strong>Payment:</strong>
                    ${esc(customer.payment)}
                </div>


                <button
                    id="bqConfirmOrder"
                    type="button"
                    style="
                        width:100%;
                        margin-top:18px;
                        padding:15px;
                        border:0;
                        border-radius:13px;
                        background:#111;
                        color:#fff;
                        font-size:17px;
                        font-weight:700;
                    "
                >
                    Confirm & Place Order
                </button>


                <button
                    id="bqBackCheckout"
                    type="button"
                    style="
                        width:100%;
                        margin-top:10px;
                        padding:13px;
                        border:0;
                        border-radius:13px;
                        background:#f1f1f1;
                        color:#333;
                        font-size:15px;
                        font-weight:700;
                    "
                >
                    ← Edit Details
                </button>


                <button
                    id="bqCancelFinal"
                    type="button"
                    style="
                        width:100%;
                        margin-top:8px;
                        padding:13px;
                        border:0;
                        border-radius:13px;
                        background:#ffecec;
                        color:#c62828;
                        font-size:15px;
                        font-weight:700;
                    "
                >
                    ❌ Cancel Order
                </button>

            </div>
        `;

        document.body.appendChild(popup);


        BQ("bqBackCheckout").onclick =
            function () {
                openCheckout();
            };


        BQ("bqCancelFinal").onclick =
            function () {
                closeCheckout();
            };


        BQ("bqConfirmOrder").addEventListener(
            "click",
            function () {

                if (
                    customer.payment ===
                    "Online Payment"
                ) {

                    alert(
                        "Online payment gateway is not connected yet. Please choose Cash on Delivery for now."
                    );

                    return;
                }

                placeOrder(
                    customer,
                    subtotal,
                    delivery,
                    total
                );
            }
        );
    }


    /* =====================================================
       PLACE ORDER
       ===================================================== */

    function placeOrder(
        customer,
        subtotal,
        delivery,
        total
    ) {

        const order = {

            id:
                "BQ-" + Date.now(),

            customerName:
                customer.name,

            town:
                customer.town,

            street:
                customer.street,

            area:
                customer.area,

            items:
                JSON.parse(
                    JSON.stringify(cart)
                ),

            subtotal:
                subtotal,

            deliveryCharge:
                delivery,

            total:
                total,

            paymentMethod:
                customer.payment,

            paymentStatus:
                "Pending",

            status:
                "Confirmed",

            date:
                new Date().toLocaleString()
        };


        if (!Array.isArray(orders)) {
            orders = [];
        }


        orders.unshift(order);


        localStorage.setItem(
            "bharapurOrders",
            JSON.stringify(orders)
        );


        cart = [];


        localStorage.setItem(
            "bharapurCart",
            JSON.stringify(cart)
        );


        if (
            typeof renderCart ===
            "function"
        ) {
            renderCart();
        }


        if (
            typeof updateCartCount ===
            "function"
        ) {
            updateCartCount();
        }


        if (
            typeof renderOrders ===
            "function"
        ) {
            renderOrders();
        }


        if (
            typeof closeCart ===
            "function"
        ) {
            closeCart();
        }


        closeCheckout();


        if (
            typeof showOfficialPopup ===
            "function"
        ) {

            showOfficialPopup(
                "Order Confirmed 🎉",
                "Your order " +
                order.id +
                " has been placed successfully. Total: ₹" +
                total +
                "."
            );

        } else {

            alert(
                "Order placed successfully!"
            );
        }
    }


    /* =====================================================
       CANCEL EXISTING ORDER
       ===================================================== */

    window.bqCancelOrder = function (orderId) {

        if (
            !Array.isArray(orders)
        ) {
            return;
        }

        const order =
            orders.find(function (item) {
                return item.id === orderId;
            });

        if (!order) return;

        if (
            order.status === "Cancelled"
        ) {
            return;
        }

        const shouldCancel =
            confirm(
                "Cancel order " +
                orderId +
                "?"
            );

        if (!shouldCancel) {
            return;
        }

        order.status = "Cancelled";

        order.cancelledAt =
            new Date().toLocaleString();

        localStorage.setItem(
            "bharapurOrders",
            JSON.stringify(orders)
        );

        if (
            typeof renderOrders ===
            "function"
        ) {
            renderOrders();
        }

        alert(
            "Order " +
            orderId +
            " has been cancelled."
        );
    };


    /* =====================================================
       PLACE ORDER BUTTON
       ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "#checkoutButton"
                );

            if (!button) return;

            event.preventDefault();
            event.stopImmediatePropagation();

            openCheckout();

        },
        true
    );

})();
