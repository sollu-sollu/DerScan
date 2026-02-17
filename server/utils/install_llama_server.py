import urllib.request
import json
import zipfile
import os
import shutil

def install_server():
    print("Fetching release info...")
    url = "https://api.github.com/repos/ggerganov/llama.cpp/releases/latest"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        print(f"Release: {data.get('tag_name')}")
        
        target_asset = None
        for asset in data.get("assets", []):
            if "bin-win-cuda-12.4-x64.zip" in asset['name'] and "cudart" not in asset['name']:
                target_asset = asset
                break
        
        if not target_asset:
            print("Could not find Windows CUDA 12.4 zip!")
            return
            
        print(f"Downloading {target_asset['name']} ({target_asset['size']/1024/1024:.1f} MB)...")
        urllib.request.urlretrieve(target_asset['browser_download_url'], "llama_server.zip")
        
        print("Extracting to server/bin/...")
        os.makedirs("../bin", exist_ok=True)
        with zipfile.ZipFile("llama_server.zip", 'r') as z:
            # Extract specifically llama-server.exe and DLLs
            for f in z.namelist():
                if f.endswith(".exe") or f.endswith(".dll"):
                    z.extract(f, "../bin")
                    print(f"Extracted: {f}")
                    
        os.remove("llama_server.zip")
        print("Done! llama-server.exe is ready.")
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    install_server()
