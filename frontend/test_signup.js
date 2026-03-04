const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

async function test() {
  const { data, error } = await supabase.auth.signUp({
    email: "test_node@example.com",
    password: "password123",
    options: {
      data: {
        name: "Test Node User",
        role: "student",
        ktuId: "TEST8888",
        isKtuVerified: false,
      },
    },
  });

  if (error) {
    console.error("Error:", error.message);
  } else {
    console.log("Success:", data.user?.id);
  }
}

test();
