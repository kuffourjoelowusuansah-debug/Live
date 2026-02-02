import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// USE YOUR CONFIG FROM THE PREVIOUS STEPS HERE
const firebaseConfig = { ... }; 

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Google Login
document.getElementById('google-login').onclick = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Create Profile in Database if it doesn't exist
    await setDoc(doc(db, "users", user.uid), {
        username: user.displayName,
        nickname: user.displayName,
        likes: 0,
        followers: 0,
        views: 0,
        comments: 0
    }, { merge: true });

    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app').classList.remove('hidden');
    showTab('feed');
};

// Tab Switching Logic
window.showTab = async (tabName) => {
    const area = document.getElementById('content-area');
    if(tabName === 'profile') {
        const userSnap = await getDoc(doc(db, "users", auth.currentUser.uid));
        const data = userSnap.data();
        area.innerHTML = `
            <div class="profile">
                <h2>@${data.username}</h2>
                <div class="stats-grid">
                    <div><span class="stat-num">${data.likes}</span><span class="stat-label">Likes</span></div>
                    <div><span class="stat-num">${data.followers}</span><span class="stat-label">Followers</span></div>
                    <div><span class="stat-num">${data.views}</span><span class="stat-label">Views</span></div>
                    <div><span class="stat-num">${data.comments}</span><span class="stat-label">Comments</span></div>
                </div>
            </div>`;
    } 
    // Add logic for 'feed' and 'chat' tabs similarly...
}
