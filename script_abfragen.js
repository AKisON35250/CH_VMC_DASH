let dbWeapon, dbLaw;

// --- IndexedDB öffnen ---
function openDatabases(callback) {
    let opened = 0;

    const reqWeapon = indexedDB.open("VMC_Weapon_DB", 1);
    reqWeapon.onupgradeneeded = e => {
        dbWeapon = e.target.result;
        if (!dbWeapon.objectStoreNames.contains("weapons")) {
            dbWeapon.createObjectStore("weapons", { keyPath: "id", autoIncrement: true });
        }
    };
    reqWeapon.onsuccess = e => {
        dbWeapon = e.target.result;
        opened++;
        if (opened === 2) callback();
    };

    const reqLaw = indexedDB.open("VMC_Law_DB", 1);
    reqLaw.onupgradeneeded = e => {
        dbLaw = e.target.result;
        if (!dbLaw.objectStoreNames.contains("law")) {
            dbLaw.createObjectStore("law", { keyPath: "id", autoIncrement: true });
        }
    };
    reqLaw.onsuccess = e => {
        dbLaw = e.target.result;
        opened++;
        if (opened === 2) callback();
    };
}

// --- Filter & Anzeige ---
function filterQueryEntries() {
    const search = document.getElementById("search-name-query").value.toLowerCase();
    const tbody = document.querySelector("#query-entries-list tbody");
    tbody.innerHTML = "";
    if (!search || !dbWeapon || !dbLaw) return;

    let allEntries = [];

    // Waffenschein laden
    dbWeapon.transaction("weapons", "readonly").objectStore("weapons").getAll().onsuccess = e => {
        allEntries = allEntries.concat(e.target.result.map(v => ({ ...v, licenseType: "Waffenschein" })));

        // Anwalt-Lizenz laden
        dbLaw.transaction("law", "readonly").objectStore("law").getAll().onsuccess = e2 => {
            allEntries = allEntries.concat(e2.target.result.map(v => ({ ...v, licenseType: "Anwalt" })));

            // Nach Name filtern
            const filtered = allEntries.filter(e => e.name.toLowerCase().includes(search));

            // Gruppieren nach Name
            const grouped = {};
            filtered.forEach(e => {
                if (!grouped[e.name]) grouped[e.name] = [];
                grouped[e.name].push(e);
            });

            // Tabelle erstellen
            for (let name in grouped) {
                const row = document.createElement("tr");

                // Lizenzen + Status farbig darstellen
                const licensesStatus = grouped[name].map(e => {
                    const statusColor = e.status === "bestanden" ? "status-bestanden" : "status-nicht-bestanden";
                    return `${e.licenseType}: <span class="${statusColor}">${e.status}</span>`;
                }).join(", ");

                const birthdays = grouped[name][0].birthday; // nur einmal
                const phones = grouped[name][0].phone;       // nur einmal

                let actions = "";
                grouped[name].forEach(e => {
                    actions += `<button onclick="editEntry(${e.id},'${e.licenseType}')">Bearbeiten (${e.licenseType})</button>`;
                    actions += `<button onclick="deleteEntry(${e.id},'${e.licenseType}')">Löschen (${e.licenseType})</button>`;
                });

                row.innerHTML = `
                    <td>${name}</td>
                    <td>${licensesStatus}</td>
                    <td>${birthdays}</td>
                    <td>${phones}</td>
                    <td>${actions}</td>
                `;
                tbody.appendChild(row);
            }
        };
    };
}

// --- Bearbeiten ---
function editEntry(id, type) {
    let db = type === "Waffenschein" ? dbWeapon : dbLaw;
    let storeName = type === "Waffenschein" ? "weapons" : "law";
    db.transaction(storeName, "readwrite").objectStore(storeName).get(id).onsuccess = e => {
        let entry = e.target.result;
        let newName = prompt("Neuer Name?", entry.name);
        let newBirthday = prompt("Geburtsdatum?", entry.birthday);
        let newPhone = prompt("Telefon?", entry.phone);
        let newStatus = prompt("Status (bestanden/nicht bestanden)?", entry.status);
        if (!newName || !newBirthday || !newPhone) return;
        entry.name = newName;
        entry.birthday = newBirthday;
        entry.phone = newPhone;
        entry.status = newStatus;
        db.transaction(storeName, "readwrite").objectStore(storeName).put(entry);
        filterQueryEntries();
    };
}

// --- Löschen ---
function deleteEntry(id, type) {
    let db = type === "Waffenschein" ? dbWeapon : dbLaw;
    let storeName = type === "Waffenschein" ? "weapons" : "law";
    db.transaction(storeName, "readwrite").objectStore(storeName).delete(id).onsuccess = filterQueryEntries;
}

// --- Beim Laden ---
window.onload = () => openDatabases(() => console.log("Datenbanken geöffnet"));
