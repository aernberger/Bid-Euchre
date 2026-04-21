import { Router } from 'express';
import supabase from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// --- NEW SIGNUP ROUTE ---
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  // Requirement 1.2.2: Passwords must have at least 12 characters.
  if (!password || password.length < 12) {
    return res.status(400).json({ error: "Password must be at least 12 characters long." });
  }

  try {
    // 1. Create the user in Supabase Auth (Admin level to bypass email verification)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Bypasses the need for a real email check
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // 2. Sync that user to your 'profiles' table (Requirements 1.1.1 & 1.1.2)
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        { 
          id: authUser.user.id, 
          email: email, 
          username: email.split('@')[0] // Uses first part of email as default username
        }
      ]);

    if (profileError) {
      // Cleanup: delete auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return res.status(400).json({ error: profileError.message });
    }

    res.status(200).json({ message: "Account created successfully!" });
  } catch (err: any) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// --- EXISTING SYNC ROUTE ---
router.post('/sync', authenticateUser, async (req: any, res) => {
  const { id, email } = req.user;
  // ... your existing sync logic ...
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return res.status(401).json({ error: error.message });
  res.status(200).json({ session: data.session, user: data.user });
});

export default router;