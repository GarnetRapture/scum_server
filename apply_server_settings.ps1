$ErrorActionPreference = "Stop"

# =========================================================================
# [SCUM 전용 서버 종합 설정 상수 정의]
# =========================================================================

# 1. 기본 서버 정보 및 보안 설정
$SERVER_NAME = "SCUM Dedicated Server" # 서버 목록에 노출될 이름
$MAX_PLAYERS = "2"                     # 최대 동시 접속 플레이어 수
$SERVER_PASSWORD = "ramker7792"        # 접속 암호 (공개 서버인 경우 "" 설정)
$MAX_PING = "250"                      # 최대 핑 제한 (밀리초 단위)

# 2. 서버 네트워크 포트 설정 (변경 시 +2 규칙 적용 필수)
$PORT = "7777"                         # 메인 게임 포트 (UDP)
$QUERY_PORT = "7779"                   # 스팀 쿼리 포트 (UDP)

# 3. 호스트 시스템 최적화 설정 (동시 구동 고려)
$SERVER_FPS_LIMIT = "120"               # 서버 최대 틱레이트 (동시 구동 시 60 권장)
$MAX_ANIMALS = "50"                   # 월드 스폰 동물 한도 제한 (CPU 부하 최적화)
$MAX_VEHICLES = "20"                   # 월드 스폰 차량 한도 제한 (물리 연산/DB 최적화)

# 4. NPC 및 특수 좀비 스폰 설정
$DISABLE_SENTRY = "1"                  # 로봇(센트리) 스폰 차단 여부 (1: 차단, 0: 허용)
$DISABLE_SUICIDE = "1"                 # 자폭 좀비(Beep Zombie) 스폰 차단 여부 (1: 차단, 0: 허용)
$EXT_PAWN_MODIFIER = "1.0"             # 실외 좀비 스폰량 배율 (1.0이 기본값)
$INT_PAWN_MODIFIER = "1.0"             # 실내 좀비 스폰량 배율 (1.0이 기본값)
$WILD_PAWN_MODIFIER = "1.0"            # 야생 좀비 스폰량 배율 (1.0이 기본값)

# 5. 월드 환경 및 인게임 시스템 설정
$TIME_SPEED_MULTIPLIER = "1.0"         # 전체 시간 흐름 배율 (1.0이 기본속도)
$FAME_GAIN_MULTIPLIER = "1.0"          # 명성 점수 획득 배율 (1.0이 기본값)

# 6. RCON 리모트 제어 설정 (개방한 TCP 7777 연동)
$ENABLE_RCON = "1"                     # RCON 활성화 (1: 활성화, 0: 비활성화)
$RCON_PORT = "7777"                    # TCP RCON 포트
$RCON_PASSWORD = "ramker7792"          # RCON 접속 비밀번호

# 7. 난이도 및 밸런스 상세 설정
$PUPPET_DAMAGE_MULTIPLIER = "1.0"      # 좀비 데미지 배율
$MAX_WORLD_PUPPETS = "64"              # 월드 전체 최대 스폰 좀비 수 제한 (최적화)

# 8. 부활(Respawn) 규칙 설정
$ALLOW_SECTOR_RESPAWN = "1"            # 섹터 부활 허용 여부 (1: 허용, 0: 차단)
$ALLOW_SHELTER_RESPAWN = "1"           # 침대/쉘터 부활 허용 여부 (1: 허용, 0: 차단)
$ALLOW_SQUAD_RESPAWN = "1"             # 분대원 부활 허용 여부 (1: 허용, 0: 차단)

# 9. 공중 보급(Cargo Drop) 설정
$CARGO_COOLDOWN_MIN = "120"            # 보급 주기 최소 시간 (분, 2시간)
$CARGO_COOLDOWN_MAX = "300"            # 보급 주기 최대 시간 (분, 5시간)
$CARGO_DESTRUCT_TIME = "18600"         # 보급 상자 자폭 시간 (초, 5시간 10분)

# 10. 아이템 스폰(Loot) 및 파밍 밸런스 설정
$SPAWNER_PROBABILITY = "1.0"           # 바닥/월드 드랍 아이템 스폰 확률 배율 (기본: 1.0)
$EXAMINE_PROBABILITY = "1.0"           # 상자/보관함 파밍 아이템 스폰 확률 배율 (기본: 1.0)
$SPAWNER_EXPIRATION = "1.0"            # 월드 드랍 아이템 리스폰 시간 배율 (기본: 1.0)
$EXAMINE_EXPIRATION = "1.0"            # 상자/보관함 리스폰 시간 배율 (기본: 1.0)

# 11. 생존 대사량(체력 소모) 및 기지 설정
$CALORIE_CONSUMPTION = "1.0"           # 칼로리 소모 속도 배율 (기본: 1.0)
$WATER_CONSUMPTION = "1.0"             # 수분 소모 속도 배율 (기본: 1.0)
$EXHAUSTION_RATE = "1.0"               # 피로 누적 속도 배율 (기본: 1.0)
$ALLOW_BASE_BUILDING = "1"             # 기지 건축 허용 여부 (1: 허용, 0: 차단)

# config.json 로드하여 루트 디렉터리 동적 도출
$config = Get-Content -Path "$PSScriptRoot\config.json" | ConvertFrom-Json
$CONFIG_PATH = "$($config.serverRootDir)\scum_server_files\SCUM\Saved\Config\WindowsServer\ServerSettings.ini"

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

# 1. 기본 서버 정보 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.ServerName" -Value $SERVER_NAME
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.MaxPlayers" -Value $MAX_PLAYERS
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.ServerPassword" -Value $SERVER_PASSWORD
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.MaxPing" -Value $MAX_PING

# 2. 포트 설정 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.Port" -Value $PORT
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.QueryPort" -Value $QUERY_PORT

# 3. 최적화 파라미터 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.ServerFPSLimit" -Value $SERVER_FPS_LIMIT
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.MaxAnimalsOnServer" -Value $MAX_ANIMALS
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.MaxAllowedVehicles" -Value $MAX_VEHICLES

# 4. NPC 및 특수 좀비 차단 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.DisableSentrySpawning" -Value $DISABLE_SENTRY
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.DisableSuicidePuppetSpawning" -Value $DISABLE_SUICIDE
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.ExteriorPawnAmountModifier" -Value $EXT_PAWN_MODIFIER
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.InteriorPawnAmountModifier" -Value $INT_PAWN_MODIFIER
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.WildPawnAmountModifier" -Value $WILD_PAWN_MODIFIER

# 5. 환경 및 시스템 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.TimeOfDaySpeedMultiplier" -Value $TIME_SPEED_MULTIPLIER
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.FamePointGainMultiplier" -Value $FAME_GAIN_MULTIPLIER

# 6. RCON 리모트 제어 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.EnableRcon" -Value $ENABLE_RCON
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.RconPort" -Value $RCON_PORT
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.RconPassword" -Value $RCON_PASSWORD

# 7. 난이도 및 밸런스 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.PuppetDamageMultiplier" -Value $PUPPET_DAMAGE_MULTIPLIER
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.MaxAllowedPuppetsInWorld" -Value $MAX_WORLD_PUPPETS

# 8. 부활(Respawn) 규칙 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.AllowSectorRespawn" -Value $ALLOW_SECTOR_RESPAWN
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.AllowShelterRespawn" -Value $ALLOW_SHELTER_RESPAWN
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.AllowSquadmateRespawn" -Value $ALLOW_SQUAD_RESPAWN

# 9. 공중 보급(Cargo Drop) 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.CargoDropCooldownMinimum" -Value $CARGO_COOLDOWN_MIN
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.CargoDropCooldownMaximum" -Value $CARGO_COOLDOWN_MAX
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.CargoDropSelfDestructTime" -Value $CARGO_DESTRUCT_TIME

# 10. 아이템 스폰(Loot) 및 파밍 밸런스 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.SpawnerProbabilityMultiplier" -Value $SPAWNER_PROBABILITY
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.ExamineSpawnerProbabilityMultiplier" -Value $EXAMINE_PROBABILITY
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.SpawnerExpirationTimeMultiplier" -Value $SPAWNER_EXPIRATION
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.ExamineSpawnerExpirationTimeMultiplier" -Value $EXAMINE_EXPIRATION

# 11. 생존 대사량 및 기지 건설 주입
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.CalorieConsumptionRateMultiplier" -Value $CALORIE_CONSUMPTION
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.WaterConsumptionRateMultiplier" -Value $WATER_CONSUMPTION
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.ExhaustionRateMultiplier" -Value $EXHAUSTION_RATE
Set-OrAddSetting -Lines ([ref]$content) -Key "scum.AllowBaseBuilding" -Value $ALLOW_BASE_BUILDING

# 파일 저장
$content | Set-Content -Path $CONFIG_PATH -Encoding UTF8
Write-Host "설정 저장 완료: $CONFIG_PATH" -ForegroundColor Cyan

# =========================================================================
# [Engine.ini 메모리 및 가비지 컬렉션(GC) 성능 최적화 주입]
# =========================================================================
$ENGINE_INI_PATH = "$($config.serverRootDir)\scum_server_files\SCUM\Saved\Config\WindowsServer\Engine.ini"

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
    
    Set-EngineSetting -Lines ([ref]$engContent) -Key "gc.CreateGarbageCollectorUObjectClusters" -Value "True"
    Set-EngineSetting -Lines ([ref]$engContent) -Key "gc.ActorClusteringEnabled" -Value "True"
    Set-EngineSetting -Lines ([ref]$engContent) -Key "gc.BlueprintClusteringEnabled" -Value "True"
    Set-EngineSetting -Lines ([ref]$engContent) -Key "s.AsyncLoadingThreadEnabled" -Value "True"
    
    $engContent | Set-Content -Path $ENGINE_INI_PATH -Encoding UTF8
    Write-Host "Engine.ini 최적화 저장 완료." -ForegroundColor Cyan
} else {
    Write-Host "알림: Engine.ini 파일이 존재하지 않아 메모리 최적화 생략 (서버 최초 실행 후 자동 생성됩니다.)" -ForegroundColor Yellow
}
