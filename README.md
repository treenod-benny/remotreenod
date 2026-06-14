# RemoteTreeNode Lobby Prototype

RemoteTreeNode의 첫 번째 프로토타입 로비 씬입니다. React, TypeScript, Phaser 3, Vite로 구성되어 있으며 회사 입구 느낌의 2D 횡스크롤 웹 로비를 제공합니다.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 아래 주소로 접속합니다.

```text
http://localhost:5173
```

## 조작

- 이동: 방향키 또는 WASD
- 상호작용: E

## 구현 범위

- Phaser 기반 `LobbyScene`
- 배경 Parallax 레이어
- 임시 플레이어 스프라이트
- 카메라 추적 및 월드 경계 제한
- Office, Cafe 포탈 2개
- 포탈/NPC 거리 기반 상호작용
- 나무 NPC 대화창
- Phaser Text 기반 UI

## 에셋 위치

로비 에셋은 아래 경로를 사용합니다.

```text
public/assets/lobby/
```

## Layout Editor

Lobby, Office, TeamSpace 오브젝트와 충돌 박스를 직접 조정하려면 개발 서버를 편집 모드로 실행합니다.

```powershell
$env:VITE_LAYOUT_EDITOR='true'
npm run dev
```

또는 실행 중인 개발 서버 주소에 `?editor=1`을 붙여도 됩니다.

```text
http://localhost:5177?editor=1
```

편집 모드에서는 각 씬에 편집용 표시가 나타납니다.

- 청록 박스: 이미지 오브젝트
- 빨간 박스: 충돌 박스
- 노란 테두리: 현재 선택한 항목

- 마우스 드래그: 오브젝트 또는 충돌 박스 이동
- 방향키: 선택한 항목 1px 이동
- 이미지 선택 후 `Q` / `E`: 크기 축소 / 확대
- 이미지 선택 후 `F`: 좌우반전
- 충돌 박스 선택 후 `J` / `L`: 너비 축소 / 확대
- 충돌 박스 선택 후 `K` / `I`: 높이 축소 / 확대
- `R`: 선택한 항목 복제
- `Delete` 또는 `Backspace`: 선택한 항목 삭제
- `P`: 에셋 팔레트 열기/닫기
- 팔레트 열린 상태에서 `N` / `B`: 다음 / 이전 에셋 선택
- 팔레트 열린 상태에서 `A`: 선택한 에셋을 현재 카메라 중앙에 추가
- `C`: 현재 씬 배치를 JSON으로 콘솔 출력 및 클립보드 복사

일반 플레이 확인은 `VITE_LAYOUT_EDITOR`를 끄고 다시 실행합니다.
