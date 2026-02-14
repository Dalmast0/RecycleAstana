// Sample initiatives data - without articles
let initiatives = [
    {
        id: 1,
        type: 'planting',
        title: 'Посадка деревьев в Ботаническом Саду',
        description: 'Приглашаем всех желающих принять участие в посадке 300 деревьев и кустарников в Ботаническом Саду. Саженцы и необходимый инвентарь предоставляются.',
        date: '2026-04-15',
        time: '10:00',
        location: 'Ботнический Сад, со стороны ул. Бухар Жырау',
        organizer: 'Eco Astana',
        contact: 'eco.astana@example.com',
        volunteersNeeded: 50,
        volunteersRegistered: 32,
        bonusPoints: 100,
        registeredUsers: [],
        createdBy: null
    },
    {
        id: 2,
        type: 'cleanup',
        title: 'Очистка берегов Есиля',
        description: 'Весенняя уборка набережной реки Есиль. Присоединяйтесь к нам, чтобы сделать наш город чище!',
        date: '2026-03-20',
        time: '09:00',
        location: 'Набережная реки Есиль, около ул. Амман',
        organizer: 'Таза Астана',
        contact: 'volunteers.astana@example.com',
        volunteersNeeded: 100,
        volunteersRegistered: 100,
        bonusPoints: 50,
        registeredUsers: [],
        createdBy: null
    },
    {
        id: 3,
        type: 'recycling',
        title: 'Акция по сбору пластика',
        description: 'Мобильный пункт приёма пластиковых бутылок и контейнеров. Сдавай пластик - получай бонусы!',
        date: '2026-03-18',
        time: '12:00',
        location: 'ТРЦ Asia Park, парковка',
        organizer: 'RecycleKZ',
        contact: '+7 777 888 9999',
        volunteersNeeded: 30,
        volunteersRegistered: 10,
        bonusPoints: 30,
        registeredUsers: [],
        createdBy: null
    },
    {
        id: 4,
        type: 'education',
        title: 'Мастер-класс: Zero Waste в быту',
        description: 'Практический семинар о том, как уменьшить количество отходов в повседневной жизни. Научим делать экосумки и многоразовую упаковку.',
        date: '2026-03-25',
        time: '14:00',
        location: 'ТРЦ Mega Silk Way',
        organizer: 'Green Life Academy',
        contact: 'greenlife.kz@example.com',
        volunteersNeeded: 25,
        volunteersRegistered: 15,
        bonusPoints: 30,
        registeredUsers: [],
        createdBy: null
    },
    {
        id: 5,
        type: 'cleanup',
        title: 'Уборка территории вокруг школы-лицей №89',
        description: 'Совместная акция учеников, родителей и жителей района по благоустройству школьной территории.',
        date: '2026-03-22',
        time: '11:00',
        location: 'Школа-лицей №89, ул. Сауран 11',
        organizer: 'Родительский комитет школы-лицей №89',
        contact: '+7 789 789 7878',
        volunteersNeeded: 30,
        volunteersRegistered: 15,
        bonusPoints: 50,
        registeredUsers: [],
        createdBy: null
    },
    {
        id: 6,
        type: 'planting',
        title: 'Озеленение жилых дворов',
        description: 'Создание зеленых зон в городских дворах: посадка растений, установка и уход за цветниками.',
        date: '2026-04-05',
        time: '10:30',
        location: 'Микрорайон "Самал-2"',
        organizer: 'ТОО "Зеленый двор"',
        contact: '+7 775 444 5566',
        volunteersNeeded: 20,
        volunteersRegistered: 8,
        bonusPoints: 100,
        registeredUsers: [],
        createdBy: null
    }
];

// User state
let currentUser = null; // null (guest), {username, role: 'regular'}, or {username, role: 'organizer'}
let userBonusPoints = 0;

// Bookmarked initiatives
let bookmarkedIds = JSON.parse(localStorage.getItem('bookmarkedInitiatives')) || [];

// Current filter and search state
let currentFilter = 'all';
let currentSearch = '';

// Bonus points by type
const BONUS_POINTS = {
    planting: 100,
    cleanup: 50,
    recycling: 30,
    education: 30
};

// DOM Elements
const initiativesFeed = document.getElementById('initiativesFeed');
const createInitiativeBtn = document.getElementById('createInitiativeBtn');
const createModal = document.getElementById('createModal');
const detailsModal = document.getElementById('detailsModal');
const authModal = document.getElementById('authModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const closeDetailsBtn = document.getElementById('closeDetailsBtn');
const closeAuthBtn = document.getElementById('closeAuthBtn');
const cancelBtn = document.getElementById('cancelBtn');
const createForm = document.getElementById('createInitiativeForm');
const searchInput = document.getElementById('searchInput');
const filterBtns = document.querySelectorAll('.filter-btn');
const noResults = document.getElementById('noResults');
const userIconBtn = document.getElementById('userIconBtn');
const statusBadge = document.getElementById('statusBadge');
const bonusPointsDisplay = document.getElementById('bonusPoints');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authTabs = document.querySelectorAll('.auth-tab');
const bookmarksBtn = document.getElementById('bookmarksBtn');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Load user data from localStorage
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        userBonusPoints = parseInt(localStorage.getItem('userBonusPoints')) || 0;
        updateUserUI();
    }
    
    renderInitiatives();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    // Filter buttons
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Check if bookmarks filter is clicked by guest
            if (btn.dataset.filter === 'bookmarks' && !currentUser) {
                showToast('Войдите в систему, чтобы просматривать закладки', 'error');
                openModal(authModal);
                return;
            }
            
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderInitiatives();
        });
    });

    // Search input
    searchInput.addEventListener('input', (e) => {
        currentSearch = e.target.value.toLowerCase();
        renderInitiatives();
    });

    // User icon button
    userIconBtn.addEventListener('click', () => {
        if (currentUser) {
            // Show logout option (for prototype, just logout)
            if (confirm('Выйти из аккаунта?')) {
                logout();
            }
        } else {
            openModal(authModal);
        }
    });

    // Create initiative modal
    createInitiativeBtn.addEventListener('click', () => {
        if (!currentUser) {
            showToast('Пожалуйста, войдите в систему', 'error');
            openModal(authModal);
        } else if (currentUser.role !== 'organizer') {
            showToast('Только организаторы могут создавать инициативы', 'error');
        } else {
            openModal(createModal);
        }
    });

    // Close modals
    closeModalBtn.addEventListener('click', () => closeModal(createModal));
    closeDetailsBtn.addEventListener('click', () => closeModal(detailsModal));
    closeAuthBtn.addEventListener('click', () => closeModal(authModal));
    cancelBtn.addEventListener('click', () => closeModal(createModal));

    // Close modal on background click
    window.addEventListener('click', (e) => {
        if (e.target === createModal) closeModal(createModal);
        if (e.target === detailsModal) closeModal(detailsModal);
        if (e.target === authModal) closeModal(authModal);
    });

    // Auth tabs
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            if (tab.dataset.tab === 'login') {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
            }
        });
    });

    // Login form
    loginForm.addEventListener('submit', handleLogin);
    
    // Signup form
    signupForm.addEventListener('submit', handleSignup);

    // Form submission
    createForm.addEventListener('submit', handleFormSubmit);
}

// Handle Login
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    // Special organizer account
    if (username === 'Prototype_org' && password === 'prototype123') {
        currentUser = {
            username: username,
            role: 'organizer'
        };
        userBonusPoints = parseInt(localStorage.getItem('userBonusPoints_' + username)) || 0;
        saveUserData();
        closeModal(authModal);
        showToast('Вы вошли как организатор!', 'success');
        updateUserUI();
        loginForm.reset();
    } else {
        // Regular user (in real app, validate against database)
        currentUser = {
            username: username,
            role: 'regular'
        };
        userBonusPoints = parseInt(localStorage.getItem('userBonusPoints_' + username)) || 0;
        saveUserData();
        closeModal(authModal);
        showToast(`Добро пожаловать, ${username}!`, 'success');
        updateUserUI();
        loginForm.reset();
    }
}

// Handle Signup
function handleSignup(e) {
    e.preventDefault();
    
    const username = document.getElementById('signupUsername').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    
    // In real app, save to database
    currentUser = {
        username: username,
        role: 'regular'
    };
    userBonusPoints = 0;
    saveUserData();
    closeModal(authModal);
    showToast('Регистрация успешна! Добро пожаловать!', 'success');
    updateUserUI();
    signupForm.reset();
}

// Logout
function logout() {
    currentUser = null;
    userBonusPoints = 0;
    localStorage.removeItem('currentUser');
    updateUserUI();
    showToast('Вы вышли из системы', 'success');
    
    // Reset to "all" filter if user was viewing bookmarks
    if (currentFilter === 'bookmarks') {
        currentFilter = 'all';
        filterBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.filter === 'all') {
                btn.classList.add('active');
            }
        });
    }
    
    renderInitiatives();
}

// Save user data
function saveUserData() {
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    localStorage.setItem('userBonusPoints_' + currentUser.username, userBonusPoints.toString());
}

// Update user UI
function updateUserUI() {
    if (!currentUser) {
        statusBadge.textContent = 'Гость';
        statusBadge.className = 'status-badge guest';
        bonusPointsDisplay.textContent = '0';
    } else if (currentUser.role === 'organizer') {
        statusBadge.textContent = 'Организатор';
        statusBadge.className = 'status-badge organizer';
        bonusPointsDisplay.textContent = userBonusPoints;
    } else {
        statusBadge.textContent = 'Пользователь';
        statusBadge.className = 'status-badge regular';
        bonusPointsDisplay.textContent = userBonusPoints;
    }
}

// Render initiatives
function renderInitiatives() {
    let filtered = initiatives.filter(initiative => {
        // Apply bookmarks filter
        if (currentFilter === 'bookmarks') {
            return bookmarkedIds.includes(initiative.id);
        }
        
        // Apply type filter
        const matchesFilter = currentFilter === 'all' || initiative.type === currentFilter;
        
        // Apply search filter
        const matchesSearch = currentSearch === '' || 
            initiative.title.toLowerCase().includes(currentSearch) ||
            initiative.description.toLowerCase().includes(currentSearch) ||
            initiative.location?.toLowerCase().includes(currentSearch);
        
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        initiativesFeed.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }

    initiativesFeed.style.display = 'grid';
    noResults.style.display = 'none';

    initiativesFeed.innerHTML = filtered.map(initiative => 
        createInitiativeCard(initiative)
    ).join('');
}

// Create initiative card HTML
function createInitiativeCard(initiative) {
    const isBookmarked = bookmarkedIds.includes(initiative.id);
    const isFull = initiative.volunteersRegistered >= initiative.volunteersNeeded;
    const isUserRegistered = currentUser && initiative.registeredUsers.includes(currentUser.username);
    const isOwnInitiative = currentUser && initiative.createdBy === currentUser.username;

    const typeLabels = {
        planting: 'Посадка деревьев',
        cleanup: 'Уборка',
        recycling: 'Переработка',
        education: 'Образование'
    };

    const typeIcons = {
        planting: 'fa-seedling',
        cleanup: 'fa-broom',
        recycling: 'fa-recycle',
        education: 'fa-graduation-cap'
    };

    const metaHTML = `
        <div class="meta-item">
            <i class="fas fa-calendar-alt"></i>
            <span>${formatDate(initiative.date)}, ${initiative.time}</span>
        </div>
        <div class="meta-item">
            <i class="fas fa-map-marker-alt"></i>
            <span>${initiative.location}</span>
        </div>
        <div class="meta-item">
            <i class="fas fa-user"></i>
            <span>${initiative.organizer}</span>
        </div>
        <div class="meta-item">
            <i class="fas fa-phone"></i>
            <span>${initiative.contact}</span>
        </div>
    `;

    const volunteerHTML = `
        <div class="volunteer-status">
            <div class="volunteer-info ${isFull ? 'status-full' : 'status-available'}">
                <i class="fas fa-users"></i>
                <span>${initiative.volunteersRegistered}/${initiative.volunteersNeeded} волонтеров</span>
            </div>
            ${!isFull ? `<span class="status-available">Места есть</span>` : `<span class="status-full">Набор закрыт</span>`}
        </div>
    `;

    let registerButtonText = 'Записаться';
    let registerButtonDisabled = false;
    
    if (isOwnInitiative) {
        registerButtonText = 'Ваша инициатива';
        registerButtonDisabled = true;
    } else if (isUserRegistered) {
        registerButtonText = 'Вы записаны';
        registerButtonDisabled = true;
    } else if (isFull) {
        registerButtonText = 'Набор закрыт';
        registerButtonDisabled = true;
    }

    const footerHTML = `
        <button class="btn btn-primary" onclick="registerForInitiative(${initiative.id})" ${registerButtonDisabled ? 'disabled' : ''}>
            <i class="fas ${isUserRegistered ? 'fa-check' : isOwnInitiative ? 'fa-star' : 'fa-user-plus'}"></i> ${registerButtonText}
        </button>
        <button class="btn btn-outline" onclick="shareInitiative(${initiative.id})">
            <i class="fas fa-share-alt"></i> Поделиться
        </button>
    `;

    // Show bookmark button only for logged-in users
    const bookmarkButton = currentUser ? `
        <button class="action-btn bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                onclick="toggleBookmark(${initiative.id})">
            <i class="fas fa-bookmark"></i>
        </button>
    ` : '';

    return `
        <div class="initiative-card" data-id="${initiative.id}">
            <div class="card-header">
                <span class="card-type-badge badge-${initiative.type}">
                    <i class="fas ${typeIcons[initiative.type]}"></i>
                    ${typeLabels[initiative.type]}
                </span>
                <div class="card-actions">
                    ${bookmarkButton}
                </div>
            </div>
            
            <h3 class="card-title">${initiative.title}</h3>
            <p class="card-description">${truncateText(initiative.description, 120)}</p>
            
            <div class="card-meta">
                ${metaHTML}
            </div>
            
            ${volunteerHTML}
            
            <div class="bonus-points">
                <i class="fas fa-star"></i>
                <span>+${initiative.bonusPoints} баллов</span>
            </div>
            
            <div class="card-footer">
                ${footerHTML}
            </div>
        </div>
    `;
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('ru-RU', options);
}

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Toggle bookmark
function toggleBookmark(id) {
    if (!currentUser) {
        showToast('Войдите в систему, чтобы добавлять закладки', 'error');
        openModal(authModal);
        return;
    }
    
    const index = bookmarkedIds.indexOf(id);
    if (index > -1) {
        bookmarkedIds.splice(index, 1);
        showToast('Инициатива удалена из закладок', 'success');
    } else {
        bookmarkedIds.push(id);
        showToast('Инициатива добавлена в закладки', 'success');
    }
    localStorage.setItem('bookmarkedInitiatives', JSON.stringify(bookmarkedIds));
    renderInitiatives();
}

// Register for initiative
function registerForInitiative(id) {
    if (!currentUser) {
        showToast('Пожалуйста, войдите в систему для регистрации', 'error');
        openModal(authModal);
        return;
    }

    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return;

    // Check if user is trying to register for their own initiative
    if (initiative.createdBy === currentUser.username) {
        showToast('Вы не можете записаться на свою инициативу', 'error');
        return;
    }

    // Check if user is already registered
    if (initiative.registeredUsers.includes(currentUser.username)) {
        showToast('Вы уже записаны на эту инициативу', 'error');
        return;
    }

    if (initiative.volunteersRegistered >= initiative.volunteersNeeded) {
        showToast('К сожалению, все места заняты', 'error');
        return;
    }

    // Register user
    initiative.volunteersRegistered++;
    initiative.registeredUsers.push(currentUser.username);
    
    // Award bonus points
    userBonusPoints += initiative.bonusPoints;
    saveUserData();
    updateUserUI();
    
    renderInitiatives();
    showToast(`Вы записались на "${initiative.title}"! +${initiative.bonusPoints} баллов`, 'success');
}

// Share initiative
function shareInitiative(id) {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return;

    if (navigator.share) {
        navigator.share({
            title: initiative.title,
            text: initiative.description,
            url: window.location.href + '?initiative=' + id
        }).then(() => {
            showToast('Спасибо за распространение!', 'success');
        }).catch(() => {
            copyToClipboard(window.location.href + '?initiative=' + id);
        });
    } else {
        copyToClipboard(window.location.href + '?initiative=' + id);
    }
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Ссылка скопирована в буфер обмена', 'success');
    });
}

// Open initiative details
function openDetails(id) {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return;

    const detailsTitle = document.getElementById('detailsTitle');
    const detailsContent = document.getElementById('detailsContent');

    detailsTitle.textContent = initiative.title;

    let contentHTML = `
        <div class="details-section">
            <h3><i class="fas fa-info-circle"></i> Описание</h3>
            <p>${initiative.description}</p>
        </div>
        <div class="details-section">
            <h3><i class="fas fa-calendar-alt"></i> Детали события</h3>
            <div class="details-meta">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(initiative.date)}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-clock"></i>
                    <span>${initiative.time}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${initiative.location}</span>
                </div>
            </div>
        </div>
        <div class="details-section">
            <h3><i class="fas fa-user"></i> Организатор</h3>
            <div class="details-meta">
                <div class="detail-item">
                    <i class="fas fa-user-circle"></i>
                    <span>${initiative.organizer}</span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-phone"></i>
                    <span>${initiative.contact}</span>
                </div>
            </div>
        </div>
        <div class="details-section">
            <h3><i class="fas fa-users"></i> Волонтеры</h3>
            <p>Требуется: ${initiative.volunteersNeeded} человек</p>
            <p>Записалось: ${initiative.volunteersRegistered} человек</p>
            <p style="color: ${initiative.volunteersRegistered >= initiative.volunteersNeeded ? 'var(--danger-color)' : 'var(--primary-color)'}; font-weight: 600;">
                ${initiative.volunteersRegistered >= initiative.volunteersNeeded ? 'Набор закрыт' : `Еще ${initiative.volunteersNeeded - initiative.volunteersRegistered} мест`}
            </p>
        </div>
        <div class="details-section">
            <h3><i class="fas fa-star"></i> Награда</h3>
            <p>За участие в этой инициативе вы получите <strong>${initiative.bonusPoints} бонусных баллов</strong>.</p>
        </div>
    `;

    detailsContent.innerHTML = contentHTML;
    openModal(detailsModal);
}

// Modal functions
function openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Handle form submission
function handleFormSubmit(e) {
    e.preventDefault();

    if (!currentUser || currentUser.role !== 'organizer') {
        showToast('Только организаторы могут создавать инициативы', 'error');
        return;
    }

    const type = document.getElementById('initiativeType').value;
    const formData = {
        id: initiatives.length + 1,
        type: type,
        title: document.getElementById('initiativeTitle').value,
        description: document.getElementById('initiativeDescription').value,
        date: document.getElementById('initiativeDate').value,
        time: document.getElementById('initiativeTime').value,
        location: document.getElementById('initiativeLocation').value,
        organizer: currentUser.username,
        contact: document.getElementById('initiativeContact').value,
        volunteersNeeded: parseInt(document.getElementById('volunteersNeeded').value),
        volunteersRegistered: 0,
        bonusPoints: BONUS_POINTS[type],
        registeredUsers: [],
        createdBy: currentUser.username
    };

    // Validate
    if (!formData.type || !formData.title || !formData.description || !formData.date || 
        !formData.time || !formData.location || !formData.contact || !formData.volunteersNeeded) {
        showToast('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }

    // Add to initiatives array
    initiatives.unshift(formData);
    
    // Award organizer bonus (50 points)
    userBonusPoints += 50;
    saveUserData();
    updateUserUI();
    
    // Reset form and close modal
    createForm.reset();
    closeModal(createModal);
    
    // Re-render
    renderInitiatives();
    
    showToast('Инициатива успешно создана! +50 баллов', 'success');
}

// Toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideInRight 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Export functions for inline onclick handlers
window.toggleBookmark = toggleBookmark;
window.registerForInitiative = registerForInitiative;
window.shareInitiative = shareInitiative;
window.openDetails = openDetails;
