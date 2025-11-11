// --- IndexedDB Setup ---
// Waffenschein DB
let dbWeapon;
let requestWeapon = indexedDB.open("VMC_Weapon_DB", 1);

requestWeapon.onupgradeneeded = function(e){
    dbWeapon = e.target.result;
    if(!dbWeapon.objectStoreNames.contains("weapons")){
        let store = dbWeapon.createObjectStore("weapons", {keyPath:"id", autoIncrement:true});
        store.createIndex("name","name",{unique:false});
    }
};

requestWeapon.onsuccess = function(e){
    dbWeapon = e.target.result;
};

// Anwalt-Lizenz DB
let dbLaw;
let requestLaw = indexedDB.open("VMC_Law_DB", 1);

requestLaw.onupgradeneeded = function(e){
    dbLaw = e.target.result;
    if(!dbLaw.objectStoreNames.contains("law")){
        let store = dbLaw.createObjectStore("law", {keyPath:"id", autoIncrement:true});
        store.createIndex("name","name",{unique:false});
    }
};

requestLaw.onsuccess = function(e){
    dbLaw = e.target.result;
};

// --- Modal Funktionen ---
function openWeaponForm(){ 
    document.getElementById("weapon-form").style.display="block"; 
}
function closeWeaponForm(){ 
    document.getElementById("weapon-form").style.display="none"; 
}

function openLawForm(){ 
    document.getElementById("law-form").style.display="block"; 
}
function closeLawForm(){ 
    document.getElementById("law-form").style.display="none"; 
}

// --- Waffenschein speichern ---
function addWeaponEntry(){
    const name = document.getElementById("weapon-name").value;
    const birthday = document.getElementById("weapon-birthday").value;
    const phone = document.getElementById("weapon-phone").value;
    const status = document.getElementById("weapon-status").value;

    if(!name || !birthday || !phone){
        alert("Bitte alle Felder ausfüllen!");
        return;
    }

    let tx = dbWeapon.transaction("weapons","readwrite");
    let store = tx.objectStore("weapons");
    store.add({name,birthday,phone,status});

    tx.oncomplete = function(){
        closeWeaponForm();
        document.getElementById("weapon-name").value="";
        document.getElementById("weapon-birthday").value="";
        document.getElementById("weapon-phone").value="";
        document.getElementById("weapon-status").value="bestanden";
        alert("Waffenschein gespeichert!");
    }
}

// --- Anwalt-Lizenz speichern ---
function addLawEntry(){
    const name = document.getElementById("law-name").value;
    const birthday = document.getElementById("law-birthday").value;
    const phone = document.getElementById("law-phone").value;
    const status = document.getElementById("law-status").value;

    if(!name || !birthday || !phone){
        alert("Bitte alle Felder ausfüllen!");
        return;
    }

    let tx = dbLaw.transaction("law","readwrite");
    let store = tx.objectStore("law");
    store.add({name,birthday,phone,status});

    tx.oncomplete = function(){
        closeLawForm();
        document.getElementById("law-name").value="";
        document.getElementById("law-birthday").value="";
        document.getElementById("law-phone").value="";
        document.getElementById("law-status").value="bestanden";
        alert("Anwalt-Lizenz gespeichert!");
    }
}

// --- Optional: Daten laden für Abfragen-Seite ---
function loadAllEntries(storeName, callback){
    let db = storeName === "weapons" ? dbWeapon : dbLaw;
    let tx = db.transaction(storeName,"readonly");
    let store = tx.objectStore(storeName);
    let results = [];

    store.openCursor().onsuccess = function(e){
        let cursor = e.target.result;
        if(cursor){
            results.push(cursor.value);
            cursor.continue();
        } else {
            callback(results);
        }
    }
}
