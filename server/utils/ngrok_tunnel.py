import os
import sys
from pyngrok import ngrok, conf
from dotenv import load_dotenv

def start_tunnel():
    # Load environment variables from .env
    load_dotenv()
    
    auth_token = os.getenv("NGROK_AUTH_TOKEN")
    port = int(os.getenv("PORT", 8000))
    
    if not auth_token or auth_token == "YOUR_NGROK_AUTH_TOKEN":
        print("[ERROR] NGROK_AUTH_TOKEN not found in .env file.")
        print("Please get your token from https://dashboard.ngrok.com and add it to server/.env")
        sys.exit(1)

    try:
        print(f"[ACTION] Authenticating with ngrok...")
        conf.get_default().auth_token = auth_token
        
        print(f"[ACTION] Opening tunnel for port {port}...")
        public_url = ngrok.connect(port).public_url
        
        print("\n" + "="*50)
        print("  DerScan AI — Remote Tunnel Active")
        print("="*50)
        print(f"\nForwarding URL: {public_url}")
        print("\n[IMPORTANT] Copy this URL and paste it into the ")
        print("API URL field in the App's Profile settings.")
        print("\nKeep this window open to maintain the connection.")
        print("="*50 + "\n")
        
        # Keep the script running
        ngrok_process = ngrok.get_ngrok_process()
        ngrok_process.proc.wait()
        
    except Exception as e:
        print(f"[ERROR] Failed to start ngrok tunnel: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_tunnel()
