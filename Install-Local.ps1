param([string]$PythonExe = '')
$ErrorActionPreference = 'Stop'
$taskPython = Join-Path $PSScriptRoot '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $taskPython)) {
    if (-not $PythonExe) {
        $taskLauncher = Get-Command py -ErrorAction SilentlyContinue
        if ($taskLauncher) {
            try {
                $taskCandidate = & $taskLauncher.Source -3.12 -c 'import sys; print(sys.executable)' 2>$null
                if ($LASTEXITCODE -eq 0 -and $taskCandidate) { $PythonExe = ($taskCandidate | Select-Object -Last 1).Trim() }
            } catch { $PythonExe = '' }
        }
        if (-not $PythonExe) {
            $taskCommand = Get-Command python -ErrorAction SilentlyContinue
            if ($taskCommand) { $PythonExe = $taskCommand.Source }
        }
    }
    if (-not $PythonExe -or -not (Test-Path -LiteralPath $PythonExe)) { throw '请通过 -PythonExe 指定 Python 3.12 的 python.exe 路径。' }
    $taskVersion = & $PythonExe -c 'import sys; print(str(sys.version_info.major)+chr(46)+str(sys.version_info.minor))'
    if ($LASTEXITCODE -ne 0 -or $taskVersion -ne '3.12') { throw '此项目使用 Python 3.12，请安装该版本或通过 -PythonExe 指定。' }
    & $PythonExe -m venv (Join-Path $PSScriptRoot '.venv')
    if ($LASTEXITCODE -ne 0) { throw '创建独立环境失败。' }
}
$taskVersion = & $taskPython -c 'import sys; print(str(sys.version_info.major)+chr(46)+str(sys.version_info.minor))'
if ($LASTEXITCODE -ne 0 -or $taskVersion -ne '3.12') { throw '现有 .venv 需要 Python 3.12，请在保留模型后重建环境。' }
& $taskPython -m pip install 'torch==2.8.0+cpu' --index-url 'https://download.pytorch.org/whl/cpu' --disable-pip-version-check
if ($LASTEXITCODE -ne 0) { throw '安装 PyTorch 失败。' }
& $taskPython -m pip install -r (Join-Path $PSScriptRoot 'requirements.txt') --disable-pip-version-check
if ($LASTEXITCODE -ne 0) { throw '安装翻译依赖失败。' }
& $taskPython (Join-Path $PSScriptRoot 'download_models.py')
if ($LASTEXITCODE -ne 0) { throw '模型下载未完成。重新执行此脚本可继续下载。' }
Write-Output '安装完成。双击 启动PonaMoji.vbs。'
