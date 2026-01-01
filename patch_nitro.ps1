$file = "C:\Rajendran\DerScan\node_modules\react-native-nitro-modules\android\src\main\java\com\margelo\nitro\NitroModulesPackage.kt"
$content = Get-Content $file -Raw
$newContent = $content.Replace("needsEagerInit = false,", "needsEagerInit = false,`r`n          hasConstants = true,")
Set-Content -Path $file -Value $newContent
Write-Host "Patched NitroModulesPackage.kt"
