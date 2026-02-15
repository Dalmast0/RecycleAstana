

let currentUser = null;
let users = JSON.parse(localStorage.getItem('ecocity_users') || '[]');
function normalizeContact(raw) {
    const v = String(raw || '').trim().toLowerCase();
    if (!v) return '';
    if (v.includes('@')) return v;           // email
    return v.replace(/[^\d+]/g, '');         // phone: keep digits and +
}

function getCurrentDisplayName() {
    if (!currentUser) return 'You';
    const fullName = `${currentUser.name || ''} ${currentUser.surname || ''}`.trim();
    return fullName || currentUser.contact || 'You';
}

// Seed 2 demo accounts so you can show both roles without a backend
function seedDemoUsersIfEmpty() {
    if (!Array.isArray(users)) users = [];
    if (users.length > 0) return;

    users = [
        {
            contact: normalizeContact('judge@example.com'),
            name: 'Judge',
            surname: 'Account',
            password: 'judge1234',
            role: 'member',
            points: 0,
            level: 1,
            recycled_kg: 0,
            co2_saved: 0
        },
        {
            contact: normalizeContact('organizer@ecocity.kz'),
            name: 'Eco',
            surname: 'Organizer',
            password: 'organizer123',
            role: 'organizer',
            points: 0,
            level: 1,
            recycled_kg: 0,
            co2_saved: 0
        }
    ];

    localStorage.setItem('ecocity_users', JSON.stringify(users));
}

function initAuth() {
    // reload + seed demo users (no backend)
    users = JSON.parse(localStorage.getItem('ecocity_users') || '[]');
    seedDemoUsersIfEmpty();

    const savedUser = localStorage.getItem('ecocity_current_user');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);

        // normalize contact if present
        if (currentUser.contact) currentUser.contact = normalizeContact(currentUser.contact);

        // sync stats from saved user into userData
        userData.points = currentUser.points || 0;
        userData.level = currentUser.level || 1;
        userData.recycled_kg = currentUser.recycled_kg || 0;
        userData.co2_saved = currentUser.co2_saved || 0;

        updateAuthUI();
    }

    updateNavAccess();
}


function handleLogin(event) {
    event.preventDefault();

    const contact = normalizeContact(document.getElementById('loginContact').value);
    const password = document.getElementById('loginPassword').value;

    const user = users.find(u => normalizeContact(u.contact) === contact && u.password === password);

    if (user) {
        currentUser = {
            contact: normalizeContact(user.contact),
            name: user.name || '',
            surname: user.surname || '',
            role: user.role || 'member',
            points: user.points || 0,
            level: user.level || 1,
            recycled_kg: user.recycled_kg || 0,
            co2_saved: user.co2_saved || 0
        };

        localStorage.setItem('ecocity_current_user', JSON.stringify(currentUser));

        userData.points = currentUser.points;
        userData.level = currentUser.level;
        userData.recycled_kg = currentUser.recycled_kg;
        userData.co2_saved = currentUser.co2_saved;

        closeLoginModal();
        updateAuthUI();
        updateNavAccess();
        location.reload();
    } else {
        document.getElementById('loginError').textContent = 'Invalid phone/email or password';
        document.getElementById('loginError').style.display = 'block';
    }
}


function handleRegister(event) {
    event.preventDefault();

    const name = document.getElementById('registerName').value.trim();
    const surname = document.getElementById('registerSurname').value.trim();
    const contact = normalizeContact(document.getElementById('registerContact').value);
    const pass1 = document.getElementById('registerPassword1').value;
    const pass2 = document.getElementById('registerPassword2').value;

    if (!name || !surname) {
        document.getElementById('registerError').textContent = 'Name and surname are required';
        document.getElementById('registerError').style.display = 'block';
        return;
    }
    if (!contact) {
        document.getElementById('registerError').textContent = 'Phone or email is required';
        document.getElementById('registerError').style.display = 'block';
        return;
    }
    if (pass1.length < 6) {
        document.getElementById('registerError').textContent = 'Password must be at least 6 characters';
        document.getElementById('registerError').style.display = 'block';
        return;
    }
    if (pass1 !== pass2) {
        document.getElementById('registerError').textContent = 'Passwords do not match';
        document.getElementById('registerError').style.display = 'block';
        return;
    }

    if (users.find(u => normalizeContact(u.contact) === contact)) {
        document.getElementById('registerError').textContent = 'This phone/email is already registered';
        document.getElementById('registerError').style.display = 'block';
        return;
    }

    const newUser = {
        contact,
        name,
        surname,
        password: pass1, // demo only
        role: 'member',
        points: 0,
        level: 1,
        recycled_kg: 0,
        co2_saved: 0
    };

    users.push(newUser);
    localStorage.setItem('ecocity_users', JSON.stringify(users));

    currentUser = {
        contact: newUser.contact,
        name: newUser.name,
        surname: newUser.surname,
        role: newUser.role,
        points: 0,
        level: 1,
        recycled_kg: 0,
        co2_saved: 0
    };

    localStorage.setItem('ecocity_current_user', JSON.stringify(currentUser));

    userData.points = 0;
    userData.level = 1;
    userData.recycled_kg = 0;
    userData.co2_saved = 0;

    closeRegisterModal();
    updateAuthUI();
    updateNavAccess();
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        if (currentUser) {
            const userIndex = users.findIndex(
                u => normalizeContact(u.contact) === normalizeContact(currentUser.contact)
            );
            if (userIndex !== -1) {
                users[userIndex].points = userData.points;
                users[userIndex].level = userData.level;
                users[userIndex].recycled_kg = userData.recycled_kg;
                users[userIndex].co2_saved = userData.co2_saved;
                localStorage.setItem('ecocity_users', JSON.stringify(users));
            }
        }

        currentUser = null;
        localStorage.removeItem('ecocity_current_user');

        userData = {
            points: 0,
            level: 1,
            recycled_kg: 0,
            co2_saved: 0,
            rank: 1
        };

        updateAuthUI();
        updateNavAccess();
        showPage('map');
    }
}

function updateAuthUI() {
    const authButtons = document.getElementById('authButtons');
    const userProfile = document.getElementById('userProfile');

    if (currentUser) {
        authButtons.style.display = 'none';
        userProfile.style.display = 'flex';

        const displayName = `${currentUser.name || ''} ${currentUser.surname || ''}`.trim() || currentUser.contact;
        document.getElementById('userName').textContent = displayName;

        document.getElementById('userRoleBadge').textContent =
            currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);

        updateNavDisplay();
    } else {
        authButtons.style.display = 'flex';
        userProfile.style.display = 'none';
    }
}


function updateNavAccess() {
    const navDashboard = document.getElementById('navDashboard');
    const navScanner = document.getElementById('navScanner');
    const navGarden = document.getElementById('navGarden');
    const createBtn = document.getElementById('createInitiativeBtn');
    
    if (!currentUser || currentUser.role === 'guest') {
        navDashboard.classList.add('nav-restricted');
        navScanner.classList.add('nav-restricted');
        navGarden.classList.add('nav-restricted');
        
        navDashboard.onclick = (e) => { e.preventDefault(); showGuestNotice('Dashboard is only available to members. Login or register to track your impact!'); };
        navScanner.onclick = (e) => { e.preventDefault(); showGuestNotice('Activity logging is only available to members. Login or register to start earning points!'); };
        navGarden.onclick = (e) => { e.preventDefault(); showGuestNotice('Eco Forest is only available to members. Login or register to grow your forest!'); };
    } else if (currentUser.role === 'member') {
        navDashboard.classList.remove('nav-restricted');
        navScanner.classList.remove('nav-restricted');
        navGarden.classList.remove('nav-restricted');
        
        navDashboard.onclick = () => showPage('dashboard');
        navScanner.onclick = () => showPage('scanner');
        navGarden.onclick = () => showPage('garden');
    } else if (currentUser.role === 'organizer') {
        navDashboard.classList.remove('nav-restricted');
        navScanner.classList.remove('nav-restricted');
        navGarden.classList.remove('nav-restricted');
        
        navDashboard.onclick = () => showPage('dashboard');
        navScanner.onclick = () => showPage('scanner');
        navGarden.onclick = () => showPage('garden');
    }
}

function showGuestNotice(message) {
    document.getElementById('guestNoticeMessage').textContent = message;
    document.getElementById('guestNotice').style.display = 'flex';
}

function closeGuestNotice() {
    document.getElementById('guestNotice').style.display = 'none';
}

function openLoginModal() {
    closeGuestNotice();
    closeRegisterModal();
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('loginError').style.display = 'none';
}

function closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginContact').value = '';
    document.getElementById('loginPassword').value = '';
}


function openRegisterModal() {
    closeGuestNotice();
    closeLoginModal();
    document.getElementById('registerModal').style.display = 'flex';
    document.getElementById('registerError').style.display = 'none';
}

function closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('registerName').value = '';
    document.getElementById('registerSurname').value = '';
    document.getElementById('registerContact').value = '';
    document.getElementById('registerPassword1').value = '';
    document.getElementById('registerPassword2').value = '';
}


function toggleUserDropdown() {
    const dropdown = document.getElementById('userDropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

document.addEventListener('click', function(event) {
    const userMenu = document.querySelector('.user-menu');
    const dropdown = document.getElementById('userDropdown');
    
    if (userMenu && dropdown && !userMenu.contains(event.target)) {
        dropdown.style.display = 'none';
    }
});

let userData = {
    points: 0,
    level: 1,
    recycled_kg: 0,
    co2_saved: 0,
    rank: 1,
    currentLocation: null,
    nearestPoint: null,
    verifiedLocation: false
};

const recyclingPoints = [
  {
    id: 1,
    name: "LS Astana (main branch)",
    address: "Telzhan Shonanuły 36A",
    lat: 51.15,
    lon: 71.42,
    types: ["plastic", "paper", "glass", "metal"],
    hours: "09:00-20:00 (Mon-Sun)",
    notes: "Multiple branches in Astana; they pay for recyclables. Popular chain."
  },
  {
    id: 2,
    name: "LS Astana (Manasa branch)",
    address: "Manasa 11/4",
    lat: 51.14,
    lon: 71.43,
    types: ["plastic", "paper", "cardboard", "metal"],
    hours: "09:00-20:00",
    notes: "One of the LS Ecolife collection points"
  },
  {
    id: 3,
    name: "Ecomaf",
    address: "Kimasar 1",
    lat: 51.13,
    lon: 71.45,
    types: ["plastic", "paper", "glass", "metal"],
    hours: "Check locally",
    notes: "Focus on secondary raw materials"
  },
  {
    id: 4,
    name: "KALEKE",
    address: "Talapkerskaya 14a",
    lat: 51.17,
    lon: 71.40,
    types: ["paper", "plastic", "metal"],
    hours: "Standard business hours",
    notes: "High quality recycling service"
  },
  {
    id: 5,
    name: "Eco Point",
    address: "Rakhimzhana Koshkarbayeva 44",
    lat: 51.18,
    lon: 71.41,
    types: ["plastic", "glass", "paper"],
    hours: "Varies, often daytime",
    notes: "Common residential area location"
  },
  {
    id: 6,
    name: "Green Station",
    address: "Kravtsova 2/2, Baikonur district",
    lat: 51.14,
    lon: 71.50,
    types: ["paper", "plastic", "glass", "metal"],
    hours: "Daytime collection",
    notes: "Part of Astana Clean Time initiatives"
  }
];

let leaderboardData = [
    { name: "EcoWarrior", points: 5000, recycled: 45 },
    { name: "GreenHero", points: 3500, recycled: 32 },
    { name: "PlanetSaver", points: 2800, recycled: 28 },
    { name: "You", points: 0, recycled: 0 },
    { name: "NatureGuardian", points: 2200, recycled: 21 },
    { name: "TreeHugger", points: 1900, recycled: 18 },
    { name: "CleanCityFan", points: 1500, recycled: 15 },
];

const questTemplates = [
    { id: 1, title: "Cigarette Cleaner", desc: "Collect and dispose 5 cigarette butts", icon: "🚬", points: 50, type: "collect", target: 5 },
    { id: 2, title: "Can Crusher", desc: "Recycle 3 metal cans", icon: "🥫", points: 100, type: "recycle", target: 3, itemType: "metal" },
    { id: 3, title: "Plastic Fighter", desc: "Recycle 5 plastic bottles", icon: "🧴", points: 150, type: "recycle", target: 5, itemType: "plastic" },
    { id: 4, title: "Paper Saver", desc: "Recycle 2kg of paper", icon: "📄", points: 80, type: "weight", target: 2, itemType: "paper" },
    { id: 5, title: "Glass Hero", desc: "Recycle 4 glass bottles", icon: "🍾", points: 120, type: "recycle", target: 4, itemType: "glass" },
    { id: 6, title: "Battery Guardian", desc: "Recycle 2 batteries", icon: "🔋", points: 200, type: "recycle", target: 2, itemType: "batteries" },
    { id: 7, title: "Eco Warrior", desc: "Recycle any 3 items today", icon: "♻️", points: 100, type: "any", target: 3 },
    { id: 8, title: "Street Cleaner", desc: "Pick up 10 pieces of litter", icon: "🗑️", points: 75, type: "collect", target: 10 },
];

let dailyQuests = [];
const achievements = [
    { id: 1, name: "First Steps", icon: "🌱", desc: "Recycle first item", requirement: 1, earned: false },
    { id: 2, name: "Eco Beginner", icon: "🌿", desc: "Earn 500 points", requirement: 500, earned: false },
    { id: 3, name: "Green Warrior", icon: "⚔️", desc: "Earn 1000 points", requirement: 1000, earned: false },
    { id: 4, name: "Planet Hero", icon: "🌍", desc: "Recycle 10kg", requirement: 10, earned: false },
    { id: 5, name: "Eco Champion", icon: "🏆", desc: "Reach Level 5", requirement: 5, earned: false },
    { id: 6, name: "Tree Planter", icon: "🌳", desc: "Save 50kg CO₂", requirement: 50, earned: false },
];

const POINTS_PER_KG = {
    plastic: 100,
    glass: 50,
    paper: 30,
    metal: 150,
    batteries: 200
};

const CO2_PER_KG = {
    plastic: 1.5,
    glass: 0.5,
    paper: 1.0,
    metal: 3.0,
    batteries: 2.0
};

let map;
let markers = [];
let currentFilter = 'all';

function initMap() {
    map = L.map('map').setView([51.1694, 71.4491], 12);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    displayMarkers();
}

function displayMarkers(filter = 'all') {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    let pointsToShow = recyclingPoints;
    if (filter !== 'all') {
        pointsToShow = recyclingPoints.filter(point => 
            point.types.includes(filter)
        );
    }
    
    pointsToShow.forEach(point => {
        const marker = L.marker([point.lat, point.lon])
            .bindPopup(`
                <div style="text-align: center;">
                    <h3>${point.name}</h3>
                    <p><strong>Address:</strong> ${point.address}</p>
                    <p><strong>Accepts:</strong> ${point.types.join(', ')}</p>
                    <p><strong>Hours:</strong> ${point.hours}</p>
                    <p style="font-size: 0.875rem; color: #666;">${point.notes}</p>
                </div>
            `)
            .addTo(map);
        markers.push(marker);
    });
}

function filterMap(type) {
    currentFilter = type;
    displayMarkers(type);
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

function showPage(pageName) {
    if (!currentUser || currentUser.role === 'guest') {
        if (pageName === 'dashboard') {
            showGuestNotice('Dashboard is only available to members. Login or register to track your impact!');
            return;
        }
        if (pageName === 'scanner') {
            showGuestNotice('Activity logging is only available to members. Login or register to start earning points!');
            return;
        }
        if (pageName === 'garden') {
            showGuestNotice('Eco Forest is only available to members. Login or register to grow your forest!');
            return;
        }
    }
    
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    document.getElementById(`page-${pageName}`).classList.add('active');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    if (pageName === 'dashboard') {
        updateDashboard();
    }
    
    if (pageName === 'leaderboard') {
        updateLeaderboard();
    }
    
    if (pageName === 'garden') {
        if (!forest.canvas) {
            setTimeout(() => initForest(), 100);
        }
        updateForestStats();
    }
    
    if (pageName === 'initiatives') {
        renderInitiatives();
    }
}

function logRecycling() {
    if (!userData.verifiedLocation) {
        alert('⚠️ Please verify your location first!');
        return;
    }
    if (!currentUser || currentUser.role === 'guest') {
        showGuestNotice('Activity logging is only available to members. Login or register to start earning points!');
        return;
    }
    
    const itemType = document.getElementById('itemType').value;
    const weight = parseFloat(document.getElementById('itemWeight').value);
    
    if (!itemType || !weight || weight <= 0) {
        alert('Please select item type and enter valid weight');
        return;
    }
    
    const pointsEarned = Math.round(weight * POINTS_PER_KG[itemType]);
    const co2Saved = (weight * CO2_PER_KG[itemType]).toFixed(2);
    
    userData.points += pointsEarned;
    userData.recycled_kg += weight;
    userData.co2_saved += parseFloat(co2Saved);
    userData.level = Math.floor(userData.points / 1000) + 1;
    
    currentUser.points = userData.points;
    currentUser.level = userData.level;
    currentUser.recycled_kg = userData.recycled_kg;
    currentUser.co2_saved = userData.co2_saved;
    localStorage.setItem('ecocity_current_user', JSON.stringify(currentUser));
    
    updateQuestProgress('recycle', itemType, 1);
    if (itemType === 'paper' || itemType === 'plastic') {
        updateQuestProgress('weight', itemType, weight);
    }
     const userIndex = users.findIndex(u => normalizeContact(u.contact) === normalizeContact(currentUser.contact));
    if (userIndex !== -1) {
        users[userIndex].points = userData.points;
        users[userIndex].level = userData.level;
        users[userIndex].recycled_kg = userData.recycled_kg;
        users[userIndex].co2_saved = userData.co2_saved;
        localStorage.setItem('ecocity_users', JSON.stringify(users));
    }
    
    const userIndex2 = leaderboardData.findIndex(u => u.name === "You");
    leaderboardData[userIndex2].points = userData.points;
    leaderboardData[userIndex2].recycled = userData.recycled_kg;
    
    checkAchievements();
    
    document.getElementById('pointsEarned').textContent = `You earned ${pointsEarned} eco-points!`;
    document.getElementById('impactMessage').textContent = `You saved ${co2Saved} kg of CO₂ 🌍`;
    document.getElementById('scanResult').style.display = 'block';
    
    updateNavDisplay();
    userData.verifiedLocation = false;
    setTimeout(() => {
        document.getElementById('itemType').value = '';
        document.getElementById('itemWeight').value = '';
        document.getElementById('scanResult').style.display = 'none';
        document.getElementById('recyclingForm').style.display = 'none';
        document.getElementById('locationStatus').innerHTML = '';
        document.getElementById('checkLocationBtn').style.display = 'block';
        document.getElementById('checkLocationBtn').disabled = false;
        document.getElementById('checkLocationBtn').textContent = '📍 Check My Location';
    }, 3000);
}

function updateDashboard() {
    document.getElementById('totalPoints').textContent = userData.points;
    document.getElementById('totalRecycled').textContent = `${userData.recycled_kg.toFixed(1)} kg`;
    document.getElementById('co2Saved').textContent = `${userData.co2_saved.toFixed(1)} kg`;
    
    leaderboardData.sort((a, b) => b.points - a.points);
    const userRank = leaderboardData.findIndex(u => u.name === "You") + 1;
    userData.rank = userRank;
    document.getElementById('userRank').textContent = `#${userRank}`;
    
    const achievementList = document.getElementById('achievementList');
    achievementList.innerHTML = '';
    
    achievements.forEach(ach => {
        const div = document.createElement('div');
        div.className = `achievement-item ${ach.earned ? 'earned' : ''}`;
        div.innerHTML = `
            <div class="achievement-icon">${ach.icon}</div>
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.desc}</div>
        `;
        achievementList.appendChild(div);
    });
}

function checkAchievements() {
    achievements.forEach(ach => {
        if (!ach.earned) {
            if (ach.id === 1 && userData.recycled_kg >= ach.requirement) ach.earned = true;
            if (ach.id === 2 && userData.points >= ach.requirement) ach.earned = true;
            if (ach.id === 3 && userData.points >= ach.requirement) ach.earned = true;
            if (ach.id === 4 && userData.recycled_kg >= ach.requirement) ach.earned = true;
            if (ach.id === 5 && userData.level >= ach.requirement) ach.earned = true;
            if (ach.id === 6 && userData.co2_saved >= ach.requirement) ach.earned = true;
        }
    });
}

function updateLeaderboard() {
    leaderboardData.sort((a, b) => b.points - a.points);
    
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    
    leaderboardData.forEach((user, index) => {
        const div = document.createElement('div');
        const isCurrentUser = currentUser && user.name === "You";
        div.className = `leaderboard-item ${index < 3 ? 'top3' : ''} ${isCurrentUser ? 'current-user' : ''}`;
        
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        div.innerHTML = `
            <div class="leaderboard-rank">${medal || `#${index + 1}`}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${isCurrentUser ? getCurrentDisplayName() : user.name}</div>
                <div class="leaderboard-stats">${user.recycled.toFixed(1)} kg recycled</div>
            </div>
            <div class="leaderboard-points">${user.points} pts</div>
        `;
        list.appendChild(div);
    });
}

function updateNavDisplay() {
    if (currentUser && currentUser.role !== 'guest') {
        document.getElementById('userPoints').textContent = `${userData.points}`;
        document.getElementById('userLevel').textContent = `${userData.level}`;
    }
}

const SPECIES_DATA = {
    oak: { cost: 500, co2: 21, color: '#2d5016', crownColor: '#4a7c59', height: 4.5 },
    pine: { cost: 400, co2: 18, color: '#1a4d2e', crownColor: '#2a6d3e', height: 5 },
    birch: { cost: 350, co2: 15, color: '#d4d4d4', crownColor: '#5a9a5a', height: 4 },
    maple: { cost: 450, co2: 19, color: '#4a3a2a', crownColor: '#8b0000', height: 4.2 },
    willow: { cost: 380, co2: 16, color: '#5a4a3a', crownColor: '#5a7a32', height: 4.8 },
    spruce: { cost: 480, co2: 20, color: '#3a2a1a', crownColor: '#0f3d1e', height: 5.2 },
    bush: { cost: 200, co2: 5, color: '#4a7c59', crownColor: '#556b2f', height: 1.5 },
    flower: { cost: 100, co2: 2, color: '#2d5016', crownColor: '#ff69b4', height: 0.8 }
};

const TIME_THEMES = {
    dawn: {
        sky: ['#1a2a3a', '#ff6b9d', '#ffa07a'],
        ambient: 0.6,
        shadowAlpha: 0.4
    },
    day: {
        sky: ['#87CEEB', '#4a90e2', '#2d6ba8'],
        ambient: 1.0,
        shadowAlpha: 0.3
    },
    dusk: {
        sky: ['#ff6b35', '#dc143c', '#1a1a2e'],
        ambient: 0.5,
        shadowAlpha: 0.5
    },
    night: {
        sky: ['#0a0a1a', '#1a1a3a', '#000000'],
        ambient: 0.3,
        shadowAlpha: 0.6
    }
};

let forest = {
    canvas: null,
    ctx: null,
    particleCanvas: null,
    particleCtx: null,
    trees: [],
    particles: [],
    wildlife: [],
    selectedSpecies: null,
    timeOfDay: 'day',
    rotation: 0,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    gridSize: 10,
    cellSize: 50,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    animationFrame: null,
    particlesEnabled: true,
    mouseGridPos: null
};

class Tree {
    constructor(x, y, species) {
        this.x = x;
        this.y = y;
        this.species = species;
        const data = SPECIES_DATA[species];
        this.co2 = data.co2;
        this.color = data.color;
        this.crownColor = data.crownColor;
        this.maxHeight = data.height;
        this.height = 0;
        this.growthProgress = 0;
        this.swayOffset = Math.random() * Math.PI * 2;
        this.age = 0;
        this.id = Date.now() + Math.random();
    }
    
    update(deltaTime) {
        this.age += deltaTime;
        
        if (this.growthProgress < 1) {
            this.growthProgress += 0.003;
            this.height = this.maxHeight * this.easeOutCubic(this.growthProgress);
        }
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    draw(ctx, iso) {
        const scale = forest.scale;
        const theme = TIME_THEMES[forest.timeOfDay];
        const sway = Math.sin(Date.now() / 1000 + this.swayOffset) * 1.5 * this.growthProgress;
        
        const isoX = (this.x - this.y) * forest.cellSize * scale + iso.centerX + forest.offsetX;
        const isoY = (this.x + this.y) * (forest.cellSize / 2) * scale + iso.centerY + forest.offsetY;
        
        ctx.save();
        ctx.globalAlpha = theme.shadowAlpha * this.growthProgress;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        const shadowSize = this.maxHeight * 12 * scale * this.growthProgress;
        ctx.ellipse(isoX, isoY + 5, shadowSize, shadowSize * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        
        const heightPx = this.height * 20 * scale;
        
        ctx.save();
        ctx.globalAlpha = theme.ambient;
        const trunkWidth = Math.max(3, this.maxHeight * 2) * scale * this.growthProgress;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = trunkWidth;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(isoX, isoY);
        ctx.lineTo(isoX + sway, isoY - heightPx);
        ctx.stroke();
        
        const crownX = isoX + sway;
        const crownY = isoY - heightPx;
        const crownSize = this.maxHeight * 15 * scale * this.growthProgress;
        
        if (this.species === 'pine' || this.species === 'spruce') {
            ctx.fillStyle = this.crownColor;
            ctx.beginPath();
            ctx.moveTo(crownX, crownY - crownSize);
            ctx.lineTo(crownX - crownSize * 0.6, crownY);
            ctx.lineTo(crownX + crownSize * 0.6, crownY);
            ctx.closePath();
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
            ctx.beginPath();
            ctx.moveTo(crownX, crownY - crownSize);
            ctx.lineTo(crownX - crownSize * 0.3, crownY - crownSize * 0.5);
            ctx.lineTo(crownX, crownY - crownSize * 0.3);
            ctx.closePath();
            ctx.fill();
        } else if (this.species === 'willow') {
            ctx.fillStyle = this.crownColor;
            ctx.beginPath();
            ctx.ellipse(crownX, crownY, crownSize, crownSize * 1.3, 0, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
            ctx.beginPath();
            ctx.ellipse(crownX, crownY + crownSize * 0.3, crownSize * 0.8, crownSize * 0.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.species === 'flower') {
            const petalCount = 5;
            const petalSize = crownSize * 0.6;
            ctx.fillStyle = this.crownColor;
            
            for (let i = 0; i < petalCount; i++) {
                const angle = (Math.PI * 2 * i) / petalCount;
                const px = crownX + Math.cos(angle) * crownSize * 0.4;
                const py = crownY + Math.sin(angle) * crownSize * 0.4;
                ctx.beginPath();
                ctx.arc(px, py, petalSize, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(crownX, crownY, crownSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            ctx.fillStyle = this.crownColor;
            ctx.beginPath();
            ctx.arc(crownX, crownY, crownSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.beginPath();
            ctx.arc(crownX - crownSize * 0.3, crownY - crownSize * 0.3, crownSize * 0.4, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.beginPath();
            ctx.arc(crownX + crownSize * 0.2, crownY + crownSize * 0.2, crownSize * 0.5, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = Math.random() * -0.5 - 0.2;
        this.life = 1;
        this.maxLife = type === 'leaf' ? 3000 : 5000;
        this.size = type === 'leaf' ? 4 : 3;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.05;
        this.opacity = 1;
        this.color = type === 'firefly' ? '#FFD700' : type === 'butterfly' ? '#ff69b4' : '#4a7c59';
        this.birthTime = Date.now();
    }
    
    update(deltaTime) {
        const age = Date.now() - this.birthTime;
        this.life = 1 - (age / this.maxLife);
        
        if (this.life <= 0) return false;
        
        if (this.type === 'leaf') {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.02;
            this.rotation += this.rotationSpeed;
            this.opacity = this.life;
        } else if (this.type === 'butterfly') {
            this.x += Math.sin(age / 200) * 0.5;
            this.y += Math.cos(age / 300) * 0.3 - 0.1;
            this.rotation = Math.sin(age / 100) * 0.2;
        } else if (this.type === 'firefly') {
            this.x += Math.sin(age / 500) * 0.3;
            this.y += Math.cos(age / 400) * 0.3;
            this.opacity = 0.5 + Math.sin(age / 200) * 0.5;
        }
        
        return true;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.opacity * this.life;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        if (this.type === 'leaf') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'butterfly') {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(-this.size, 0, this.size, this.size * 1.5, -0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.ellipse(this.size, 0, this.size, this.size * 1.5, 0.3, 0, Math.PI * 2);
            ctx.fill();
        } else if (this.type === 'firefly') {
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
        
        ctx.restore();
    }
}

function initForest() {
    forest.canvas = document.getElementById('forestCanvas');
    forest.ctx = forest.canvas.getContext('2d');
    forest.particleCanvas = document.getElementById('particleCanvas');
    forest.particleCtx = forest.particleCanvas.getContext('2d');
    
    resizeForestCanvas();
    window.addEventListener('resize', resizeForestCanvas);
    
    loadForest();
    
    forest.canvas.addEventListener('mousedown', onForestMouseDown);
    forest.canvas.addEventListener('mousemove', onForestMouseMove);
    forest.canvas.addEventListener('mouseup', onForestMouseUp);
    forest.canvas.addEventListener('wheel', onForestWheel);
    forest.canvas.addEventListener('click', onForestClick);
    forest.canvas.addEventListener('mouseleave', () => { forest.mouseGridPos = null; });
    
    forest.canvas.addEventListener('touchstart', onForestTouchStart);
    forest.canvas.addEventListener('touchmove', onForestTouchMove);
    forest.canvas.addEventListener('touchend', onForestTouchEnd);
    
    animateForest();
    
    setInterval(spawnParticles, 1000);
}

function resizeForestCanvas() {
    const container = forest.canvas.parentElement;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    forest.canvas.width = width;
    forest.canvas.height = height;
    forest.particleCanvas.width = width;
    forest.particleCanvas.height = height;
}

let lastTime = Date.now();

function animateForest() {
    const now = Date.now();
    const deltaTime = now - lastTime;
    lastTime = now;
    
    drawForest(deltaTime);
    
    if (forest.particlesEnabled) {
        drawParticles(deltaTime);
    }
    
    forest.animationFrame = requestAnimationFrame(animateForest);
}

function drawForest(deltaTime) {
    const ctx = forest.ctx;
    const canvas = forest.canvas;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const theme = TIME_THEMES[forest.timeOfDay];
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, theme.sky[0]);
    gradient.addColorStop(0.5, theme.sky[1]);
    gradient.addColorStop(1, theme.sky[2]);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const iso = {
        centerX: canvas.width / 2,
        centerY: canvas.height / 2
    };
    
    drawGround(ctx, iso, theme);
    
    const sortedTrees = [...forest.trees].sort((a, b) => (a.x + a.y) - (b.x + b.y));
    sortedTrees.forEach(tree => {
        tree.update(deltaTime);
        tree.draw(ctx, iso);
    });
    
    if (forest.selectedSpecies && forest.mouseGridPos) {
        drawPlacementIndicator(ctx, iso);
    }
}

function drawGround(ctx, iso, theme) {
    const gridSize = forest.gridSize;
    const cellSize = forest.cellSize;
    const scale = forest.scale;
    
    ctx.save();
    ctx.globalAlpha = theme.ambient;
    
    const corners = getGroundCorners(iso, gridSize, cellSize, scale);
    
    const groundGradient = ctx.createRadialGradient(
        iso.centerX, iso.centerY, 0,
        iso.centerX, iso.centerY,
        Math.max(forest.canvas.width, forest.canvas.height) / 2
    );
    groundGradient.addColorStop(0, '#3a5a2a');
    groundGradient.addColorStop(0.7, '#2a4a1a');
    groundGradient.addColorStop(1, '#1a3a0a');
    
    ctx.fillStyle = groundGradient;
    ctx.beginPath();
    ctx.moveTo(corners.top.x, corners.top.y);
    ctx.lineTo(corners.right.x, corners.right.y);
    ctx.lineTo(corners.bottom.x, corners.bottom.y);
    ctx.lineTo(corners.left.x, corners.left.y);
    ctx.closePath();
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x <= gridSize; x++) {
        for (let y = 0; y <= gridSize; y++) {
            const isoX = (x - y) * cellSize * scale + iso.centerX + forest.offsetX;
            const isoY = (x + y) * (cellSize / 2) * scale + iso.centerY + forest.offsetY;
            
            if (x < gridSize) {
                const nextIsoX = ((x + 1) - y) * cellSize * scale + iso.centerX + forest.offsetX;
                const nextIsoY = ((x + 1) + y) * (cellSize / 2) * scale + iso.centerY + forest.offsetY;
                ctx.beginPath();
                ctx.moveTo(isoX, isoY);
                ctx.lineTo(nextIsoX, nextIsoY);
                ctx.stroke();
            }
            
            if (y < gridSize) {
                const nextIsoX = (x - (y + 1)) * cellSize * scale + iso.centerX + forest.offsetX;
                const nextIsoY = (x + (y + 1)) * (cellSize / 2) * scale + iso.centerY + forest.offsetY;
                ctx.beginPath();
                ctx.moveTo(isoX, isoY);
                ctx.lineTo(nextIsoX, nextIsoY);
                ctx.stroke();
            }
        }
    }
    
    ctx.restore();
}

function haversineDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3;
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function checkLocationForLogging() {
    const btn = document.getElementById('checkLocationBtn');
    const statusDiv = document.getElementById('locationStatus');
    
    btn.disabled = true;
    btn.textContent = '📍 Getting location...';
    statusDiv.innerHTML = '<p>🔄 Checking your location...</p>';
    
    if (!navigator.geolocation) {
        statusDiv.innerHTML = '<p class="error">❌ Geolocation not supported by your browser</p>';
        statusDiv.className = 'location-status error';
        btn.disabled = false;
        btn.textContent = '📍 Check My Location';
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLon = position.coords.longitude;
            
            userData.currentLocation = { lat: userLat, lon: userLon };
            
            let nearestPoint = null;
            let minDistance = Infinity;
            
            recyclingPoints.forEach(point => {
                const distance = haversineDistance(userLat, userLon, point.lat, point.lon);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestPoint = point;
                }
            });
            
            const distanceKm = (minDistance / 1000).toFixed(2);
            
            if (minDistance <= 100) {
                userData.nearestPoint = nearestPoint;
                userData.verifiedLocation = true;
                
                statusDiv.innerHTML = `
                    <p>✅ <strong>Location Verified!</strong></p>
                    <p>You are at: <strong>${nearestPoint.name}</strong></p>
                    <p>Distance: ${minDistance.toFixed(0)}m</p>
                `;
                statusDiv.className = 'location-status success';
                
                document.getElementById('recyclingForm').style.display = 'block';
                btn.style.display = 'none';
            } else {
                userData.verifiedLocation = false;
                
                statusDiv.innerHTML = `
                    <p>❌ <strong>Too far from recycling point</strong></p>
                    <p>Nearest point: <strong>${nearestPoint.name}</strong></p>
                    <p>Distance: <strong>${distanceKm} km</strong> away</p>
                    <p>You must be within <strong>100 meters</strong> to log recycling</p>
                `;
                statusDiv.className = 'location-status error';
                
                btn.disabled = false;
                btn.textContent = '📍 Try Again';
            }
        },
        (error) => {
            let errorMessage = '';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = '❌ Location access denied. Please enable location permissions.';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = '❌ Location information unavailable.';
                    break;
                case error.TIMEOUT:
                    errorMessage = '❌ Location request timed out.';
                    break;
                default:
                    errorMessage = '❌ Unknown error occurred.';
            }
            
            statusDiv.innerHTML = `<p>${errorMessage}</p>`;
            statusDiv.className = 'location-status error';
            btn.disabled = false;
            btn.textContent = '📍 Try Again';
        }
    );
}

function generateDailyQuests() {
    const today = new Date().toDateString();
    const saved = loadQuests();
    
    if (saved && saved.date === today) {
        dailyQuests = saved.quests;
    } else {
        const shuffled = [...questTemplates].sort(() => Math.random() - 0.5);
        dailyQuests = shuffled.slice(0, 3).map(template => ({
            ...template,
            progress: 0,
            completed: false
        }));
        saveQuests();
    }
    
    displayQuests();
    updateQuestTimer();
    setInterval(updateQuestTimer, 1000);
}

function loadQuests() {
    const saved = localStorage.getItem('ecocity_daily_quests');
    return saved ? JSON.parse(saved) : null;
}

function saveQuests() {
    const data = {
        date: new Date().toDateString(),
        quests: dailyQuests
    };
    localStorage.setItem('ecocity_daily_quests', JSON.stringify(data));
}

function displayQuests() {
    const container = document.getElementById('questsList');
    if (!container) return;
    
    container.innerHTML = dailyQuests.map(quest => {
        const progressPercent = Math.min(100, (quest.progress / quest.target) * 100);
        
        return `
            <div class="quest-card ${quest.completed ? 'completed' : ''}">
                <div class="quest-header">
                    <div class="quest-icon">${quest.icon}</div>
                    <div class="quest-info">
                        <div class="quest-title">${quest.title}</div>
                        <div class="quest-desc">${quest.desc}</div>
                    </div>
                </div>
                
                <div class="quest-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progressPercent}%"></div>
                    </div>
                    <div class="progress-text">${quest.progress} / ${quest.target}</div>
                </div>
                
                <div class="quest-reward">
                    <div class="quest-points">
                        <span>⭐</span>
                        <span>${quest.points} points</span>
                    </div>
                    <button class="quest-complete-btn" 
                            ${quest.completed || quest.progress < quest.target ? 'disabled' : ''}
                            onclick="completeQuest(${quest.id})">
                        ${quest.completed ? '✓ Completed' : 'Claim Reward'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function updateQuestTimer() {
    const timerEl = document.getElementById('questTimer');
    if (!timerEl) return;
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    timerEl.textContent = `${hours}h ${minutes}m ${seconds}s`;
}

function updateQuestProgress(type, itemType, amount) {
    dailyQuests.forEach(quest => {
        if (quest.completed) return;
        
        if (quest.type === 'any') {
            quest.progress += amount;
        } else if (quest.type === type && (!quest.itemType || quest.itemType === itemType)) {
            quest.progress += amount;
        }
    });
    
    saveQuests();
    displayQuests();
}

function completeQuest(questId) {
    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || quest.completed || quest.progress < quest.target) return;
    
    quest.completed = true;
    userData.points += quest.points;
    
    if (currentUser) {
        currentUser.points = userData.points;
        localStorage.setItem('ecocity_current_user', JSON.stringify(currentUser));
        
        const userIndex = users.findIndex(u => normalizeContact(u.contact) === normalizeContact(currentUser.contact));
        if (userIndex !== -1) {
            users[userIndex].points = userData.points;
            localStorage.setItem('ecocity_users', JSON.stringify(users));
        }
    }
    
    saveQuests();
    displayQuests();
    updateNavDisplay();
    
    alert(`🎉 Quest completed! You earned ${quest.points} points!`);
}

function getGroundCorners(iso, gridSize, cellSize, scale) {
    return {
        top: {
            x: (0 - 0) * cellSize * scale + iso.centerX + forest.offsetX,
            y: (0 + 0) * (cellSize / 2) * scale + iso.centerY + forest.offsetY
        },
        right: {
            x: (gridSize - 0) * cellSize * scale + iso.centerX + forest.offsetX,
            y: (gridSize + 0) * (cellSize / 2) * scale + iso.centerY + forest.offsetY
        },
        bottom: {
            x: (gridSize - gridSize) * cellSize * scale + iso.centerX + forest.offsetX,
            y: (gridSize + gridSize) * (cellSize / 2) * scale + iso.centerY + forest.offsetY
        },
        left: {
            x: (0 - gridSize) * cellSize * scale + iso.centerX + forest.offsetX,
            y: (0 + gridSize) * (cellSize / 2) * scale + iso.centerY + forest.offsetY
        }
    };
}

function drawPlacementIndicator(ctx, iso) {
    const pos = forest.mouseGridPos;
    const scale = forest.scale;
    
    const isoX = (pos.x - pos.y) * forest.cellSize * scale + iso.centerX + forest.offsetX;
    const isoY = (pos.x + pos.y) * (forest.cellSize / 2) * scale + iso.centerY + forest.offsetY;
    
    ctx.save();
    ctx.strokeStyle = '#00e676';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const size = forest.cellSize * scale * 0.4;
    ctx.beginPath();
    ctx.arc(isoX, isoY, size, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0, 230, 118, 0.2)';
    ctx.fill();
    
    ctx.restore();
}

function drawParticles(deltaTime) {
    const ctx = forest.particleCtx;
    const canvas = forest.particleCanvas;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    forest.particles = forest.particles.filter(particle => {
        const alive = particle.update(deltaTime);
        if (alive) {
            particle.draw(ctx);
        }
        return alive;
    });
}

function spawnParticles() {
    if (!forest.particlesEnabled || forest.trees.length === 0) return;
    
    const canvas = forest.canvas;
    const count = Math.min(3, Math.ceil(forest.trees.length / 5));
    
    const timeOfDay = forest.timeOfDay;
    let particleType = 'leaf';
    
    if (timeOfDay === 'night') {
        particleType = Math.random() > 0.5 ? 'firefly' : 'leaf';
    } else if (timeOfDay === 'day' && Math.random() > 0.7) {
        particleType = 'butterfly';
    }
    
    for (let i = 0; i < count; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height * 0.3;
        forest.particles.push(new Particle(x, y, particleType));
    }
}

function onForestMouseDown(e) {
    forest.isDragging = true;
    forest.lastX = e.clientX;
    forest.lastY = e.clientY;
}

function onForestMouseMove(e) {
    const rect = forest.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    forest.mouseGridPos = screenToGrid(mouseX, mouseY);
    
    if (!forest.isDragging) return;
    
    const dx = e.clientX - forest.lastX;
    const dy = e.clientY - forest.lastY;
    
    forest.offsetX += dx;
    forest.offsetY += dy;
    
    forest.lastX = e.clientX;
    forest.lastY = e.clientY;
}

function onForestMouseUp(e) {
    forest.isDragging = false;
}

function onForestWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.95 : 1.05;
    forest.scale = Math.max(0.5, Math.min(2, forest.scale * delta));
}

function onForestTouchStart(e) {
    if (e.touches.length === 1) {
        forest.isDragging = true;
        forest.lastX = e.touches[0].clientX;
        forest.lastY = e.touches[0].clientY;
    }
}

function onForestTouchMove(e) {
    if (!forest.isDragging || e.touches.length !== 1) return;
    
    const dx = e.touches[0].clientX - forest.lastX;
    const dy = e.touches[0].clientY - forest.lastY;
    
    forest.offsetX += dx;
    forest.offsetY += dy;
    
    forest.lastX = e.touches[0].clientX;
    forest.lastY = e.touches[0].clientY;
}

function onForestTouchEnd(e) {
    forest.isDragging = false;
}

function onForestClick(e) {
    if (forest.isDragging) return;
    
    if (!forest.selectedSpecies) {
        return;
    }
    
    const rect = forest.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const gridPos = screenToGrid(mouseX, mouseY);
    
    if (gridPos) {
        plantTree(gridPos.x, gridPos.y);
    }
}

function screenToGrid(screenX, screenY) {
    const canvas = forest.canvas;
    const isoCenterX = canvas.width / 2 + forest.offsetX;
    const isoCenterY = canvas.height / 2 + forest.offsetY;
    
    const cellSize = forest.cellSize * forest.scale;
    
    const isoX = screenX - isoCenterX;
    const isoY = screenY - isoCenterY;
    
    const gridX = Math.floor((isoX / cellSize + isoY / (cellSize / 2)) / 2);
    const gridY = Math.floor((isoY / (cellSize / 2) - isoX / cellSize) / 2);
    
    if (gridX >= 0 && gridX < forest.gridSize && gridY >= 0 && gridY < forest.gridSize) {
        return { x: gridX, y: gridY };
    }
    
    return null;
}

function selectSpecies(species) {
    if (!currentUser || currentUser.role === 'guest') {
        showGuestNotice('Eco Forest is only available to members. Login or register to grow your forest!');
        return;
    }
    
    const data = SPECIES_DATA[species];
    
    if (userData.points < data.cost) {
        alert(`Not enough points! You need ${data.cost} points.`);
        return;
    }
    
    forest.selectedSpecies = species;
    
    document.querySelectorAll('.species-card').forEach(card => {
        card.classList.remove('selected');
    });
    document.querySelector(`[data-species="${species}"]`).classList.add('selected');
    
    document.getElementById('selectionIndicator').style.display = 'block';
    document.getElementById('indicatorText').textContent = `${species.charAt(0).toUpperCase() + species.slice(1)} selected`;
}

function clearSpeciesSelection() {
    forest.selectedSpecies = null;
    document.getElementById('selectionIndicator').style.display = 'none';
    document.querySelectorAll('.species-card').forEach(card => {
        card.classList.remove('selected');
    });
}

function plantTree(x, y) {
    const occupied = forest.trees.some(t => t.x === x && t.y === y);
    if (occupied) {
        return;
    }
    
    const species = forest.selectedSpecies;
    const data = SPECIES_DATA[species];
    
    userData.points -= data.cost;
    
    if (currentUser) {
        currentUser.points = userData.points;
        localStorage.setItem('ecocity_current_user', JSON.stringify(currentUser));
        
       const userIndex = users.findIndex(u => normalizeContact(u.contact) === normalizeContact(currentUser.contact));
        if (userIndex !== -1) {
            users[userIndex].points = userData.points;
            localStorage.setItem('ecocity_users', JSON.stringify(users));
        }
    }
    
    const tree = new Tree(x, y, species);
    forest.trees.push(tree);
    
    updateForestStats();
    updateNavDisplay();
    saveForest();
    clearSpeciesSelection();
}

function updateForestStats() {
    const treeCount = forest.trees.length;
    const totalCO2 = forest.trees.reduce((sum, tree) => sum + tree.co2, 0);
    const health = Math.min(100, (treeCount / 20) * 100);
    const wildlife = Math.floor(treeCount / 5);
    
    document.getElementById('forestPoints').textContent = `${userData.points} pts`;
    document.getElementById('totalTrees').textContent = treeCount;
    document.getElementById('forestCO2').textContent = `${totalCO2} kg`;
    document.getElementById('forestHealth').textContent = `${Math.round(health)}%`;
    document.getElementById('healthBar').style.width = `${health}%`;
    document.getElementById('wildlifeCount').textContent = wildlife;
    
    if (treeCount === 10 && !sessionStorage.getItem('forest_milestone_10')) {
        showForestInfo('🌲 Growing Forest', 'Your forest is taking shape! Keep planting.');
        sessionStorage.setItem('forest_milestone_10', 'true');
    } else if (treeCount === 25 && !sessionStorage.getItem('forest_milestone_25')) {
        showForestInfo('🦋 Thriving Ecosystem', 'Wildlife is attracted to your forest!');
        sessionStorage.setItem('forest_milestone_25', 'true');
    }
}

function showForestInfo(title, desc) {
    const info = document.getElementById('forestInfo');
    info.querySelector('.forest-info-title').textContent = title;
    info.querySelector('.forest-info-desc').textContent = desc;
    info.style.display = 'block';
    
    setTimeout(() => {
        info.style.display = 'none';
    }, 3000);
}

function saveForest() {
    if (!currentUser) return;
    
    const data = {
        trees: forest.trees.map(t => ({
            x: t.x,
            y: t.y,
            species: t.species
        })),
        timeOfDay: forest.timeOfDay
    };
    localStorage.setItem(`ecocity_forest_${currentUser.contact}`, JSON.stringify(data));
}

function loadForest() {
    if (!currentUser) return;
    
    const saved = localStorage.getItem(`ecocity_forest_${currentUser.contact}`);
    if (saved) {
        const data = JSON.parse(saved);
        forest.trees = data.trees.map(t => {
            const tree = new Tree(t.x, t.y, t.species);
            tree.growthProgress = 1;
            tree.height = tree.maxHeight;
            return tree;
        });
        forest.timeOfDay = data.timeOfDay || 'day';
        updateTimeUI();
    }
}

function setTimeOfDay(time) {
    forest.timeOfDay = time;
    updateTimeUI();
    saveForest();
}

function updateTimeUI() {
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-time="${forest.timeOfDay}"]`).classList.add('active');
}

function clearForest() {
    if (!confirm('Clear your entire forest? This cannot be undone!')) {
        return;
    }
    
    forest.trees = [];
    saveForest();
    updateForestStats();
}

function shareForest() {
    const treeCount = forest.trees.length;
    const totalCO2 = forest.trees.reduce((sum, tree) => sum + tree.co2, 0);
    const message = `🌲 My EcoCity Forest:\n${treeCount} trees planted\n${totalCO2} kg CO₂ absorbed per year!\n\nHelping build a greener planet 🌍`;
    
    if (navigator.share) {
        navigator.share({ title: 'My Eco Forest', text: message });
    } else {
        navigator.clipboard.writeText(message).then(() => {
            showForestInfo('📋 Copied!', 'Forest stats copied to clipboard');
        });
    }
}

function rotateForestLeft() {
    forest.rotation -= 45;
}

function rotateForestRight() {
    forest.rotation += 45;
}

function resetForestView() {
    forest.scale = 1;
    forest.offsetX = 0;
    forest.offsetY = 0;
    forest.rotation = 0;
}

function toggleParticles() {
    forest.particlesEnabled = !forest.particlesEnabled;
    const btn = document.getElementById('particleToggle');
    btn.classList.toggle('active');
    
    if (!forest.particlesEnabled) {
        forest.particles = [];
        forest.particleCtx.clearRect(0, 0, forest.particleCanvas.width, forest.particleCanvas.height);
    }
}

window.onload = function() {
    initAuth();
    initMap();
    updateNavDisplay();
    updateDashboard();
    generateDailyQuests();
};

let initiatives = [
    {
        id: 1,
        type: 'planting',
        title: 'Tree Planting at Botanical Garden',
        description: 'Join us to plant 300 trees and shrubs at the Botanical Garden. Saplings and tools provided.',
        date: '2026-04-15',
        time: '10:00',
        location: 'Botanical Garden, Bukhar Zhyrau St.',
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
        title: 'Yesil River Bank Cleanup',
        description: 'Spring cleanup of the Yesil River embankment. Help make our city cleaner!',
        date: '2026-03-20',
        time: '09:00',
        location: 'Yesil River Embankment, near Amman St.',
        organizer: 'Clean Astana',
        contact: 'volunteers.astana@example.com',
        volunteersNeeded: 100,
        volunteersRegistered: 87,
        bonusPoints: 50,
        registeredUsers: [],
        createdBy: null
    },
    {
        id: 3,
        type: 'recycling',
        title: 'Plastic Collection Drive',
        description: 'Mobile collection point for plastic bottles and containers. Recycle and earn bonuses!',
        date: '2026-03-18',
        time: '12:00',
        location: 'Asia Park Mall, parking lot',
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
        title: 'Workshop: Zero Waste Living',
        description: 'Practical seminar on reducing waste in daily life. Learn to make eco-bags and reusable packaging.',
        date: '2026-03-25',
        time: '14:00',
        location: 'Mega Silk Way Mall',
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
        title: 'School #89 Territory Cleanup',
        description: 'Joint initiative by students, parents, and residents to beautify school grounds.',
        date: '2026-03-22',
        time: '11:00',
        location: 'School-Lyceum #89, Sauran St. 11',
        organizer: 'School #89 Parent Committee',
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
        title: 'Residential Yard Greening',
        description: 'Creating green zones in city yards: planting and maintaining flower beds.',
        date: '2026-04-05',
        time: '10:30',
        location: 'Samal-2 Microdistrict',
        organizer: 'Green Yard LLC',
        contact: '+7 775 444 5566',
        volunteersNeeded: 20,
        volunteersRegistered: 8,
        bonusPoints: 100,
        registeredUsers: [],
        createdBy: null
    }
];

let bookmarkedInitiatives = JSON.parse(localStorage.getItem('bookmarkedInitiatives') || '[]');
let joinedInitiatives = JSON.parse(localStorage.getItem('joinedInitiatives') || '[]');

function renderInitiatives() {
    const grid = document.getElementById('initiativesGrid');
    const noResults = document.getElementById('noInitiatives');
    
    if (!grid) return;
    
    let filtered = initiatives;
    
    if (currentFilter === 'bookmarked') {
        filtered = initiatives.filter(i => bookmarkedInitiatives.includes(i.id));
    } else if (currentFilter !== 'all') {
        filtered = initiatives.filter(i => i.type === currentFilter);
    }
    
    const searchTerm = document.getElementById('initiativesSearch')?.value.toLowerCase() || '';
    if (searchTerm) {
        filtered = filtered.filter(i => 
            i.title.toLowerCase().includes(searchTerm) ||
            i.description.toLowerCase().includes(searchTerm) ||
            i.location.toLowerCase().includes(searchTerm)
        );
    }
    
    if (filtered.length === 0) {
        grid.style.display = 'none';
        noResults.style.display = 'block';
        return;
    }
    
    grid.style.display = 'grid';
    noResults.style.display = 'none';
    
    grid.innerHTML = filtered.map(initiative => {
        const progress = (initiative.volunteersRegistered / initiative.volunteersNeeded) * 100;
        const isBookmarked = bookmarkedInitiatives.includes(initiative.id);
        const isJoined = joinedInitiatives.includes(initiative.id);
        const isFull = initiative.volunteersRegistered >= initiative.volunteersNeeded;
        const isCreator = currentUser && initiative.createdBy === currentUser.contact;

        
        const typeIcons = {
            planting: '🌱',
            cleanup: '🧹',
            recycling: '♻️',
            education: '📚'
        };
        
        return `
            <div class="initiative-card" onclick="viewInitiativeDetails(${initiative.id})">
                <div class="initiative-header">
                    <span class="initiative-type-badge">
                        <span>${typeIcons[initiative.type]}</span>
                        <span>${initiative.type}</span>
                    </span>
                    <button class="initiative-bookmark ${isBookmarked ? 'bookmarked' : ''}" 
                            onclick="event.stopPropagation(); toggleBookmark(${initiative.id})">
                        ${isBookmarked ? '🔖' : '📑'}
                    </button>
                </div>
                
                <h3 class="initiative-title">${initiative.title}</h3>
                <p class="initiative-description">${initiative.description}</p>
                
                <div class="initiative-meta">
                    <div class="meta-item">
                        <span class="meta-icon">📅</span>
                        <span>${formatDate(initiative.date)} at ${initiative.time}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">📍</span>
                        <span>${initiative.location}</span>
                    </div>
                    <div class="meta-item">
                        <span class="meta-icon">👤</span>
                        <span>${initiative.organizer}</span>
                    </div>
                </div>
                
                <div class="initiative-progress">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <div class="progress-text">
                        ${initiative.volunteersRegistered} / ${initiative.volunteersNeeded} volunteers
                        ${isFull ? '• FULL' : ''}
                    </div>
                </div>
                
                <div class="initiative-footer">
                    <div class="points-badge">
                        <span>⭐</span>
                        <span>${initiative.bonusPoints} pts</span>
                    </div>
                    <button class="initiative-action ${isJoined ? 'joined' : ''} ${!currentUser ? 'guest-btn' : ''}" 
                            onclick="event.stopPropagation(); ${!currentUser ? 'showGuestNotice(\'Please login to join initiatives\')' : isCreator ? 'alert(\'You cannot join your own initiative\')' : isJoined ? `leaveInitiative(${initiative.id})` : `joinInitiative(${initiative.id})`}"
                            ${(isFull && !isJoined) || isCreator ? 'disabled' : ''}>
                        ${!currentUser ? 'Login to Join' : isCreator ? 'Your Event' : isJoined ? '✓ Joined' : isFull ? 'Full' : 'Join'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

function filterInitiatives(filter) {
    currentFilter = filter;
    
    document.querySelectorAll('.initiative-filter').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    renderInitiatives();
}

function searchInitiatives() {
    renderInitiatives();
}

function toggleBookmark(id) {
    const index = bookmarkedInitiatives.indexOf(id);
    if (index > -1) {
        bookmarkedInitiatives.splice(index, 1);
    } else {
        bookmarkedInitiatives.push(id);
    }
    localStorage.setItem('bookmarkedInitiatives', JSON.stringify(bookmarkedInitiatives));
    renderInitiatives();
}

function joinInitiative(id) {
    if (!currentUser) {
        showGuestNotice('Please login to join initiatives');
        return;
    }
    
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return;
if (initiative.createdBy === currentUser.contact) {
        alert('You cannot join your own initiative!');
        return;
    }
    
    if (initiative.volunteersRegistered >= initiative.volunteersNeeded) {
        alert('This initiative is already full!');
        return;
    }
    
    initiative.volunteersRegistered++;
    joinedInitiatives.push(id);
    localStorage.setItem('joinedInitiatives', JSON.stringify(joinedInitiatives));
    
    userData.points += initiative.bonusPoints;
    
    if (currentUser) {
        currentUser.points = userData.points;
        localStorage.setItem('ecocity_current_user', JSON.stringify(currentUser));
        
        const userIndex = users.findIndex(u => u.username === currentUser.username);
        if (userIndex !== -1) {
            users[userIndex].points = userData.points;
            localStorage.setItem('ecocity_users', JSON.stringify(users));
        }
    }
    
    updateNavDisplay();
    
    renderInitiatives();
    alert(`You joined "${initiative.title}"! +${initiative.bonusPoints} points`);
}

function leaveInitiative(id) {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return;
    
    if (!confirm('Are you sure you want to leave this initiative?')) {
        return;
    }
    
    initiative.volunteersRegistered--;
    const index = joinedInitiatives.indexOf(id);
    if (index > -1) {
        joinedInitiatives.splice(index, 1);
    }
    localStorage.setItem('joinedInitiatives', JSON.stringify(joinedInitiatives));
    
    renderInitiatives();
}

function viewInitiativeDetails(id) {
    const initiative = initiatives.find(i => i.id === id);
    if (!initiative) return;
    
    const modal = document.getElementById('initiativeDetailsModal');
    const title = document.getElementById('detailsInitiativeTitle');
    const content = document.getElementById('initiativeDetailsContent');
    
    const typeIcons = {
        planting: '🌱',
        cleanup: '🧹',
        recycling: '♻️',
        education: '📚'
    };
    
    const progress = (initiative.volunteersRegistered / initiative.volunteersNeeded) * 100;
    const isJoined = joinedInitiatives.includes(initiative.id);
    const isFull = initiative.volunteersRegistered >= initiative.volunteersNeeded;
    const isCreator = currentUser && initiative.createdBy === currentUser.contact;

    title.textContent = initiative.title;
    
    content.innerHTML = `
        <div style="margin-bottom: var(--spacing-lg);">
            <span class="initiative-type-badge">
                <span>${typeIcons[initiative.type]}</span>
                <span>${initiative.type}</span>
            </span>
        </div>
        
        <p style="font-size: 1rem; color: var(--text-secondary); line-height: 1.8; margin-bottom: var(--spacing-xl);">
            ${initiative.description}
        </p>
        
        <div style="display: grid; gap: var(--spacing-lg); margin-bottom: var(--spacing-xl);">
            <div class="meta-item">
                <span class="meta-icon">📅</span>
                <span><strong>Date & Time:</strong> ${formatDate(initiative.date)} at ${initiative.time}</span>
            </div>
            <div class="meta-item">
                <span class="meta-icon">📍</span>
                <span><strong>Location:</strong> ${initiative.location}</span>
            </div>
            <div class="meta-item">
                <span class="meta-icon">👤</span>
                <span><strong>Organizer:</strong> ${initiative.organizer}</span>
            </div>
            <div class="meta-item">
                <span class="meta-icon">📞</span>
                <span><strong>Contact:</strong> ${initiative.contact}</span>
            </div>
        </div>
        
        <div style="background: var(--bg-tertiary); padding: var(--spacing-lg); border-radius: 8px; margin-bottom: var(--spacing-xl);">
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--spacing-md);">
                <span style="font-size: 0.875rem; color: var(--text-tertiary);">Volunteers</span>
                <span style="font-weight: 700;">${initiative.volunteersRegistered} / ${initiative.volunteersNeeded}</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        </div>
        
        <div style="display: flex; gap: var(--spacing-md); justify-content: flex-end;">
            <div class="points-badge" style="font-size: 1rem; padding: 0.75rem 1.5rem;">
                <span>⭐</span>
                <span>${initiative.bonusPoints} points reward</span>
            </div>
            ${!currentUser ? `
                <button class="initiative-action guest-btn" style="padding: 0.75rem 2rem; font-size: 1rem;"
                        onclick="showGuestNotice('Please login to join initiatives'); closeInitiativeDetails();">
                    Login to Join
                </button>
            ` : isCreator ? `
                <button class="initiative-action" style="padding: 0.75rem 2rem; font-size: 1rem;" disabled>
                    Your Event
                </button>
            ` : `
                <button class="initiative-action ${isJoined ? 'joined' : ''}" style="padding: 0.75rem 2rem; font-size: 1rem;"
                        onclick="${isJoined ? 'leaveInitiative' : 'joinInitiative'}(${initiative.id}); closeInitiativeDetails();"
                        ${isFull && !isJoined ? 'disabled' : ''}>
                    ${isJoined ? '✓ Joined' : isFull ? 'Full' : 'Join Initiative'}
                </button>
            `}
        </div>
    `;
    
    modal.style.display = 'flex';
}

function closeInitiativeDetails() {
    document.getElementById('initiativeDetailsModal').style.display = 'none';
}

function openCreateInitiative() {
    if (!currentUser) {
        showGuestNotice('Please login to create initiatives');
        return;
    }
    
    if (currentUser.role !== 'organizer') {
        alert('Only organizers can create initiatives!');
        return;
    }
    
    document.getElementById('createInitiativeModal').style.display = 'flex';
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('newInitiativeDate').min = today;
}

function closeCreateInitiative() {
    document.getElementById('createInitiativeModal').style.display = 'none';
    document.getElementById('newInitiativeType').value = '';
    document.getElementById('newInitiativeTitle').value = '';
    document.getElementById('newInitiativeDesc').value = '';
    document.getElementById('newInitiativeDate').value = '';
    document.getElementById('newInitiativeTime').value = '';
    document.getElementById('newInitiativeLocation').value = '';
    document.getElementById('newInitiativeContact').value = '';
    document.getElementById('newInitiativeVolunteers').value = '';
}

function submitInitiative(event) {
    event.preventDefault();
    
    const typeSelect = document.getElementById('newInitiativeType').value;
    const bonusMap = {
        planting: 100,
        cleanup: 50,
        recycling: 30,
        education: 30
    };
    
    const newInitiative = {
        id: Date.now(),
        type: typeSelect,
        title: document.getElementById('newInitiativeTitle').value,
        description: document.getElementById('newInitiativeDesc').value,
        date: document.getElementById('newInitiativeDate').value,
        time: document.getElementById('newInitiativeTime').value,
        location: document.getElementById('newInitiativeLocation').value,
       organizer: getCurrentDisplayName(),
        contact: document.getElementById('newInitiativeContact').value,
        volunteersNeeded: parseInt(document.getElementById('newInitiativeVolunteers').value),
        volunteersRegistered: 0,
        bonusPoints: bonusMap[typeSelect] || 30,
        registeredUsers: [],
        createdBy: currentUser.contact
    };
    
    initiatives.unshift(newInitiative);
    closeCreateInitiative();
    renderInitiatives();
    
    alert('Initiative created successfully!');
}

