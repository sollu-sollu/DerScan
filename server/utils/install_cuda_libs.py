import os
import sys
import zipfile
import urllib.request
import json
import shutil

DLL_DIR = "cuda_runtime"
os.makedirs(DLL_DIR, exist_ok=True)

def get_cudart_url():
    print("Fetching release info...", end="")
    try:
        url = "https://api.github.com/repos/ggerganov/llama.cpp/releases/latest"
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode())
            
        print(f" Release: {data.get('tag_name')}")
        
        for asset in data.get("assets", []):
            name = asset["name"]
            # Target the standalone cudart zip
            if name == "cudart-llama-bin-win-cuda-12.4-x64.zip":
                print(f" Found target: {name}")
                return asset["browser_download_url"]
        
        # Fallback to older naming if needed
        for asset in data.get("assets", []):
             if "cudart" in name and "cuda-12.4" in name and name.endswith(".zip"):
                 return asset["browser_download_url"]

        print(" No matching cudart zip found.")
        return None
    except Exception as e:
        print(f" Error: {e}")
        return None

def install_dlls(url):
    zip_path = "cudart.zip"
    print(f"Downloading {url}...")
    try:
        urllib.request.urlretrieve(url, zip_path)
        print("Extracting...")
        
        with zipfile.ZipFile(zip_path, 'r') as z:
            z.extractall(DLL_DIR)
            
        # Move DLLs to server root
        copied = 0
        for f in os.listdir(DLL_DIR):
            if f.endswith(".dll"):
                shutil.copy(os.path.join(DLL_DIR, f), ".")
                print(f" Installed: {f}")
                copied += 1
        
        # Cleanup
        os.remove(zip_path)
        shutil.rmtree(DLL_DIR)
        
        return copied > 0
    except Exception as e:
        print(f" Installation failed: {e}")
        return False

if __name__ == "__main__":
    url = get_cudart_url()
    if url:
        if install_dlls(url):
            print("\n[SUCCESS] CUDA Runtime DLLs installed!")
            print("Please restart the server: python main.py")
        else:
            print("\n[FAIL] Could not install DLLs.")
    else:
        print("\n[FAIL] URL not found.")
