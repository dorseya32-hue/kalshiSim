export default {
  async fetch(request, env, ctx) {
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Play Market - Real-Time Prediction Platform</title>

  <!-- Tailwind CSS & Professional Typeface -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1.9.4/dist/confetti.browser.min.js"></script>

  <!-- Official Firebase Compat SDKs (Fixed from broken gstatic.com placeholders) -->
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-auth-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/10.8.0/firebase-database-compat.js"></script>

  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: #020617;
      color: #f8fafc;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
    }
    .font-mono { font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

  <!-- Top Navigation Bar -->
  <header class="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-sky-500 flex items-center justify-center font-extrabold text-slate-950 text-lg shadow-md shadow-emerald-500/10">
          ▲
        </div>
        <div>
          <span class="text-base font-extrabold text-white tracking-tight">Play Market</span>
          <span class="text-[10px] text-emerald-400 font-mono block -mt-1">Connected: playmarketdata-575e2</span>
        </div>
      </div>

      <!-- Account / Actions Header Zone -->
      <div class="flex items-center gap-3 text-xs">
        <div id="account-pill" class="hidden items-center gap-2.5 px-3 py-1.5 bg-slate-800/90 rounded-xl border border-slate-700">
          <span id="welcome" class="text-slate-200 font-semibold truncate max-w-[140px]"></span>
          <span class="text-slate-600">·</span>
          <span id="balance" class="font-mono font-bold text-emerald-400 tabular-nums"></span>
          <button id="logout-btn" class="ml-1 text-slate-400 hover:text-rose-400 transition" title="Log out">✕</button>
        </div>

        <button id="btn-admin-toggle" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg border border-slate-700 transition">
          Admin (123457)
        </button>

        <button id="btn-auth-toggle" class="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition shadow-sm">
          Log In / Sign Up
        </button>
      </div>
    </div>
  </header>

  <!-- Main Viewport -->
  <main class="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">

    <!-- Hero Overview Banner -->
    <section class="p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div class="max-w-2xl space-y-2">
        <div class="flex items-center gap-2 text-xs font-semibold text-emerald-400">
          <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>LIVE PREDICTION PLATFORM</span>
        </div>
        <h1 class="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Trade outcome contracts with play credits.
        </h1>
        <p class="text-xs sm:text-sm text-slate-400 leading-relaxed">
          Credits hold no monetary cash value. Back your conviction on YES or NO. Winning bets receive your original stake back plus a <strong>10% bonus payout</strong>.
        </p>
      </div>

      <div class="p-4 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono shrink-0 space-y-1.5">
        <div class="flex justify-between gap-4 text-slate-400">
          <span>Starting Balance:</span>
          <strong class="text-emerald-400 font-bold">1,000 credits</strong>
        </div>
        <div class="flex justify-between gap-4 text-slate-400">
          <span>Resolution Bonus:</span>
          <strong class="text-slate-200">+10% Payout</strong>
        </div>
        <div class="flex justify-between gap-4 text-slate-400">
          <span>Admin Passcode:</span>
          <strong class="text-slate-200 font-bold">123457</strong>
        </div>
      </div>
    </section>

    <!-- Global Floating / Alert Toast -->
    <div id="message" role="status" class="hidden p-3.5 rounded-xl border text-xs font-medium transition-all"></div>

    <!-- Auth Section -->
    <section id="auth" class="hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 max-w-md mx-auto space-y-4 shadow-xl">
      <div class="flex items-center justify-between">
        <h2 class="text-base font-bold text-slate-100">Sign Up or Log In</h2>
        <button onclick="$('auth').classList.add('hidden')" class="text-slate-400 hover:text-slate-200 text-xs">✕</button>
      </div>
      <p class="text-xs text-slate-400">Every new registered trader starts with 1,000 play credits.</p>
      
      <input id="email" type="email" placeholder="Email address" autocomplete="username" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500">
      <input id="password" type="password" placeholder="Password" autocomplete="current-password" class="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500">
      
      <div class="flex gap-2 pt-2">
        <button id="signup" class="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition">
          Sign Up (+1,000 Credits)
        </button>
        <button id="login" class="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg text-xs transition">
          Log In
        </button>
      </div>
    </section>

    <!-- Admin Console (Password-Gated with 123457) -->
    <section id="admin" class="hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-6 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div class="flex items-center gap-2">
          <h2 class="text-base font-bold text-slate-100">Admin Control Console</h2>
          <span class="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
            AUTHENTICATED
          </span>
        </div>
        <button id="btn-admin-close" class="text-xs text-slate-400 hover:text-slate-200 px-2 py-1 rounded bg-slate-800">Close</button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 1. Create Market -->
        <div class="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Publish Prediction Market</h3>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">Market Question</label>
            <input id="question" placeholder="e.g. Will SpaceX complete an orbital refuel in 2026?" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">Resolution Criteria</label>
            <textarea id="description" placeholder="Specify authoritative verification sources and edge cases..." rows="2" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500"></textarea>
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">Closes At (Future Date/Time)</label>
            <input id="closes" type="datetime-local" class="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500">
          </div>
          <button id="create" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition">
            Create Market
          </button>
        </div>

        <!-- 2. Set Market Outcome & Distribute Payouts -->
        <div class="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <h3 class="text-xs font-bold text-emerald-400 uppercase tracking-wider">Set Market Outcome</h3>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">Target Market ID</label>
            <input id="outcome-market-id" placeholder="Paste Market ID (or click 'Resolve' on card below)" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100 focus:outline-none focus:border-emerald-500">
          </div>
          <div>
            <label class="block text-[11px] text-slate-400 mb-1">Winning Outcome</label>
            <select id="outcome" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-100 focus:outline-none focus:border-emerald-500 font-semibold">
              <option value="">-- Choose Winning Side --</option>
              <option value="YES">YES</option>
              <option value="NO">NO</option>
            </select>
          </div>
          <p class="text-[11px] text-slate-500">
            Rule: Winning traders automatically receive their original stake back + 10% bonus credited to their balance.
          </p>
          <button id="set-outcome" class="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition">
            Set Outcome & Distribute Payouts
          </button>
        </div>
      </div>

      <!-- 3. User Credits & Market Deletion -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        <div class="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Trader Credit Adjustments</h3>
          <input id="target-user" placeholder="User ID (UID)" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100">
          <input id="credit-amount" placeholder="Whole credit amount (e.g. 500)" type="number" min="1" step="1" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100">
          <div class="flex gap-2">
            <button id="add-credits" class="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs transition">+ Add Credits</button>
            <button id="remove-credits" class="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition">- Deduct</button>
          </div>
        </div>

        <div class="space-y-3 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <h3 class="text-xs font-bold text-slate-300 uppercase tracking-wider">Delete Market</h3>
          <input id="market-id" placeholder="Market ID to delete" class="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-100">
          <button id="delete-market" class="w-full py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs transition">
            Delete Market Permanently
          </button>
        </div>
      </div>
    </section>

    <!-- Markets List Section -->
    <section class="space-y-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <h2 class="text-lg font-bold text-slate-100">Prediction Markets</h2>
          <span id="market-counter" class="text-xs font-mono text-slate-500"></span>
        </div>
        <span class="text-xs text-slate-400">Live odds calculated dynamically from trader pools</span>
      </div>

      <div id="markets" class="grid grid-cols-1 md:grid-cols-2 gap-5"></div>
    </section>

    <!-- ELABORATED: User Portfolio ("Your Bets") -->
    <section id="portfolio" class="hidden p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h2 class="text-base font-bold text-slate-100">Your Portfolio & Bets</h2>
          <p class="text-xs text-slate-400">Track all active stakes, estimated returns, and won payouts.</p>
        </div>
        <span id="portfolio-total-stake" class="text-xs font-mono text-emerald-400 font-bold"></span>
      </div>
      <div id="positions" class="space-y-3"></div>
    </section>

  </main>

  <footer class="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
    Play Market · Educational play-money demonstration platform · Credits have no monetary cash value.
  </footer>

  <script>
    // Firebase Project Configuration (Corrected)
    const firebaseConfig = {
      apiKey: "AIzaSyBs_rAE7nbKwkVsojk8yaOLModifiatXpo",
      authDomain: "playmarketdata-575e2.firebaseapp.com",
      databaseURL: "https://playmarketdata-575e2-default-rtdb.firebaseio.com",
      projectId: "playmarketdata-575e2",
      storageBucket: "playmarketdata-575e2.firebasestorage.app",
      messagingSenderId: "970991872848",
      appId: "1:970991872848:web:d30381d8f8e7d61f091a55"
    };

    let db, auth;
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.database();
      auth = firebase.auth();
    } catch (e) {
      console.warn("Firebase Init Error:", e);
    }

    const ADMIN_CODE = "123457";
    const STARTING_CREDITS = 1000;
    const $ = id => document.getElementById(id);

    function say(message, isError = false) {
      const el = $("message");
      el.textContent = message;
      el.className = isError
        ? "p-3.5 rounded-xl border text-xs font-medium bg-rose-950/50 border-rose-500/40 text-rose-300 shadow-lg"
        : "p-3.5 rounded-xl border text-xs font-medium bg-emerald-950/50 border-emerald-500/40 text-emerald-300 shadow-lg";
      el.classList.remove("hidden");
      setTimeout(() => el.classList.add("hidden"), 5500);
    }

    async function getUserData(uid) {
      if (!db) return {};
      const snapshot = await db.ref("users/" + uid).once("value");
      return snapshot.val() || {};
    }

    function currentUser() {
      return auth ? auth.currentUser : null;
    }

    async function signup() {
      const email = $("email").value.trim();
      const password = $("password").value;
      if (!email || !password) return say("Enter your email and password.", true);

      try {
        const credential = await auth.createUserWithEmailAndPassword(email, password);
        await db.ref("users/" + credential.user.uid).set({
          username: email.split('@')[0],
          balance: STARTING_CREDITS,
          createdAt: new Date().toISOString()
        });
        say("Account registered with " + STARTING_CREDITS + " play credits!");
        $("auth").classList.add("hidden");
      } catch (error) {
        say("Signup failed: " + error.message, true);
      }
    }

    async function login() {
      const email = $("email").value.trim();
      const password = $("password").value;
      if (!email || !password) return say("Enter your email and password.", true);

      try {
        await auth.signInWithEmailAndPassword(email, password);
        say("Logged in successfully.");
        $("auth").classList.add("hidden");
      } catch (error) {
        say("Login failed: " + error.message, true);
      }
    }

    async function logout() {
      try {
        await auth.signOut();
        $("admin").classList.add("hidden");
        say("Logged out.");
      } catch (error) {
        say(error.message, true);
      }
    }

    function showAdminControls() {
      if (!currentUser()) return say("Please log in first to access admin controls.", true);
      const code = prompt("Enter the admin password (default: 123457):");
      if (code !== ADMIN_CODE) return say("Incorrect admin password.", true);

      $("admin").classList.toggle("hidden");
      say("Admin controls unlocked.");
    }

    async function createMarket() {
      const code = prompt("Enter the admin passcode (123457) to create a market:");
      if (code !== ADMIN_CODE) {
        return say("Incorrect admin code. Passcode (123457) is required to create a market.", true);
      }

      const user = currentUser();
      if (!user) return say("Log in first to create a market.", true);

      const question = $("question").value.trim();
      const description = $("description").value.trim();
      const closeInput = $("closes").value;

      if (question.length < 5 || question.length > 200) {
        return say("Question must be between 5 and 200 characters.", true);
      }
      if (description.length > 2000) {
        return say("Description must be 2,000 characters or fewer.", true);
      }

      const closeDate = new Date(closeInput);
      if (!closeInput || Number.isNaN(closeDate.getTime()) || closeDate <= new Date()) {
        return say("Please choose a future closing time.", true);
      }

      try {
        await db.ref("markets").push().set({
          question,
          description: description || "Outcome determined according to verified sources.",
          closesAt: closeDate.toISOString(),
          status: "open",
          outcome: null,
          positions: {},
          createdBy: user.uid,
          createdAt: new Date().toISOString()
        });
        $("question").value = "";
        $("description").value = "";
        $("closes").value = "";
        say("Prediction market published!");
      } catch (error) {
        say("Could not create market: " + error.message, true);
      }
    }

    async function placeBet(marketId, side, amountValue) {
      const user = currentUser();
      if (!user) {
        $("auth").classList.remove("hidden");
        return say("Please log in or sign up to place a bet.", true);
      }

      const amount = Number(amountValue);
      if (!Number.isInteger(amount) || amount < 1) {
        return say("Enter a whole-number stake of at least 1 credit.", true);
      }

      try {
        const userRef = db.ref("users/" + user.uid);
        const marketRef = db.ref("markets/" + marketId);
        const [userSnapshot, marketSnapshot] = await Promise.all([
          userRef.once("value"),
          marketRef.once("value")
        ]);

        const userData = userSnapshot.val() || {};
        const market = marketSnapshot.val();

        if (amount > Number(userData.balance || 0)) {
          return say("Insufficient credits. You have " + (userData.balance || 0) + " credits.", true);
        }
        if (!market || market.status !== "open" || new Date(market.closesAt) <= new Date()) {
          return say("This market is closed for betting.", true);
        }

        const positionRef = marketRef.child("positions/" + user.uid);
        const positionSnapshot = await positionRef.once("value");
        const position = positionSnapshot.val() || { side, stake: 0 };

        if (position.side !== side && Number(position.stake) > 0) {
          return say("You already hold a " + position.side + " position. Only one side per market is permitted.", true);
        }

        await positionRef.set({
          username: userData.username || user.email.split('@')[0],
          side,
          stake: Number(position.stake || 0) + amount,
          timestamp: new Date().toISOString()
        });
        await userRef.update({ balance: Number(userData.balance || 0) - amount });

        say("Bet placed: " + amount + " credits on " + side + "!");
        if (typeof confetti === 'function') confetti({ particleCount: 60, spread: 60 });
      } catch (error) {
        say("Could not place bet: " + error.message, true);
      }
    }

    // ELABORATED: Fixed syntax error in catch block and hardened balance update
    async function changeCredits(direction) {
      if (!currentUser()) return say("Log in first.", true);

      const targetId = $("target-user").value.trim();
      const amount = Number($("credit-amount").value);
      if (!targetId || !Number.isInteger(amount) || amount < 1) {
        return say("Enter a valid user ID and positive amount.", true);
      }

      try {
        const userRef = db.ref("users/" + targetId);
        const snapshot = await userRef.once("value");
        let data = snapshot.val();

        if (!data) {
          data = { balance: 0, username: targetId };
          await userRef.set(data);
        }

        const balance = Number(data.balance || 0);
        const newBalance = direction === "add" ? balance + amount : balance - amount;
        if (newBalance < 0) return say("Cannot remove more credits than user possesses.", true);

        await userRef.update({ balance: newBalance });
        say((direction === "add" ? "Added " : "Deducted ") + amount + " credits for user " + targetId + ". New balance: " + newBalance);
      } catch (error) {
        say("Could not update credits: " + error.message, true);
      }
    }

    async function deleteMarket() {
      if (!currentUser()) return say("Log in first.", true);
      const marketId = $("market-id").value.trim();
      if (!marketId) return say("Enter a market ID.", true);
      if (!confirm("Delete market " + marketId + "?")) return;
      try {
        await db.ref("markets/" + marketId).remove();
        say("Market deleted.");
      } catch (error) {
        say("Could not delete market: " + error.message, true);
      }
    }

    async function setOutcome() {
      if (!currentUser()) return say("Log in first.", true);
      const marketId = $("outcome-market-id").value.trim();
      const outcome = $("outcome").value;
      if (!marketId || !outcome) return say("Enter market ID and select outcome.", true);

      try {
        const marketRef = db.ref("markets/" + marketId);
        const snapshot = await marketRef.once("value");
        const market = snapshot.val();
        if (!market) return say("Market not found.", true);
        if (market.status !== "open") return say("Market is not open.", true);

        await marketRef.update({
          outcome,
          status: "resolved",
          resolvedAt: new Date().toISOString()
        });

        const positions = market.positions || {};
        const payoutPromises = [];
        let totalPayout = 0;
        let winnersCount = 0;

        for (const [uid, position] of Object.entries(positions)) {
          if (position.side === outcome) {
            winnersCount++;
            const stake = Number(position.stake || 0);
            const payout = Math.floor(stake * 1.1); // 10% bonus returned
            totalPayout += payout;
            payoutPromises.push(
              db.ref("users/" + uid).update({
                balance: firebase.database.ServerValue.increment(payout)
              })
            );
          }
        }
        await Promise.all(payoutPromises);
        say("Outcome set to " + outcome + "! Distributed " + totalPayout + " credits to " + winnersCount + " winners (+10% bonus).");
        if (typeof confetti === 'function') confetti({ particleCount: 100, spread: 70 });
      } catch (error) {
        say("Could not set outcome: " + error.message, true);
      }
    }

    // ELABORATED: Full render cycle including Markets AND the User Portfolio ("#positions")
    async function render(liveMarkets = null) {
      const user = currentUser();
      $("auth").classList.toggle("hidden", !!user);
      $("account-pill").classList.toggle("hidden", !user);
      $("portfolio").classList.toggle("hidden", !user);
      $("btn-auth-toggle").textContent = user ? "Log Out" : "Log In / Sign Up";

      if (!user) {
        $("admin").classList.add("hidden");
      }

      if (user) {
        const userData = await getUserData(user.uid);
        $("welcome").textContent = userData.username || user.email.split('@')[0];
        $("balance").textContent = Number(userData.balance || 0).toLocaleString() + " credits";
      }

      if (liveMarkets === null && db) {
        const snapshot = await db.ref("markets").once("value");
        liveMarkets = snapshot.val() || {};
      }

      liveMarkets = liveMarkets || {};
      const box = $("markets");
      box.innerHTML = "";
      const keys = Object.keys(liveMarkets);
      $("market-counter").textContent = keys.length + " markets listed";

      if (keys.length === 0) {
        box.innerHTML = '<p class="col-span-2 text-xs text-slate-500 py-12 text-center">No prediction markets currently listed. Click Admin to publish the first one!</p>';
        return;
      }

      // Populate Markets
      const userBetsList = [];

      for (const [marketId, market] of Object.entries(liveMarkets)) {
        const positions = Object.values(market.positions || {});
        const yesPool = positions.filter(p => p.side === "YES").reduce((sum, p) => sum + Number(p.stake || 0), 0);
        const noPool = positions.filter(p => p.side === "NO").reduce((sum, p) => sum + Number(p.stake || 0), 0);
        const total = yesPool + noPool;
        const yesPercent = total ? Math.round((yesPool * 100) / total) : 50;
        const noPercent = total ? 100 - yesPercent : 50;

        const isClosed = market.status !== "open" || new Date(market.closesAt) <= new Date();
        const isResolved = market.status === "resolved";

        // Check if user has position in this market
        if (user && market.positions && market.positions[user.uid]) {
          userBetsList.push({
            marketId,
            market,
            position: market.positions[user.uid]
          });
        }

        const card = document.createElement("article");
        card.className = "p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition shadow-lg";

        const userPos = user && market.positions ? market.positions[user.uid] : null;

        card.innerHTML = \`
          <div class="space-y-2">
            <div class="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span class="text-slate-500">ID: \${marketId}</span>
              <span class="\${isClosed && !isResolved ? 'text-amber-400 font-semibold' : ''}">
                \${isResolved ? 'Resolved' : 'Closes: ' + new Date(market.closesAt).toLocaleDateString()}
              </span>
            </div>
            <h3 class="text-base font-bold text-slate-100 leading-snug">\${market.question || "Untitled market"}</h3>
            <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">\${market.description || "No resolution details provided."}</p>
          </div>

          <!-- Odds Bar -->
          <div class="space-y-1.5 pt-2 border-t border-slate-800/80 font-mono">
            <div class="flex justify-between items-baseline text-xs">
              <span class="text-xl font-extrabold text-emerald-400">\${yesPercent}% <span class="text-xs font-sans text-slate-400 font-semibold">YES</span></span>
              <span class="text-slate-400 font-sans text-xs">\${total.toLocaleString()} cr total pool</span>
              <span class="text-xl font-extrabold text-rose-400">\${noPercent}% <span class="text-xs font-sans text-slate-400 font-semibold">NO</span></span>
            </div>

            <div class="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden flex">
              <div class="h-full bg-emerald-500 transition-all duration-300" style="width: \${yesPercent}%"></div>
              <div class="h-full bg-rose-500 transition-all duration-300" style="width: \${noPercent}%"></div>
            </div>

            <div class="flex justify-between text-[11px] text-slate-500">
              <span>YES: \${yesPool.toLocaleString()} cr</span>
              <span>NO: \${noPool.toLocaleString()} cr</span>
            </div>
          </div>

          <!-- Existing Position Badge -->
          \${userPos ? \`
            <div class="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between items-center font-mono">
              <span class="text-slate-400">Your Position:</span>
              <span class="\${userPos.side === 'YES' ? 'text-emerald-400' : 'text-rose-400'} font-bold">
                \${userPos.stake} cr on \${userPos.side} (Est. payout: \${Math.floor(userPos.stake * 1.1)} cr)
              </span>
            </div>
          \` : ''}

          <!-- Actions / Outcome -->
          <div class="pt-2 border-t border-slate-800/80">
            \${isResolved ? \`
              <div class="flex items-center justify-between p-2 rounded-xl text-xs font-mono font-bold \${
                market.outcome === 'YES' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }">
                <span>OUTCOME: \${market.outcome}</span>
                <span>\${userPos && userPos.side === market.outcome ? 'WON (+10% Bonus)' : 'RESOLVED'}</span>
              </div>
            \` : !isClosed ? \`
              <div class="space-y-2">
                <div class="flex items-center gap-2">
                  <input id="stake-\${marketId}" type="number" min="1" step="1" value="50" placeholder="Stake" class="w-24 px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs font-mono tabular-nums text-slate-100 text-center">
                  <button onclick="placeBet('\${marketId}', 'YES', document.getElementById('stake-\${marketId}').value)" class="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition">Bet YES</button>
                  <button onclick="placeBet('\${marketId}', 'NO', document.getElementById('stake-\${marketId}').value)" class="flex-1 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition">Bet NO</button>
                </div>
              </div>
            \` : \`
              <div class="text-xs text-amber-400/90 text-center py-1 font-medium">Betting closed · Awaiting admin outcome resolution</div>
            \`}
          </div>
        \`;

        box.appendChild(card);
      }

      // Populate Portfolio ("Your Bets")
      const posBox = $("positions");
      posBox.innerHTML = "";
      if (userBetsList.length === 0) {
        posBox.innerHTML = '<p class="text-xs text-slate-500 italic py-3">You have not placed any bets yet. Choose an open market above to place a prediction.</p>';
      } else {
        let totalStaked = 0;
        for (const item of userBetsList) {
          totalStaked += Number(item.position.stake || 0);
          const isWon = item.market.status === 'resolved' && item.market.outcome === item.position.side;
          const isLost = item.market.status === 'resolved' && item.market.outcome && item.market.outcome !== item.position.side;
          const potential = Math.floor(item.position.stake * 1.1);

          const row = document.createElement("div");
          row.className = "p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs";
          row.innerHTML = \`
            <div class="space-y-0.5 max-w-md">
              <span class="text-[10px] text-slate-500 font-mono">ID: \${item.marketId}</span>
              <h4 class="font-bold text-slate-200">\${item.market.question}</h4>
            </div>
            <div class="text-right font-mono">
              <div class="\${item.position.side === 'YES' ? 'text-emerald-400' : 'text-rose-400'} font-bold">
                \${item.position.stake} cr on \${item.position.side}
              </div>
              <div class="text-[11px] \${isWon ? 'text-emerald-400 font-bold' : isLost ? 'text-slate-500' : 'text-slate-400'}">
                \${isWon ? '+ ' + potential + ' cr (WON)' : isLost ? '0 cr (LOST)' : 'Est. payout: ' + potential + ' cr'}
              </div>
            </div>
          \`;
          posBox.appendChild(row);
        }
        $("portfolio-total-stake").textContent = "Total Staked: " + totalStaked.toLocaleString() + " credits";
      }
    }

    // Attach listeners
    if (auth) {
      auth.onAuthStateChanged(() => render());
    }
    if (db) {
      db.ref("markets").on("value", snapshot => render(snapshot.val() || {}));
    }

    $("signup").addEventListener("click", signup);
    $("login").addEventListener("click", login);
    $("logout-btn").addEventListener("click", logout);
    $("btn-auth-toggle").addEventListener("click", () => {
      if (currentUser()) {
        logout();
      } else {
        $("auth").classList.toggle("hidden");
      }
    });

    $("btn-admin-toggle").addEventListener("click", showAdminControls);
    $("btn-admin-close").addEventListener("click", () => $("admin").classList.add("hidden"));
    $("create").addEventListener("click", createMarket);
    $("set-outcome").addEventListener("click", setOutcome);
    $("add-credits").addEventListener("click", () => changeCredits("add"));
    $("remove-credits").addEventListener("click", () => changeCredits("remove"));
    $("delete-market").addEventListener("click", deleteMarket);

    // Initial render
    render();
  </script>
</body>
</html>`;

    return new Response(html, {
      headers: {
        "content-type": "text/html;charset=UTF-8",
        "cache-control": "no-cache"
      }
    });
  }
};
