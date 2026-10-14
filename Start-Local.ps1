param([switch]$NoBrowser, [int]$Port = 18713)
$ErrorActionPreference = 'Stop'
$taskRoot = $PSScriptRoot
$taskRuntime = Join-Path $taskRoot 'runtime'
$taskPython = Join-Path $taskRoot '.venv\Scripts\python.exe'
$taskServer = Join-Path $taskRoot 'server.py'
$taskUrl = "http://127.0.0.1:$Port"
try {
    New-Item -ItemType Directory -Force -Path $taskRuntime | Out-Null
    if (-not (Test-Path -LiteralPath $taskPython)) { throw '缺少独立 Python 环境，请先执行安装脚本。' }
    $taskStatus = $null
    try { $taskStatus = Invoke-RestMethod -Uri "$taskUrl/api/status" -TimeoutSec 2 } catch {}
    if ($taskStatus -and $taskStatus.application -ne 'PonaMoji-local') { throw "端口 $Port 已被其他应用使用。" }
    if (-not $taskStatus) {
        $taskListening = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($taskListening) { throw "端口 $Port 已被使用，未启动新服务。" }
        $taskArgs = @('-u', ('"' + $taskServer + '"'), '--port', "$Port", '--device', 'cpu')
        $taskProcess = Start-Process -FilePath $taskPython -ArgumentList $taskArgs -WorkingDirectory $taskRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $taskRuntime 'server-output.log') -RedirectStandardError (Join-Path $taskRuntime 'server-error.log') -PassThru
        @{pid=$taskProcess.Id;url=$taskUrl;server=$taskServer;started_at=(Get-Date).ToString('o')} | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $taskRuntime 'server-state.json')
    }
    for ($taskAttempt = 0; $taskAttempt -lt 60; $taskAttempt++) {
        try { $taskStatus = Invoke-RestMethod -Uri "$taskUrl/api/status" -TimeoutSec 2 } catch { $taskStatus = $null }
        if ($taskStatus -and $taskStatus.application -eq 'PonaMoji-local') {
            $taskStateFile = Join-Path $taskRuntime 'server-state.json'
            $taskSavedState = if (Test-Path -LiteralPath $taskStateFile) { Get-Content -Raw -LiteralPath $taskStateFile | ConvertFrom-Json } else { [PSCustomObject]@{url=$taskUrl;server=$taskServer} }
            $taskSavedState | Add-Member -NotePropertyName server_pid -NotePropertyValue $taskStatus.pid -Force
            $taskSavedState | ConvertTo-Json | Set-Content -Encoding UTF8 -LiteralPath $taskStateFile
        }
        if ($taskStatus -and $taskStatus.error) { throw $taskStatus.error }
        if ($taskStatus -and $taskStatus.ready) {
            Write-Output "PonaMoji 已就绪：$taskUrl"
            if (-not $NoBrowser) { Start-Process $taskUrl }
            exit 0
        }
        Start-Sleep -Seconds 1
    }
    throw '模型仍未就绪，请查看 runtime/server-error.log。可稍后重新运行启动脚本。'
} catch {
    $_ | Out-String | Set-Content -Encoding UTF8 -LiteralPath (Join-Path $taskRuntime 'launcher-error.log')
    Write-Error $_
    exit 1
}
