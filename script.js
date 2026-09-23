/* =====================================================
   QUICK NOTES
   ===================================================== */


/* ================= ELEMENTS ================= */

const authPage =
    document.getElementById("authPage");

const appPage =
    document.getElementById("appPage");


const loginTab =
    document.getElementById("loginTab");

const registerTab =
    document.getElementById("registerTab");


const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");


const loginUsername =
    document.getElementById("loginUsername");

const loginPassword =
    document.getElementById("loginPassword");


const registerUsername =
    document.getElementById("registerUsername");

const registerPassword =
    document.getElementById("registerPassword");

const confirmPassword =
    document.getElementById("confirmPassword");


const welcomeUser =
    document.getElementById("welcomeUser");

const logoutBtn =
    document.getElementById("logoutBtn");

const themeBtn =
    document.getElementById("themeBtn");


const noteTitle =
    document.getElementById("noteTitle");

const noteText =
    document.getElementById("noteText");

const saveNoteBtn =
    document.getElementById("saveNoteBtn");

const clearBtn =
    document.getElementById("clearBtn");

const copyBtn =
    document.getElementById("copyBtn");

const textBtn =
    document.getElementById("textBtn");

const pdfNoteBtn =
    document.getElementById("pdfNoteBtn");

const newNoteBtn =
    document.getElementById("newNoteBtn");

const notesContainer =
    document.getElementById("notesContainer");


const pdfInput =
    document.getElementById("pdfInput");

const pdfContainer =
    document.getElementById("pdfContainer");

const pdfViewer =
    document.getElementById("pdfViewer");

const pdfFrame =
    document.getElementById("pdfFrame");

const pdfName =
    document.getElementById("pdfName");

const closePdf =
    document.getElementById("closePdf");


const message =
    document.getElementById("message");


const dateElement =
    document.getElementById("date");

const timeElement =
    document.getElementById("time");


/* ================= VARIABLES ================= */

let currentUser = "";

let editingNote = null;

let database = null;

let currentPDFUrl = null;


/* ================= MESSAGE ================= */

function showMessage(text) {

    message.textContent = text;

    message.style.display = "block";


    setTimeout(() => {

        message.style.display = "none";

    }, 2500);

}


/* ================= USER ACCOUNT ================= */

function getUsers() {

    return JSON.parse(
        localStorage.getItem(
            "quickNotesUsers"
        ) || "{}"
    );

}


function saveUsers(users) {

    localStorage.setItem(
        "quickNotesUsers",
        JSON.stringify(users)
    );

}


/* =====================================================
   LOGIN / CREATE ACCOUNT TABS
   ===================================================== */

loginTab.addEventListener(
    "click",
    () => {

        loginTab.classList.add("active");

        registerTab.classList.remove(
            "active"
        );


        loginForm.classList.remove(
            "hidden"
        );

        registerForm.classList.add(
            "hidden"
        );


        /*
         IMPORTANT:
         Login tab open karte hi fields blank.
        */

        loginForm.reset();

        loginUsername.value = "";

        loginPassword.value = "";

    }
);


registerTab.addEventListener(
    "click",
    () => {

        registerTab.classList.add(
            "active"
        );

        loginTab.classList.remove(
            "active"
        );


        registerForm.classList.remove(
            "hidden"
        );

        loginForm.classList.add(
            "hidden"
        );

    }
);


/* =====================================================
   CREATE ACCOUNT
   ===================================================== */

registerForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const username =
            registerUsername.value.trim();

        const password =
            registerPassword.value;

        const confirm =
            confirmPassword.value;


        if (username.length < 3) {

            showMessage(
                "Username must have at least 3 characters."
            );

            return;

        }


        if (password.length < 4) {

            showMessage(
                "Password must have at least 4 characters."
            );

            return;

        }


        if (password !== confirm) {

            showMessage(
                "Passwords do not match."
            );

            return;

        }


        const users =
            getUsers();


        if (users[username]) {

            showMessage(
                "Username already exists."
            );

            return;

        }


        users[username] = {

            password: password,

            createdAt:
                new Date().toISOString()

        };


        saveUsers(users);


        /*
         IMPORTANT:
         Account create hone ke baad
         username/password login mein
         automatically nahi aayenge.
        */

        registerForm.reset();

        loginForm.reset();


        loginTab.click();


        showMessage(
            "Account created. Please login."
        );

    }
);


/* =====================================================
   LOGIN
   ===================================================== */

loginForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        const username =
            loginUsername.value.trim();

        const password =
            loginPassword.value;


        const users =
            getUsers();


        if (
            !users[username] ||
            users[username].password !== password
        ) {

            showMessage(
                "Incorrect username or password."
            );

            return;

        }


        currentUser =
            username;


        /*
         Current login session only.
        */

        sessionStorage.setItem(
            "quickNotesUser",
            currentUser
        );


        /*
         Login successful hone ke
         baad fields clear.
        */

        loginForm.reset();

        loginUsername.value = "";

        loginPassword.value = "";


        openApplication();

    }
);


/* =====================================================
   OPEN APPLICATION
   ===================================================== */

function openApplication() {

    authPage.classList.add(
        "hidden"
    );

    appPage.classList.remove(
        "hidden"
    );


    welcomeUser.textContent =
        "Welcome, " + currentUser;


    loadNotes();

    loadPDFs();

}


/* =====================================================
   LOGOUT
   ===================================================== */

logoutBtn.addEventListener(
    "click",
    () => {

        /*
         Remove current login session.
        */

        sessionStorage.removeItem(
            "quickNotesUser"
        );


        /*
         Remove old remembered username
         if it exists from previous version.
        */

        localStorage.removeItem(
            "rememberedUsername"
        );


        /*
         Clear current user.
        */

        currentUser = "";


        editingNote = null;


        /*
         VERY IMPORTANT:
         Username and password BLANK.
        */

        loginForm.reset();

        registerForm.reset();


        loginUsername.value = "";

        loginPassword.value = "";

        registerUsername.value = "";

        registerPassword.value = "";

        confirmPassword.value = "";


        /*
         Clear editor.
        */

        clearEditor();


        /*
         Close PDF.
        */

        closePDFViewer();


        /*
         Show login page.
        */

        appPage.classList.add(
            "hidden"
        );

        authPage.classList.remove(
            "hidden"
        );


        /*
         Open Login tab.
        */

        loginTab.classList.add(
            "active"
        );

        registerTab.classList.remove(
            "active"
        );


        loginForm.classList.remove(
            "hidden"
        );

        registerForm.classList.add(
            "hidden"
        );


        /*
         Final safety:
         login fields blank.
        */

        loginUsername.value = "";

        loginPassword.value = "";


        showMessage(
            "Logged out successfully."
        );

    }
);


/* =====================================================
   NOTES
   ===================================================== */

function notesKey() {

    return "notes_" + currentUser;

}


function getNotes() {

    return JSON.parse(
        localStorage.getItem(
            notesKey()
        ) || "[]"
    );

}


function saveNotes(notes) {

    localStorage.setItem(
        notesKey(),
        JSON.stringify(notes)
    );

}


/* ================= SAVE NOTE ================= */

saveNoteBtn.addEventListener(
    "click",
    () => {

        const title =
            noteTitle.value.trim();

        const text =
            noteText.value.trim();


        if (!title && !text) {

            showMessage(
                "Please write something first."
            );

            return;

        }


        const notes =
            getNotes();


        if (editingNote !== null) {

            const note =
                notes.find(
                    n =>
                        n.id === editingNote
                );


            if (note) {

                note.title =
                    title ||
                    "Untitled Note";

                note.text =
                    text;

                note.updatedAt =
                    new Date()
                        .toISOString();

            }


            showMessage(
                "Note updated."
            );

        } else {

            notes.unshift({

                id:
                    Date.now(),

                title:
                    title ||
                    "Untitled Note",

                text:
                    text,

                createdAt:
                    new Date()
                        .toISOString(),

                updatedAt:
                    new Date()
                        .toISOString()

            });


            showMessage(
                "Note saved successfully."
            );

        }


        saveNotes(notes);

        loadNotes();

        clearEditor();

    }
);


/* ================= LOAD NOTES ================= */

function loadNotes() {

    const notes =
        getNotes();


    notesContainer.innerHTML = "";


    if (notes.length === 0) {

        notesContainer.innerHTML = `

            <div class="note-card">

                <h3>
                    No Notes Yet
                </h3>

                <p>
                    Create your first Quick Note.
                </p>

            </div>

        `;

        return;

    }


    notes.forEach(
        (note) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "note-card";


            card.innerHTML = `

                <h3></h3>

                <div
                    class="note-content">
                </div>

                <div
                    class="note-date">

                    Last saved:
                    ${new Date(
                        note.updatedAt
                    ).toLocaleString()}

                </div>


                <div
                    class="note-actions">

                    <button
                        class="normal-btn edit"
                        type="button">
                        Edit
                    </button>


                    <button
                        class="normal-btn copy"
                        type="button">
                        Copy
                    </button>


                    <button
                        class="normal-btn text"
                        type="button">
                        Text
                    </button>


                    <button
                        class="normal-btn pdf"
                        type="button">
                        PDF
                    </button>


                    <button
                        class="logout-btn delete"
                        type="button">
                        Delete
                    </button>

                </div>

            `;


            card.querySelector(
                "h3"
            ).textContent =
                note.title;


            card.querySelector(
                ".note-content"
            ).textContent =
                note.text;


            /* EDIT */

            card.querySelector(
                ".edit"
            ).addEventListener(
                "click",
                () => {

                    editingNote =
                        note.id;


                    noteTitle.value =
                        note.title;


                    noteText.value =
                        note.text;


                    saveNoteBtn.textContent =
                        "💾 Update Note";


                    noteTitle.focus();

                }
            );


            /* COPY */

            card.querySelector(
                ".copy"
            ).addEventListener(
                "click",
                () => {

                    copyText(
                        note.title +
                        "\n\n" +
                        note.text
                    );

                }
            );


            /* TEXT */

            card.querySelector(
                ".text"
            ).addEventListener(
                "click",
                () => {

                    downloadText(
                        note.title,
                        note.text
                    );

                }
            );


            /* PDF */

            card.querySelector(
                ".pdf"
            ).addEventListener(
                "click",
                () => {

                    noteTitle.value =
                        note.title;

                    noteText.value =
                        note.text;

                    window.print();

                }
            );


            /* DELETE */

            card.querySelector(
                ".delete"
            ).addEventListener(
                "click",
                () => {

                    if (
                        !confirm(
                            "Delete this note?"
                        )
                    ) {

                        return;

                    }


                    const newNotes =
                        getNotes()
                            .filter(
                                n =>
                                    n.id !==
                                    note.id
                            );


                    saveNotes(
                        newNotes
                    );


                    loadNotes();


                    showMessage(
                        "Note deleted."
                    );

                }
            );


            notesContainer.appendChild(
                card
            );

        }
    );

}


/* ================= CLEAR NOTE ================= */

function clearEditor() {

    noteTitle.value = "";

    noteText.value = "";

    editingNote = null;


    saveNoteBtn.textContent =
        "💾 Save Note";

}


clearBtn.addEventListener(
    "click",
    clearEditor
);


newNoteBtn.addEventListener(
    "click",
    clearEditor
);


/* ================= COPY ================= */

copyBtn.addEventListener(
    "click",
    () => {

        if (
            !noteTitle.value &&
            !noteText.value
        ) {

            showMessage(
                "Nothing to copy."
            );

            return;

        }


        copyText(
            noteTitle.value +
            "\n\n" +
            noteText.value
        );

    }
);


function copyText(text) {

    navigator.clipboard
        .writeText(text)
        .then(
            () => {

                showMessage(
                    "Copied successfully."
                );

            }
        )
        .catch(
            () => {

                showMessage(
                    "Copy failed."
                );

            }
        );

}


/* ================= SAVE TEXT ================= */

textBtn.addEventListener(
    "click",
    () => {

        if (
            !noteTitle.value &&
            !noteText.value
        ) {

            showMessage(
                "Nothing to save."
            );

            return;

        }


        downloadText(
            noteTitle.value ||
            "Quick Note",

            noteText.value
        );

    }
);


function downloadText(
    title,
    text
) {

    const blob =
        new Blob(
            [text],
            {
                type:
                    "text/plain"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href = url;

    link.download =
        title + ".txt";


    link.click();


    URL.revokeObjectURL(
        url
    );


    showMessage(
        "Text file downloaded."
    );

}


/* ================= SAVE PDF ================= */

pdfNoteBtn.addEventListener(
    "click",
    () => {

        if (
            !noteTitle.value &&
            !noteText.value
        ) {

            showMessage(
                "Nothing to save."
            );

            return;

        }


        window.print();

    }
);


/* =====================================================
   DARK / LIGHT THEME
   ===================================================== */

themeBtn.addEventListener(
    "click",
    () => {

        document.body.classList.toggle(
            "dark"
        );


        const dark =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "theme",
            dark ?
                "dark" :
                "light"
        );


        themeBtn.textContent =
            dark ?
                "☀️" :
                "🌙";

    }
);


if (
    localStorage.getItem(
        "theme"
    ) === "dark"
) {

    document.body.classList.add(
        "dark"
    );

    themeBtn.textContent =
        "☀️";

}


/* =====================================================
   PAGE NAVIGATION
   ===================================================== */

document
    .querySelectorAll(
        ".menu-btn"
    )
    .forEach(
        (button) => {

            button.addEventListener(
                "click",
                () => {

                    const page =
                        button.dataset.page;


                    document
                        .querySelectorAll(
                            ".page"
                        )
                        .forEach(
                            (p) => {

                                p.classList.add(
                                    "hidden"
                                );

                            }
                        );


                    document
                        .getElementById(
                            page
                        )
                        .classList.remove(
                            "hidden"
                        );


                    document
                        .querySelectorAll(
                            ".menu-btn"
                        )
                        .forEach(
                            (b) => {

                                b.classList.remove(
                                    "active"
                                );

                            }
                        );


                    button.classList.add(
                        "active"
                    );

                }
            );

        }
    );


/* =====================================================
   PDF DATABASE
   ===================================================== */

function openDatabase() {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const request =
                indexedDB.open(
                    "QuickNotesDatabase",
                    1
                );


            request.onupgradeneeded =
                (event) => {

                    const db =
                        event.target.result;


                    if (
                        !db.objectStoreNames
                            .contains(
                                "pdfs"
                            )
                    ) {

                        db.createObjectStore(
                            "pdfs",
                            {
                                keyPath:
                                    "id",
                                autoIncrement:
                                    true
                            }
                        );

                    }

                };


            request.onsuccess =
                () => {

                    database =
                        request.result;

                    resolve(
                        database
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* ADD PDF */

function addPDF(file) {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    "pdfs",
                    "readwrite"
                );


            const store =
                transaction
                    .objectStore(
                        "pdfs"
                    );


            const request =
                store.add({

                    username:
                        currentUser,

                    name:
                        file.name,

                    size:
                        file.size,

                    date:
                        new Date()
                            .toISOString(),

                    blob:
                        file

                });


            request.onsuccess =
                () =>
                    resolve();


            request.onerror =
                () =>
                    reject(
                        request.error
                    );

        }
    );

}


/* GET PDFS */

function getPDFs() {

    return new Promise(
        (
            resolve,
            reject
        ) => {

            const transaction =
                database.transaction(
                    "pdfs",
                    "readonly"
                );


            const store =
                transaction
                    .objectStore(
                        "pdfs"
                    );


            const request =
                store.getAll();


            request.onsuccess =
                () => {

                    const files =
                        request.result
                            .filter(
                                file =>
                                    file.username
                                    ===
                                    currentUser
                            );


                    resolve(
                        files
                    );

                };


            request.onerror =
                () => {

                    reject(
                        request.error
                    );

                };

        }
    );

}


/* UPLOAD PDF */

pdfInput.addEventListener(
    "change",
    async () => {

        const file =
            pdfInput.files[0];


        if (!file) {

            return;

        }


        if (
            file.type !==
            "application/pdf"
        ) {

            showMessage(
                "Please select a PDF file."
            );

            pdfInput.value = "";

            return;

        }


        try {

            await addPDF(
                file
            );


            await loadPDFs();


            showMessage(
                "PDF uploaded successfully."
            );

        }
        catch (error) {

            console.error(
                error
            );


            showMessage(
                "PDF upload failed."
            );

        }


        pdfInput.value = "";

    }
);


/* LOAD PDFS */

async function loadPDFs() {

    if (
        !database ||
        !currentUser
    ) {

        return;

    }


    const files =
        await getPDFs();


    pdfContainer.innerHTML =
        "";


    if (
        files.length === 0
    ) {

        pdfContainer.innerHTML = `

            <div class="pdf-card">

                No PDF files uploaded yet.

            </div>

        `;

        return;

    }


    files.forEach(
        (file) => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "pdf-card";


            const info =
                document.createElement(
                    "div"
                );


            info.innerHTML = `

                <strong>
                    📄 ${file.name}
                </strong>

                <br>

                <small>

                    ${new Date(
                        file.date
                    ).toLocaleString()}

                </small>

            `;


            const actions =
                document.createElement(
                    "div"
                );


            actions.className =
                "pdf-actions";


            /* OPEN */

            const open =
                document.createElement(
                    "button"
                );


            open.className =
                "main-btn";

            open.type =
                "button";

            open.textContent =
                "Open";


            open.onclick =
                () => {

                    openPDF(
                        file
                    );

                };


            /* DOWNLOAD */

            const download =
                document.createElement(
                    "button"
                );


            download.className =
                "normal-btn";

            download.type =
                "button";

            download.textContent =
                "Download";


            download.onclick =
                () => {

                    downloadPDF(
                        file
                    );

                };


            /* DELETE */

            const remove =
                document.createElement(
                    "button"
                );


            remove.className =
                "logout-btn";

            remove.type =
                "button";

            remove.textContent =
                "Delete";


            remove.onclick =
                () => {

                    if (
                        !confirm(
                            "Delete this PDF?"
                        )
                    ) {

                        return;

                    }


                    const transaction =
                        database.transaction(
                            "pdfs",
                            "readwrite"
                        );


                    transaction
                        .objectStore(
                            "pdfs"
                        )
                        .delete(
                            file.id
                        );


                    transaction.oncomplete =
                        () => {

                            loadPDFs();

                            closePDFViewer();


                            showMessage(
                                "PDF deleted."
                            );

                        };

                };


            actions.append(
                open,
                download,
                remove
            );


            card.append(
                info,
                actions
            );


            pdfContainer.appendChild(
                card
            );

        }
    );

}


/* OPEN PDF */

function openPDF(file) {

    closePDFViewer();


    currentPDFUrl =
        URL.createObjectURL(
            file.blob
        );


    pdfFrame.src =
        currentPDFUrl;


    pdfName.textContent =
        file.name;


    pdfViewer.classList.remove(
        "hidden"
    );


    pdfViewer.scrollIntoView({
        behavior:
            "smooth"
    });

}


/* CLOSE PDF */

function closePDFViewer() {

    pdfViewer.classList.add(
        "hidden"
    );


    pdfFrame.src =
        "about:blank";


    if (
        currentPDFUrl
    ) {

        URL.revokeObjectURL(
            currentPDFUrl
        );


        currentPDFUrl =
            null;

    }

}


closePdf.addEventListener(
    "click",
    closePDFViewer
);


/* DOWNLOAD PDF */

function downloadPDF(file) {

    const url =
        URL.createObjectURL(
            file.blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        file.name;


    link.click();


    setTimeout(
        () => {

            URL.revokeObjectURL(
                url
            );

        },
        1000
    );


    showMessage(
        "PDF downloaded."
    );

}


/* =====================================================
   DATE AND TIME
   ===================================================== */

function updateClock() {

    const now =
        new Date();


    dateElement.textContent =
        now.toLocaleDateString(
            undefined,
            {
                weekday:
                    "short",

                year:
                    "numeric",

                month:
                    "short",

                day:
                    "numeric"
            }
        );


    timeElement.textContent =
        now.toLocaleTimeString();

}


setInterval(
    updateClock,
    1000
);


updateClock();


/* =====================================================
   START APPLICATION
   ===================================================== */

openDatabase()
    .then(
        () => {

            /*
             If browser still has an active session,
             app can open.

             After LOGOUT sessionStorage is removed,
             therefore Login page appears blank.
            */

            const savedUser =
                sessionStorage.getItem(
                    "quickNotesUser"
                );


            if (savedUser) {

                currentUser =
                    savedUser;


                openApplication();

            }
            else {

                authPage.classList.remove(
                    "hidden"
                );


                appPage.classList.add(
                    "hidden"
                );


                /*
                 IMPORTANT:
                 Login screen completely blank.
                */

                loginForm.reset();

                loginUsername.value =
                    "";

                loginPassword.value =
                    "";

            }

        }
    )
    .catch(
        (error) => {

            console.error(
                "Database error:",
                error
            );

        }
    );