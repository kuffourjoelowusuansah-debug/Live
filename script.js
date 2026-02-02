import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getFirestore, collection, addDoc, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js";

// PASTE YOUR CONFIG HERE
const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_ID",
  appId: "YOUR_APP_ID"
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
        const sRef = ref(storage, Date.now() + file.name);
        await uploadBytes(sRef, file);
        url = await getDownloadURL(sRef);
        type = file.type.split('/')[0];
    }

    if(msgInp.value || url) {
        await addDoc(collection(db, "msgs"), {
            text: msgInp.value,
            file: url,
            type: type,
            time: serverTimestamp()
        });
        msgInp.value = "";
        fileInp.value = "";
    }
};

onSnapshot(query(collection(db, "msgs"), orderBy("time")), (snap) => {
    chatBox.innerHTML = "";
    snap.forEach(doc => {
        const d = doc.data();
        const div = document.createElement('div');
        div.className = "msg-box";
        if(d.text) div.innerHTML += `<p>${d.text}</p>`;
        if(d.file && d.type === 'image') div.innerHTML += `<img src="${d.file}">`;
        if(d.file && d.type === 'video') div.innerHTML += `<video src="${d.file}" controls></video>`;
        chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
});
