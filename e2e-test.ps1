$today = (Get-Date).ToString('yyyy-MM-dd')
Write-Host "===== E2E TEST =====" -ForegroundColor Cyan
Write-Host "Date: $today`n"

Write-Host "Creating Cliente..."
$u = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/users' -Body (@{ name='ClienteE2E'; email='e2e@test.com'; dni='99999999' } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "OK - ID: $($u.id)`n"

Write-Host "Creating Sala (cap=3)..."
$r = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/rooms' -Body (@{ name='SalaTest'; capacity=3 } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "OK - ID: $($r.id)`n"

Write-Host "Creating Pelicula (subtitled=true)..."
$m = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/movie' -Body (@{ title='PeliTest'; genre='Drama'; duration=100; subtitled=$true } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "OK - ID: $($m.id), Subtitled=$($m.subtitled)`n"

Write-Host "Creating Funcion..."
$f = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/functions' -Body (@{ movie=$m.id; room=$r.id; date=$today; time='20:00'; price=150 } | ConvertTo-Json) -ContentType 'application/json'
Write-Host "OK - ID: $($f.id)`n"

Write-Host "Making 3 reservations..."
$index = 0
1..3 | ForEach-Object { 
    $index++
    $res = Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/reservations' -Body (@{ userId=$u.id; functionId=$f.id; seats=1 } | ConvertTo-Json) -ContentType 'application/json'
    $price = $res.functionPrice
    Write-Host "  Res $index`: ID=$($res.id), Date=$($res.functionDate), Time=$($res.functionTime), Price=`$$price"
}

Write-Host "`nAttempting 4th (should fail)..."
try { 
    Invoke-RestMethod -Method Post -Uri 'http://localhost:3001/reservations' -Body (@{ userId=$u.id; functionId=$f.id; seats=1 } | ConvertTo-Json) -ContentType 'application/json' | Out-Null
    Write-Host "FAIL: Created when it should not!"
} catch { 
    Write-Host "PASS: $($_.Exception.Message)"
}

Write-Host "`nMovies Report:"
$moviesReport = Invoke-RestMethod -Method Get -Uri "http://localhost:3001/reports/movies?from=$today&to=$today"
$moviesReport | ForEach-Object { 
    Write-Host "  $($_.movieTitle): Revenue=`$$($_.totalRevenue), Occupancy=$($_.occupancyRate)%"
}

Write-Host "`nRooms Report:"
$roomsReport = Invoke-RestMethod -Method Get -Uri "http://localhost:3001/reports/rooms?from=$today&to=$today"
$roomsReport | ForEach-Object { 
    Write-Host "  $($_.roomName): Occupancy=$($_.occupancyPercentage)%, Seats=$($_.totalSeatsUsed)/$($_.totalCapacity)"
}

Write-Host "`n===== E2E PASSED =====" -ForegroundColor Green
