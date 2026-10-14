Option Explicit
Dim taskShell, taskFSO, taskRoot, taskExit
Set taskShell = CreateObject("WScript.Shell")
Set taskFSO = CreateObject("Scripting.FileSystemObject")
taskRoot = taskFSO.GetParentFolderName(WScript.ScriptFullName)
taskExit = taskShell.Run("powershell.exe -NoProfile -ExecutionPolicy Bypass -File """ & taskRoot & "\Stop-Local.ps1""", 0, True)
If taskExit <> 0 Then MsgBox "PonaMoji could not stop. Run Stop-Local.ps1 to inspect the error.", 48, "PonaMoji"
