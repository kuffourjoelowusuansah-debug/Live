import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAYUBkVTNELQLKETcodaJDhNaUirAyaosQ",
    authDomain: "livee-3bb22.firebaseapp.com",
    projectId: "livee-3bb22",
    storageBucket: "livee-3bb22.firebasestorage.app",
    messagingSenderId: "970845322855",
    appId: "1:970845322855:web:e17a3560aa2ee1b2285ec2",
    measurementId: "G-26TLCWNMRY"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

const sendBtn = document.getElementById('send');
const msgInp = document.getElementById('msg');
const fileInp = document.getElementById('file');
const chatBox = document.getElementById('chat');

sendBtn.onclick = async () => {
    const file = fileInp.files[0];
    let url = null;
    let type = null;

    if(file) {
        const sRef = ref(storage, 'uploads/' + Date.now() + "_" + file.name);
        const snap = await uploadBytes(sRef, file);
        url = await getDownloadURL(snap.ref);
        type = file.type.split('/')[0]; // 'image' or 'video'
    }

    if(msgInp.value.trim() || url) {
        await addDoc(collection(db, "messages"), {
            text: msgInp.value,
            file: url,
            type: type,
            time: serverTimestamp()
        });
        msgInp.value = "";
        fileInp.value = "";
    }
};

onSnapshot(query(collection(db, "messages"), orderBy("time")), (snap) => {
    chatBox.innerHTML = "";
    snap.forEach(doc => {
        const d = doc.data();
        const div = document.createElement('div');
        div.className = "msg-box";
        if(d.text) div.innerHTML += `<p style="margin:0">${d.text}</p>`;
        if(d.file && d.type === 'image') div.innerHTML += `<img src="${d.file}">`;
        if(d.file && d.type === 'video') div.innerHTML += `<video src="${d.file}" controls></video>`;
        chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
});
