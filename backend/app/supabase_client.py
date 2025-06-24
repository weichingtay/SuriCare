# backend/supabase_client.py
from supabase import create_client, Client
import os, dotenv
dotenv.load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUAPBASE_KEY = os.environ["SUPABASE_KEY"]

supabase: Client = create_client(SUPABASE_URL,SUAPBASE_KEY)
