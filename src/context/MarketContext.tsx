import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Market, UserProfile, ActivityEvent, MarketCategory, Outcome } from '../types/market';
import { INITIAL_USERS, INITIAL_MARKETS, INITIAL_ACTIVITY } from '../data/initialData';
import { 
  auth, 
  db, 
  isFirebaseInitialized, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  ref, 
  onValue, 
  set, 
  update, 
  remove 
} from '../lib/firebase';

const STORAGE_KEY = 'play_market_state_v1';
export const ADMIN_CODE = '123457';
export const STARTING_CREDITS = 1000;

interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

interface MarketContextType {
  users: Record<string, UserProfile>;
  currentUser: UserProfile | null;
  markets: Record<string, Market>;
  activities: ActivityEvent[];
  isAdmin: boolean;
  toasts: ToastMessage[];
  firebaseStatus: 'connected' | 'offline_fallback';
  dismissToast: (id: string) => void;
  showToast: (text: string, type?: 'success' | 'error' | 'info') => void;
  // Auth
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  signup: (email: string, password?: string, username?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  switchUser: (uid: string) => void;
  // Admin
  unlockAdmin: (code: string) => boolean;
  lockAdmin: () => void;
  // Markets & Trading
  placeBet: (marketId: string, side: Outcome, amount: number) => Promise<{ success: boolean; message: string }>;
  createMarket: (params: {
    question: string;
    description: string;
    category: MarketCategory;
    closesAt: string;
    adminCode?: string;
  }) => Promise<{ success: boolean; message: string; marketId?: string }>;
  setOutcome: (marketId: string, outcome: Outcome) => Promise<{ success: boolean; message: string; totalPayout?: number; winnersCount?: number }>;
  deleteMarket: (marketId: string) => Promise<{ success: boolean; message: string }>;
  adjustUserCredits: (targetUid: string, amount: number, direction: 'add' | 'remove') => Promise<{ success: boolean; message: string }>;
  addComment: (marketId: string, text: string) => void;
  resetToDefaultData: () => void;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

export const MarketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<Record<string, UserProfile>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_USERS;
  });

  const [currentUid, setCurrentUid] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_currentUid`);
      if (saved && users[saved]) return saved;
    } catch (e) {
      console.error(e);
    }
    return null;
  });

  const [markets, setMarkets] = useState<Record<string, Market>>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_markets`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_MARKETS;
  });

  const [activities, setActivities] = useState<ActivityEvent[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_activities`);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return INITIAL_ACTIVITY;
  });

  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(`${STORAGE_KEY}_isAdmin`) === 'true';
    } catch {
      return false;
    }
  });

  const [firebaseStatus, setFirebaseStatus] = useState<'connected' | 'offline_fallback'>('offline_fallback');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Sync to localStorage as continuous backup
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUid) {
      localStorage.setItem(`${STORAGE_KEY}_currentUid`, currentUid);
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_currentUid`);
    }
  }, [currentUid]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_markets`, JSON.stringify(markets));
  }, [markets]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_activities`, JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_isAdmin`, isAdmin ? 'true' : 'false');
  }, [isAdmin]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev.slice(-4), { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Firebase Realtime Sync Listeners
  useEffect(() => {
    if (!isFirebaseInitialized || !db) return;

    try {
      const marketsRef = ref(db, 'markets');
      const unsubscribeMarkets = onValue(
        marketsRef,
        snapshot => {
          const remoteMarkets = snapshot.val();
          if (remoteMarkets && typeof remoteMarkets === 'object') {
            setMarkets(prev => ({
              ...prev,
              ...remoteMarkets
            }));
            setFirebaseStatus('connected');
          }
        },
        error => {
          console.warn("Firebase Realtime DB read warning, using local cache:", error.message);
          setFirebaseStatus('offline_fallback');
        }
      );

      // Listen for Firebase Auth changes
      let unsubscribeAuth = () => {};
      if (auth) {
        unsubscribeAuth = onAuthStateChanged(auth, firebaseUser => {
          if (firebaseUser) {
            setFirebaseStatus('connected');
            // If user logged in via Firebase Auth, update or create profile
            setUsers(prev => {
              const existing = prev[firebaseUser.uid];
              if (existing) return prev;
              return {
                ...prev,
                [firebaseUser.uid]: {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email || `${firebaseUser.uid}@firebase.user`,
                  username: firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : 'Trader'),
                  balance: STARTING_CREDITS,
                  createdAt: new Date().toISOString(),
                  avatarColor: 'from-cyan-500 to-blue-600'
                }
              };
            });
            setCurrentUid(firebaseUser.uid);
          }
        });
      }

      return () => {
        unsubscribeMarkets();
        unsubscribeAuth();
      };
    } catch (err) {
      console.warn("Firebase sync setup:", err);
      setFirebaseStatus('offline_fallback');
    }
  }, []);

  const currentUser = currentUid && users[currentUid] ? users[currentUid] : null;

  // Sign up
  const signup = async (email: string, password?: string, usernameInput?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      showToast('Please enter a valid email address.', 'error');
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Try Firebase Auth if available
    let uid = `usr_${Date.now().toString(36)}`;
    if (isFirebaseInitialized && auth && password) {
      try {
        const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        uid = cred.user.uid;
        setFirebaseStatus('connected');
      } catch (err: any) {
        console.warn("Firebase auth signup info:", err.message);
        // Fall back gracefully to local account if Firebase Auth rejects or offline
      }
    }

    const username = usernameInput?.trim() || cleanEmail.split('@')[0];
    const newUser: UserProfile = {
      uid,
      email: cleanEmail,
      username,
      balance: STARTING_CREDITS,
      createdAt: new Date().toISOString(),
      avatarColor: 'from-purple-500 to-indigo-600'
    };

    setUsers(prev => ({ ...prev, [uid]: newUser }));
    setCurrentUid(uid);

    // Sync user data to Firebase DB if available
    if (isFirebaseInitialized && db) {
      try {
        await set(ref(db, `users/${uid}`), {
          username: newUser.username,
          balance: STARTING_CREDITS,
          email: cleanEmail
        });
      } catch (e) {
        console.warn("Firebase user write:", e);
      }
    }

    showToast(`Account created with ${STARTING_CREDITS} play credits!`, 'success');
    return { success: true, message: `Account created with ${STARTING_CREDITS} play credits!` };
  };

  // Login
  const login = async (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      showToast('Please enter your email.', 'error');
      return { success: false, message: 'Please enter your email.' };
    }

    if (isFirebaseInitialized && auth && password) {
      try {
        const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
        setCurrentUid(cred.user.uid);
        showToast('Logged in via Firebase Authentication!', 'success');
        return { success: true, message: 'Logged in successfully.' };
      } catch (e: any) {
        console.warn("Firebase signIn info:", e.message);
      }
    }

    const found = Object.values(users).find(u => u.email.toLowerCase() === cleanEmail);
    if (found) {
      setCurrentUid(found.uid);
      showToast(`Welcome back, ${found.username}!`, 'success');
      return { success: true, message: `Welcome back, ${found.username}!` };
    }

    return signup(cleanEmail, password);
  };

  const logout = async () => {
    if (isFirebaseInitialized && auth) {
      try {
        await signOut(auth);
      } catch (e) {
        console.warn(e);
      }
    }
    setCurrentUid(null);
    setIsAdmin(false);
    showToast('Logged out.', 'info');
  };

  const switchUser = (uid: string) => {
    if (users[uid]) {
      setCurrentUid(uid);
      showToast(`Switched active trader to ${users[uid].username}`, 'info');
    }
  };

  const unlockAdmin = (code: string): boolean => {
    if (code.trim() === ADMIN_CODE) {
      setIsAdmin(true);
      showToast('Admin controls unlocked.', 'success');
      return true;
    }
    showToast('Incorrect admin passcode.', 'error');
    return false;
  };

  const lockAdmin = () => {
    setIsAdmin(false);
    showToast('Admin controls locked.', 'info');
  };

  // Place Bet
  const placeBet = async (marketId: string, side: Outcome, amountValue: number): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      showToast('Log in or select a trader to place a bet.', 'error');
      return { success: false, message: 'Log in to place a bet.' };
    }

    const amount = Math.floor(Number(amountValue));
    if (!Number.isInteger(amount) || amount < 1) {
      showToast('Enter a whole-number stake of at least 1 credit.', 'error');
      return { success: false, message: 'Enter a whole-number stake of at least 1 credit.' };
    }

    if (amount > currentUser.balance) {
      showToast(`Insufficient balance. You have ${currentUser.balance} credits available.`, 'error');
      return { success: false, message: 'You do not have enough credits.' };
    }

    const market = markets[marketId];
    if (!market) {
      showToast('Market not found.', 'error');
      return { success: false, message: 'Market not found.' };
    }

    if (market.status !== 'open') {
      showToast('This market is closed.', 'error');
      return { success: false, message: 'This market is closed.' };
    }

    if (new Date(market.closesAt).getTime() <= Date.now()) {
      showToast('This market has passed its closing deadline.', 'error');
      return { success: false, message: 'This market is closed.' };
    }

    const existingPosition = market.positions[currentUser.uid];
    if (existingPosition && existingPosition.side !== side && existingPosition.stake > 0) {
      showToast(`You already hold a ${existingPosition.side} position. Only one side per market is permitted.`, 'error');
      return { success: false, message: 'You can only bet on one side per market.' };
    }

    const newStake = (existingPosition?.stake || 0) + amount;
    const updatedPosition = {
      uid: currentUser.uid,
      username: currentUser.username,
      email: currentUser.email,
      side,
      stake: newStake,
      timestamp: new Date().toISOString()
    };

    const newBalance = currentUser.balance - amount;

    // Local state updates
    setUsers(prev => ({
      ...prev,
      [currentUser.uid]: {
        ...prev[currentUser.uid],
        balance: newBalance
      }
    }));

    setMarkets(prev => ({
      ...prev,
      [marketId]: {
        ...prev[marketId],
        positions: {
          ...prev[marketId].positions,
          [currentUser.uid]: updatedPosition
        }
      }
    }));

    // Sync to Firebase if connected
    if (isFirebaseInitialized && db) {
      try {
        await Promise.all([
          set(ref(db, `markets/${marketId}/positions/${currentUser.uid}`), {
            username: currentUser.username,
            side,
            stake: newStake
          }),
          update(ref(db, `users/${currentUser.uid}`), {
            balance: newBalance
          })
        ]);
      } catch (err: any) {
        console.warn("Firebase position write (persisted locally):", err.message);
      }
    }

    const newActivity: ActivityEvent = {
      id: `act_${Date.now()}`,
      type: 'bet',
      title: `Bet Placed: ${amount} on ${side}`,
      description: `${currentUser.username} staked ${amount} credits on ${side} for "${market.question.slice(0, 45)}..."`,
      timestamp: new Date().toISOString(),
      marketId,
      amount,
      user: currentUser.username
    };
    setActivities(prev => [newActivity, ...prev.slice(0, 49)]);

    showToast(`Bet placed: ${amount} credits on ${side}!`, 'success');
    return { success: true, message: `Bet placed: ${amount} credits on ${side}.` };
  };

  // Create Market
  const createMarket = async (params: {
    question: string;
    description: string;
    category: MarketCategory;
    closesAt: string;
    adminCode?: string;
  }): Promise<{ success: boolean; message: string; marketId?: string }> => {
    // Require admin code (123457) or active admin session
    const providedCode = params.adminCode?.trim();
    if (!isAdmin && providedCode !== ADMIN_CODE) {
      showToast('Admin code (123457) is required to create a market.', 'error');
      return { success: false, message: 'Admin code (123457) is required to create a market.' };
    }
    if (providedCode === ADMIN_CODE && !isAdmin) {
      setIsAdmin(true);
    }

    const question = params.question.trim();
    const description = params.description.trim();

    if (question.length < 5 || question.length > 200) {
      showToast('Question must be between 5 and 200 characters.', 'error');
      return { success: false, message: 'Question must be between 5 and 200 characters.' };
    }

    const closeDate = new Date(params.closesAt);
    if (!params.closesAt || isNaN(closeDate.getTime()) || closeDate.getTime() <= Date.now()) {
      showToast('Closing time must be set to a future date.', 'error');
      return { success: false, message: 'Choose a future closing time.' };
    }

    const marketId = `mkt_${Date.now().toString(36)}`;
    const newMarket: Market = {
      id: marketId,
      question,
      description,
      category: params.category,
      closesAt: closeDate.toISOString(),
      createdAt: new Date().toISOString(),
      status: 'open',
      outcome: null,
      createdBy: currentUser?.uid || 'admin',
      createdByName: currentUser?.username || 'Admin',
      positions: {},
      comments: []
    };

    setMarkets(prev => ({
      ...prev,
      [marketId]: newMarket
    }));

    if (isFirebaseInitialized && db) {
      try {
        await set(ref(db, `markets/${marketId}`), {
          question,
          description,
          category: params.category,
          closesAt: closeDate.toISOString(),
          status: 'open',
          outcome: null,
          createdBy: currentUser?.uid || 'admin',
          createdByName: currentUser?.username || 'Admin',
          positions: {}
        });
      } catch (err: any) {
        console.warn("Firebase create market write:", err.message);
      }
    }

    showToast('Prediction market created successfully!', 'success');
    return { success: true, message: 'Market created.', marketId };
  };

  // Set outcome & distribute 10% bonus
  const setOutcome = async (marketId: string, outcome: Outcome): Promise<{ success: boolean; message: string; totalPayout?: number; winnersCount?: number }> => {
    const market = markets[marketId];
    if (!market) {
      showToast('Market not found.', 'error');
      return { success: false, message: 'Market not found.' };
    }

    const positions = market.positions || {};
    let totalPayout = 0;
    let winnersCount = 0;
    let currentUserWon = false;
    const updatedUsers = { ...users };
    const firebasePayoutUpdates: Record<string, any> = {};

    Object.entries(positions).forEach(([uid, pos]) => {
      if (pos.side === outcome) {
        winnersCount++;
        const stake = Number(pos.stake || 0);
        const payout = Math.floor(stake * 1.1); // 10% bonus returned
        totalPayout += payout;

        if (updatedUsers[uid]) {
          updatedUsers[uid] = {
            ...updatedUsers[uid],
            balance: updatedUsers[uid].balance + payout
          };
          firebasePayoutUpdates[`users/${uid}/balance`] = updatedUsers[uid].balance;
        }
        if (currentUser && currentUser.uid === uid) {
          currentUserWon = true;
        }
      }
    });

    setUsers(updatedUsers);

    setMarkets(prev => ({
      ...prev,
      [marketId]: {
        ...prev[marketId],
        status: 'resolved',
        outcome,
        resolvedAt: new Date().toISOString()
      }
    }));

    if (isFirebaseInitialized && db) {
      try {
        await update(ref(db, `markets/${marketId}`), {
          outcome,
          status: 'resolved',
          resolvedAt: new Date().toISOString()
        });
        if (Object.keys(firebasePayoutUpdates).length > 0) {
          await update(ref(db), firebasePayoutUpdates);
        }
      } catch (err: any) {
        console.warn("Firebase resolve sync:", err.message);
      }
    }

    if (currentUserWon) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        console.error(e);
      }
      showToast(`Outcome resolved to ${outcome}! You won! +10% bonus payout credited.`, 'success');
    } else {
      showToast(`Outcome set to ${outcome}. Paid out ${totalPayout} credits to ${winnersCount} winners.`, 'success');
    }

    return {
      success: true,
      message: `Outcome set to ${outcome} and payouts distributed.`,
      totalPayout,
      winnersCount
    };
  };

  // Delete market
  const deleteMarket = async (marketId: string): Promise<{ success: boolean; message: string }> => {
    if (!markets[marketId]) {
      showToast('Market not found.', 'error');
      return { success: false, message: 'Market not found.' };
    }

    setMarkets(prev => {
      const copy = { ...prev };
      delete copy[marketId];
      return copy;
    });

    if (isFirebaseInitialized && db) {
      try {
        await remove(ref(db, `markets/${marketId}`));
      } catch (e: any) {
        console.warn("Firebase delete market:", e.message);
      }
    }

    showToast('Market deleted.', 'info');
    return { success: true, message: 'Market deleted.' };
  };

  // Adjust User Credits
  const adjustUserCredits = async (targetUid: string, amountVal: number, direction: 'add' | 'remove'): Promise<{ success: boolean; message: string }> => {
    const amount = Math.floor(Number(amountVal));
    if (!targetUid || !Number.isInteger(amount) || amount < 1) {
      showToast('Enter a valid user ID and positive amount.', 'error');
      return { success: false, message: 'Invalid input.' };
    }

    const user = users[targetUid];
    const currentBal = Number(user?.balance || 0);
    const newBal = direction === 'add' ? currentBal + amount : currentBal - amount;

    if (newBal < 0) {
      showToast(`Cannot deduct ${amount} credits: user only has ${currentBal}.`, 'error');
      return { success: false, message: 'Insufficient balance.' };
    }

    setUsers(prev => ({
      ...prev,
      [targetUid]: {
        ...(prev[targetUid] || {
          uid: targetUid,
          email: `${targetUid}@demo.market`,
          username: targetUid,
          createdAt: new Date().toISOString()
        }),
        balance: newBal
      }
    }));

    if (isFirebaseInitialized && db) {
      try {
        await update(ref(db, `users/${targetUid}`), {
          balance: newBal
        });
      } catch (err: any) {
        console.warn("Firebase balance update:", err.message);
      }
    }

    showToast(`${direction === 'add' ? 'Added' : 'Removed'} ${amount} credits for ${user?.username || targetUid}.`, 'success');
    return { success: true, message: `Updated balance for user ${targetUid}` };
  };

  const addComment = (marketId: string, text: string) => {
    if (!currentUser) return;
    const clean = text.trim();
    if (!clean) return;

    const userPosition = markets[marketId]?.positions[currentUser.uid];
    const newComment = {
      id: `c_${Date.now()}`,
      uid: currentUser.uid,
      username: currentUser.username,
      text: clean,
      side: userPosition?.side,
      timestamp: new Date().toISOString()
    };

    setMarkets(prev => {
      const m = prev[marketId];
      if (!m) return prev;
      return {
        ...prev,
        [marketId]: {
          ...m,
          comments: [...(m.comments || []), newComment]
        }
      };
    });
  };

  const resetToDefaultData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUid('usr_alice');
    setMarkets(INITIAL_MARKETS);
    setActivities(INITIAL_ACTIVITY);
    setIsAdmin(false);
    localStorage.clear();
    showToast('Platform reset to initial demo state.', 'info');
  };

  return (
    <MarketContext.Provider
      value={{
        users,
        currentUser,
        markets,
        activities,
        isAdmin,
        toasts,
        firebaseStatus,
        dismissToast,
        showToast,
        login,
        signup,
        logout,
        switchUser,
        unlockAdmin,
        lockAdmin,
        placeBet,
        createMarket,
        setOutcome,
        deleteMarket,
        adjustUserCredits,
        addComment,
        resetToDefaultData
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = (): MarketContextType => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider');
  }
  return context;
};
