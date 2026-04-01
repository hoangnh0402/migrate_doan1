import os
import subprocess

TARGET_COMMIT = "ae3f06d"

REPLACEMENTS = [
    (b"com.CityLens", b"com.hqcsystem"),
    (b"com.citylens", b"com.hqcsystem"),
    (b"container_name: CityLens", b"container_name: hqc-system"),
    (b"container_name: Citylens", b"container_name: hqc-system"),
    (b"CityLens-network", b"hqc-system-network"),
    (b"POSTGRES_USER: CityLens", b"POSTGRES_USER: hqc_system"),
    (b"POSTGRES_USER=CityLens", b"POSTGRES_USER=hqc_system"),
    (b"pg_isready -U CityLens", b"pg_isready -U hqc_system"),
    (b"CityLens_password", b"hqc_system_password"),
    (b"CityLens_db", b"hqc_system_db"),
    (b"CityLens_realtime", b"hqc_system_realtime"),
    (b"CityLens_app", b"hqc_system_app"),
    (b"citylens-", b"hqc-system-"),
    (b"CityLens-", b"hqc-system-"),
    (b"citylens_", b"hqc_system_"),
    (b"CityLens", b"HQC System"),
    (b"citylens", b"hqcsystem"),
    (b"CITYLENS", b"HQC_SYSTEM")
]

def apply_replacements(content: bytes) -> bytes:
    for old_val, new_val in REPLACEMENTS:
        content = content.replace(old_val, new_val)
    return content

def get_dest_path(git_path):
    # e.g. "CityLens/backend/test.py"
    parts = git_path.split('/')
    if parts[0] == 'CityLens':
        parts[0] = 'HQC_System'
    
    # Path rules applied by us manually:
    path_str = "/".join(parts)
    path_str = path_str.replace("citylens-utils", "hqc-system-utils")
    path_str = path_str.replace("citylens-ngsi-ld", "hqc-system-ngsi-ld")
    path_str = path_str.replace("citylens-geo-utils", "hqc-system-geo-utils")
    path_str = path_str.replace("com/citylens/", "com/hqcsystem/")
    path_str = path_str.replace("citylens", "hqc-system") # handle citylens-*.ttl 
    
    return os.path.normpath(path_str)

def main():
    # 1. Get all files in CityLens in TARGET_COMMIT
    output = subprocess.check_output(["git", "ls-tree", "-r", "--name-only", TARGET_COMMIT])
    files = output.decode("utf-8").splitlines()
    
    citylens_files = [f for f in files if f.startswith("CityLens/")]
    
    # 2. Extract and replace
    for f in citylens_files:
        dest_path = get_dest_path(f)
        try:
            # Check if this file maps to an existing file in HQC_System or if we need to create it
            if not os.path.exists(dest_path) and not os.path.exists(os.path.dirname(dest_path)):
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                
            file_content = subprocess.check_output(["git", "show", f"{TARGET_COMMIT}:{f}"], stderr=subprocess.DEVNULL)
            
            # Since git returns binary stdout, we can safely replace exact string tokens manually 
            # and write without messing up the underlying valid utf-8 sequence for Vietnamese words
            modified_content = apply_replacements(file_content)
            
            with open(dest_path, "wb") as out_f:
                out_f.write(modified_content)
                
            print(f"Fixed encoding for {dest_path}")
        except Exception as e:
            print(f"Error on {f}: {e}")

if __name__ == "__main__":
    main()
