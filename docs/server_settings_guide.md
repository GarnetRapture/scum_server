# SCUM Dedicated Server Configuration & Optimization Guide

본 문서는 사용자의 Windows 11 PC 하드웨어 환경 분석을 통해 도출한 SCUM Dedicated Server의 최신 최적화 설정 가이드라인입니다.

---

## 1. 호스트 시스템 환경 분석
* **CPU**: AMD Ryzen 7 5800X (8 Cores, 16 Threads) — 싱글코어 클럭 및 멀티스레드 성능이 우수하여 고부하 로직 연산에 매우 유리합니다.
* **RAM**: 64.00 GB — 대용량 메모리가 확보되어 동시 접속 인원 증가 및 맵 로딩 리소스 축적에도 여유롭습니다.
* **Disk**: D 드라이브 여유 공간 약 474 GB 확보 (NVMe SSD 환경인 경우 스터터링 방지에 크게 기여)

---

## 2. 서버 설정 파일 개요
* **파일명**: `ServerSettings.ini`
* **기본 경로**: `D:\scum_server\scum_server_files\SCUM\Saved\Config\WindowsServer\ServerSettings.ini`
  > [!NOTE]
  > 해당 파일은 서버(`SCUM_Server.exe`)가 최초 1회 완전히 구동되어 초기화 프로세스를 마친 후에 자동으로 생성됩니다.

---

## 3. 최적화 및 사용자 요구 사양 상수 (동시 구동 및 콘텐츠 제어 최적화)
동일 PC에서 서버와 게임 클라이언트를 동시에 실행할 때 리소스 충돌(프레임 드랍, 스터터링)을 예방하고, 사용자 요청에 맞춰 특정 요소를 비활성화하기 위한 최적화 상수 설정입니다. [apply_server_settings.ps1](file:///d:/scum_server/apply_server_settings.ps1)을 통해 자동 반영됩니다.

```ini
[scum]
# 1. 사용자 기본 요구 사양
scum.MaxPlayers=2              # 최대 플레이어 인원 설정 (요청 사양: 2명)
scum.ServerPassword=ramker7792 # 서버 비밀번호 설정

# 2. 서버/클라 동시 구동 맞춤 성능 최적화
scum.ServerFPSLimit=60         # 서버 틱레이트를 60으로 제한하여 클라이언트 실행에 필요한 CPU 자원 확보 (동시 구동 시 필수)
scum.MaxAnimalsOnServer=100    # 월드 스폰 동물 수 제한을 낮춰 서버 프로세스의 실시간 연산량 감소
scum.MaxAllowedVehicles=20     # 월드 차량 대수 제한을 조정하여 비활성 동기화 연산 제거

# 3. 게임 플레이 콘텐츠 차단 설정
scum.DisableSentrySpawning=1        # 로봇(센트리) 스폰 완전 비활성화 (1: 차단, 0: 허용)
scum.DisableSuicidePuppetSpawning=1 # 자폭 좀비(Beep Zombie) 스폰 완전 비활성화 (1: 차단, 0: 허용)

# 4. 공중 보급 설정 (최신 조율 사양)
scum.CargoDropCooldownMinimum=120   # 보급 주기 최소 (120분 = 2시간)
scum.CargoDropCooldownMaximum=300   # 보급 주기 최대 (300분 = 5시간)
scum.CargoDropSelfDestructTime=18600 # 보급 상자 유지/자폭 대기시간 (18600초 = 5시간 10분)

# 5. 아이템 파밍 및 월드 스폰 배율
scum.SpawnerProbabilityMultiplier=1.0        # 월드 드랍 파밍 확률 배율 (1.0: 기본)
scum.ExamineSpawnerProbabilityMultiplier=1.0 # 상자 검색 파밍 확률 배율 (1.0: 기본)
scum.SpawnerExpirationTimeMultiplier=1.0     # 월드 파밍 리스폰 주기 배율 (1.0: 기본)
scum.ExamineSpawnerExpirationTimeMultiplier=1.0 # 상자 검색 리스폰 주기 배율 (1.0: 기본)

# 6. 생존 대사량 및 플레이어 건축
scum.CalorieConsumptionRateMultiplier=1.0    # 칼로리 소모 배율 (1.0: 기본)
scum.WaterConsumptionRateMultiplier=1.0      # 수분 소모 배율 (1.0: 기본)
scum.ExhaustionRateMultiplier=1.0            # 피로 누적 배율 (1.0: 기본)
scum.AllowBaseBuilding=1                     # 기지 건설 허용 여부 (1: 허용, 0: 차단)
```

---

## 4. CPU 자원 격리 (CPU Affinity 제어)
* 동일 PC에서 서버와 클라이언트의 연산 코어가 겹치면 급격한 프레임 스파이크가 발생합니다.
* [start_scum_server.bat](file:///d:/scum_server/start_scum_server.bat) 스크립트를 작성하여 서버 프로세스는 **CPU 0, 1, 2, 3번 코어**(물리 코어 2개 분량)만 사용하도록 고정했습니다.
* 이를 통해 게임 클라이언트와 OS는 나머지 **4~15번 코어**를 완전히 보장받아 게임 도중 버벅임 없는 쾌적한 60FPS+ 환경을 유지할 수 있습니다.

---

## 5. 네트워크 및 포트 개방 설정
서버 정상 작동 및 스팀 서버 목록 노출을 위해 다음 포트 정보가 필요합니다.

* **Main Game Port**: `7777` (UDP) — 클라이언트 게임 접속용
* **Raw UDP Port**: `7778` (UDP) — raw UDP 통신용 (Game Port + 1)
* **Steam Query Port**: `7779` (UDP) — 스팀 서버 브라우저 노출용 (Game Port + 2)
* **RCON Port**: `7777` (TCP) — 서버 원격 제어용 (선택 사항)

---

## 5. 서버 유지 관리 및 성능 최적화 전략
1. **정기적인 재시작 자동화**:
   * Unreal Engine 기반 서버 특성상 장시간 구동 시 점진적인 메모리 누수(Memory Leak)가 발생합니다. 매 12시간 주기(최소 24시간)로 서버 프로세스를 자동 재시작하도록 배치 스크립트와 윈도우 작업 스케줄러 등록을 권장합니다.
2. **데이터베이스 관리**:
   * 월드 진행 상황 및 유저 데이터 누적으로 데이터베이스(`SCUM.db`)가 불필요하게 거대해질 수 있습니다. 정기 점검 시 로그 폴더(`SaveFiles/Logs`)를 정리하고 DB 백업을 수동으로 수행하는 것이 좋습니다.
3. **가비지 컬렉션(GC) 및 스레드 튜닝 (자동 주입)**:
   * [apply_server_settings.bat](file:///d:/scum_server/apply_server_settings.bat) 실행 시 `Engine.ini` 파일에 다음 가비지 컬렉션 클러스터링 및 비동기 스레딩 인수가 자동 구성되어 끊김(hitch)을 억제합니다.
     * `gc.CreateGarbageCollectorUObjectClusters=True` (오브젝트 그룹화로 GC 부하 최소화)
     * `gc.ActorClusteringEnabled=True` (액터 클러스터링을 통한 탐색 오버헤드 감소)
     * `s.AsyncLoadingThreadEnabled=True` (비동기 스트리밍 로딩 보장)
4. **시작 실행 인수 고도화 (구동기 자동 적용)**:
   * [start_scum_server.bat](file:///d:/scum_server/start_scum_server.bat) 스크립트에 Unreal Engine의 성능 극대화 명령줄 옵션을 주입했습니다.
     * `-USEALLAVAILABLECORES` (할당된 스레드의 멀티코어 성능을 최대로 확장)
     * `-unattended` (무인 모드로 구동하여 불필요한 백그라운드 입출력 리소스 오버헤드 차단)
     * `-NoSafemode` (안전 모드를 비활성화하여 오버헤드 방지)
5. **수동 변경 시 프로세스 제어**:
   * `ServerSettings.ini` 텍스트 파일을 직접 수정할 때는 **반드시 서버를 중지한 상태**에서 변경 후 저장해야 합니다. 서버 구동 중에 파일을 직접 변경하면 적용되지 않고 롤백됩니다.

