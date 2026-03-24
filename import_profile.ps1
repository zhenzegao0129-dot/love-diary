[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$headers = @{
    "X-Bmob-Application-Id" = "8e1e8e647e06b88bfde858650f8f3f44"
    "X-Bmob-REST-API-Key" = "63ff0bf3f93f38edca2bc938ec25bd3e"
    "Content-Type" = "application/json"
}

$data = @{
    owner = "ta"
    location = "目前在放城镇太平村"
    phone = "redmi"
    birthday = "2005 0927 农历0824"
    height = "169cm"
    shoeSize = "40"
    zodiac = "天秤座"
    mbti = "enfp"
    snacks = "麻辣素毛肚，魔芋爽，笋小样"
    meals = "半天妖"
    drinks = "奶茶"
    fruits = "喜欢大多数水果，不喜欢苹果香蕉哈密瓜，榴莲菠萝蜜一般"
    games = "王者荣耀星露谷双人成行"
    freeTime = "刷抖音"
    musicApp = "QQ音乐"
    allergies = "对珊瑚过敏"
    anniversary = "20231017"
    notToDo = "不凶老婆，不骗老婆，不能冷暴力老婆，对老婆大人忠心耿耿"
    expectation = "我们要一直一直永远在一起"
}

$jsonBody = $data | ConvertTo-Json -Compress

try {
    $postResponse = Invoke-RestMethod -Method Post -Uri "https://api.bmobcloud.com/1/classes/PartnerProfile" -Headers $headers -Body ([System.Text.Encoding]::UTF8.GetBytes($jsonBody))
    Write-Output "POST Success:"
    $postResponse | ConvertTo-Json
} catch {
    Write-Output "Error:"
    $_.Exception.Message
}
