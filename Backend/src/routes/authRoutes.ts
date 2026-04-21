import { Router } from 'express';
import supabase from '../supabaseClient.js';
import { authenticateUser } from '../middleware/auth.js';

const router = Router();

// This endpoint is called right after the frontend finishes logging in
router.post('/sync', authenticateUser, async (req: any, res) => {
  const { id, email } = req.user;

  try {
    // 1. Check if the profile already exists in Supabase
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (profile) {
      return res.status(200).json({ 
        message: 'Welcome back!', 
        profile 
      });
    }

    // 2. If no profile exists, create a new one
    // We'll use the part before the '@' in their email as a default username
    const defaultUsername = email.split('@')[0];

    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert([{ 
        id: id, 
        username: defaultUsername, 
        profile_pic_url: null 
      }])
      .select()
      .single();

    if (insertError) throw insertError;

    res.status(201).json({ 
      message: 'Profile created successfully', 
      profile: newProfile 
    });

  } catch (err: any) {
    console.error('❌ Sync Error:', err.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;