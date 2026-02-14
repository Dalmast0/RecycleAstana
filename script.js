

let userData = {
    points: 0,
    level: 1,
    recycled_kg: 0,
    co2_saved: 0,
    rank: 1
};


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


let leaderboardData = [
    { name: "EcoWarrior", points: 5000, recycled: 45 },
    { name: "GreenHero", points: 3500, recycled: 32 },
    { name: "PlanetSaver", points: 2800, recycled: 28 },
    { name: "You", points: 0, recycled: 0 },
    { name: "NatureGuardian", points: 2200, recycled: 21 },
    { name: "TreeHugger", points: 1900, recycled: 18 },
    { name: "CleanCityFan", points: 1500, recycled: 15 },
];


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
    

    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}


function showPage(pageName) {
 
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
}


function logRecycling() {
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
    

    const userIndex = leaderboardData.findIndex(u => u.name === "You");
    leaderboardData[userIndex].points = userData.points;
    leaderboardData[userIndex].recycled = userData.recycled_kg;
    

    checkAchievements();
    

    document.getElementById('pointsEarned').textContent = `You earned ${pointsEarned} eco-points!`;
    document.getElementById('impactMessage').textContent = `You saved ${co2Saved} kg of CO₂ 🌍`;
    document.getElementById('scanResult').style.display = 'block';
    
    
    updateNavDisplay();
    

    setTimeout(() => {
        document.getElementById('itemType').value = '';
        document.getElementById('itemWeight').value = '';
        document.getElementById('scanResult').style.display = 'none';
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

function updateNavDisplay() {
    document.getElementById('userPoints').textContent = `${userData.points} points`;
    document.getElementById('userLevel').textContent = `Level ${userData.level}`;
}




let garden3D = {
    canvas: null,
    ctx: null,
    plants: [],
    selectedPlant: null,
    rotation: 45,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    gridSize: 8,
    cellSize: 60,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    animationFrame: null
};


class Plant3D {
    constructor(x, y, type, icon, color, height, co2) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.icon = icon;
        this.color = color;
        this.height = height;
        this.co2 = co2;
        this.growthProgress = 0;
        this.swayOffset = Math.random() * Math.PI * 2;
    }
    
    update() {
        if (this.growthProgress < 1) {
            this.growthProgress += 0.05;
        }
    }
    
    draw(ctx, isometric) {
        const scale = garden3D.scale;
        const sway = Math.sin(Date.now() / 1000 + this.swayOffset) * 2;
        const isoX = (this.x - this.y) * garden3D.cellSize * scale + isometric.centerX + garden3D.offsetX + sway;
        const isoY = (this.x + this.y) * (garden3D.cellSize / 2) * scale + isometric.centerY + garden3D.offsetY;
        ctx.save();
        ctx.globalAlpha = 0.3 * this.growthProgress;
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.ellipse(isoX, isoY + 10, 15 * scale * this.growthProgress, 5 * scale * this.growthProgress, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        

        const heightPixels = this.height * 20 * this.growthProgress;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 4 * scale * this.growthProgress;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(isoX, isoY);
        ctx.lineTo(isoX, isoY - heightPixels);
        ctx.stroke();
        
   
        ctx.save();
        ctx.font = `${35 * scale * this.growthProgress}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.icon, isoX, isoY - heightPixels - 15);
        ctx.restore();
    }
}
function findPlantIslands() {
    const visited = new Set();
    const islands = [];
    
    garden3D.plants.forEach(plant => {
        const key = `${plant.x},${plant.y}`;
        if (visited.has(key)) return;
        
        
        const island = [];
        const queue = [plant];
        visited.add(key);
        
        while (queue.length > 0) {
            const current = queue.shift();
            island.push(current);
            
            
            const neighbors = [
                [current.x - 1, current.y],
                [current.x + 1, current.y],
                [current.x, current.y - 1],
                [current.x, current.y + 1],
                [current.x - 1, current.y - 1],
                [current.x + 1, current.y + 1],
                [current.x - 1, current.y + 1],
                [current.x + 1, current.y - 1]
            ];
            
            neighbors.forEach(([nx, ny]) => {
                const nKey = `${nx},${ny}`;
                if (!visited.has(nKey)) {
                    const neighbor = garden3D.plants.find(p => p.x === nx && p.y === ny);
                    if (neighbor) {
                        visited.add(nKey);
                        queue.push(neighbor);
                    }
                }
            });
        }
        
        if (island.length > 0) {
            islands.push(island);
        }
    });
    
    return islands;
}

function drawGardenBase(ctx, isometric) {
    const gridSize = garden3D.gridSize;
    const cellSize = garden3D.cellSize;
    const scale = garden3D.scale;
    
    ctx.save();
    
    const totalWidth = gridSize * cellSize * scale;
    const totalHeight = gridSize * cellSize * scale / 2;
    const centerX = isometric.centerX + garden3D.offsetX;
    const centerY = isometric.centerY + garden3D.offsetY;
    const DEPTH = 15; 
    

    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + totalHeight / 2 + DEPTH + 5, 
                totalWidth / 2 * 0.9, totalHeight / 4, 0, 0, Math.PI * 2);
    ctx.fill();
    
   
    ctx.fillStyle = '#5A4A3A';
    ctx.beginPath();
    ctx.moveTo(centerX - totalWidth / 2, centerY);
    ctx.lineTo(centerX - totalWidth / 2, centerY + DEPTH);
    ctx.lineTo(centerX, centerY + totalHeight / 2 + DEPTH);
    ctx.lineTo(centerX, centerY + totalHeight / 2);
    ctx.closePath();
    ctx.fill();
    
    
    ctx.fillStyle = '#6B5A4A';
    ctx.beginPath();
    ctx.moveTo(centerX, centerY + totalHeight / 2);
    ctx.lineTo(centerX, centerY + totalHeight / 2 + DEPTH);
    ctx.lineTo(centerX + totalWidth / 2, centerY + DEPTH);
    ctx.lineTo(centerX + totalWidth / 2, centerY);
    ctx.closePath();
    ctx.fill();
    
    
    const grassGradient = ctx.createRadialGradient(
        centerX, centerY - totalHeight / 4, 0,
        centerX, centerY, totalWidth / 2
    );
    grassGradient.addColorStop(0, '#8DB255');
    grassGradient.addColorStop(0.5, '#7FA142');
    grassGradient.addColorStop(1, '#6B8E3F');
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - totalHeight / 2);
    ctx.lineTo(centerX + totalWidth / 2, centerY);
    ctx.lineTo(centerX, centerY + totalHeight / 2);
    ctx.lineTo(centerX - totalWidth / 2, centerY);
    ctx.closePath();
    ctx.fillStyle = grassGradient;
    ctx.fill();
    
    // 4. Border
    ctx.strokeStyle = '#4A6B2F';
    ctx.lineWidth = 5;
    ctx.lineJoin = 'round';
    ctx.stroke();
    
    // 5. Subtle tile grid
    ctx.strokeStyle = 'rgba(74, 107, 47, 0.12)';
    ctx.lineWidth = 1;
    
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const isoX = (x - y) * cellSize * scale + centerX;
            const isoY = (x + y) * (cellSize / 2) * scale + centerY;
            
            const halfSize = cellSize * scale / 2;
            const quarterSize = cellSize * scale / 4;
            
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - quarterSize);
            ctx.lineTo(isoX + halfSize, isoY);
            ctx.lineTo(isoX, isoY + quarterSize);
            ctx.lineTo(isoX - halfSize, isoY);
            ctx.closePath();
            ctx.stroke();
        }
    }
    
    // 6. Grass texture
    ctx.fillStyle = 'rgba(107, 142, 63, 0.3)';
    for (let i = 0; i < 100; i++) {
        const randX = centerX + (Math.random() - 0.5) * totalWidth * 0.85;
        const randY = centerY + (Math.random() - 0.5) * totalHeight * 0.85;
        

        ctx.save();
        ctx.translate(randX, randY);
        ctx.rotate(Math.random() * Math.PI);
        ctx.fillRect(-0.5, -2, 1, 4);
        ctx.restore();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(centerX - totalWidth / 2 * 0.7, centerY - totalHeight / 2 * 0.4);
    ctx.lineTo(centerX, centerY - totalHeight / 2 * 0.85);
    ctx.stroke();
    
    ctx.restore();
}

function drawUnifiedTile(ctx, island, isometric) {
    if (island.length === 0) return;
    
    const scale = garden3D.scale;
    const cellSize = garden3D.cellSize;
    
    
    const grid = {};
    island.forEach(plant => {
        grid[`${plant.x},${plant.y}`] = true;
    });
    
    const xs = island.map(p => p.x);
    const ys = island.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    
    ctx.save();
    
    
    const OVERLAP = 2; 
    
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            if (!grid[`${x},${y}`]) continue;
            
            const isoX = (x - y) * cellSize * scale + isometric.centerX + garden3D.offsetX;
            const isoY = (x + y) * (cellSize / 2) * scale + isometric.centerY + garden3D.offsetY;
            
            const halfSize = cellSize * scale / 2 + OVERLAP;
            const quarterSize = cellSize * scale / 4 + OVERLAP;
            
            
            ctx.fillStyle = '#5C4033';
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - quarterSize + 8);
            ctx.lineTo(isoX + halfSize, isoY + 8);
            ctx.lineTo(isoX, isoY + quarterSize + 8);
            ctx.lineTo(isoX - halfSize, isoY + 8);
            ctx.closePath();
            ctx.fill();
            
           
            ctx.fillStyle = '#A0826D';
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - quarterSize);
            ctx.lineTo(isoX + halfSize, isoY);
            ctx.lineTo(isoX, isoY + quarterSize);
            ctx.lineTo(isoX - halfSize, isoY);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            if (!grid[`${x},${y}`]) continue;
            
            const isoX = (x - y) * cellSize * scale + isometric.centerX + garden3D.offsetX;
            const isoY = (x + y) * (cellSize / 2) * scale + isometric.centerY + garden3D.offsetY;
            
            const halfSize = cellSize * scale / 2 + OVERLAP;
            const quarterSize = cellSize * scale / 4 + OVERLAP;
            
            
            const gradient = ctx.createLinearGradient(isoX - halfSize, isoY, isoX + halfSize, isoY);
            gradient.addColorStop(0, 'rgba(139, 111, 71, 0.5)');
            gradient.addColorStop(0.5, 'rgba(184, 153, 104, 0.3)');
            gradient.addColorStop(1, 'rgba(160, 130, 109, 0.5)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(isoX, isoY - quarterSize);
            ctx.lineTo(isoX + halfSize, isoY);
            ctx.lineTo(isoX, isoY + quarterSize);
            ctx.lineTo(isoX - halfSize, isoY);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    
    ctx.strokeStyle = '#5C4033';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            if (!grid[`${x},${y}`]) continue;
            
            const isoX = (x - y) * cellSize * scale + isometric.centerX + garden3D.offsetX;
            const isoY = (x + y) * (cellSize / 2) * scale + isometric.centerY + garden3D.offsetY;
            
            const halfSize = cellSize * scale / 2;
            const quarterSize = cellSize * scale / 4;
            
            const hasLeft = grid[`${x-1},${y}`];
            const hasRight = grid[`${x+1},${y}`];
            const hasTop = grid[`${x},${y-1}`];
            const hasBottom = grid[`${x},${y+1}`];
            
            ctx.beginPath();
            
            if (!hasTop && !hasLeft) {
                ctx.moveTo(isoX - halfSize, isoY);
                ctx.lineTo(isoX, isoY - quarterSize);
            }
            if (!hasTop && !hasRight) {
                if (ctx.lineTo) ctx.lineTo(isoX + halfSize, isoY);
                else {
                    ctx.moveTo(isoX, isoY - quarterSize);
                    ctx.lineTo(isoX + halfSize, isoY);
                }
            }
            if (!hasBottom && !hasRight) {
                if (!hasTop && !hasRight) ctx.lineTo(isoX, isoY + quarterSize);
                else {
                    ctx.moveTo(isoX + halfSize, isoY);
                    ctx.lineTo(isoX, isoY + quarterSize);
                }
            }
            if (!hasBottom && !hasLeft) {
                if (!hasBottom && !hasRight) ctx.lineTo(isoX - halfSize, isoY);
                else {
                    ctx.moveTo(isoX, isoY + quarterSize);
                    ctx.lineTo(isoX - halfSize, isoY);
                }
            }
            
            ctx.stroke();
        }
    }
    
    ctx.restore();
}

function drawConnectedTile(ctx, x, y, size, hasLeft, hasRight, hasTop, hasBottom) {
    ctx.save();
    ctx.translate(x, y);
    
 
    const halfSize = size / 2 * 1.02; 
    const quarterSize = size / 4 * 1.02;
    
  
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(0, -quarterSize + 7);
    ctx.lineTo(halfSize + 1, 7);
    ctx.lineTo(0, quarterSize + 7);
    ctx.lineTo(-halfSize - 1, 7);
    ctx.closePath();
    ctx.fill();
    
    
    ctx.beginPath();
    ctx.moveTo(0, -quarterSize);
    ctx.lineTo(halfSize + 1, 0); 
    ctx.lineTo(0, quarterSize);
    ctx.lineTo(-halfSize - 1, 0); 
    ctx.closePath();
    

    const gradient = ctx.createLinearGradient(-halfSize, 0, halfSize, 0);
    gradient.addColorStop(0, '#8B6F47');
    gradient.addColorStop(0.5, '#A0826D');
    gradient.addColorStop(1, '#8B7355');
    ctx.fillStyle = gradient;
    ctx.fill();
    
 
    ctx.beginPath();
    ctx.moveTo(0, -quarterSize - 2);
    ctx.lineTo(halfSize + 1, -2);
    ctx.lineTo(0, quarterSize - 2);
    ctx.lineTo(-halfSize - 1, -2);
    ctx.closePath();
    
    const topGradient = ctx.createLinearGradient(-halfSize, -2, halfSize, -2);
    topGradient.addColorStop(0, '#9D8562');
    topGradient.addColorStop(0.5, '#B89968');
    topGradient.addColorStop(1, '#A0826D');
    ctx.fillStyle = topGradient;
    ctx.fill();
    

    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 2.5;
    ctx.lineJoin = 'miter';
    
 
    if (!hasTop && !hasLeft) {
        ctx.beginPath();
        ctx.moveTo(-halfSize - 1, 0);
        ctx.lineTo(0, -quarterSize);
        ctx.stroke();
    }
    
   
    if (!hasTop && !hasRight) {
        ctx.beginPath();
        ctx.moveTo(0, -quarterSize);
        ctx.lineTo(halfSize + 1, 0);
        ctx.stroke();
    }
    

    if (!hasBottom && !hasRight) {
        ctx.beginPath();
        ctx.moveTo(halfSize + 1, 0);
        ctx.lineTo(0, quarterSize);
        ctx.stroke();
    }
    

    if (!hasBottom && !hasLeft) {
        ctx.beginPath();
        ctx.moveTo(0, quarterSize);
        ctx.lineTo(-halfSize - 1, 0);
        ctx.stroke();
    }
    

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-halfSize * 0.6, -quarterSize * 0.5);
    ctx.lineTo(0, -quarterSize * 0.8);
    ctx.stroke();
    

    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    const random = Math.random();
    for (let i = 0; i < 4; i++) {
        const dotX = (Math.random() - 0.5) * halfSize * 1.4;
        const dotY = (Math.random() - 0.5) * quarterSize * 1.2;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 2, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}



function init3DGarden() {
    garden3D.canvas = document.getElementById('gardenCanvas');
    garden3D.ctx = garden3D.canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    loadGarden3D();
    
    garden3D.canvas.addEventListener('mousedown', onMouseDown);
    garden3D.canvas.addEventListener('mousemove', onMouseMove);
    garden3D.canvas.addEventListener('mouseup', onMouseUp);
    garden3D.canvas.addEventListener('wheel', onWheel);
    garden3D.canvas.addEventListener('click', onCanvasClick);
    

    garden3D.canvas.addEventListener('touchstart', onTouchStart);
    garden3D.canvas.addEventListener('touchmove', onTouchMove);
    garden3D.canvas.addEventListener('touchend', onTouchEnd);
    

    animate3DGarden();
}

function resizeCanvas() {
    const container = garden3D.canvas.parentElement;
    garden3D.canvas.width = container.clientWidth - 64;
    garden3D.canvas.height = 500;
}


function animate3DGarden() {
    draw3DGarden();
    

    garden3D.plants.forEach(plant => plant.update());
    
    garden3D.animationFrame = requestAnimationFrame(animate3DGarden);
}


function draw3DGarden() {
    const ctx = garden3D.ctx;
    const canvas = garden3D.canvas;
    

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    

    const isometric = {
        centerX: canvas.width / 2,
        centerY: canvas.height / 2
    };
    

    drawGardenBase(ctx, isometric);
    
 
    const islands = findPlantIslands();
    

    islands.forEach(island => {
        drawUnifiedTile(ctx, island, isometric);
    });
    
  
    const sortedPlants = [...garden3D.plants].sort((a, b) => {
        return (a.x + a.y) - (b.x + b.y);
    });
    
    sortedPlants.forEach(plant => plant.draw(ctx, isometric));
    
  
    if (garden3D.selectedPlant) {
        drawPlacementGuides(ctx, isometric);
    }
}


function drawGroundGrid(ctx, isometric) {
    const gridSize = garden3D.gridSize;
    const cellSize = garden3D.cellSize;
    const scale = garden3D.scale;
    
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
            const isoX = (x - y) * cellSize * scale + isometric.centerX + garden3D.offsetX;
            const isoY = (x + y) * (cellSize / 2) * scale + isometric.centerY + garden3D.offsetY;
            

            ctx.save();
            ctx.translate(isoX, isoY);
            

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(cellSize * scale / 2, cellSize * scale / 4);
            ctx.lineTo(0, cellSize * scale / 2);
            ctx.lineTo(-cellSize * scale / 2, cellSize * scale / 4);
            ctx.closePath();
            

            const gradient = ctx.createLinearGradient(0, 0, 0, cellSize * scale / 2);
            gradient.addColorStop(0, '#7CB342');
            gradient.addColorStop(1, '#558B2F');
            ctx.fillStyle = gradient;
            ctx.fill();
            

            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.lineWidth = 1;
            ctx.stroke();
            
            ctx.restore();
        }
    }
}


function drawPlacementGuides(ctx, isometric) {
    const gridSize = garden3D.gridSize;
    const cellSize = garden3D.cellSize;
    const scale = garden3D.scale;
    
    for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {

            const occupied = garden3D.plants.some(p => p.x === x && p.y === y);
            if (occupied) continue;
            
            const isoX = (x - y) * cellSize * scale + isometric.centerX + garden3D.offsetX;
            const isoY = (x + y) * (cellSize / 2) * scale + isometric.centerY + garden3D.offsetY;
            ctx.save();
            ctx.fillStyle = 'rgba(40, 167, 69, 0.3)';
            ctx.beginPath();
            ctx.arc(isoX, isoY, 6 * scale, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = 'rgba(40, 167, 69, 0.6)';
            ctx.lineWidth = 1.5;
            ctx.stroke();
            ctx.restore();
        }
    }
}

function onMouseDown(e) {
    garden3D.isDragging = true;
    garden3D.lastX = e.clientX;
    garden3D.lastY = e.clientY;
}
function drawConnectedTile(ctx, x, y, size, hasLeft, hasRight, hasTop, hasBottom) {
    ctx.save();
    ctx.translate(x, y);
    
    const halfSize = size / 2;
    const quarterSize = size / 4;
    
    
    ctx.fillStyle = '#654321';
    ctx.beginPath();
    ctx.moveTo(0, -quarterSize + 6);
    ctx.lineTo(halfSize, 6);
    ctx.lineTo(0, quarterSize + 6);
    ctx.lineTo(-halfSize, 6);
    ctx.closePath();
    ctx.fill();
    

    ctx.beginPath();
    ctx.moveTo(0, -quarterSize);
    ctx.lineTo(halfSize, 0);
    ctx.lineTo(0, quarterSize);
    ctx.lineTo(-halfSize, 0);
    ctx.closePath();
    

    const gradient = ctx.createLinearGradient(-halfSize, 0, halfSize, 0);
    gradient.addColorStop(0, '#8B6F47');
    gradient.addColorStop(0.5, '#A0826D');
    gradient.addColorStop(1, '#8B7355');
    ctx.fillStyle = gradient;
    ctx.fill();
    

    ctx.strokeStyle = '#654321';
    ctx.lineWidth = 3;
    

    if (!hasTop && !hasLeft) {
        ctx.beginPath();
        ctx.moveTo(-halfSize, 0);
        ctx.lineTo(0, -quarterSize);
        ctx.stroke();
    }
    

    if (!hasTop && !hasRight) {
        ctx.beginPath();
        ctx.moveTo(0, -quarterSize);
        ctx.lineTo(halfSize, 0);
        ctx.stroke();
    }
    

    if (!hasBottom && !hasRight) {
        ctx.beginPath();
        ctx.moveTo(halfSize, 0);
        ctx.lineTo(0, quarterSize);
        ctx.stroke();
    }
    

    if (!hasBottom && !hasLeft) {
        ctx.beginPath();
        ctx.moveTo(0, quarterSize);
        ctx.lineTo(-halfSize, 0);
        ctx.stroke();
    }

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-halfSize * 0.7, -quarterSize * 0.3);
    ctx.lineTo(-halfSize * 0.3, -quarterSize * 0.6);
    ctx.lineTo(halfSize * 0.1, -quarterSize * 0.8);
    ctx.stroke();
    

    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    for (let i = 0; i < 3; i++) {
        const dotX = (Math.random() - 0.5) * halfSize * 1.5;
        const dotY = (Math.random() - 0.5) * quarterSize * 1.5;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}
function onMouseMove(e) {
    if (!garden3D.isDragging) return;
    
    const dx = e.clientX - garden3D.lastX;
    const dy = e.clientY - garden3D.lastY;
    
    garden3D.offsetX += dx;
    garden3D.offsetY += dy;
    
    garden3D.lastX = e.clientX;
    garden3D.lastY = e.clientY;
}

function onMouseUp(e) {
    garden3D.isDragging = false;
}

function onWheel(e) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    garden3D.scale = Math.max(0.5, Math.min(2, garden3D.scale * delta));
}

function onTouchStart(e) {
    if (e.touches.length === 1) {
        garden3D.isDragging = true;
        garden3D.lastX = e.touches[0].clientX;
        garden3D.lastY = e.touches[0].clientY;
    }
}

function onTouchMove(e) {
    if (!garden3D.isDragging || e.touches.length !== 1) return;
    
    const dx = e.touches[0].clientX - garden3D.lastX;
    const dy = e.touches[0].clientY - garden3D.lastY;
    
    garden3D.offsetX += dx;
    garden3D.offsetY += dy;
    
    garden3D.lastX = e.touches[0].clientX;
    garden3D.lastY = e.touches[0].clientY;
}

function onTouchEnd(e) {
    garden3D.isDragging = false;
}


function onCanvasClick(e) {
    if (garden3D.isDragging) return;
    if (!garden3D.selectedPlant) {
        alert('💡 Select a plant from the shop first!');
        return;
    }
    
    const rect = garden3D.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    

    const gridPos = screenToGrid(mouseX, mouseY);
    
    if (gridPos) {
        plantInGrid3D(gridPos.x, gridPos.y);
    }
}


function screenToGrid(screenX, screenY) {
    const canvas = garden3D.canvas;
    const isoCenterX = canvas.width / 2 + garden3D.offsetX;
    const isoCenterY = canvas.height / 2 + garden3D.offsetY;
    
    const cellSize = garden3D.cellSize * garden3D.scale;
    
 
    const isoX = screenX - isoCenterX;
    const isoY = screenY - isoCenterY;
    
  
    const gridX = Math.floor((isoX / cellSize + isoY / (cellSize / 2)) / 2);
    const gridY = Math.floor((isoY / (cellSize / 2) - isoX / cellSize) / 2);
    
 
    if (gridX >= 0 && gridX < garden3D.gridSize && gridY >= 0 && gridY < garden3D.gridSize) {
        return { x: gridX, y: gridY };
    }
    
    return null;
}


function selectPlant(type, cost, icon, co2, color, height, imageUrl) {
    if (userData.points < cost) {
        alert(`Not enough points! You need ${cost} points, but have ${userData.points}`);
        return;
    }
    
    garden3D.selectedPlant = { type, cost, icon, co2, color, height, imageUrl };
    

    document.getElementById('selectedPlantInfo').style.display = 'flex';
    document.getElementById('selectedPlantText').textContent = `${icon} Selected: Click on garden to plant (${cost} pts)`;

    document.querySelectorAll('.plant-item').forEach(item => {
        item.classList.remove('selected');
    });
    event.target.closest('.plant-item').classList.add('selected');
}
function clearSelection() {
    garden3D.selectedPlant = null;
    document.getElementById('selectedPlantInfo').style.display = 'none';
    document.querySelectorAll('.plant-item').forEach(item => {
        item.classList.remove('selected');
    });
}


function plantInGrid3D(x, y) {
    const occupied = garden3D.plants.some(p => p.x === x && p.y === y);
    if (occupied) {
        alert('⚠️ This spot is already planted!');
        return;
    }
    
    const plant = garden3D.selectedPlant;
    
    userData.points -= plant.cost;
    
    const newPlant = new Plant3D(
        x, y, 
        plant.type, 
        plant.icon, 
        plant.color, 
        plant.height, 
        plant.co2,
        plant.imageUrl  
    );
    garden3D.plants.push(newPlant);
    

    updateGardenStats();
    updateNavDisplay();
    saveGarden3D();
    

    clearSelection();
    
    console.log(`🌱 Planted ${plant.icon} at (${x}, ${y})`);
}


function updateGardenStats() {
    document.getElementById('gardenPoints').textContent = userData.points;
    document.getElementById('totalPlants').textContent = garden3D.plants.length;
    
    const totalCO2 = garden3D.plants.reduce((sum, plant) => sum + plant.co2, 0);
    document.getElementById('gardenCO2').textContent = `${totalCO2} kg/year`;
}

function saveGarden3D() {
    const saveData = {
        plants: garden3D.plants.map(p => ({
            x: p.x,
            y: p.y,
            type: p.type,
            icon: p.icon,
            color: p.color,
            height: p.height,
            co2: p.co2
        }))
    };
    localStorage.setItem('ecocity_garden3d', JSON.stringify(saveData));
}

function loadGarden3D() {
    const saved = localStorage.getItem('ecocity_garden3d');
    if (saved) {
        const data = JSON.parse(saved);
        garden3D.plants = data.plants.map(p => 
            new Plant3D(p.x, p.y, p.type, p.icon, p.color, p.height, p.co2)
        );
        garden3D.plants.forEach(p => p.growthProgress = 1); 
    }
}


function clearGarden() {
    if (!confirm('🗑️ Clear entire garden? This cannot be undone!')) {
        return;
    }
    
    garden3D.plants = [];
    saveGarden3D();
    updateGardenStats();
    alert('Garden cleared!');
}


function shareGarden() {
    const plantCount = garden3D.plants.length;
    const totalCO2 = garden3D.plants.reduce((sum, plant) => sum + plant.co2, 0);
    const message = `🌳 My EcoCity 3D Garden:\n${plantCount} plants planted\n${totalCO2} kg CO₂ absorbed per year!\n\nJoin me in making the planet greener! 🌍`;
    
    if (navigator.share) {
        navigator.share({
            title: 'My Eco Garden',
            text: message
        });
    } else {
        navigator.clipboard.writeText(message).then(() => {
            alert('📋 Garden stats copied to clipboard!');
        });
    }
}


function rotateGardenLeft() {
    garden3D.rotation -= 45;
}

function rotateGardenRight() {
    garden3D.rotation += 45;
}

function resetCamera() {
    garden3D.scale = 1;
    garden3D.offsetX = 0;
    garden3D.offsetY = 0;
    garden3D.rotation = 45;
}


const originalShowPage2 = showPage;
showPage = function(pageName) {
    if (typeof originalShowPage2 === 'function') {
        originalShowPage2(pageName);
    } else {

        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(`page-${pageName}`).classList.add('active');
        

        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        event.target.classList.add('active');
    }
    
    if (pageName === 'garden') {
        if (!garden3D.canvas) {
            setTimeout(() => init3DGarden(), 100);
        }
        updateGardenStats();
    }
    
    if (pageName === 'dashboard') {
        updateDashboard();
    }
    
    if (pageName === 'leaderboard') {
        updateLeaderboard();
    }
};








window.onload = function() {
    initMap();
    updateNavDisplay();
    updateDashboard();

};
