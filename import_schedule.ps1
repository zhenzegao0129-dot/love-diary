# 批量导入课表到 Bmob 云端
$AppId = "8e1e8e647e06b88bfde858650f8f3f44"
$ApiKey = "63ff0bf3f93f38edca2bc938ec25bd3e"
$Url = "https://api.bmobcloud.com/1/classes/CourseSchedule"

$headers = @{
    "X-Bmob-Application-Id" = $AppId
    "X-Bmob-REST-API-Key" = $ApiKey
    "Content-Type" = "application/json"
}

# 课程数据：owner, day(0=周一), period, name, room, color
$courses = @(
    # ===== 星期一 (day=0) =====
    @{owner="me"; day=0; period=1; name="数学建模"; room="公教楼601"; color="#ff6b81"},
    @{owner="me"; day=0; period=2; name="数学建模"; room="公教楼601"; color="#ff6b81"},
    @{owner="me"; day=0; period=3; name="篮球"; room="体育场"; color="#55efc4"},
    @{owner="me"; day=0; period=4; name="篮球"; room="体育场"; color="#55efc4"},
    @{owner="me"; day=0; period=5; name="算法设计与分析"; room=""; color="#a29bfe"},
    @{owner="me"; day=0; period=6; name="算法设计与分析"; room=""; color="#a29bfe"},
    @{owner="me"; day=0; period=9; name="人工智能伦理与安全"; room="JT304"; color="#ffeaa7"},
    @{owner="me"; day=0; period=10; name="人工智能伦理与安全"; room="JT304"; color="#ffeaa7"},

    # ===== 星期二 (day=1) =====
    @{owner="me"; day=1; period=1; name="自动控制原理"; room="电气楼"; color="#74b9ff"},
    @{owner="me"; day=1; period=2; name="自动控制原理"; room="电气楼"; color="#74b9ff"},
    @{owner="me"; day=1; period=3; name="数字图像处理"; room="电气楼419"; color="#fd79a8"},
    @{owner="me"; day=1; period=4; name="数字图像处理"; room="电气楼419"; color="#fd79a8"},
    @{owner="me"; day=1; period=5; name="形势与政策2"; room="教楼407"; color="#e17055"},
    @{owner="me"; day=1; period=6; name="形势与政策2"; room="教楼407"; color="#e17055"},
    @{owner="me"; day=1; period=7; name="习近平思想概论"; room="教楼602"; color="#6c5ce7"},
    @{owner="me"; day=1; period=8; name="习近平思想概论"; room="教楼602"; color="#6c5ce7"},

    # ===== 星期三 (day=2) =====
    @{owner="me"; day=2; period=3; name="大学英语4"; room="教楼307"; color="#00cec9"},
    @{owner="me"; day=2; period=4; name="大学英语4"; room="教楼307"; color="#00cec9"},
    @{owner="me"; day=2; period=5; name="Linux编程与实践"; room="JT204"; color="#ff9a9e"},
    @{owner="me"; day=2; period=6; name="Linux编程与实践"; room="JT204"; color="#ff9a9e"},
    @{owner="me"; day=2; period=7; name="心理健康教育2"; room="教楼105"; color="#81ecec"},
    @{owner="me"; day=2; period=8; name="心理健康教育2"; room="教楼105"; color="#81ecec"},
    @{owner="me"; day=2; period=9; name="山东红色文化"; room="JT403"; color="#fab1a0"},

    # ===== 星期四 (day=3) =====
    @{owner="me"; day=3; period=3; name="习近平思想概论"; room=""; color="#6c5ce7"},
    @{owner="me"; day=3; period=4; name="习近平思想概论"; room=""; color="#6c5ce7"},
    @{owner="me"; day=3; period=7; name="算法设计与分析"; room="JT204"; color="#a29bfe"},
    @{owner="me"; day=3; period=8; name="算法设计与分析"; room="JT204"; color="#a29bfe"},

    # ===== 星期五 (day=4) =====
    @{owner="me"; day=4; period=1; name="自动控制原理"; room="电气楼231"; color="#74b9ff"},
    @{owner="me"; day=4; period=2; name="自动控制原理"; room="电气楼231"; color="#74b9ff"},
    @{owner="me"; day=4; period=5; name="数字图像处理"; room="教楼305"; color="#fd79a8"},
    @{owner="me"; day=4; period=6; name="数字图像处理"; room="教楼305"; color="#fd79a8"},

    # ===== 星期六 (day=5) =====
    @{owner="me"; day=5; period=1; name="数学建模"; room="教楼306"; color="#ff6b81"},
    @{owner="me"; day=5; period=2; name="数学建模"; room="教楼306"; color="#ff6b81"}
)

$total = $courses.Count
$success = 0

foreach ($c in $courses) {
    $body = $c | ConvertTo-Json -Compress
    try {
        $result = Invoke-RestMethod -Uri $Url -Method Post -Headers $headers -Body $body
        $success++
        Write-Host "[OK $success/$total] $($c.name) - 周$($c.day+1) 第$($c.period)节" -ForegroundColor Green
    } catch {
        Write-Host "[FAIL] $($c.name) - $($_.Exception.Message)" -ForegroundColor Red
    }
    Start-Sleep -Milliseconds 200
}

Write-Host ""
Write-Host "===== 导入完成！成功: $success / $total =====" -ForegroundColor Cyan
