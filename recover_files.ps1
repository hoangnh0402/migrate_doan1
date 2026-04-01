$commitHash = "04e2f81"
$destRoot = "c:\Users\hoang.nguyenhuy3\migrate_doan1\HQC_System"

# Map of git paths (under CityLens/) to destination paths (under HQC_System/)
$files = @{
    "CityLens/web-dashboard/src/app/(dashboard)/layout.tsx" = "web-dashboard\src\app\(dashboard)\layout.tsx"
    "CityLens/web-dashboard/src/app/(dashboard)/dashboard/page.tsx" = "web-dashboard\src\app\(dashboard)\dashboard\page.tsx"
    "CityLens/web-dashboard/src/app/(dashboard)/data-license/page.tsx" = "web-dashboard\src\app\(dashboard)\data-license\page.tsx"
    "CityLens/web-dashboard/src/lib/gemini-service.ts" = "web-dashboard\src\lib\gemini-service.ts"
    "CityLens/backend/app/adapters/sosa_helpers.py" = "backend\app\adapters\sosa_helpers.py"
    "CityLens/backend/app/models/notification.py" = "backend\app\models\notification.py"
    "CityLens/backend/app/models/report.py" = "backend\app\models\report.py"
    "CityLens/backend/app/schemas/assignment.py" = "backend\app\schemas\assignment.py"
    "CityLens/backend/app/services/ai_chat_service.py" = "backend\app\services\ai_chat_service.py"
    "CityLens/backend/app/services/notification_service.py" = "backend\app\services\notification_service.py"
    "CityLens/backend/scripts/import_osm.py" = "backend\scripts\import_osm.py"
    "CityLens/backend/data/rdf/citylens-airquality.ttl" = "backend\data\rdf\hqc-system-airquality.ttl"
    "CityLens/backend/data/rdf/citylens-civic.ttl" = "backend\data\rdf\hqc-system-civic.ttl"
    "CityLens/backend/data/rdf/citylens-traffic.ttl" = "backend\data\rdf\hqc-system-traffic.ttl"
    "CityLens/backend/data/rdf/README.md" = "backend\data\rdf\README.md"
    "CityLens/packages/citylens-geo-utils/src/index.ts" = "packages\hqc-system-geo-utils\src\index.ts"
    "CityLens/packages/citylens-ngsi-ld/README.md" = "packages\hqc-system-ngsi-ld\README.md"
    "CityLens/packages/citylens-utils/package.json" = "packages\hqc-system-utils\package.json"
    "CityLens/web-app/README.md" = "web-app\README.md"
    "CityLens/web-app/scripts/setup.ps1" = "web-app\scripts\setup.ps1"
    "CityLens/web-app/src/screens/PersonalInfoScreen.tsx" = "web-app\src\screens\PersonalInfoScreen.tsx"
    "CityLens/web-app/src/services/alerts.ts" = "web-app\src\services\alerts.ts"
}

foreach ($gitPath in $files.Keys) {
    $destPath = Join-Path $destRoot $files[$gitPath]
    Write-Host "Recovering: $gitPath -> $destPath"
    
    try {
        $content = git show "${commitHash}:${gitPath}" 2>&1
        if ($LASTEXITCODE -eq 0) {
            # Apply renaming: CityLens -> HQC System, citylens -> hqcsystem
            $contentStr = $content -join "`n"
            $contentStr = $contentStr.Replace("com.CityLens", "com.hqcsystem")
            $contentStr = $contentStr.Replace("com.citylens", "com.hqcsystem")
            $contentStr = $contentStr.Replace("CityLens", "HQC System")
            $contentStr = $contentStr.Replace("citylens", "hqcsystem")
            $contentStr = $contentStr.Replace("CITYLENS", "HQC_SYSTEM")
            
            $parentDir = Split-Path $destPath -Parent
            if (-not (Test-Path $parentDir)) {
                New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
            }
            [System.IO.File]::WriteAllText($destPath, $contentStr, (New-Object System.Text.UTF8Encoding($false)))
            Write-Host "  OK - recovered and renamed"
        } else {
            Write-Host "  SKIP - file not found in commit: $content"
        }
    } catch {
        Write-Host "  ERROR: $_"
    }
}

# Also recover Spring Boot files
$springFiles = @{
    "CityLens/backend-spring/infrastructure/src/main/java/com/citylens/infrastructure/adapter/in/web/RealtimeController.java" = "backend-spring\infrastructure\src\main\java\com\hqcsystem\infrastructure\adapter\in\web\RealtimeController.java"
    "CityLens/backend-spring/user-domain/src/main/java/com/citylens/user/application/query/dto/LoginQuery.java" = "backend-spring\user-domain\src\main\java\com\hqcsystem\user\application\query\dto\LoginQuery.java"
}

foreach ($gitPath in $springFiles.Keys) {
    $destPath = Join-Path $destRoot $springFiles[$gitPath]
    Write-Host "Recovering Spring: $gitPath -> $destPath"
    
    try {
        $content = git show "${commitHash}:${gitPath}" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $contentStr = $content -join "`n"
            $contentStr = $contentStr.Replace("com.citylens", "com.hqcsystem")
            $contentStr = $contentStr.Replace("CityLens", "HQC System")
            $contentStr = $contentStr.Replace("citylens", "hqcsystem")
            
            $parentDir = Split-Path $destPath -Parent
            if (-not (Test-Path $parentDir)) {
                New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
            }
            [System.IO.File]::WriteAllText($destPath, $contentStr, (New-Object System.Text.UTF8Encoding($false)))
            Write-Host "  OK - recovered and renamed"
        } else {
            Write-Host "  SKIP - not in commit"
        }
    } catch {
        Write-Host "  ERROR: $_"
    }
}

Write-Host "`nDone! All files recovered."
