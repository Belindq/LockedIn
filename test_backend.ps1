# Simple Backend Test Script
Write-Host "Testing Signup on Port 3000..." -ForegroundColor Cyan

$testEmail = "user_$(Get-Random)@example.com"
Write-Host "Creating user with email: $testEmail"

$body = @{
    email       = $testEmail
    password    = "password123"
    firstName   = "Test"
    lastName    = "User"
    age         = 25
    gender      = "non-binary"
    sexuality   = "bisexual"
    homeAddress = "1600 Pennsylvania Avenue NW, Washington, DC"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -ContentType "application/json" -Body $body -ErrorAction Stop
    
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "User created:"
    $response.user | Format-List
} catch {
    Write-Host "❌ FAILED" -ForegroundColor Red
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    
    # Try to read the error details
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $details = $reader.ReadToEnd()
        Write-Host "Details: $details" -ForegroundColor Yellow
    }
}
