$ErrorActionPreference = 'Stop'
$taskStatePath = Join-Path $PSScriptRoot 'runtime\server-state.json'
$taskState = if (Test-Path -LiteralPath $taskStatePath) { Get-Content -Raw -LiteralPath $taskStatePath | ConvertFrom-Json } else { [PSCustomObject]@{url='http://127.0.0.1:18713'} }
$taskStatus = $null
try { $taskStatus = Invoke-RestMethod -Uri "$($taskState.url)/api/status" -TimeoutSec 2 } catch {}
$taskExpectedServer = Join-Path $PSScriptRoot 'server.py'
$taskIds = @($taskState.server_pid, $(if ($taskStatus -and $taskStatus.application -eq 'PonaMoji-local') { $taskStatus.pid }), $taskState.pid) | Where-Object { $_ -is [int] -or $_ -is [long] } | Select-Object -Unique
$taskStopped = 0
foreach ($taskId in $taskIds) {
    $taskProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $taskId"
    if (-not $taskProcess) { continue }
    if (-not $taskProcess.CommandLine -or -not $taskProcess.CommandLine.Contains($taskExpectedServer) -or [System.IO.Path]::GetFileName($taskProcess.ExecutablePath) -ne 'python.exe') { continue }
    Stop-Process -Id $taskId -ErrorAction SilentlyContinue
    $taskStopped++
}
if (Test-Path -LiteralPath $taskStatePath) { Remove-Item -LiteralPath $taskStatePath }
Write-Output "PonaMoji 本地服务已停止（处理 $taskStopped 个本项目进程）。"
