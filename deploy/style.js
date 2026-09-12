// --- إعدادات Supabase ---
const SUPABASE_URL = 'https://grikvijvxrrgxrjoibhs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_L1P0fWE39VbejqgywlfEUA_dqG-_v0H';
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

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

// --- 2. دالة حساب النظام ---
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

    // حفظ النتائج مؤقتاً في الذاكرة لنقلها لقاعدة البيانات
    localStorage.setItem("currentProject", JSON.stringify(currentData));

    let resultHTML = '<div style="margin-top: 20px; padding: 15px; border: 1px solid rgba(56,189,248,0.4); border-radius: 10px; background: #0a0f1e; text-align: left;">' +
        '<h3 style="color: #38bdf8; margin-bottom: 10px;">📊 Design Results</h3>' +
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

// --- 3. التحكم في نافذة العميل وحفظ البيانات في قاعدة البيانات ---
function openClientModal() {
    const projectData = localStorage.getItem("currentProject");
    if (!projectData) {
        alert("الرجاء حساب المنظومة أولاً قبل الحفظ!");
        return;
    }
    const modal = document.getElementById('clientModal');
    if (modal) modal.style.display = 'flex';
}

function closeClientModal() {
    const modal = document.getElementById('clientModal');
    if (modal) modal.style.display = 'none';
}

async function submitClientOrder(event) {
    event.preventDefault();
    
    const projectData = localStorage.getItem("currentProject");
    if (!projectData) return;
    
    let design = JSON.parse(projectData);
    
    const clientName = document.getElementById('clientName').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const clientPhone = document.getElementById('clientPhone').value;
    const uniqueId = Math.floor(Date.now() / 1000);

    try {
        const { error } = await _supabase
            .from('projects')
            .insert([
                { 
                    id: uniqueId,
                    name: String(clientName),
                    address: String(clientAddress),
                    phone: String(clientPhone),
                    systemType: String(design.mode),
                    panels: Number(design.panels),
                    panelspower: String(design.panelPower + 'W'),
                    inverter: String(design.inverter + 'kw'),
                    battery: String(design.battery + 'kw'),
                    cost: 0 
                }
            ]);

        if (error) {
            alert('خطأ في حفظ البيانات: ' + error.message);
        } else {
            alert('تم حفظ المشروع في قاعدة البيانات بنجاح! 🎉');
            localStorage.removeItem("currentProject");
            closeClientModal();
            document.getElementById('clientForm').reset();
        }
    } catch (err) {
        alert('حدث خطأ في الاتصال: ' + err.message);
    }
}

// --- 4. جلب وعرض المشاريع من قاعدة البيانات في الداشبورد ---
// --- 4. جلب وعرض المشاريع من قاعدة البيانات في الداشبورد مع تصدير Excel ---
async function loadDashboardProjects() {
    const listElement = document.getElementById("list");
    if (!listElement) return;

    const { data: projects, error } = await _supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        listElement.innerHTML = "<p style='text-align: center; color: red; margin-top: 20px;'>تعذر جلب المشاريع من قاعدة البيانات.</p>";
        return;
    }

    if (!projects || projects.length === 0) {
        listElement.innerHTML = "<p style='text-align: center; color: #aaa; margin-top: 20px;'>No saved projects found.</p>";
        return;
    }

    let html = '<div style="max-width: 800px; margin: 20px auto; padding: 20px;">';
    
    projects.forEach((proj, index) => {
        html += '<div class="card" style="background: #0a0f1e; border: 1px solid rgba(56,189,248,0.4); padding: 15px; margin-bottom: 15px; border-radius: 8px; text-align: left; color: #fff;">' +
            '<h3 style="color: #38bdf8; margin-bottom: 10px;">Request #' + (proj.id || (index + 1)) + ' — ' + proj.systemType + '</h3>' +
            '<div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; margin-bottom: 10px;">' +
                '<p>👤 <strong>Client:</strong> ' + proj.name + '</p>' +
                '<p>📍 <strong>Address:</strong> ' + proj.address + '</p>' +
                '<p>📞 <strong>Phone:</strong> ' + proj.phone + '</p>' +
            '</div>' +
            '<p>☀️ <strong>Solar Panels:</strong> ' + proj.panels + ' panels (' + proj.panelspower + ')</p>' +
            '<p>⚡️ <strong>Inverter Size:</strong> ' + proj.inverter + '</p>' +
            '<p>🔋 <strong>Battery/Energy:</strong> ' + proj.battery + '</p>' +
            '<div style="margin-top: 15px;">' +
                '<button onclick="exportProjectToExcel(\'' + proj.name + '\', \'' + proj.systemType + '\', \'' + proj.panels + '\', \'' + proj.inverter + '\', \'' + proj.battery + '\')" style="background: #38bdf8 !important; color: #000 !important; padding: 8px 15px; font-size: 14px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold;">📥 تصدير كفاتورة Excel</button>' +
            '</div>' +
            '</div>';
    });

    html += '</div>';
    listElement.innerHTML = html;
}

// --- 5. دالة توليد وتنزيل ملف الإكسل (CSV) ---
function exportProjectToExcel(clientName, systemType, panels, inverter, battery) {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Field,Details\n";
    csvContent += "Client Name," + clientName + "\n";
    csvContent += "System Type," + systemType + "\n";
    csvContent += "Panels Count," + panels + "\n";
    csvContent += "Inverter Size," + inverter + "\n";
    csvContent += "Battery Capacity," + battery + "\n";

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Solar_Invoice_" + (clientName ? clientName.replace(/\s+/g, "_") : "Client") + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard')) {
        loadDashboardProjects();
    }
});
// دالة كشف لغة الجهاز وتعديل الاتجاه تلقائياً
document.addEventListener("DOMContentLoaded", function() {
    const userLang = navigator.language  ||navigator.userLanguage||  "en";

    if (userLang.startsWith("ar")) {
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.setAttribute("lang", "ar");

        const translations = {
            "Smart Solar Designer - Client Portal": "تصميم الطاقة الشمسية الذكي - بوابة العميل",
            "Calculate System & Cost": "حساب النظام والتكلفة",
            "Save Project (Send to Engineer)": "حفظ المشروع (إرسال إلى المهندس)",
            "Your Design & Estimated Price": "تصميمك والسعر التقديري"
        };

        const elements = document.querySelectorAll("body *");
        elements.forEach(el => {
            if (el.children.length === 0) {
                let text = el.textContent.trim();
                // فحص دقيق ومطابقة مرنة لكل النصوص
                for (let key in translations) {
                    if (text.includes(key)) {
                        el.textContent = el.textContent.replace(key, translations[key]);
                    }
                }
            }
        });
    }
});