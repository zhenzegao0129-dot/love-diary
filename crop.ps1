Add-Type -AssemblyName System.Drawing
$imgPath = "c:\Users\25824\.gemini\antigravity\scratch\our_diary\1.png"
$img = [System.Drawing.Image]::FromFile($imgPath)
$w = $img.Width
$h = $img.Height
$min = [math]::Min($w, $h)
$rect = New-Object System.Drawing.Rectangle([math]::Floor(($w - $min)/2), [math]::Floor(($h - $min)/2), $min, $min)
$bmp = New-Object System.Drawing.Bitmap($min, $min)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.DrawImage($img, (New-Object System.Drawing.Rectangle(0, 0, $min, $min)), $rect, [System.Drawing.GraphicsUnit]::Pixel)

$bmp192 = New-Object System.Drawing.Bitmap($bmp, 192, 192)
$bmp192.Save("c:\Users\25824\.gemini\antigravity\scratch\our_diary\icon-192.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp192.Dispose()

$bmp512 = New-Object System.Drawing.Bitmap($bmp, 512, 512)
$bmp512.Save("c:\Users\25824\.gemini\antigravity\scratch\our_diary\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp512.Dispose()

$graphics.Dispose()
$bmp.Dispose()
$img.Dispose()
