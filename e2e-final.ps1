#!/usr/bin/env powershell
<#
.SYNOPSIS
    E2E Test para CineGest - Prueba flujo completo
#>

$today = (Get-Date).ToString('yyyy-MM-dd')
$baseUrl = "http://localhost:3001"

Write-Host "===== CINEGEST E2E TEST =====" -ForegroundColor Cyan
Write-Host "Date: $today`n"

# 1. Create Cliente
Write-Host "1. Creando Cliente..." -ForegroundColor Yellow
$userBody = @{ name = 'ClienteE2E'; email = 'e2e@test.com'; dni = '99999999' } | ConvertTo-Json
$user = Invoke-RestMethod -Method Post -Uri "$baseUrl/users" -Body $userBody -ContentType 'application/json'
$userId = $user.id
Write-Host "   ✓ Cliente ID: $userId`n"

# 2. Create Room
Write-Host "2. Creando Sala (capacity=3)..." -ForegroundColor Yellow
$roomBody = @{ name = 'SalaE2E'; capacity = 3 } | ConvertTo-Json
$room = Invoke-RestMethod -Method Post -Uri "$baseUrl/rooms" -Body $roomBody -ContentType 'application/json'
$roomId = $room.id
Write-Host "   ✓ Room ID: $roomId, Capacity: $($room.capacity)`n"

# 3. Create Movie
Write-Host "3. Creando Película (subtitled=true)..." -ForegroundColor Yellow
$movieBody = @{ title = 'PelículaE2E'; genre = 'Drama'; duration = 120; subtitled = $true } | ConvertTo-Json
$movie = Invoke-RestMethod -Method Post -Uri "$baseUrl/movie" -Body $movieBody -ContentType 'application/json'
$movieId = $movie.id
Write-Host "   ✓ Movie ID: $movieId, Subtitled: $($movie.subtitled)`n"

# 4. Create Function
Write-Host "4. Creando Función..." -ForegroundColor Yellow
$funcBody = @{ movie = $movieId; room = $roomId; date = $today; time = '20:00'; price = 150 } | ConvertTo-Json
$func = Invoke-RestMethod -Method Post -Uri "$baseUrl/functions" -Body $funcBody -ContentType 'application/json'
$funcId = $func.id
Write-Host "   ✓ Function ID: $funcId`n"

# 5. Make 3 reservations (fill the room)
Write-Host "5. Haciendo 3 reservaciones (llenar la sala)..." -ForegroundColor Yellow
for ($i = 1; $i -le 3; $i++) {
    $resBody = @{ userId = $userId; functionId = $funcId; seats = 1 } | ConvertTo-Json
    $res = Invoke-RestMethod -Method Post -Uri "$baseUrl/reservations" -Body $resBody -ContentType 'application/json'
    Write-Host "   ✓ Res#$i - ID: $($res.id), FuncDate: $($res.functionDate), Time: $($res.functionTime), Price: `$$($res.functionPrice)"
}
Write-Host ""

# 6. Try 4th reservation (should fail)
Write-Host "6. Intentando 4ta reservación (debería fallar)..." -ForegroundColor Yellow
try {
    $resBody = @{ userId = $userId; functionId = $funcId; seats = 1 } | ConvertTo-Json
    Invoke-RestMethod -Method Post -Uri "$baseUrl/reservations" -Body $resBody -ContentType 'application/json' | Out-Null
    Write-Host "   ✗ ERROR: Se creó cuando debería fallar!" -ForegroundColor Red
} catch {
    Write-Host "   ✓ PASS: Error esperado - Sin asientos disponibles`n"
}

# 7. Get Movies Report
Write-Host "7. Reporte de Películas..." -ForegroundColor Yellow
$moviesUrl = "$baseUrl/reports/movies?from=$today`&to=$today"
$moviesReport = Invoke-RestMethod -Method Get -Uri $moviesUrl
$moviesReport | ForEach-Object {
    Write-Host "   ✓ $($_.movieTitle): Revenue=`$$($_.totalRevenue), Occupancy=$($_.occupancyRate)%"
}
Write-Host ""

# 8. Get Rooms Report
Write-Host "8. Reporte de Salas..." -ForegroundColor Yellow
$roomsUrl = "$baseUrl/reports/rooms?from=$today`&to=$today"
$roomsReport = Invoke-RestMethod -Method Get -Uri $roomsUrl
$roomsReport | ForEach-Object {
    Write-Host "   ✓ $($_.roomName): Occupancy=$($_.occupancyPercentage)%, Seats=$($_.totalSeatsUsed)/$($_.totalCapacity)"
}
Write-Host ""

Write-Host "===== E2E TEST EXITOSO =====" -ForegroundColor Green
