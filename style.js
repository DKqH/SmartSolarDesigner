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
 
// --- 2. دالة حساب النظام وإرساله للداشبورد تلقائياً --- 
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
 
    // حساب التكلفة والإضافات
    let estimatedCost = (panels * 120) + (inverter * 150) + (battery * 200);
    let extrasList = [];

    const optCables = document.getElementById("optCables");
    const cableMetersElement = document.getElementById("cableMeters");
    if (optCables && optCables.checked && cableMetersElement) {
        const meters = Number(cableMetersElement.value) || 0;
        estimatedCost += (meters * 2); 
        extrasList.push("DC/AC Cables (" + meters + " Meters)");
    }

    const optMounting = document.getElementById("optMounting");
    if (optMounting && optMounting.checked) {
        estimatedCost += Number(optMounting.value);
        extrasList.push("Aluminum Mounting Structures");
    }

    const optProtection = document.getElementById("optProtection");
    if (optProtection && optProtection.checked) {
        estimatedCost += Number(optProtection.value);
        extrasList.push("Protection Box & Breakers");
    }

    const optLabor = document.getElementById("optLabor");
    if (optLabor && optLabor.checked) {
        extrasList.push("Installation Labor");
    }

    // تجهيز كائن المشروع
    const projectData = { 
        mode: systemTypeName, 
        energy: energy.toFixed(1), 
        panels: panels, 
        panelPower: panelPower, 
        battery: battery, 
        inverter: inverter, 
        extras: extrasList,
        cost: estimatedCost,
        date: new Date().toLocaleDateString() 
    }; 
 
    // حفظ المشروع مؤقتاً وإرساله لطلبات الداشبورد
    localStorage.setItem("currentProject", JSON.stringify(projectData));let clientRequests = JSON.parse(localStorage.getItem("clientRequests")) || []; 
    clientRequests.push(projectData); 
    localStorage.setItem("clientRequests", JSON.stringify(clientRequests)); 
 
    // عرض النتيجة للزبون
    let resultHTML = '<div class="result-card">' + 
        '<h3>📊 Design Results & Cost</h3>' + 
        '<p><span class="ico">🚜</span> <strong>System:</strong> ' + systemTypeName + '</p>' + 
        '<p><span class="ico">☀️</span> <strong>Solar Panels:</strong> ' + panels + ' panels (' + panelPower + 'W each)</p>' + 
        '<p><span class="ico">⚡️</span> <strong>Inverter Size:</strong> ' + inverter + ' kW</p>'; 
 
    if (mode === "agricultural") { 
        resultHTML += '<p><span class="ico">🔋</span> <strong>Battery Bank:</strong> Not Required (Direct Solar Pumping)</p>'; 
    } else { 
        resultHTML += '<p><span class="ico">🔋</span> <strong>Battery Size:</strong> ' + battery + ' kWh</p>'; 
    } 

    resultHTML += '<hr style="border-color: var(--glass-border); margin: 12px 0;">';
    resultHTML += '<p style="color: var(--accent2); font-size: 15px;"><strong>Estimated Cost: $' + estimatedCost.toLocaleString() + '</strong></p>';
    resultHTML += '<p style="color: #28a745; font-size: 13px; margin-top: 5px;">✅ Calculated & Sent to Engineer Successfully!</p>';
    resultHTML += '</div>'; 
     
    if (resultElement) { 
        resultElement.innerHTML = resultHTML; 
    }
} 

// --- 3. عرض الطلبات والمشاريع في الداشبورد --- 
function loadDashboardProjects() { 
    const listElement = document.getElementById("list"); 
    if (!listElement) return; 
 
    const requestsData = localStorage.getItem("clientRequests");
    const projectsData = localStorage.getItem("projects");
    
    let html = '<div class="project-list">'; 

    // أولاً: طلبات الزبائن المنتظرة
    if (requestsData) {
        let requests = JSON.parse(requestsData);
        if (requests.length > 0) {
            html += '<h2 style="color: var(--accent2); margin-bottom: 15px;">⏳ Customer Requests Awaiting Approval</h2>';
            requests.forEach((req, reqIndex) => {
                let reqExtras = req.extras && req.extras.length > 0 ? req.extras.join(', ') : 'None selected';
                html += '<div class="project-card" style="border-left: 4px solid orange;">' + 
                    '<h3>Client Request #' + (reqIndex + 1) + ' — ' + req.mode + '</h3>' + 
                    '<p><span class="ico">📅</span> <strong>Date:</strong> ' + req.date + '</p>' + 
                    '<p><span class="ico">☀️</span> <strong>Panels:</strong> ' + req.panels + ' panels (' + req.panelPower + 'W)</p>' + 
                    '<p><span class="ico">⚡️</span> <strong>Inverter:</strong> ' + req.inverter + ' kW</p>' + 
                    '<p><span class="ico">🛠️</span> <strong>Accessories:</strong> ' + reqExtras + '</p>' + 
                    '<p><span class="ico">💰</span> <strong>Estimated Cost:</strong> $' + (req.cost ? req.cost.toLocaleString() : 0) + '</p>' + 
                    '<button class="print-btn" style="background: #28a745 !important; margin-top: 10px;" onclick="approveClientRequest(' + reqIndex + ')">✅ Confirm & Move to Active Projects</button>' +
                    '</div>';
            });
        }
    }

    // ثانياً: المشاريع النشطة والمعتمدة
    html += '<h2 style="color: var(--cyan); margin: 25px 0 15px 0;">📋 Active Confirmed Projects & Invoices</h2>';
    if (!projectsData || JSON.parse(projectsData).length === 0) { 
        html += "<p class='empty-state'>No confirmed projects found.</p>"; 
    } else {
        const projects = JSON.parse(projectsData); 
        projects.forEach((proj, index) => { 
            let extrasHtml = proj.extras && proj.extras.length > 0 ? proj.extras.join(', ') : 'None selected';

            html += '<div class="project-card">' +'<h3>Project #' + (index + 1) + ' — ' + proj.mode + '</h3>' + 
                '<p><span class="ico">📅</span> <strong>Date:</strong> ' + proj.date + '</p>' + 
                '<p><span class="ico">☀️</span> <strong>Solar Panels:</strong> ' + proj.panels + ' panels (' + proj.panelPower + 'W each)</p>' + 
                '<p><span class="ico">⚡️</span> <strong>Inverter Size:</strong> ' + proj.inverter + ' kW</p>' + 
                '<p><span class="ico">🔋</span> <strong>Storage:</strong> ' + (proj.battery > 0 ? proj.battery + ' kWh' : 'Direct Pumping') + '</p>';
                
            if(proj.cost) {
                html += '<p><span class="ico">💰</span> <strong>Base Cost:</strong> $' + proj.cost.toLocaleString() + '</p>';
            }

            html += '<button class="print-btn" onclick="toggleInvoice(' + index + ')">📄 Generate Final Bill (Invoice)</button>' +
                
                '<div id="invoice-' + index + '" style="display:none;" class="invoice-card">' +
                    '<div class="invoice-header"><span>SMART SOLAR SYSTEM INVOICE</span><span>#' + (1000 + index) + '</span></div>' +
                    '<p><strong>System Category:</strong> ' + proj.mode + '</p>' +
                    '<p><strong>1. Solar Panels:</strong> ' + proj.panels + ' Units (' + proj.panelPower + 'W)</p>' +
                    '<p><strong>2. Hybrid Inverter:</strong> ' + proj.inverter + ' kW</p>' +
                    (proj.battery > 0 ? '<p><strong>3. Energy Storage:</strong> Lithium Battery (' + proj.battery + ' kWh)</p>' : '<p><strong>3. Pumping Kit:</strong> Direct VFD Solar Pump</p>') +
                    '<p><strong>4. Accessories:</strong> ' + extrasHtml + '</p>' +
                    
                    // خانة المصنعية للمهندس
                    '<div style="margin: 12px 0; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; border: 1px solid var(--glass-border);">' +
                        '<label style="font-size: 12px; color: var(--accent2); display: block; margin-bottom: 4px;">Add/Adjust Labor & Extra Fees ($):</label>' +
                        '<input type="number" id="laborFee-' + index + '" placeholder="Enter labor cost" value="0" style="width: 120px; padding: 6px;" onchange="updateTotalCost(' + index + ', ' + proj.cost + ')">' +
                    '</div>' +

                    '<hr style="border-color: var(--glass-border); margin: 10px 0;">' +
                    '<p style="color: var(--accent2); font-size: 15px;"><strong>Total Invoice Cost: $<span id="finalCost-' + index + '">' + proj.cost.toLocaleString() + '</span></strong></p>' +
                    '<button class="print-btn" style="background: var(--cyan) !important;" onclick="window.print()">🖨️ Print Final Invoice</button>' +
                '</div>' +
                '</div>'; 
        });
    }

    html += '</div>'; 
    listElement.innerHTML = html; 
} 

// --- 4. قبول الطلب من طرف المهندس ونقله للنشطة ---
function approveClientRequest(reqIndex) {
    let clientRequests = JSON.parse(localStorage.getItem("clientRequests")) || [];
    let confirmedProjects = JSON.parse(localStorage.getItem("projects")) || [];
    
    let approvedProj = clientRequests.splice(reqIndex, 1)[0];
    confirmedProjects.push(approvedProj);
    
    localStorage.setItem("clientRequests", JSON.stringify(clientRequests));
    localStorage.setItem("projects", JSON.stringify(confirmedProjects));
    
    alert("Project approved successfully and moved to active invoices! ✅");
    loadDashboardProjects();
}

// --- 5. إظهار/إخفاء الفاتورة ---
function toggleInvoice(index) {
    const inv = document.getElementById('invoice-' + index);
    if (inv) {
        inv.style.display = inv.style.display === 'none' ? 'block' : 'none';
    }
}

// --- 6. تحديث السعر الكلي بالمصنعية ---
function updateTotalCost(index, baseCost) {
    const laborInput = document.getElementById('laborFee-' + index);
    const finalCostSpan = document.getElementById('finalCost-' + index);
    if(laborInput && finalCostSpan) {
        const laborVal = Number(laborInput.value) || 0;
        const total = baseCost + laborVal;
        finalCostSpan.innerText = total.toLocaleString();
    }
}
 
window.addEventListener('DOMContentLoaded', () => { 
    loadDashboardProjects(); 
});