Clear-Host
Write-Host ""
Write-Host ""
Write-Host ""
Write-Host ""
Write-Host "             ███████╗████████╗ █████╗      ██╗         █████╗ ██████╗ ██╗" -ForegroundColor Cyan
Write-Host "             ██╔════╝╚══██╔══╝██╔══██╗     ██║        ██╔══██╗██╔══██╗██║" -ForegroundColor Cyan
Write-Host "             ███████╗   ██║   ███████║     ██║        ███████║██████╔╝██║" -ForegroundColor Cyan
Write-Host "             ╚════██║   ██║   ██╔══██║██   ██║        ██╔══██║██╔═══╝ ██║" -ForegroundColor Cyan
Write-Host "             ███████║   ██║   ██║  ██║╚█████╔╝███████╗██║  ██║██║     ██║" -ForegroundColor Cyan
Write-Host "             ╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚════╝ ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝" -ForegroundColor Cyan                                                                                                                   
Write-Host ""
Write-Host "                    STAJ ortamı başlatılıyor... Lütfen bekleyin."          -ForegroundColor Cyan




Start-Sleep 2




# Workspace 3
glazewm command focus --workspace 3

# API terminali
Start-Process wt -ArgumentList '-d "C:\Users\Alfendow\Documents\staj-proje\stajapi" pwsh -NoExit -Command dotnet run'

Start-sleep 2

# Frontend terminali
Start-Process wt -ArgumentList '-d "C:\Users\Alfendow\Documents\staj-proje\staj-frontend" pwsh -NoExit -Command ng serve'


Start-Sleep 8

# Workspace 2
glazewm command focus --workspace 2
Start-Process code -ArgumentList 'C:\Users\Alfendow\Documents\staj-proje' -WindowStyle Hidden


Start-Sleep 4

# Workspace 1
glazewm command focus --workspace 1
Start-Process "http://localhost:5141/swagger/index.html"
Start-Process "http://localhost:4200/"