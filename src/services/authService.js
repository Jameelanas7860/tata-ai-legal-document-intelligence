// Authentication service — frontend-only, localStorage-based session.
// Validates against demo credentials pre-filled on the login page.

const DEMO_EMAIL = 'anas.khan@tata.com';
const DEMO_PASSWORD = 'demo1234';
const SESSION_KEY = 'ldi_session';

// Deterministic UUID for the demo user (valid UUID format for DB compatibility)
const DEMO_USER_ID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';

function getInitials(name) {
  if (!name) return 'U';
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function buildDemoUser() {
  return {
    id: DEMO_USER_ID,
    email: DEMO_EMAIL,
    name: 'Anas Khan',
    role: 'Senior Legal Counsel',
    initials: getInitials('Anas Khan'),
    organization: 'Tata Group',
    memberSince: '2023-04-01',
  };
}

function saveSession(user) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
}

function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default {
  async login(email, password) {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const user = buildDemoUser();
      saveSession(user);
      return user;
    }
    throw new Error('Invalid login credentials');
  },

  async signup(name, email, password) {
    if (!name || !email || !password) {
      throw new Error('Please fill in all fields.');
    }
    const user = {
      id: DEMO_USER_ID,
      email,
      name,
      role: 'Legal Counsel',
      initials: getInitials(name),
      organization: 'Tata Group',
      memberSince: new Date().toISOString().split('T')[0],
    };
    saveSession(user);
    return user;
  },

  async logout() {
    clearSession();
  },

  async forgotPassword(email) {
    return { success: true, email };
  },

  async getCurrentUser() {
    return loadSession();
  },

  isAuthenticated() {
    return !!loadSession();
  },

  getSessionUser() {
    return loadSession();
  },
};
