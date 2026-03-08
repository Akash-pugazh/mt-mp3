Add-Type -AssemblyName System.Drawing
$ErrorActionPreference = "Stop"

function New-MTIcon {
  param(
    [int]$Size,
    [string]$Path,
    [bool]$WithBackground
  )

  $side = [int](@($Size)[0])
  $bmp = New-Object System.Drawing.Bitmap -ArgumentList @($side, $side, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  if ($WithBackground) {
    $bgRect = New-Object System.Drawing.RectangleF -ArgumentList @(0, 0, $side, $side)
    $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
      $bgRect,
      [System.Drawing.Color]::FromArgb(255, 12, 12, 15),
      [System.Drawing.Color]::FromArgb(255, 2, 2, 2),
      45
    )
    $g.FillRectangle($bgBrush, $bgRect)
    $bgBrush.Dispose()

    $pad = [int]($side * 0.035)
    $corner = [single]($side * 0.18)
    $pathRound = New-Object System.Drawing.Drawing2D.GraphicsPath
    $r = New-Object System.Drawing.Rectangle -ArgumentList @($pad, $pad, ($side - ($pad * 2)), ($side - ($pad * 2)))
    $d = [int]($corner * 2)
    $pathRound.AddArc($r.X, $r.Y, $d, $d, 180, 90)
    $pathRound.AddArc($r.Right - $d, $r.Y, $d, $d, 270, 90)
    $pathRound.AddArc($r.Right - $d, $r.Bottom - $d, $d, $d, 0, 90)
    $pathRound.AddArc($r.X, $r.Bottom - $d, $d, $d, 90, 90)
    $pathRound.CloseFigure()
    $stroke = New-Object System.Drawing.Pen(
      [System.Drawing.Color]::FromArgb(82, 255, 232, 173),
      [single]([math]::Max(1, $side * 0.008))
    )
    $g.DrawPath($stroke, $pathRound)
    $stroke.Dispose()
    $pathRound.Dispose()
  }

  $fontSize = [single]($side * 0.50)
  $font = New-Object System.Drawing.Font("Segoe UI Black", $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

  $textRect = New-Object System.Drawing.RectangleF -ArgumentList @(0, [single]($side * 0.02), $side, $side)

  $shadowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(120, 0, 0, 0))
  $shadowRect = New-Object System.Drawing.RectangleF -ArgumentList @(
    [single]($textRect.X + $side * 0.012),
    [single]($textRect.Y + $side * 0.018),
    $textRect.Width,
    $textRect.Height
  )
  $g.DrawString("MT", $font, $shadowBrush, $shadowRect, $sf)
  $shadowBrush.Dispose()

  $fillRect = New-Object System.Drawing.RectangleF -ArgumentList @([single]($side * 0.2), [single]($side * 0.24), [single]($side * 0.6), [single]($side * 0.52))
  $txtBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $fillRect,
    [System.Drawing.Color]::FromArgb(255, 248, 247, 255),
    [System.Drawing.Color]::FromArgb(255, 255, 221, 166),
    35
  )
  $blend = New-Object System.Drawing.Drawing2D.ColorBlend
  $blend.Colors = @(
    [System.Drawing.Color]::FromArgb(255, 248, 247, 255),
    [System.Drawing.Color]::FromArgb(255, 218, 214, 255),
    [System.Drawing.Color]::FromArgb(255, 255, 221, 166)
  )
  $blend.Positions = @(0.0, 0.58, 1.0)
  $txtBrush.InterpolationColors = $blend
  $g.DrawString("MT", $font, $txtBrush, $textRect, $sf)

  $outlinePen = New-Object System.Drawing.Pen(
    [System.Drawing.Color]::FromArgb(70, 255, 255, 255),
    [single]([math]::Max(1, $side * 0.018))
  )
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $emSize = $g.DpiY * $font.Size / 72
  $gp.AddString("MT", $font.FontFamily, [int]$font.Style, $emSize, $textRect, $sf)
  $g.DrawPath($outlinePen, $gp)

  $txtBrush.Dispose()
  $outlinePen.Dispose()
  $gp.Dispose()
  $font.Dispose()
  $sf.Dispose()

  $dir = Split-Path -Parent $Path
  if (!(Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  $bmp.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)

  $g.Dispose()
  $bmp.Dispose()
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$resBase = Join-Path $projectRoot "android\\app\\src\\main\\res"

$sizes = @{
  "mipmap-mdpi" = 48
  "mipmap-hdpi" = 72
  "mipmap-xhdpi" = 96
  "mipmap-xxhdpi" = 144
  "mipmap-xxxhdpi" = 192
}

foreach ($entry in $sizes.GetEnumerator()) {
  $folder = Join-Path $resBase $entry.Key
  $px = $entry.Value
  New-MTIcon -Size $px -Path (Join-Path $folder "ic_launcher.png") -WithBackground $true
  New-MTIcon -Size $px -Path (Join-Path $folder "ic_launcher_round.png") -WithBackground $true
  New-MTIcon -Size $px -Path (Join-Path $folder "ic_launcher_foreground.png") -WithBackground $false
}

$publicDir = Join-Path $projectRoot "public"
$faviconPng = Join-Path $publicDir "favicon.png"
$faviconIco = Join-Path $publicDir "favicon.ico"
New-MTIcon -Size 48 -Path $faviconPng -WithBackground $true
$faviconBmp = [System.Drawing.Bitmap]::FromFile($faviconPng)
$hIcon = $faviconBmp.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
$fs = New-Object System.IO.FileStream($faviconIco, [System.IO.FileMode]::Create)
$icon.Save($fs)
$fs.Close()
$faviconBmp.Dispose()
[System.Runtime.InteropServices.Marshal]::Release($hIcon) | Out-Null
Remove-Item $faviconPng -Force

$androidPublicDir = Join-Path $projectRoot "android\\app\\src\\main\\assets\\public"
Copy-Item -Path $faviconIco -Destination (Join-Path $androidPublicDir "favicon.ico") -Force
Copy-Item -Path (Join-Path $publicDir "mt-mp3-logo.svg") -Destination (Join-Path $androidPublicDir "mt-mp3-logo.svg") -Force

Write-Output "MT icon assets generated."
