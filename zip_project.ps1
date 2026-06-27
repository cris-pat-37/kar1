$src = "c:\Users\navad\Warehouse Registration\goods-distribution-warehouse-stock-register"
$temp = "c:\Users\navad\Warehouse Registration\temp_zip_build"
$dest = "c:\Users\navad\Warehouse Registration\goods-distribution-warehouse-stock-register.zip"

Write-Output "Cleaning up any old temporary folder..."
if (Test-Path $temp) {
    Remove-Item -Path $temp -Recurse -Force
}
if (Test-Path $dest) {
    Remove-Item -Path $dest -Force
}

Write-Output "Copying project files using robocopy (excluding node_modules, dist, and .git)..."
# robocopy exit codes under 8 are successful.
robocopy $src $temp /E /XD node_modules dist .git .next .cache

Write-Output "Compressing files to zip archive..."
Compress-Archive -Path "$temp\*" -DestinationPath $dest -Force

Write-Output "Cleaning up temporary folder..."
if (Test-Path $temp) {
    Remove-Item -Path $temp -Recurse -Force
}

Write-Output "Zip file created successfully at: $dest"
