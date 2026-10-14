Option Explicit
Dim taskShell, taskFSO, taskRoot, taskExit
Set taskShell = CreateObject("WScript.Shell")
Set taskFSO = CreateObject("Scripting.FileSystemObject")
taskRoot = taskFSO.GetParentFolderName(WScript.ScriptFullName)
taskExit = taskShell.Run("powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & taskRoot & "\Start-Local.ps1""", 0, True)
If taskExit <> 0 Then MsgBox "PonaMoji could not start. See runtime\launcher-error.log.", 48, "PonaMoji"
