function getStoredArray(key) {
    try {
        const data = localStorage.getItem(key);

        if (!data) {
            return [];
        }

        const parsedData = JSON.parse(data);

        return Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
        console.error("Error reading " + key + ":", error);
        return [];
    }
}

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function loadDashboardProjects() {
    const listElement = document.getElementById("list");

    if (!listElement) {
        console.error('Element with id="list" was not found.');
        return;
    }

    listElement.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "project-list";
    wrapper.style.maxWidth = "100%";
    wrapper.style.padding = "0";

    const requests = getStoredArray("clientRequests");
    const projects = getStoredArray("projects");

    // =========================
    // 1. Customer Requests
    // =========================
    if (requests.length > 0) {
        const reqHeader = document.createElement("h3");
        reqHeader.style.color = "var(--accent2)";
        reqHeader.style.marginBottom = "12px";
        reqHeader.innerText = "⏳ Customer Requests Awaiting Approval";

        wrapper.appendChild(reqHeader);

        requests.forEach(function (req, reqIndex) {
            const card = document.createElement("div");
            card.className = "project-card";
            card.style.borderLeft = "4px solid orange";
            card.style.marginBottom = "15px";

            const title = document.createElement("h3");
            title.innerText =
                "Client Request #" +
                (reqIndex + 1) +
                " — " +
                (req.mode || "Unknown System");

            card.appendChild(title);

            const infoBox = document.createElement("div");
            infoBox.style.cssText =
                "background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; margin-bottom: 10px; border: 1px solid var(--glass-border);";

            infoBox.innerHTML =
                '<p><span class="ico">👤</span> <strong>Client Name:</strong> ' +
                escapeHtml(req.clientName || "N/A") +
                "</p>" +
                '<p><span class="ico">📍</span> <strong>Address:</strong> ' +
                escapeHtml(req.clientAddress || "N/A") +
                "</p>" +
                '<p><span class="ico">📞</span> <strong>Phone:</strong> ' +
                escapeHtml(req.clientPhone || "N/A") +
                "</p>";

            card.appendChild(infoBox);

            const details = document.createElement("div");

            const reqExtras =
                Array.isArray(req.extras) && req.extras.length > 0
                    ? req.extras.join(", ")
                    : "None selected";

            const requestCost = Number(req.cost) || 0;

            details.innerHTML =
                '<p><span class="ico">📅</span> <strong>Date:</strong> ' +
                escapeHtml(req.date || "N/A") +
                "</p>" +
                '<p><span class="ico">☀️</span> <strong>Panels:</strong> ' +
                (Number(req.panels) || 0) +
                " panels (" +
                (Number(req.panelPower) || 0) +
                "W)</p>" +
                '<p><span class="ico">⚡️</span> <strong>Inverter:</strong> ' +
                (Number(req.inverter) || 0) +
                " kW</p>" +
                '<p><span class="ico">🛠</span> <strong>Accessories:</strong> ' +
                escapeHtml(reqExtras) +
                "</p>" +
                '<p><span class="ico">💰</span> <strong>Estimated Cost:</strong> $' +
                requestCost.toLocaleString() +
                "</p>";

            card.appendChild(details);const btn = document.createElement("button");
            btn.className = "print-btn";
            btn.style.cssText =
                "background: #28a745 !important; margin-top: 10px;";
            btn.innerText = "✅ Confirm & Move to Active Projects";

            btn.onclick = function () {
                approveClientRequest(reqIndex);
            };

            card.appendChild(btn);
            wrapper.appendChild(card);
        });
    }

    // =========================
    // 2. Active Projects
    // =========================
    const projHeader = document.createElement("h3");

    projHeader.style.cssText =
        "color: var(--cyan); margin: 25px 0 12px 0;";

    projHeader.innerText =
        "📋 Active Confirmed Projects & Invoices";

    wrapper.appendChild(projHeader);

    if (projects.length === 0) {
        const emptyMsg = document.createElement("p");

        emptyMsg.className = "empty-state";
        emptyMsg.innerText = "No confirmed projects found.";

        wrapper.appendChild(emptyMsg);
    } else {
        projects.forEach(function (proj, index) {
            const card = document.createElement("div");

            card.className = "project-card";
            card.style.marginBottom = "15px";

            const title = document.createElement("h3");

            title.innerText =
                "Project #" +
                (index + 1) +
                " — " +
                (proj.mode || "Unknown System");

            card.appendChild(title);

            // Client Information
            const infoBox = document.createElement("div");

            infoBox.style.cssText =
                "background: rgba(0,0,0,0.2); padding: 8px; border-radius: 4px; margin-bottom: 10px; border: 1px solid var(--glass-border);";

            infoBox.innerHTML =
                '<p><span class="ico">👤</span> <strong>Client Name:</strong> ' +
                escapeHtml(proj.clientName || "N/A") +
                "</p>" +
                '<p><span class="ico">📍</span> <strong>Address:</strong> ' +
                escapeHtml(proj.clientAddress || "N/A") +
                "</p>" +
                '<p><span class="ico">📞</span> <strong>Phone:</strong> ' +
                escapeHtml(proj.clientPhone || "N/A") +
                "</p>";

            card.appendChild(infoBox);

            const batteryValue = Number(proj.battery) || 0;

            const storageText =
                batteryValue > 0
                    ? batteryValue + " kWh"
                    : "Direct Pumping";

            const details = document.createElement("div");

            details.innerHTML =
                '<p><span class="ico">📅</span> <strong>Date:</strong> ' +
                escapeHtml(proj.date || "N/A") +
                "</p>" +
                '<p><span class="ico">☀️</span> <strong>Solar Panels:</strong> ' +
                (Number(proj.panels) || 0) +
                " panels (" +
                (Number(proj.panelPower) || 0) +
                "W each)</p>" +
                '<p><span class="ico">⚡️</span> <strong>Inverter Size:</strong> ' +
                (Number(proj.inverter) || 0) +
                " kW</p>" +
                '<p><span class="ico">🔋</span> <strong>Storage:</strong> ' +
                storageText +
                "</p>";

            card.appendChild(details);

            // Invoice Button
            const invBtn = document.createElement("button");

            invBtn.className = "print-btn";
            invBtn.innerText = "📄 Generate Final Bill (Invoice)";

            invBtn.onclick = function () {
                toggleInvoice(index);
            };

            card.appendChild(invBtn);

            // Cost
            const baseCost = Number(proj.cost) || 0;

            const extrasHtml =
                Array.isArray(proj.extras) && proj.extras.length > 0
                    ? proj.extras.join(", ")
                    : "None selected";

            // Invoice Card
            const invoiceCard = document.createElement("div");invoiceCard.id = "invoice-" + index;
            invoiceCard.style.display = "none";
            invoiceCard.className = "invoice-card";

            invoiceCard.innerHTML =
                '<div class="invoice-header">' +
                "<span>SMART SOLAR SYSTEM INVOICE</span>" +
                "<span>#" +
                (1000 + index) +
                "</span>" +
                "</div>" +
                "<p><strong>Client:</strong> " +
                escapeHtml(proj.clientName || "N/A") +
                " (" +
                escapeHtml(proj.clientPhone || "N/A") +
                ")</p>" +
                "<p><strong>System Category:</strong> " +
                escapeHtml(proj.mode || "N/A") +
                "</p>" +
                "<p><strong>1. Solar Panels:</strong> " +
                (Number(proj.panels) || 0) +
                " Units (" +
                (Number(proj.panelPower) || 0) +
                "W)</p>" +
                "<p><strong>2. Hybrid Inverter:</strong> " +
                (Number(proj.inverter) || 0) +
                " kW</p>" +
                "<p><strong>3. Storage/Pumping:</strong> " +
                storageText +
                "</p>" +
                "<p><strong>4. Accessories:</strong> " +
                escapeHtml(extrasHtml) +
                "</p>" +
                '<div style="margin: 12px 0; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 4px; border: 1px solid var(--glass-border);">' +
                '<label style="font-size: 12px; color: var(--accent2); display: block; margin-bottom: 4px;">Add/Adjust Labor & Extra Fees ($):</label>' +
                '<input type="number" id="laborFee-' +
                index +
                '" placeholder="Enter labor cost" value="0" style="width: 120px; padding: 6px;" onchange="updateTotalCost(' +
                index +
                ", " +
                baseCost +
                ')">' +
                "</div>" +
                '<hr style="border-color: var(--glass-border); margin: 10px 0;">' +
                '<p style="color: var(--accent2); font-size: 15px;"><strong>Total Invoice Cost: $<span id="finalCost-' +
                index +
                '">' +
                baseCost.toLocaleString() +
                "</span></strong></p>" +
                '<div style="margin-top: 12px;">' +
                '<button class="print-btn" style="background: var(--cyan) !important;" onclick="window.print()">🖨 Print Invoice</button> ' +
                '<button class="print-btn" style="background: #217346 !important;" onclick="exportToExcel(' +
                index +
                ')">📊 Export to Excel</button>' +
                "</div>";

            card.appendChild(invoiceCard);
            wrapper.appendChild(card);
        });
    }

    listElement.appendChild(wrapper);
}

function approveClientRequest(reqIndex) {
    const clientRequests = getStoredArray("clientRequests");
    const confirmedProjects = getStoredArray("projects");

    if (reqIndex < 0 || reqIndex >= clientRequests.length) return;

    const approvedProj = clientRequests.splice(reqIndex, 1)[0];
    confirmedProjects.push(approvedProj);

    localStorage.setItem("clientRequests", JSON.stringify(clientRequests));
    localStorage.setItem("projects", JSON.stringify(confirmedProjects));

    alert("Project approved and moved to active invoices! ✅");
    loadDashboardProjects();
}

function toggleInvoice(index) {
    const inv = document.getElementById("invoice-" + index);
    if (inv) {
        inv.style.display = inv.style.display === "none" ? "block" : "none";
    }
}

function updateTotalCost(index, baseCost) {
    const laborInput = document.getElementById("laborFee-" + index);
    const finalCostSpan = document.getElementById("finalCost-" + index);
    if (laborInput && finalCostSpan) {
        const laborValue = Number(laborInput.value) || 0;
        const total = baseCost + laborValue;
        finalCostSpan.innerText = total.toLocaleString();
    }
}function exportToExcel(index) {
    const projects = getStoredArray("projects");
    const proj = projects[index];
    if (!proj) return;

    const laborInput = document.getElementById("laborFee-" + index);
    const laborVal = laborInput ? Number(laborInput.value) || 0 : 0;
    const finalTotal = (Number(proj.cost) || 0) + laborVal;

    let csvContent = "data:text/csv;charset=utf-8,\uFEFF";
    csvContent += "Field,Details\n";
    csvContent += "Client Name," + (proj.clientName || "") + "\n";
    csvContent += "Client Address," + (proj.clientAddress || "") + "\n";
    csvContent += "Client Phone," + (proj.clientPhone || "") + "\n";
    csvContent += "System Type," + (proj.mode || "") + "\n";
    csvContent += "Date," + (proj.date || "") + "\n";
    csvContent += "Solar Panels (Units)," + (proj.panels || 0) + "\n";
    csvContent += "Panel Power (W)," + (proj.panelPower || 0) + "\n";
    csvContent += "Inverter Size (kW)," + (proj.inverter || 0) + "\n";
    csvContent += "Storage/Energy," + (proj.battery > 0 ? proj.battery + " kWh" : "Direct Pumping") + "\n";
    csvContent += "Accessories," + (proj.extras ? proj.extras.join(" - ") : "None") + "\n";
    csvContent += "Labor & Extra Fees ($)," + laborVal + "\n";
    csvContent += "Total Invoice Cost ($)," + finalTotal + "\n";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Solar_Invoice_" + (1000 + index) + ".csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

window.addEventListener("DOMContentLoaded", () => {
    loadDashboardProjects();
});