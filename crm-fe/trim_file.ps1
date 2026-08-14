$path = "d:\Code\crm\crm-fe\src\features\crm\accounts\AccountsPage.tsx"
$lines = [System.IO.File]::ReadAllLines($path)
$trimmed = $lines[0..1089]
[System.IO.File]::WriteAllLines($path, $trimmed)
Write-Host "Done. Lines now: $($trimmed.Length)"
