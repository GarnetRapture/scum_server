$ErrorActionPreference = "Stop"

# config.json 로드하여 루트 및 설정값 동적 도출
$configPath = "$PSScriptRoot\config.json"
if (-not (Test-Path $configPath)) {
    Write-Error "설정 파일($configPath)이 존재하지 않습니다."
    exit 1
}
$config = Get-Content -Path $configPath -Raw | ConvertFrom-Json

$CONFIG_PATH = "$($config.serverRootDir)\scum_server_files\SCUM\Saved\Config\WindowsServer\ServerSettings.ini"
$ENGINE_INI_PATH = "$($config.serverRootDir)\scum_server_files\SCUM\Saved\Config\WindowsServer\Engine.ini"

Write-Host "SCUM 서버 종합 최적화 설정 주입 프로세스를 시작합니다." -ForegroundColor Cyan

if (-not (Test-Path $CONFIG_PATH)) {
    Write-Error "설정 파일($CONFIG_PATH)이 존재하지 않습니다. 서버(SCUM_Server.exe)를 최초 1회 실행하여 설정 파일이 자동 생성되게 한 뒤 본 스크립트를 재실행해 주십시오."
    exit 1
}

# 파일 내용 로드
$content = Get-Content -Path $CONFIG_PATH -Encoding UTF8

# 설정 변경을 위한 헬퍼 함수 정의
function Set-OrAddSetting {
    param(
        [ref]$Lines,
        [string]$Key,
        [string]$Value
    )
    $pattern = "^$([regex]::Escape($Key))="
    $found = $false
    
    for ($i = 0; $i -lt $Lines.Value.Length; $i++) {
        if ($Lines.Value[$i] -match $pattern) {
            $Lines.Value[$i] = "$Key=$Value"
            $found = $true
            break
        }
    }
    
    if (-not $found) {
        $newLines = @()
        $added = $false
        foreach ($line in $Lines.Value) {
            $newLines += $line
            if ($line -eq "[scum]" -and -not $added) {
                $newLines += "$Key=$Value"
                $added = $true
            }
        }
        $Lines.Value = $newLines
    }
    Write-Host "설정 적용 완료: $Key -> $Value" -ForegroundColor Green
}

# config.json의 [server] 필드를 동적으로 파싱하여 자동 매핑 (상수화 제거)
$serverProps = $config.server.psobject.properties
foreach ($prop in $serverProps) {
    Set-OrAddSetting -Lines ([ref]$content) -Key $prop.Name -Value $prop.Value
}

# 파일 저장
$content | Set-Content -Path $CONFIG_PATH -Encoding UTF8
Write-Host "설정 저장 완료: $CONFIG_PATH" -ForegroundColor Cyan

# =========================================================================
# Engine.ini 메모리 및 가비지 컬렉션(GC) 성능 최적화 주입
# =========================================================================
if (Test-Path $ENGINE_INI_PATH) {
    Write-Host "Engine.ini 메모리/GC 최적화 주입을 시작합니다." -ForegroundColor Cyan
    $engContent = Get-Content -Path $ENGINE_INI_PATH -Encoding UTF8
    
    # [/Script/Engine.Engine] 섹션 존재 여부 확인
    $sectionExists = $false
    foreach ($line in $engContent) {
        if ($line -eq "[/Script/Engine.Engine]") {
            $sectionExists = $true
            break
        }
    }
    
    # 섹션이 없으면 하단에 추가
    if (-not $sectionExists) {
        $engContent += ""
        $engContent += "[/Script/Engine.Engine]"
    }
    
    # 설정 키/값 매핑 헬퍼
    function Set-EngineSetting {
        param(
            [ref]$Lines,
            [string]$Key,
            [string]$Value
        )
        $pattern = "^$([regex]::Escape($Key))="
        $found = $false
        for ($i = 0; $i -lt $Lines.Value.Length; $i++) {
            if ($Lines.Value[$i] -match $pattern) {
                $Lines.Value[$i] = "$Key=$Value"
                $found = $true
                break
            }
        }
        if (-not $found) {
            $newLines = @()
            $added = $false
            foreach ($line in $Lines.Value) {
                $newLines += $line
                if ($line -eq "[/Script/Engine.Engine]" -and -not $added) {
                    $newLines += "$Key=$Value"
                    $added = $true
                }
            }
            $Lines.Value = $newLines
        }
        Write-Host "Engine 최적화 적용: $Key -> $Value" -ForegroundColor Green
    }
    
    # config.json의 [engine] 필드를 동적으로 파싱하여 자동 매핑 (상수화 제거)
    $engineProps = $config.engine.psobject.properties
    foreach ($prop in $engineProps) {
        Set-EngineSetting -Lines ([ref]$engContent) -Key $prop.Name -Value $prop.Value
    }
    
    $engContent | Set-Content -Path $ENGINE_INI_PATH -Encoding UTF8
    Write-Host "Engine.ini 최적화 저장 완료." -ForegroundColor Cyan
} else {
    Write-Host "알림: Engine.ini 파일이 존재하지 않아 메모리 최적화 생략 (서버 최초 실행 후 자동 생성됩니다.)" -ForegroundColor Yellow
}
