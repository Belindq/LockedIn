$ports = @(3000, 3001, 3002)

foreach ($port in $ports) {
    Write-Host "Trying http://localhost:$port/api/debug/users ..." -NoNewline
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:$port/api/debug/users" -Method Get -ErrorAction Stop
        Write-Host " FOUND!" -ForegroundColor Green
        
        Write-Host "Total Users: $($response.count)" -ForegroundColor Cyan
        $response.users | Format-Table -Property email, status, firstName, avatar, createdAt
        exit
    } catch {
        Write-Host " No Server." -ForegroundColor Yellow
    }
}

Write-Host "Could not find running server on 3000, 3001, or 3002." -ForegroundColor Red
