import os
import platform
import subprocess

BASE_DIR = os.path.dirname(os.path.abspath(__file__))  # services/ping/
GO_SERVICE_DIR = BASE_DIR
BINARY_NAME = "pinger.exe" if platform.system() == "Windows" else "pinger"
BINARY_PATH = os.path.join(BASE_DIR, BINARY_NAME)

def compile_if_needed():
    if not os.path.exists(BINARY_PATH):
        print("Compiling pinger service...")
        result = subprocess.run(
            ["go", "build", "-o", BINARY_PATH, "."],
            cwd=GO_SERVICE_DIR,
            capture_output=True,
            text=True
        )
        if result.returncode != 0:
            raise RuntimeError(f"Failed to compile pinger binary: {result.stderr}")
        
def start_service():
    compile_if_needed()
    subprocess.Popen([BINARY_PATH])