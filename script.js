import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, query, orderBy, onSnapshot, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// 1. YOUR FIREBASE CONFIG
const firebaseConfig = {
    apiKey: "AIzaSyAYUBkVTNELQLKETcodaJDhNaUirAyaosQ",
    authDomain: "livee-3bb22.firebaseapp.com",
    projectId: "livee-3bb22",
    storageBucket: "livee-3bb22.firebasestorage.app",
    messagingSenderId: "970845322855",
    appId: "1:970845322855:web:e17a3560aa2ee1b2285ec2",
    measurementId: "G-26TLCWNMRY"
};

// 2. INITIALIZE SERVICES
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const authScreen = document.getElementById('auth-screen');
const mainApp = document.getElementById('main-app');
const contentArea = document.getElementById('content-area');

// 3. LOGIN LOGIC (Optimized for Mobile)
document.getElementById('google-login').onclick = () => {
    signInWithRedirect(auth, provider);
};

// Check if user just returned from Google Login
getRedirectResult(auth).catch((error) => {
    alert("Login Error: " + error.message);
});

// 4. AUTH STATE OBSERVER (Automatic Login)
onAuthStateChanged(auth, async (user) => {
    if (user) {
        authScreen.classList.add('hidden');
        mainApp.classList.remove('hidden');
        
        // Ensure user exists in Database
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        
        if (!userSnap.exists()) {
            await setDoc(userRef, {
                username: user.displayName,
                nickname: user.displayName.split(' ')[0],
                likes: 0,
                followers: 0,
                views: 0,
                comments: 0
            });
        }
        showTab('feed'); // Start at Feed
    } else {
        authScreen.classList.remove('hidden');
        mainApp.classList.add('hidden');
    }
});

// 5. NAVIGATION / TABS
window.showTab = async (tabName) => {
    contentArea.innerHTML = "<p style='padding:20px'>Loading...</p>";
    
    if (tabName === 'profile') {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const data = userSnap.data();
        contentArea.innerHTML = `
            <div style="padding:20px; text-align:center;">
                <h2 style="margin-bottom:5px;">${data.username}</h2>
                <p style="color:#aaa; margin-bottom:20px;">@${data.nickname}</p>
                <div style="display:flex; justify-content:space-around; background:#222; padding:20px; border-radius:15px;">
                    <div><b style="font-size:20px;">${data.likes}</b><br><small>Likes</small></div>
                    <div><b style="font-size:20px;">${data.followers}</b><br><small>Followers</small></div>
                    <div><b style="font-size:20px;">${data.views}</b><br><small>Views</small></div>
                </div>
                <button id="logout-btn" style="margin-top:40px; background:#ff4444; color:white; border:none; padding:10px 30px; border-radius:20px;">Logout</button>
            </div>`;
        document.getElementById('logout-btn').onclick = () => signOut(auth);

    } else if (tabName === 'feed') {
        contentArea.innerHTML = `
            <div style="padding:20px;">
                <h3>📺 Video Feed</h3>
                <p style="color:#888;">Videos from people you follow will appear here.</p>
                <div style="background:#333; height:300px; border-radius:10px; display:flex; align-items:center; justify-content:center; margin-top:10px;">
                    No videos yet. Be the first to post!
                </div>
            </div>`;
            
    } else if (tabName === 'chat') {
        contentArea.innerHTML = `
            <div style="padding:20px;">
                <h3>💬 Messages</h3>
                <p style="color:#888;">Tap a friend to start chatting.</p>
            </div>`;
    }
};
