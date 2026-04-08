import supabase from "./supabaseClient.js";

async function verifyConnection() {
  console.log("📡 Attempting to reach Supabase...");

  // This simple query checks if the database is alive
  const { data, error } = await supabase.from('profiles').select('count');

  if (error) {
    // If you haven't made the 'profiles' table yet, 
    // it will fail with "relation profiles does not exist"
    // which actually PROVES the connection is working!
    console.log("✔️ Connection reached Supabase, but failed on query:");
    console.log("Message:", error.message);
  } else {
    console.log("✅ Full Success! Connected and queried successfully.");
    console.log("Profile Count:", data);
  }
}

verifyConnection();