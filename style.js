// --- 1. القوائم المنسدلة ---
function toggleDropdown() {
    const content = document.querySelector(".dropdown-content");
    if (content) content.classList.toggle("show");
}

window.onclick = function(event) {
    if (!event.target.matches('.dropdown-btn')) {
        const dropdowns = document.getElementsByClassName("dropdown-content");
        for (let i = 0; i < dropdowns.length; i++) {
            dropdowns[i].classList.remove('show');
        }
    }
};

// --- 2. دالة حساب النظام (ألواح 590W للجميع) ---
const panelPower = 590;

function calculate() {
    const modeElement = document.getElementById("mode");
    const sunHoursElement = document.getElementById("sunHours");
    const resultElement = document.getElementById("result");

    if (!modeElement || !sunHoursElement) return;

    const mode = modeElement.value;
    const sunHours = Number(sunHoursElement.value);

    if (sunHours <= 0) {
        alert("Please enter valid Sun Hours!");
        return;
    }

    let energy = 0;
    let inverter = 0;
    let battery = 0;
    let panels = 0;
    let systemTypeName = "";

    if (mode === "daily") {
        systemTypeName = "Residential System (Home)";
        const energyElement = document.getElementById("energy");
        if (!energyElement) return;
        
        energy = Number(energyElement.value);
        if (energy <= 0) {
            alert("Please enter valid energy consumption!");
            return;
        }
        const peakLoad = energy / 5;
        inverter = Math.ceil(peakLoad * 1.25);
        battery = Math.ceil((energy * 0.6) / 0.85);
        panels = Math.ceil((energy * 1000) / (sunHours * panelPower));
    } else {
        systemTypeName = "Agricultural System (Solar Water Pump)";
        const pumpHpElement = document.getElementById("pumpHp");
        if (!pumpHpElement) return;

        const pumpHp = Number(pumpHpElement.value);
        if (pumpHp <= 0) {
            alert("Please enter valid pump horsepower (HP)!");
            return;
        }
        
        const pumpKw = pumpHp * 0.746;
        const requiredPvKw = pumpKw * 1.30; 
        
        inverter = Math.ceil(pumpKw * 1.25);
        battery = 0; 
        panels = Math.ceil((requiredPvKw * 1000) / panelPower);
        energy = pumpKw * sunHours;
    }

    const currentData = {
        mode: systemTypeName,
        energy: energy.toFixed(1),
        panels: panels,
        panelPower: panelPower,
        battery: battery,
        inverter: inverter,
        date: new Date().toLocaleDateString()
    };

    localStorage.setItem("currentProject", JSON.stringify(currentData));

    let resultHTML = '<div style="margin-top: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 10px; background: #f9f9f9; text-align: left;">' +
        '<h3 style="color: #0b3d2e; margin-bottom: 10px;">📊 Design Results</h3>' +
        '<p>🚜 <strong>System:</strong> ' + systemTypeName + '</p>' +
        '<p>☀️ <strong>Solar Panels:</strong> ' + panels + ' panels (' + panelPower + 'W each)</p>' +
        '<p>⚡️ <strong>Inverter Size:</strong> ' + inverter + ' kW</p>';
    
    if (mode === "agricultural") {
        resultHTML += '<p>🔋 <strong>Battery Bank:</strong> Not Required (Direct Solar Pumping)</p>';
    } else {
        resultHTML += '<p>🔋 <strong>Battery Size:</strong> ' + battery + ' kWh</p>';
    }

    resultHTML += '</div>';
    
    if (resultElement) {
        resultElement.innerHTML = resultHTML;
    }
}

// --- 3. دالة حفظ المشروع ---
function saveProject() {
    const projectData = localStorage.getItem("currentProject");
    if (!projectData) {
        alert("Please calculate the system first!");
        return;
    }
    
    const project = JSON.parse(projectData);
    let projects = JSON.parse(localStorage.getItem("projects")) || [];
    projects.push(project);
    localStorage.setItem("projects", JSON.stringify(projects));
    alert("Project Saved Successfully! 🎉");
}
// --- 4. دالة عرض المشاريع في الداشبورد ---
function loadDashboardProjects() {
    const listElement = document.getElementById("list");
    if (!listElement) return;

    const projectsData = localStorage.getItem("projects");
    if (!projectsData) {
        listElement.innerHTML = "<p style='text-align: center; color: #666; margin-top: 20px;'>No saved projects found.</p>";
        return;
    }

    const projects = JSON.parse(projectsData);
    if (projects.length === 0) {
        listElement.innerHTML = "<p style='text-align: center; color: #666; margin-top: 20px;'>No saved projects found.</p>";
        return;
    }

    let html = '<div style="max-width: 800px; margin: 20px auto; padding: 20px;">';
    
    projects.forEach((proj, index) => {
        html += '<div style="background: #f9f9f9; border: 1px solid #ddd; padding: 15px; margin-bottom: 15px; border-radius: 8px; text-align: left;">' +
            '<h3 style="color: #0b3d2e; margin-bottom: 10px;">Project #' + (index + 1) + ': ' + proj.mode + '</h3>' +
            '<p>📅 <strong>Date:</strong> ' + proj.date + '</p>' +
            '<p>☀️ <strong>Solar Panels:</strong> ' + proj.panels + ' panels (' + proj.panelPower + 'W each)</p>' +
            '<p>⚡️ <strong>Inverter Size:</strong> ' + proj.inverter + ' kW</p>' +
            '<p>🔋 <strong>Battery/Energy:</strong> ' + (proj.battery > 0 ? proj.battery + ' kWh' : 'Not Required (Direct Pumping)') + '</p>' +
            '</div>';
    });

    html += '</div>';
    listElement.innerHTML = html;
}

window.addEventListener('DOMContentLoaded', () => {
    loadDashboardProjects();
});