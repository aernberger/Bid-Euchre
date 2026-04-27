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

router.get('/stats', authenticateUser, async (req: any, res) => {
  const userId = req.user?.id as string | undefined;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication token is missing' });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('games_played, games_won, total_calls_won, successful_calls, sum_bid_amount, hands_played, hands_won, tricks_played, tricks_won')
    .eq('id', userId)
    .single();

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  return res.status(200).json({
    stats: {
      gamesPlayed: Number(data?.games_played ?? 0),
      gamesWon: Number(data?.games_won ?? 0),
      totalCallsWon: Number(data?.total_calls_won ?? 0),
      successfulCalls: Number(data?.successful_calls ?? 0),
      sumBidAmount: Number(data?.sum_bid_amount ?? 0),
      handsPlayed: Number(data?.hands_played ?? 0),
      handsWon: Number(data?.hands_won ?? 0),
      tricksPlayed: Number(data?.tricks_played ?? 0),
      tricksWon: Number(data?.tricks_won ?? 0),
    },
  });
});

router.patch('/profile', authenticateUser, async (req: any, res) => {
  const userId = req.user?.id as string | undefined;
  const usernameRaw = req.body?.username;
  const profilePicUrlRaw = req.body?.profilePicUrl;

  if (!userId) {
    return res.status(401).json({ error: 'Authentication token is missing' });
  }

  const updates: { username?: string; profile_pic_url?: string } = {};
  const metadataUpdates: { username?: string; profile_pic_url?: string } = {};

  if (usernameRaw !== undefined) {
    if (typeof usernameRaw !== 'string' || !usernameRaw.trim()) {
      return res.status(400).json({ error: 'Username must be a non-empty string.' });
    }
    const username = usernameRaw.trim();
    if (username.length > 32) {
      return res.status(400).json({ error: 'Username must be 32 characters or fewer.' });
    }
    updates.username = username;
    metadataUpdates.username = username;
  }

  if (profilePicUrlRaw !== undefined) {
    if (typeof profilePicUrlRaw !== 'string') {
      return res.status(400).json({ error: 'Profile picture URL must be a string.' });
    }
    const profilePicUrl = profilePicUrlRaw.trim();
    if (profilePicUrl.length > 2048) {
      return res.status(400).json({ error: 'Profile picture URL is too long.' });
    }
    if (profilePicUrl.length > 0) {
      try {
        const parsed = new URL(profilePicUrl);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
          return res.status(400).json({ error: 'Profile picture URL must be http or https.' });
        }
      } catch {
        return res.status(400).json({ error: 'Profile picture URL is invalid.' });
      }
      updates.profile_pic_url = profilePicUrl;
      metadataUpdates.profile_pic_url = profilePicUrl;
    } else {
      updates.profile_pic_url = '';
      metadataUpdates.profile_pic_url = '';
    }
  }

  if (!Object.keys(updates).length) {
    return res.status(400).json({ error: 'No profile changes were provided.' });
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);

  if (profileError) {
    return res.status(400).json({ error: profileError.message });
  }

  const { data: metadataResult, error: metadataError } = await supabase.auth.admin.updateUserById(
    userId,
    { user_metadata: metadataUpdates }
  );

  if (metadataError) {
    return res.status(400).json({ error: metadataError.message });
  }

  return res.status(200).json({
    message: 'Profile updated successfully.',
    user: metadataResult.user,
  });
});

export default router;