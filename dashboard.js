// إعداد الاتصال بقاعدة البيانات Supabase
const SUPABASE_URL = 'https://grikvijvxrrgxrjoibhs.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_L1P0fWE39VbejqgywlfEUA_dqG-_v0H';
const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// دالة لتنظيف النصوص وتجنب الأكواد الخبيثة
function escapeHtml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// دالة إرسال الطلب النهائي مع بيانات العميل للمهندس وخزنها في Supabase مباشرة
async function submitClientOrder(event) {
    event.preventDefault();
    
    const projectData = localStorage.getItem("currentProject");
    if (!projectData) {
        alert("Please calculate the system first!");
        return;
    }
    
    let design = JSON.parse(projectData);
    
    const clientName = document.getElementById('clientName').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const clientPhone = document.getElementById('clientPhone').value;

    // توليد رقم معرف فريد ومؤقت لتجاوز شرط الـ ID
    const uniqueId = Math.floor(Date.now() / 1000);

    try {
        const { data, error } = await _supabase
            .from('projects')
            .insert([
                { 
                    id: uniqueId,
                    name: String(clientName),
                    address: String(clientAddress),
                    phone: String(clientPhone),
                    systemType: String(design.mode),
                    panels: Number(design.panels),
                    panelspower: String(design.panelPower),
                    inverter: String(design.inverter + 'kw'),
                    battery: String(design.battery + 'kw'),
                    cost: Number(design.cost)
                }
            ]);

        if (error) {
            console.error('خطأ من Supabase:', error);
            alert('خطأ من قاعدة البيانات: ' + error.message);
        } else {
            alert('تم إرسال طلبك ومعلومات التصميم بنجاح إلى المهندس! 🎉');
            localStorage.removeItem("currentProject");
            closeClientModal();
            document.getElementById('clientForm').reset();
        }
    } catch (err) {
        console.error('خطأ غير متوقع:', err);
        alert('حدث خطأ في الاتصال: ' + err.message);
    }
}
// دالة جلب وعرض الطلبات في لوحة تحكم المهندس (dashboard.html)
async function loadDashboardProjects() {
    const listElement = document.getElementById("list");
    if (!listElement) return;

    const { data: projects, error } = await _supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('خطأ في جلب البيانات:', error.message);
        listElement.innerHTML = "<p class='empty-state' style='color: red;'>تعذر الاتصال بقاعدة البيانات لجلب الطلبات.</p>";
        return;
    }

    listElement.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "project-list";

    if (!projects || projects.length === 0) {
        wrapper.innerHTML = "<p class='empty-state'>No pending requests found.</p>";
    } else {
        projects.forEach(function (proj, index) {
            const card = document.createElement("div");
            card.className = "project-card invoice-card";
            card.style.marginBottom = "15px";

            const statusText = proj.status || "Pending Approval";
            const badgeColor = statusText.includes("Approved") ? "var(--cyan)" : "var(--accent2)";

            card.innerHTML = `
                <div class="invoice-header">
                    <span>Request #${proj.id || (index + 1)} — ${escapeHtml(proj.mode)}</span>
                    <span style="color: ${badgeColor}; font-weight: bold;">${escapeHtml(statusText)}</span>
                </div>
                <div style='background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px; margin-bottom: 10px;'>
                <p>👤 <strong>Client:</strong> ${escapeHtml(proj.name)}</p>
                    <p>📍 <strong>Address:</strong> ${escapeHtml(proj.address)}</p>
                    <p>📞 <strong>Phone:</strong> ${escapeHtml(proj.phone)}</p>
                </div>
                <p>📅 <strong>Date:</strong> ${escapeHtml(proj.date)}</p>
                <p>☀️ <strong>Panels:</strong> ${escapeHtml(proj.panels)} panels (${escapeHtml(proj.panelPower)}W)</p>
                <p>⚡️ <strong>Inverter:</strong> ${escapeHtml(proj.inverter)} kW</p>
                <p>🔋 <strong>Battery:</strong> ${escapeHtml(proj.battery)} kWh</p>
                <p style="margin-top: 8px; font-size: 15px; color: var(--accent2);">💰 <strong>Total Cost:</strong> $${escapeHtml(proj.cost)}</p>
                
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button class="print-btn" onclick="approveProject(${proj.id})">✓ تأكيد الطلب (اعتماد)</button>
                </div>
            `;
            wrapper.appendChild(card);
        });
    }

    listElement.appendChild(wrapper);
}

// دالة اعتماد أو تأكيد الطلب بواسطة المهندس
async function approveProject(projectId) {
    const { error } = await _supabase
        .from('projects')
        .update({ status: 'Approved by Engineer' })
        .eq('id', projectId);

    if (error) {
        alert('حدث خطأ أثناء تأكيد الطلب: ' + error.message);
    } else {
        alert('تم تأكيد الطلب بنجاح!');
        loadDashboardProjects();
    }
}

// التشغيل التلقائي للدالة حسب الصفحة الحالية
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardProjects();
    }
});

// دالة لتنظيف النصوص وتجنب الأكواد الخبيثة
function escapeHtml(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// دالة إرسال الطلب النهائي مع بيانات العميل للمهندس وخزنها في Supabase مباشرة
async function submitClientOrder(event) {
    event.preventDefault();
    
    const projectData = localStorage.getItem("currentProject");
    if (!projectData) {
        alert("Please calculate the system first!");
        return;
    }
    
    let design = JSON.parse(projectData);
    
    const clientName = document.getElementById('clientName').value;
    const clientAddress = document.getElementById('clientAddress').value;
    const clientPhone = document.getElementById('clientPhone').value;

    const uniqueId = Math.floor(Date.now() / 1000);

    try {
        const { data, error } = await _supabase
            .from('projects')
            .insert([
                { 
                    id: uniqueId,
                    name: String(clientName),
                    address: String(clientAddress),
                    phone: String(clientPhone),
                    systemType: String(design.mode),
                    panels: Number(design.panels),
                    panelspower: String(design.panelPower),
                    inverter: String(design.inverter + 'kw'),
                    battery: String(design.battery + 'kw'),
                    cost: Number(design.cost)
                }
            ]);

        if (error) {
            console.error('خطأ من Supabase:', error);
            alert('خطأ من قاعدة البيانات: ' + error.message);
        } else {
            alert('تم إرسال طلبك ومعلومات التصميم بنجاح إلى المهندس! 🎉');
            localStorage.removeItem("currentProject");
            closeClientModal();
            document.getElementById('clientForm').reset();
        }
    } catch (err) {
        console.error('خطأ غير متوقع:', err);
        alert('حدث خطأ في الاتصال: ' + err.message);
    }
}

// دالة جلب وعرض الطلبات في لوحة تحكم المهندس (dashboard.html)
async function loadDashboardProjects() {
    const listElement = document.getElementById("list");
    if (!listElement) return;

    const { data: projects, error } = await _supabase
        .from('projects')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('خطأ في جلب البيانات:', error.message);
        listElement.innerHTML = "<p class='empty-state' style='color: red;'>تعذر الاتصال بقاعدة البيانات لجلب الطلبات.</p>";
        return;
    }

    listElement.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "project-list";

    if (!projects || projects.length === 0) {
        wrapper.innerHTML = "<p class='empty-state'>No pending requests found.</p>";
    } else {
        projects.forEach(function (proj, index) {
            const card = document.createElement("div");
            card.className = "project-card invoice-card";
            card.style.marginBottom = "15px";

            const statusText = proj.status || "Pending Approval";
            const badgeColor = statusText.includes("Approved") ? "var(--cyan)" : "var(--accent2)";

            card.innerHTML = `
                <div class="invoice-header">
                    <span>Request #${proj.id || (index + 1)} — ${escapeHtml(proj.systemType)}</span>
                    <span style="color: ${badgeColor}; font-weight: bold;">${escapeHtml(statusText)}</span>
                </div><div style='background: rgba(0,0,0,0.2); padding: 10px; border-radius: 4px; margin-bottom: 10px;'>
                    <p>👤 <strong>Client:</strong> ${escapeHtml(proj.name)}</p>
                    <p>📍 <strong>Address:</strong> ${escapeHtml(proj.address)}</p>
                    <p>📞 <strong>Phone:</strong> ${escapeHtml(proj.phone)}</p>
                </div>
                <p>☀️ <strong>Panels:</strong> ${escapeHtml(proj.panels)} panels (${escapeHtml(proj.panelspower)})</p>
                <p>⚡️ <strong>Inverter:</strong> ${escapeHtml(proj.inverter)}</p>
                <p>🔋 <strong>Battery:</strong> ${escapeHtml(proj.battery)}</p>
                <p style="margin-top: 8px; font-size: 15px; color: var(--accent2);">💰 <strong>Total Cost:</strong> $${escapeHtml(proj.cost)}</p>
                
                <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap;">
                    <button class="print-btn" onclick="approveProject(${proj.id})">✓ تأكيد الطلب (اعتماد)</button>
                    <button class="print-btn" style="background: var(--cyan) !important;" onclick="exportProjectToExcel('${escapeHtml(proj.name)}', '${escapeHtml(proj.systemType)}', '${escapeHtml(proj.panels)}', '${escapeHtml(proj.inverter)}', '${escapeHtml(proj.battery)}', '${escapeHtml(proj.cost)}')">📥 تصدير إلى Excel</button>
                </div>
            `;
            wrapper.appendChild(card);
        });
    }

    listElement.appendChild(wrapper);
}

// دالة اعتماد أو تأكيد الطلب بواسطة المهندس
async function approveProject(projectId) {
    const { error } = await _supabase
        .from('projects')
        .update({ status: 'Approved by Engineer' })
        .eq('id', projectId);

    if (error) {
        alert('حدث خطأ أثناء تأكيد الطلب: ' + error.message);
    } else {
        alert('تم تأكيد الطلب بنجاح!');
        loadDashboardProjects();
    }
}

// --- دالة جديدة: تصدير بيانات الفاتورة إلى ملف Excel (CSV) ---
function exportProjectToExcel(clientName, systemType, panels, inverter, battery, cost) {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // دعم اللغة العربية (UTF-8 BOM)
    
    csvContent += "Field,Details\n";
    csvContent += "Client Name," + clientName + "\n";
    csvContent += "System Type," + systemType + "\n";
    csvContent += "Panels Count," + panels + "\n";
    csvContent += "Inverter Size," + inverter + "\n";
    csvContent += "Battery Capacity," + battery + "\n";
    csvContent += "Total Cost ($)," + cost + "\n";

    let encodedUri = encodeURI(csvContent);
    let link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Solar_Invoice_" + clientName.replace(/\s+/g, "_") + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// التشغيل التلقائي للدالة حسب الصفحة الحالية
window.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        loadDashboardProjects();
    }
});
