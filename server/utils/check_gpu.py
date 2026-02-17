import os
import sys
import ctypes

print(f"Python: {sys.version}")
print(f"Platform: {sys.platform}")

try:
    import llama_cpp
    print(f"llama-cpp-python version: {llama_cpp.__version__}")
    print(f"llama_cpp path: {os.path.dirname(llama_cpp.__file__)}")
except ImportError:
    print("llama-cpp-python NOT INSTALLED")
    sys.exit(1)

# Check for CUDA DLLs
cuda_path = os.environ.get('CUDA_PATH', '')
print(f"CUDA_PATH: {cuda_path}")

print("Checking for local DLLs...")
dlls = ["cudart64_12.dll", "cublas64_12.dll", "cublasLt64_12.dll"]
for dll in dlls:
    if os.path.exists(dll):
        print(f"Found {dll} ({os.path.getsize(dll)} bytes)")
        try:
            # Try to load it explicitly
            ctypes.CDLL(os.path.abspath(dll))
            print(f"Successfully loaded {dll}")
            # Add to search path explicitly
            os.add_dll_directory(os.getcwd())
        except Exception as e:
            print(f"Failed to load {dll}: {e}")
    else:
        print(f"MISSING: {dll}")

try:
    from llama_cpp import Llama
    print("Llama import successful")
    
    # Try to load a dummy model or check internal flags if possible
    # Just printing helps to see if the DLL loaded
    print("Attempting to load shared library...")
    try:
        # This triggers loading the .dll/.so
        llama_cpp.llama_backend_init()
        print("llama_backend_init successful")
    except Exception as e:
        print(f"llama_backend_init failed: {e}")

except Exception as e:
    print(f"Error importing Llama: {e}")
