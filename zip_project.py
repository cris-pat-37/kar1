import os
import zipfile

def zip_project(src_dir, dest_zip):
    exclude_dirs = {'node_modules', 'dist', '.git', '.next', '.cache'}
    
    with zipfile.ZipFile(dest_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(src_dir):
            # Modifying dirs in-place will prevent os.walk from visiting them
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                # Do not include the output zip if it is being created inside the same directory
                file_path = os.path.join(root, file)
                if os.path.abspath(file_path) == os.path.abspath(dest_zip):
                    continue
                
                arcname = os.path.relpath(file_path, src_dir)
                zipf.write(file_path, arcname)
                print(f"Added: {arcname}")

if __name__ == "__main__":
    src = r"c:\Users\navad\Warehouse Registration\goods-distribution-warehouse-stock-register"
    dest = r"c:\Users\navad\Warehouse Registration\goods-distribution-warehouse-stock-register.zip"
    print(f"Zipping {src} to {dest}...")
    zip_project(src, dest)
    print("Done!")
