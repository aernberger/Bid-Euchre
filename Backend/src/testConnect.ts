import supabase from './supabaseClient.js';

/**
 * checks if database is live
 */

async function verifyConnection() {
  console.log(' Attempting to reach Supabase...');

  const { data, error } = await supabase.from('profiles').select('count');

  if (error) {
    console.log('Connection reached Supabase, but failed on query:');
    console.log('Message:', error.message);
  } else {
    console.log('Full Success! Connected and queried successfully.');
    console.log('Profile Count:', data);
  }
}

verifyConnection();
