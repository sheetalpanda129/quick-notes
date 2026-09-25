/* =========================================
   QUICK NOTES - COMPLETE JAVASCRIPT
========================================= */

let currentUser = localStorage.getItem("quickNotesCurrentUser") || "";

let editingNoteId = null;
let notePinned = false;
let noteFavorite = false;

let selectedFolderId = null;
let currentViewerFile = null;

let db;


/* =========================================
   HELPER
========================================= */

function $(id) {
    return document.getElementById(id);
}

function showToast(message) {

    const toast = $("toast");

    toast.textContent = message;

    toast.style.display = "block";

    setTimeout(() => {
        toast.style.display = "none";
    }, 2500);
}


function makeId() {

    return Date.now() + "_" +
        Math.random().toString(36).substring(2, 9);

}


function escapeHTML(text) {

    return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================
   LOCAL STORAGE
========================================= */

function storageKey(name) {

    return "quickNotes_" + currentUser + "_" + name;

}


function getData(name, defaultValue = []) {

    try {

        return JSON.parse(
            localStorage.getItem(storageKey(name))
        ) || defaultValue;

    } catch {

        return defaultValue;

    }

}


function saveData(name, data) {

    localStorage.setItem(
        storageKey(name),
        JSON.stringify(data)
    );

}


/* =========================================
   INDEXED DB
========================================= */

function openDatabase() {

    return new Promise((resolve, reject) => {

        const request =
            indexedDB.open("QuickNotesFileDatabase", 1);


        request.onupgradeneeded = function(event) {

            const database = event.target.result;

            if (!database.objectStoreNames.contains("files")) {

                database.createObjectStore(
                    "files",
                    {
                        keyPath: "id"
                    }
                );

            }

        };


        request.onsuccess = function(event) {

            db = event.target.result;

            resolve();

        };


        request.onerror = function() {

            reject(request.error);

        };

    });

}


function saveFileToDB(fileObject) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction("files", "readwrite");

        const store =
            transaction.objectStore("files");

        store.put(fileObject);

        transaction.oncomplete = resolve;

        transaction.onerror = () => {
            reject(transaction.error);
        };

    });

}


function getAllFiles() {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction("files", "readonly");

        const store =
            transaction.objectStore("files");

        const request =
            store.getAll();

        request.onsuccess = () => {

            resolve(request.result);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


function getFile(id) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction("files", "readonly");

        const request =
            transaction.objectStore("files").get(id);

        request.onsuccess = () => {

            resolve(request.result);

        };

        request.onerror = () => {

            reject(request.error);

        };

    });

}


function deleteFileFromDB(id) {

    return new Promise((resolve, reject) => {

        const transaction =
            db.transaction("files", "readwrite");

        transaction.objectStore("files").delete(id);

        transaction.oncomplete = resolve;

        transaction.onerror = () => {
            reject(transaction.error);
        };

    });

}


/* =========================================
   AUTH
========================================= */

function showLogin() {

    $("authScreen").classList.remove("hidden");

    $("appScreen").classList.add("hidden");

}


async function showApplication() {

    $("authScreen").classList.add("hidden");

    $("appScreen").classList.remove("hidden");

    $("topUsername").textContent = currentUser;

    $("welcomeUsername").textContent = currentUser;

    await refreshEverything();

}


/* LOGIN TAB */

$("loginTab").onclick = function() {

    $("loginTab").classList.add("active");

    $("signupTab").classList.remove("active");

    $("loginForm").classList.remove("hidden");

    $("signupForm").classList.add("hidden");

};


/* SIGNUP TAB */

$("signupTab").onclick = function() {

    $("signupTab").classList.add("active");

    $("loginTab").classList.remove("active");

    $("signupForm").classList.remove("hidden");

    $("loginForm").classList.add("hidden");

};


/* SHOW PASSWORD */

document.querySelectorAll("[data-eye]").forEach(button => {

    button.onclick = function() {

        const input =
            $(button.dataset.eye);

        input.type =
            input.type === "password"
                ? "text"
                : "password";

    };

});


/* CREATE ACCOUNT */

$("signupForm").onsubmit = function(event) {

    event.preventDefault();

    const username =
        $("signupUsername").value.trim();

    const password =
        $("signupPassword").value;

    const confirm =
        $("signupConfirm").value;


    if (!username || !password) {

        showToast("Please enter username and password");

        return;

    }


    if (password !== confirm) {

        showToast("Passwords do not match");

        return;

    }


    const users =
        JSON.parse(
            localStorage.getItem("quickNotesUsers") || "{}"
        );


    if (users[username]) {

        showToast("Username already exists");

        return;

    }


    users[username] = {
        password: password
    };


    localStorage.setItem(
        "quickNotesUsers",
        JSON.stringify(users)
    );


    currentUser = username;

    localStorage.setItem(
        "quickNotesCurrentUser",
        username
    );


    saveData("notes", []);

    saveData("folders", []);


    showToast("Account created successfully");


    showApplication();

};


/* LOGIN */

$("loginForm").onsubmit = function(event) {

    event.preventDefault();

    const username =
        $("loginUsername").value.trim();

    const password =
        $("loginPassword").value;


    const users =
        JSON.parse(
            localStorage.getItem("quickNotesUsers") || "{}"
        );


    if (
        !users[username] ||
        users[username].password !== password
    ) {

        showToast("Wrong username or password");

        return;

    }


    currentUser = username;

    localStorage.setItem(
        "quickNotesCurrentUser",
        username
    );


    showApplication();

};


/* LOGOUT */

$("logoutBtn").onclick = function() {

    currentUser = "";

    localStorage.removeItem(
        "quickNotesCurrentUser"
    );

    showLogin();

    showToast("Logged out");

};


/* =========================================
   PAGE NAVIGATION
========================================= */

function openSection(sectionName) {

    const sections = [
        "dashboard",
        "notes",
        "documents",
        "folders",
        "excel",
        "backup",
        "settings"
    ];


    sections.forEach(name => {

        const section =
            $(name + "Section");

        if (!section) return;

        section.classList.add("hidden");

    });


    const selected =
        $(sectionName + "Section");


    if (selected) {

        selected.classList.remove("hidden");

    }


    document.querySelectorAll(".nav-btn")
        .forEach(button => {

            button.classList.toggle(
                "active",
                button.dataset.section === sectionName
            );

        });


    if (sectionName === "dashboard") {

        renderDashboard();

    }

    if (sectionName === "notes") {

        renderNotes();

    }

    if (sectionName === "documents") {

        renderFiles();

    }

    if (sectionName === "folders") {

        renderFolders();

    }

    if (sectionName === "excel") {

        createExcelTable();

    }

}


/* SIDEBAR */

document.querySelectorAll(".nav-btn")
    .forEach(button => {

        button.onclick = function() {

            openSection(
                button.dataset.section
            );

        };

    });


/* DASHBOARD QUICK ACTIONS */

document.querySelectorAll("[data-go]")
    .forEach(button => {

        button.onclick = function() {

            openSection(
                button.dataset.go
            );

        };

    });


/* =========================================
   NOTES
========================================= */

function getNotes() {

    return getData("notes", []);

}


function renderNotes() {

    let notes =
        getNotes();


    const search =
        $("noteSearch").value.toLowerCase();


    const filter =
        $("noteFilter").value;


    notes =
        notes.filter(note => {

            return (
                note.title.toLowerCase().includes(search) ||
                note.content.toLowerCase().includes(search)
            );

        });


    if (filter === "pinned") {

        notes =
            notes.filter(note => note.pinned);

    }


    if (filter === "favorite") {

        notes =
            notes.filter(note => note.favorite);

    }


    notes.sort(
        (a, b) =>
            b.updated - a.updated
    );


    if (!notes.length) {

        $("notesList").innerHTML = `
            <div class="panel">
                No notes found.
            </div>
        `;

        return;

    }


    $("notesList").innerHTML =
        notes.map(note => `

            <div class="note-card">

                <h3>
                    ${note.pinned ? "📌 " : ""}
                    ${note.favorite ? "⭐ " : ""}
                    ${escapeHTML(note.title || "Untitled")}
                </h3>

                <p>
                    ${escapeHTML(note.content)}
                </p>

                <div class="meta">
                    ${new Date(note.updated).toLocaleString()}
                </div>

                <div class="card-buttons">

                    <button
                        onclick="editNote('${note.id}')"
                    >
                        Edit
                    </button>

                    <button
                        onclick="copyNoteText('${note.id}')"
                    >
                        Copy
                    </button>

                    <button
                        class="danger-outline"
                        onclick="deleteNote('${note.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `).join("");

}


window.editNote = function(id) {

    const notes =
        getNotes();

    const note =
        notes.find(
            item => item.id === id
        );


    if (!note) return;


    editingNoteId = id;

    notePinned = note.pinned;

    noteFavorite = note.favorite;


    $("noteTitle").value =
        note.title;

    $("noteContent").value =
        note.content;


    $("pinNoteBtn").textContent =
        notePinned
            ? "📌 Pinned"
            : "📌 Pin";


    $("favoriteNoteBtn").textContent =
        noteFavorite
            ? "⭐ Favorite On"
            : "⭐ Favorite";


    openSection("notes");

};


window.deleteNote = function(id) {

    if (!confirm("Delete this note?")) return;


    const notes =
        getNotes().filter(
            note => note.id !== id
        );


    saveData("notes", notes);

    renderNotes();

    refreshStats();

    showToast("Note deleted");

};


window.copyNoteText = async function(id) {

    const note =
        getNotes().find(
            n => n.id === id
        );


    if (!note) return;


    try {

        await navigator.clipboard.writeText(
            note.content
        );

        showToast("Note copied");

    } catch {

        showToast("Copy permission denied");

    }

};


/* NEW NOTE */

$("newNoteBtn").onclick = function() {

    editingNoteId = null;

    notePinned = false;

    noteFavorite = false;

    $("noteTitle").value = "";

    $("noteContent").value = "";

    $("pinNoteBtn").textContent = "📌 Pin";

    $("favoriteNoteBtn").textContent = "⭐ Favorite";

    openSection("notes");

};


/* PIN */

$("pinNoteBtn").onclick = function() {

    notePinned =
        !notePinned;

    $("pinNoteBtn").textContent =
        notePinned
            ? "📌 Pinned"
            : "📌 Pin";

};


/* FAVORITE */

$("favoriteNoteBtn").onclick = function() {

    noteFavorite =
        !noteFavorite;

    $("favoriteNoteBtn").textContent =
        noteFavorite
            ? "⭐ Favorite On"
            : "⭐ Favorite";

};


/* SAVE NOTE */

$("saveNoteBtn").onclick = function() {

    const title =
        $("noteTitle").value.trim();

    const content =
        $("noteContent").value;


    if (!title && !content) {

        showToast("Write something first");

        return;

    }


    let notes =
        getNotes();


    if (editingNoteId) {

        const note =
            notes.find(
                item =>
                    item.id === editingNoteId
            );


        if (note) {

            note.title = title;

            note.content = content;

            note.pinned = notePinned;

            note.favorite = noteFavorite;

            note.updated = Date.now();

        }

    } else {

        notes.push({

            id: makeId(),

            title: title,

            content: content,

            pinned: notePinned,

            favorite: noteFavorite,

            updated: Date.now()

        });

    }


    saveData("notes", notes);


    showToast("Note saved successfully");


    renderNotes();

    refreshStats();

};


/* CLEAR */

$("clearNoteBtn").onclick = function() {

    editingNoteId = null;

    $("noteTitle").value = "";

    $("noteContent").value = "";

};


/* COPY */

$("copyNoteBtn").onclick = async function() {

    try {

        await navigator.clipboard.writeText(
            $("noteContent").value
        );

        showToast("Copied");

    } catch {

        showToast("Copy permission denied");

    }

};


/* PASTE */

$("pasteNoteBtn").onclick = async function() {

    try {

        const text =
            await navigator.clipboard.readText();

        $("noteContent").value += text;

        showToast("Pasted");

    } catch {

        showToast("Paste permission denied");

    }

};


/* TXT */

$("saveTxtBtn").onclick = function() {

    const text =
        $("noteTitle").value +
        "\n\n" +
        $("noteContent").value;


    const blob =
        new Blob(
            [text],
            {
                type: "text/plain"
            }
        );


    downloadBlob(
        blob,
        ($("noteTitle").value || "note") +
        ".txt"
    );

};


/* PDF PRINT */

$("printNoteBtn").onclick = function() {

    const title =
        $("noteTitle").value;

    const content =
        $("noteContent").value;


    const printWindow =
        window.open(
            "",
            "_blank"
        );


    printWindow.document.write(`
        <html>

        <head>

            <title>${escapeHTML(title)}</title>

            <style>

                body {
                    font-family: Arial;
                    padding: 40px;
                }

                p {
                    white-space: pre-wrap;
                    line-height: 1.6;
                }

            </style>

        </head>

        <body>

            <h1>
                ${escapeHTML(title)}
            </h1>

            <p>
                ${escapeHTML(content)}
            </p>

        </body>

        </html>
    `);


    printWindow.document.close();

    printWindow.print();

};


$("noteSearch").oninput =
    renderNotes;

$("noteFilter").onchange =
    renderNotes;


/* =========================================
   FILE TYPES
========================================= */

function getFileType(file) {

    const name =
        file.name.toLowerCase();

    const type =
        file.type || "";


    if (
        type.includes("pdf") ||
        name.endsWith(".pdf")
    ) {

        return "pdf";

    }


    if (
        type.includes("sheet") ||
        name.endsWith(".xls") ||
        name.endsWith(".xlsx")
    ) {

        return "excel";

    }


    if (
        type.includes("word") ||
        name.endsWith(".doc") ||
        name.endsWith(".docx")
    ) {

        return "word";

    }


    if (
        type.startsWith("image/")
    ) {

        return "image";

    }


    return "text";

}


function fileIcon(type) {

    if (type === "pdf") return "📕";

    if (type === "excel") return "📊";

    if (type === "word") return "📘";

    if (type === "image") return "🖼️";

    return "📄";

}


/* =========================================
   FILE UPLOAD
========================================= */

async function uploadFiles(
    fileList,
    folderId = null
) {

    if (!fileList.length) return;


    for (const file of fileList) {

        const object = {

            id: makeId(),

            owner: currentUser,

            name: file.name,

            size: file.size,

            type: file.type,

            kind: getFileType(file),

            folderId: folderId,

            created: Date.now(),

            blob: file

        };


        await saveFileToDB(object);

    }


    showToast(
        fileList.length +
        " file(s) uploaded"
    );


    await refreshEverything();

}


/* UPLOAD BUTTON */

$("uploadBtn").onclick =
    () => $("fileInput").click();

$("chooseFiles").onclick =
    () => $("fileInput").click();

$("dashboardUpload").onclick =
    () => {

        openSection("documents");

        $("fileInput").click();

    };


$("fileInput").onchange =
    event => {

        uploadFiles(
            Array.from(
                event.target.files
            )
        );

    };


/* DRAG DROP */

$("dropZone").ondragover =
    event => {

        event.preventDefault();

    };


$("dropZone").ondrop =
    event => {

        event.preventDefault();

        uploadFiles(
            Array.from(
                event.dataTransfer.files
            )
        );

    };


/* =========================================
   RENDER FILES
========================================= */

async function renderFiles() {

    const allFiles =
        await getAllFiles();


    let files =
        allFiles.filter(
            file =>
                file.owner === currentUser
        );


    const search =
        $("fileSearch")
            .value
            .toLowerCase();


    const type =
        $("fileTypeFilter").value;


    const folder =
        $("fileFolderFilter").value;


    const folders =
        getData("folders", []);


    $("fileFolderFilter").innerHTML =
        `
            <option value="all">
                All Folders
            </option>
        ` +
        folders.map(
            f =>
                `<option value="${f.id}">
                    ${escapeHTML(f.name)}
                </option>`
        ).join("");


    $("fileFolderFilter").value =
        folder;


    files =
        files.filter(file => {

            const searchMatch =
                file.name
                    .toLowerCase()
                    .includes(search);


            const typeMatch =
                type === "all" ||
                file.kind === type;


            const folderMatch =
                folder === "all" ||
                file.folderId === folder;


            return (
                searchMatch &&
                typeMatch &&
                folderMatch
            );

        });


    if (!files.length) {

        $("fileList").innerHTML = `
            <div class="panel">
                No files found.
            </div>
        `;

        return;

    }


    $("fileList").innerHTML =
        files.map(
            createFileCard
        ).join("");

}


function createFileCard(file) {

    return `

        <div class="file-card">

            <div class="file-icon">
                ${fileIcon(file.kind)}
            </div>

            <div class="file-name">
                ${escapeHTML(file.name)}
            </div>

            <div class="meta">

                ${file.kind.toUpperCase()}

                <br>

                ${(file.size / 1024).toFixed(1)}
                KB

                <br>

                ${new Date(
                    file.created
                ).toLocaleString()}

            </div>

            <div class="file-actions">

                <button
                    class="primary-btn"
                    onclick="openFile('${file.id}')"
                >
                    Open
                </button>

                <button
                    onclick="downloadFile('${file.id}')"
                >
                    Download
                </button>

                <button
                    class="danger-outline"
                    onclick="deleteUploadedFile('${file.id}')"
                >
                    Delete
                </button>

            </div>

        </div>

    `;

}


/* =========================================
   OPEN FILE
========================================= */

window.openFile = async function(id) {

    const file =
        await getFile(id);


    if (!file) {

        showToast("File not found");

        return;

    }


    currentViewerFile =
        file;


    $("viewerTitle").textContent =
        file.name;


    const body =
        $("viewerBody");


    body.innerHTML = "";


    const url =
        URL.createObjectURL(
            file.blob
        );


    /* PDF */

    if (file.kind === "pdf") {

        body.innerHTML = `
            <iframe
                src="${url}"
            ></iframe>
        `;

    }


    /* IMAGE */

    else if (file.kind === "image") {

        body.innerHTML = `
            <img
                src="${url}"
                alt="${escapeHTML(file.name)}"
            >
        `;

    }


    /* EXCEL */

    else if (file.kind === "excel") {

        if (!window.XLSX) {

            body.innerHTML =
                "<p>Excel library not loaded.</p>";

        } else {

            const arrayBuffer =
                await file.blob.arrayBuffer();


            const workbook =
                XLSX.read(
                    arrayBuffer,
                    {
                        type: "array"
                    }
                );


            const sheet =
                workbook.Sheets[
                    workbook.SheetNames[0]
                ];


            body.innerHTML =
                XLSX.utils.sheet_to_html(
                    sheet
                );

        }

    }


    /* WORD */

    else if (file.kind === "word") {

        if (!window.mammoth) {

            body.innerHTML =
                "<p>Word viewer library not loaded.</p>";

        } else {

            const arrayBuffer =
                await file.blob.arrayBuffer();


            const result =
                await mammoth.convertToHtml({
                    arrayBuffer:
                        arrayBuffer
                });


            body.innerHTML =
                result.value;

        }

    }


    /* TEXT */

    else {

        body.innerHTML = `
            <pre style="
                white-space:pre-wrap;
                font-family:Arial;
            ">
${escapeHTML(await file.blob.text())}
            </pre>
        `;

    }


    $("viewerModal")
        .classList
        .remove("hidden");

};


/* DOWNLOAD */

window.downloadFile =
    async function(id) {

        const file =
            await getFile(id);


        if (!file) return;


        downloadBlob(
            file.blob,
            file.name
        );

    };


/* DELETE */

window.deleteUploadedFile =
    async function(id) {

        if (
            !confirm(
                "Delete this file?"
            )
        ) return;


        await deleteFileFromDB(id);


        showToast(
            "File deleted"
        );


        await refreshEverything();

    };


/* FILTERS */

$("fileSearch").oninput =
    renderFiles;

$("fileTypeFilter").onchange =
    renderFiles;

$("fileFolderFilter").onchange =
    renderFiles;


/* =========================================
   FOLDERS
========================================= */

function renderFolders() {

    const folders =
        getData("folders", []);


    if (!folders.length) {

        $("folderList").innerHTML = `
            <div class="panel">
                No folders created yet.
            </div>
        `;

        return;

    }


    $("folderList").innerHTML =
        folders.map(folder => `

            <div class="folder-card">

                <div class="folder-icon">
                    📁
                </div>

                <h3>
                    ${escapeHTML(folder.name)}
                </h3>

                <div class="folder-actions">

                    <button
                        class="primary-btn"
                        onclick="openFolder('${folder.id}')"
                    >
                        Open
                    </button>

                    <button
                        onclick="selectFolder('${folder.id}')"
                    >
                        Select
                    </button>

                    <button
                        class="danger-outline"
                        onclick="deleteFolder('${folder.id}')"
                    >
                        Delete
                    </button>

                </div>

            </div>

        `).join("");


    updateSelectedFolderText();

}


function updateSelectedFolderText() {

    const folders =
        getData("folders", []);


    const folder =
        folders.find(
            f =>
                f.id === selectedFolderId
        );


    $("selectedFolderText").textContent =
        folder
            ? "Selected: " + folder.name
            : "No folder selected";

}


/* CREATE FOLDER */

$("createFolderBtn").onclick =
    function() {

        const name =
            prompt(
                "Enter folder name:"
            );


        if (!name || !name.trim()) {

            return;

        }


        const folders =
            getData("folders", []);


        folders.push({

            id: makeId(),

            name: name.trim()

        });


        saveData(
            "folders",
            folders
        );


        renderFolders();

        renderFiles();

        showToast(
            "Folder created"
        );

    };


/* SELECT FOLDER */

window.selectFolder =
    function(id) {

        selectedFolderId =
            id;


        updateSelectedFolderText();

        showToast(
            "Folder selected"
        );

    };


/* OPEN FOLDER */

window.openFolder =
    async function(id) {

        selectedFolderId =
            id;


        const folders =
            getData("folders", []);


        const folder =
            folders.find(
                f => f.id === id
            );


        if (!folder) return;


        $("openedFolderName").textContent =
            "📁 " + folder.name;


        const allFiles =
            await getAllFiles();


        const files =
            allFiles.filter(
                file =>
                    file.owner === currentUser &&
                    file.folderId === id
            );


        if (!files.length) {

            $("openedFolderFiles").innerHTML = `
                <div class="panel">
                    This folder is empty.
                </div>
            `;

        } else {

            $("openedFolderFiles").innerHTML =
                files.map(
                    createFileCard
                ).join("");

        }


        $("openedFolder")
            .classList
            .remove("hidden");

    };


/* DELETE FOLDER */

window.deleteFolder =
    async function(id) {

        if (
            !confirm(
                "Delete this folder?"
            )
        ) return;


        const folders =
            getData("folders", [])
                .filter(
                    f =>
                        f.id !== id
                );


        saveData(
            "folders",
            folders
        );


        const files =
            await getAllFiles();


        for (const file of files) {

            if (
                file.folderId === id &&
                file.owner === currentUser
            ) {

                file.folderId = null;

                await saveFileToDB(file);

            }

        }


        selectedFolderId = null;


        $("openedFolder")
            .classList
            .add("hidden");


        await refreshEverything();

        showToast(
            "Folder deleted"
        );

    };


/* UPLOAD TO FOLDER */

$("uploadToFolderBtn").onclick =
    function() {

        if (!selectedFolderId) {

            showToast(
                "First select a folder"
            );

            return;

        }


        $("folderFileInput").click();

    };


$("folderFileInput").onchange =
    function(event) {

        uploadFiles(
            Array.from(
                event.target.files
            ),
            selectedFolderId
        );

    };


$("closeFolderBtn").onclick =
    function() {

        $("openedFolder")
            .classList
            .add("hidden");

    };


/* =========================================
   EXCEL CREATOR
========================================= */

let excelRows = 5;

let excelColumns = 5;


function createExcelTable() {

    let html =
        "<tr><th>#</th>";


    for (
        let column = 0;
        column < excelColumns;
        column++
    ) {

        html += `
            <th>
                Column ${column + 1}
            </th>
        `;

    }


    html += "</tr>";


    for (
        let row = 0;
        row < excelRows;
        row++
    ) {

        html += `
            <tr>

                <th>
                    ${row + 1}
                </th>
        `;


        for (
            let column = 0;
            column < excelColumns;
            column++
        ) {

            html += `

                <td>

                    <input
                        data-cell="${row}-${column}"
                        placeholder="Enter data"
                    >

                </td>

            `;

        }


        html += "</tr>";

    }


    $("excelTable").innerHTML =
        html;

}


/* ADD ROW */

$("addRowBtn").onclick =
    function() {

        excelRows++;

        createExcelTable();

    };


/* ADD COLUMN */

$("addColumnBtn").onclick =
    function() {

        excelColumns++;

        createExcelTable();

    };


/* CLEAR EXCEL */

$("clearExcelBtn").onclick =
    function() {

        excelRows = 5;

        excelColumns = 5;

        createExcelTable();

    };


/* SAVE EXCEL */

$("saveExcelBtn").onclick =
    async function() {

        if (!window.XLSX) {

            showToast(
                "Excel library not loaded"
            );

            return;

        }


        const data = [];


        for (
            let row = 0;
            row < excelRows;
            row++
        ) {

            const rowData = [];


            for (
                let column = 0;
                column < excelColumns;
                column++
            ) {

                const input =
                    document.querySelector(
                        `[data-cell="${row}-${column}"]`
                    );


                rowData.push(
                    input
                        ? input.value
                        : ""
                );

            }


            data.push(
                rowData
            );

        }


        const worksheet =
            XLSX.utils.aoa_to_sheet(
                data
            );


        const workbook =
            XLSX.utils.book_new();


        XLSX.utils.book_append_sheet(
            workbook,
            worksheet,
            $("excelSheetName").value ||
            "Sheet1"
        );


        const output =
            XLSX.write(
                workbook,
                {
                    bookType: "xlsx",
                    type: "array"
                }
            );


        let fileName =
            $("excelFileName").value ||
            "My-Excel-Sheet.xlsx";


        if (
            !fileName.endsWith(".xlsx")
        ) {

            fileName += ".xlsx";

        }


        const blob =
            new Blob(
                [output],
                {
                    type:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            );


        /* DOWNLOAD */

        downloadBlob(
            blob,
            fileName
        );


        /* SAVE INTO DOCUMENTS */

        await saveFileToDB({

            id: makeId(),

            owner: currentUser,

            name: fileName,

            size: blob.size,

            type: blob.type,

            kind: "excel",

            folderId: null,

            created: Date.now(),

            blob: blob

        });


        showToast(
            "Excel saved successfully"
        );


        await refreshEverything();

    };


$("createExcelFromDocuments").onclick =
    () => openSection("excel");


/* =========================================
   BACKUP
========================================= */

$("backupBtn").onclick =
    async function() {

        const backup = {

            username: currentUser,

            notes:
                getData("notes", []),

            folders:
                getData("folders", []),

            date:
                new Date().toISOString()

        };


        const blob =
            new Blob(
                [
                    JSON.stringify(
                        backup,
                        null,
                        2
                    )
                ],
                {
                    type:
                        "application/json"
                }
            );


        downloadBlob(
            blob,
            "quick-notes-backup.json"
        );


        showToast(
            "Backup downloaded"
        );

    };


/* RESTORE */

$("restoreBtn").onclick =
    async function() {

        const file =
            $("restoreInput").files[0];


        if (!file) {

            showToast(
                "Select backup file"
            );

            return;

        }


        try {

            const data =
                JSON.parse(
                    await file.text()
                );


            if (data.notes) {

                saveData(
                    "notes",
                    data.notes
                );

            }


            if (data.folders) {

                saveData(
                    "folders",
                    data.folders
                );

            }


            await refreshEverything();


            showToast(
                "Backup restored"
            );


        } catch {

            showToast(
                "Invalid backup file"
            );

        }

    };


/* =========================================
   PROFILE
========================================= */

function openProfile() {

    $("newUsername").value =
        currentUser;

    $("profileModal")
        .classList
        .remove("hidden");

}


$("profileBtn").onclick =
    openProfile;

$("settingsProfileBtn").onclick =
    openProfile;


/* CHANGE USERNAME */

$("changeUsernameBtn").onclick =
    function() {

        const newUsername =
            $("newUsername")
                .value
                .trim();


        if (!newUsername) {

            showToast(
                "Enter username"
            );

            return;

        }


        if (
            newUsername === currentUser
        ) {

            return;

        }


        const users =
            JSON.parse(
                localStorage.getItem(
                    "quickNotesUsers"
                ) || "{}"
            );


        if (users[newUsername]) {

            showToast(
                "Username already exists"
            );

            return;

        }


        users[newUsername] =
            users[currentUser];


        delete users[currentUser];


        localStorage.setItem(
            "quickNotesUsers",
            JSON.stringify(users)
        );


        /* Copy data */

        const oldUser =
            currentUser;


        const notes =
            getData("notes", []);


        const folders =
            getData("folders", []);


        currentUser =
            newUsername;


        saveData(
            "notes",
            notes
        );


        saveData(
            "folders",
            folders
        );


        localStorage.setItem(
            "quickNotesCurrentUser",
            currentUser
        );


        $("topUsername").textContent =
            currentUser;


        $("welcomeUsername").textContent =
            currentUser;


        $("profileModal")
            .classList
            .add("hidden");


        showToast(
            "Username changed"
        );

    };


/* CHANGE PASSWORD */

$("changePasswordBtn").onclick =
    function() {

        const password =
            $("newPassword").value;


        if (!password) {

            showToast(
                "Enter new password"
            );

            return;

        }


        const users =
            JSON.parse(
                localStorage.getItem(
                    "quickNotesUsers"
                ) || "{}"
            );


        users[currentUser].password =
            password;


        localStorage.setItem(
            "quickNotesUsers",
            JSON.stringify(users)
        );


        $("newPassword").value = "";


        showToast(
            "Password changed"
        );

    };


/* =========================================
   MODAL CLOSE
========================================= */

document
    .querySelectorAll("[data-close]")
    .forEach(button => {

        button.onclick =
            function() {

                const modal =
                    $(button.dataset.close);

                modal.classList.add(
                    "hidden"
                );

            };

    });


/* =========================================
   THEME
========================================= */

$("themeToggle").onclick =
    function() {

        document.body.classList.toggle(
            "dark"
        );

    };


document
    .querySelectorAll("[data-theme]")
    .forEach(button => {

        button.onclick =
            function() {

                document.body.classList.remove(
                    "dark",
                    "blue",
                    "green"
                );


                if (
                    button.dataset.theme !==
                    "light"
                ) {

                    document.body.classList.add(
                        button.dataset.theme
                    );

                }

            };

    });


/* =========================================
   BRIGHTNESS
========================================= */

$("brightnessRange").oninput =
    function() {

        const value =
            this.value;


        document.body.style.filter =
            `brightness(${value / 100})`;


        $("brightnessValue")
            .textContent =
            value + "%";

    };


/* =========================================
   DASHBOARD
========================================= */

async function renderDashboard() {

    const notes =
        getNotes();


    const allFiles =
        await getAllFiles();


    const files =
        allFiles.filter(
            file =>
                file.owner === currentUser
        );


    $("statNotes").textContent =
        notes.length;


    $("statFiles").textContent =
        files.length;


    $("statPDF").textContent =
        files.filter(
            f => f.kind === "pdf"
        ).length;


    $("statExcel").textContent =
        files.filter(
            f => f.kind === "excel"
        ).length;


    $("statWord").textContent =
        files.filter(
            f => f.kind === "word"
        ).length;


    $("statImages").textContent =
        files.filter(
            f => f.kind === "image"
        ).length;


    const recent =
        [...files]
            .sort(
                (a,b) =>
                    b.created - a.created
            )
            .slice(0,5);


    if (!recent.length) {

        $("recentFiles").innerHTML =
            "No files yet.";

    } else {

        $("recentFiles").innerHTML =
            recent.map(
                file =>
                    `<p>
                        ${fileIcon(file.kind)}
                        ${escapeHTML(file.name)}
                    </p>`
            ).join("");

    }

}


/* GLOBAL SEARCH */

$("globalSearch").oninput =
    async function() {

        const query =
            this.value
                .toLowerCase()
                .trim();


        if (!query) {

            $("globalResults").textContent =
                "Search notes and files here.";

            return;

        }


        const notes =
            getNotes().filter(
                note =>
                    (
                        note.title +
                        " " +
                        note.content
                    )
                    .toLowerCase()
                    .includes(query)
            );


        const allFiles =
            await getAllFiles();


        const files =
            allFiles.filter(
                file =>
                    file.owner === currentUser &&
                    file.name
                        .toLowerCase()
                        .includes(query)
            );


        let result = [];


        notes.forEach(note => {

            result.push(
                `📝 ${escapeHTML(note.title)}`
            );

        });


        files.forEach(file => {

            result.push(
                `${fileIcon(file.kind)}
                ${escapeHTML(file.name)}`
            );

        });


        $("globalResults").innerHTML =
            result.length
                ? result.join("<br>")
                : "No results found.";

    };


/* =========================================
   DOWNLOAD
========================================= */

function downloadBlob(
    blob,
    filename
) {

    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement("a");


    link.href = url;

    link.download =
        filename;


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    setTimeout(
        () =>
            URL.revokeObjectURL(
                url
            ),
        1000
    );

}


/* =========================================
   REFRESH
========================================= */

async function refreshStats() {

    await renderDashboard();

}


async function refreshEverything() {

    renderNotes();

    renderFolders();

    createExcelTable();

    await renderFiles();

    await renderDashboard();

}


/* =========================================
   CLOCK
========================================= */

function updateClock() {

    $("clock").textContent =
        new Date().toLocaleString();

}


setInterval(
    updateClock,
    1000
);


/* =========================================
   START APPLICATION
========================================= */

(async function() {

    try {

        await openDatabase();

    } catch (error) {

        console.error(
            error
        );

        alert(
            "Browser storage could not be opened."
        );

    }


    if (currentUser) {

        await showApplication();

    } else {

        showLogin();

    }


    updateClock();

})();
