import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const SUPABASE_URL = "https://fkdvsxnwpbvahllneusg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrZHZzeG53cGJ2YWhsbG5ldXNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcxNTIyNjYsImV4cCI6MjA1MjcyODI2Nn0.MaR3oybouBfueMTbp3pmm2YH786j-n2G-qc0snk1CXI";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
