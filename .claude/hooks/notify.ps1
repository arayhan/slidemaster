param(
  [string]$Title = "Claude Code",
  [string]$Message = "Task complete"
)
# Windows toast notification with beep fallback. Called by Claude Code hooks (Stop / Notification / SubagentStop).
# Windows-only (Windows.UI.Notifications WinRT API); on macOS/Linux this hook is a silent no-op via the try/catch
# below, which is an accepted tradeoff rather than a cross-platform notifier. Hook failures never fail the turn.
# ASCII only: PowerShell 5.1 reads BOM-less files as ANSI; non-ASCII chars break the parser.
try {
  $null = [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime]
  $appId = '{1AC14E77-02E7-4E5D-B744-2EB1AE5198B7}\WindowsPowerShell\v1.0\powershell.exe'
  $template = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
  $texts = $template.GetElementsByTagName("text")
  $null = $texts.Item(0).AppendChild($template.CreateTextNode($Title))
  $null = $texts.Item(1).AppendChild($template.CreateTextNode($Message))
  $toast = New-Object Windows.UI.Notifications.ToastNotification($template)
  [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier($appId).Show($toast)
} catch {
  try { [console]::beep(880, 250); [console]::beep(660, 250) } catch {}
}
