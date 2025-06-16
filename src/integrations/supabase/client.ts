import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://fkdvsxnwpbvahllneusg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZHZzeG53cGJ2YWhsbG5ldXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNTIyNjYsImV4cCI6MjA1MjcyODI2Nn0.MaR3oybouBfueMTbp3pmm2YH786j-n2G-qc0snk1CXI";
const SUPABASE_SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZHZzeG53cGJ2YWhsbG5ldXNnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzE1MjI2NiwiZXhwIjoyMDUyNzI4MjY2fQ.usENdxMijyA9FLAX4apkMFMIob6p__Fej0hDKeYUbhk";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
