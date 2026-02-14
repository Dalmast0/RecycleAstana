
// User data (fake database)
let userData = {
    points: 0,
    level: 1,
    recycled_kg: 0,
    co2_saved: 0,
    rank: 1
};

// Recycling points in Astana
const recyclingPoints = [
    { id: 1, name: "Mega Silk Way Eco Station", lat: 51.1282, lon: 71.4306, types: ["plastic", "glass", "paper", "metal"], hours: "24/7", rating: 4.5 },
    { id: 2, name: "Khan Shatyr Recycling Point", lat: 51.1327, lon: 71.4062, types: ["plastic", "batteries"], hours: "10:00-22:00", rating: 4.2 },
    { id: 3, name: "Keruen Mall Eco Corner", lat: 51.1355, lon: 71.4504, types: ["plastic", "glass", "paper"], hours: "10:00-21:00", rating: 4.0 },
    { id: 4, name: "Sary Arka Green Point", lat: 51.1608, lon: 71.4165, types: ["metal", "batteries"], hours: "09:00-20:00", rating: 4.7 },
    { id: 5, name: "Abu Dhabi Plaza Eco Station", lat: 51.1275, lon: 71.4383, types: ["plastic", "glass"], hours: "24/7", rating: 4.3 },
    { id: 6, name: "Expo 2017 Area Recycling", lat: 51.0914, lon: 71.4673, types: ["plastic", "glass", "paper", "metal"], hours: "08:00-20:00", rating: 4.8 },
    { id: 7, name: "Baiterek Area Eco Point", lat: 51.1282, lon: 71.4306, types: ["plastic", "paper"], hours: "09:00-18:00", rating: 4.1 },
    { id: 8, name: "Nazarbayev University Station", lat: 51.0909, lon: 71.4054, types: ["plastic", "glass", "paper", "metal"], hours: "24/7", rating: 4.6 },
    { id: 9, name: "Central Park Green Corner", lat: 51.1605, lon: 71.4704, types: ["plastic", "glass", "paper"], hours: "06:00-23:00", rating: 4.4 },
    { id: 10, name: "Dostyk Plaza Recycling", lat: 51.1432, lon: 71.4285, types: ["plastic", "metal", "batteries"], hours: "10:00-22:00", rating: 4.2 },
    { id: 11, name: "Mangilik El Eco Station", lat: 51.1214, lon: 71.4478, types: ["glass", "paper", "metal"], hours: "08:00-20:00", rating: 4.5 },
    { id: 12, name: "Esil District Green Point", lat: 51.1721, lon: 71.4234, types: ["plastic", "glass"], hours: "09:00-19:00", rating: 4.0 },
];

// Leaderboard data
let leaderboardData = [
    { name: "EcoWarrior", points: 5000, recycled: 45 },
    { name: "GreenHero", points: 3500, recycled: 32 },
    { name: "PlanetSaver", points: 2800, recycled: 28 },
    { name: "You", points: 0, recycled: 0 },
    { name: "NatureGuardian", points: 2200, recycled: 21 },
    { name: "TreeHugger", points: 1900, recycled: 18 },
    { name: "CleanCityFan", points: 1500, recycled: 15 },
];

// Achievements
const achievements = [
    { id: 1, name: "First Steps", icon: "🌱", desc: "Recycle first item", requirement: 1, earned: false },
    { id: 2, name: "Eco Beginner", icon: "🌿", desc: "Earn 500 points", requirement: 500, earned: false },
    { id: 3, name: "Green Warrior", icon: "⚔️", desc: "Earn 1000 points", requirement: 1000, earned: false },
    { id: 4, name: "Planet Hero", icon: "🌍", desc: "Recycle 10kg", requirement: 10, earned: false },
    { id: 5, name: "Eco Champion", icon: "🏆", desc: "Reach Level 5", requirement: 5, earned: false },
    { id: 6, name: "Tree Planter", icon: "🌳", desc: "Save 50kg CO₂", requirement: 50, earned: false },
];

// Points per kg by type
const POINTS_PER_KG = {
    plastic: 100,
    glass: 50,
    paper: 30,
    metal: 150,
    batteries: 200
};

// CO2 saved per kg
const CO2_PER_KG = {
    plastic: 1.5,
    glass: 0.5,
    paper: 1.0,
    metal: 3.0,
    batteries: 2.0
};

// ==================== MAP ====================
let map;
let markers = [];
let currentFilter = 'all';

function initMap() {
    // Create map centered on Astana
    map = L.map('map').setView([51.1694, 71.4491], 12);
    
    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    // Add all markers
    displayMarkers();
}

function displayMarkers(filter = 'all') {
    // Clear existing markers
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    // Filter points
    let pointsToShow = recyclingPoints;
    if (filter !== 'all') {
        pointsToShow = recyclingPoints.filter(point => 
            point.types.includes(filter)
        );
    }
    
    // Add markers
    pointsToShow.forEach(point => {
        const marker = L.marker([point.lat, point.lon])
            .bindPopup(`
                <div style="text-align: center;">
                    <h3>${point.name}</h3>
                    <p><strong>Accepts:</strong> ${point.types.join(', ')}</p>
                    <p><strong>Hours:</strong> ${point.hours}</p>
                    <p>⭐ ${point.rating} / 5.0</p>
                </div>
            `)
            .addTo(map);
        markers.push(marker);
    });
}

function filterMap(type) {
    currentFilter = type;
    displayMarkers(type);
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// ==================== NAVIGATION ====================
function showPage(pageName) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    document.getElementById(`page-${pageName}`).classList.add('active');
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // If showing dashboard, update it
    if (pageName === 'dashboard') {
        updateDashboard();
    }
    
    // If showing leaderboard, update it
    if (pageName === 'leaderboard') {
        updateLeaderboard();
    }
}

// ==================== RECYCLING LOGGER ====================
function logRecycling() {
    const itemType = document.getElementById('itemType').value;
    const weight = parseFloat(document.getElementById('itemWeight').value);
    
    if (!itemType || !weight || weight <= 0) {
        alert('Please select item type and enter valid weight');
        return;
    }
    
    // Calculate points
    const pointsEarned = Math.round(weight * POINTS_PER_KG[itemType]);
    const co2Saved = (weight * CO2_PER_KG[itemType]).toFixed(2);
    
    // Update user data
    userData.points += pointsEarned;
    userData.recycled_kg += weight;
    userData.co2_saved += parseFloat(co2Saved);
    userData.level = Math.floor(userData.points / 1000) + 1;
    
    // Update leaderboard
    const userIndex = leaderboardData.findIndex(u => u.name === "You");
    leaderboardData[userIndex].points = userData.points;
    leaderboardData[userIndex].recycled = userData.recycled_kg;
    
    // Check achievements
    checkAchievements();
    
    // Show result
    document.getElementById('pointsEarned').textContent = `You earned ${pointsEarned} eco-points!`;
    document.getElementById('impactMessage').textContent = `You saved ${co2Saved} kg of CO₂ 🌍`;
    document.getElementById('scanResult').style.display = 'block';
    
    // Update nav display
    updateNavDisplay();
    
    // Clear form
    setTimeout(() => {
        document.getElementById('itemType').value = '';
        document.getElementById('itemWeight').value = '';
        document.getElementById('scanResult').style.display = 'none';
    }, 3000);
}

// ==================== DASHBOARD ====================
function updateDashboard() {
    document.getElementById('totalPoints').textContent = userData.points;
    document.getElementById('totalRecycled').textContent = `${userData.recycled_kg.toFixed(1)} kg`;
    document.getElementById('co2Saved').textContent = `${userData.co2_saved.toFixed(1)} kg`;
    
    // Calculate rank
    leaderboardData.sort((a, b) => b.points - a.points);
    const userRank = leaderboardData.findIndex(u => u.name === "You") + 1;
    userData.rank = userRank;
    document.getElementById('userRank').textContent = `#${userRank}`;
    
    // Display achievements
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

// ==================== LEADERBOARD ====================
function updateLeaderboard() {
    leaderboardData.sort((a, b) => b.points - a.points);
    
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    
    leaderboardData.forEach((user, index) => {
        const div = document.createElement('div');
        div.className = `leaderboard-item ${index < 3 ? 'top3' : ''}`;
        
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
        
        div.innerHTML = `
            <div class="leaderboard-rank">${medal || `#${index + 1}`}</div>
            <div class="leaderboard-info">
                <div class="leaderboard-name">${user.name}</div>
                <div class="leaderboard-stats">${user.recycled.toFixed(1)} kg recycled</div>
            </div>
            <div class="leaderboard-points">${user.points} pts</div>
        `;
        list.appendChild(div);
    });
}

// ==================== NAV DISPLAY ====================
function updateNavDisplay() {
    document.getElementById('userPoints').textContent = `${userData.points} points`;
    document.getElementById('userLevel').textContent = `Level ${userData.level}`;
}
let gardenData = {
    plots: Array(64).fill(null), // 8x8 grid
    selectedPlant: null,
    totalCO2: 0
};

// Load garden from localStorage
function loadGarden() {
    const saved = localStorage.getItem('ecocity_garden');
    if (saved) {
        gardenData = JSON.parse(saved);
    }
    renderGarden();
}

// Save garden to localStorage
function saveGarden() {
    localStorage.setItem('ecocity_garden', JSON.stringify(gardenData));
}

// Initialize garden grid
function initGarden() {
    const grid = document.getElementById('gardenGrid');
    grid.innerHTML = '';
    
    for (let i = 0; i < 64; i++) {
        const cell = document.createElement('div');
        cell.className = 'garden-cell empty';
        cell.dataset.index = i;
        cell.onclick = () => plantInCell(i);
        grid.appendChild(cell);
    }
    
    loadGarden();
    updateGardenStats();
}

// Render garden state
function renderGarden() {
    gardenData.plots.forEach((plant, index) => {
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (plant) {
            cell.className = 'garden-cell planted';
            cell.innerHTML = `
                ${plant.icon}
                <button class="remove-btn" onclick="removePlant(${index}, event)">×</button>
            `;
        } else {
            cell.className = 'garden-cell empty';
            cell.innerHTML = '';
        }
    });
}


function buyPlant(type, cost, icon, co2) {
    if (userData.points < cost) {
        alert(`❌ Not enough points! You need ${cost} points, but have ${userData.points}`);
        return;
    }
    
    gardenData.selectedPlant = { type, cost, icon, co2 };
    alert(`✅ ${icon} selected! Click on empty spot in garden to plant.`);
}

// Plant in cell
function plantInCell(index) {
    if (!gardenData.selectedPlant) {
        alert('💡 Select a plant from the shop first!');
        return;
    }
    
    if (gardenData.plots[index]) {
        alert('⚠️ This spot is already planted!');
        return;
    }
    
    const plant = gardenData.selectedPlant;
    
    // Deduct points
    userData.points -= plant.cost;
    
    // Plant it
    gardenData.plots[index] = plant;
    gardenData.totalCO2 += plant.co2;
    
    // Update UI
    renderGarden();
    updateGardenStats();
    updateNavDisplay();
    saveGarden();
    
    // Clear selection
    gardenData.selectedPlant = null;
    
    // Show success
    const cell = document.querySelector(`[data-index="${index}"]`);
    cell.style.animation = 'growPlant 0.5s ease-out';
}

// Remove plant from cell
function removePlant(index, event) {
    event.stopPropagation(); // Prevent cell click
    
    if (!confirm('🗑️ Remove this plant? You won\'t get points back.')) {
        return;
    }
    
    const plant = gardenData.plots[index];
    if (plant) {
        gardenData.totalCO2 -= plant.co2;
        gardenData.plots[index] = null;
        
        renderGarden();
        updateGardenStats();
        saveGarden();
    }
}

// Update garden statistics
function updateGardenStats() {
    document.getElementById('gardenPoints').textContent = userData.points;
    
    const plantCount = gardenData.plots.filter(p => p !== null).length;
    document.getElementById('totalPlants').textContent = plantCount;
    
    document.getElementById('gardenCO2').textContent = `${gardenData.totalCO2} kg/year`;
}

// Clear entire garden
function clearGarden() {
    if (!confirm('🗑️ Clear entire garden? This cannot be undone!')) {
        return;
    }
    
    gardenData.plots = Array(64).fill(null);
    gardenData.totalCO2 = 0;
    
    renderGarden();
    updateGardenStats();
    saveGarden();
    
    alert('✅ Garden cleared!');
}

// Share garden
function shareGarden() {
    const plantCount = gardenData.plots.filter(p => p !== null).length;
    const message = `🌳 My EcoCity Garden:\n${plantCount} plants planted\n${gardenData.totalCO2} kg CO₂ absorbed per year!\n\nJoin me in making the planet greener! 🌍`;
    
    // Try to use Web Share API
    if (navigator.share) {
        navigator.share({
            title: 'My Eco Garden',
            text: message
        });
    } else {
        // Fallback: copy to clipboard
        navigator.clipboard.writeText(message).then(() => {
            alert('📋 Garden stats copied to clipboard!');
        });
    }
}

// Update showPage function to handle garden
const originalShowPage = showPage;
showPage = function(pageName) {
    originalShowPage(pageName);
    
    if (pageName === 'garden') {
        if (!document.getElementById('gardenGrid').hasChildNodes()) {
            initGarden();
        } else {
            updateGardenStats();
        }
    }
};
// ==================== INIT ====================
window.onload = function() {
    initMap();
    updateNavDisplay();
    updateDashboard();
};