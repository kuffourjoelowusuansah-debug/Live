// Error logger for mobile debugging
window.onerror = function(m) { alert("Livee Error: " + m); };

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

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
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 1. Handle the Google Login Button
const loginBtn = document.getElementById('google-login');
if (loginBtn) {
    loginBtn.onclick = () => {
        signInWithRedirect(auth, provider);
    };
}

// 2. Watch for the User logging in
onAuthStateChanged(auth, async (user) => {
    const authScreen = document.getElementById('auth-screen');
    const mainApp = document.getElementById('main-app');
    
    if (user) {
        authScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        
        // Save/Update user profile
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, {
            username: user.displayName,
            nickname: user.displayName.split(' ')[0],
            likes: 0,
            followers: 0,
            views: 0
        }, { merge: true });
        
        showTab('profile'); 
    } else {
        authScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
});

// 3. Tab Navigation
window.showTab = async (tab) => {
    const area = document.getElementById('content-area');
    if (!auth.currentUser) return;

    if (tab === 'profile') {
        const snap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const d = snap.data();
        area.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <h2>${d.username}</h2>
                <p>@${d.nickname}</p>
                <div style="display:flex; justify-content:space-around; background:#222; padding:15px; border-radius:10px;">
                    <div><b>${d.likes}</b><br>Likes</div>
                    <div><b>${d.followers}</b><br>Followers</div>
                    <div><b>${d.views}</b><br>Views</div>
                </div>
                <button onclick="window.logout()" style="margin-top:30px; background:red; color:white; border:none; padding:10px 20px; border-radius:20px;">Logout</button>
            </div>`;
    } else {
        area.innerHTML = `<h2 style="padding:20px;">${tab.toUpperCase()} Coming Soon</h2>`;
    }
};

window.logout = () => signOut(auth);
