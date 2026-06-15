# RemoteTreeNode

## 슬로건

출근은 선택

AI와 일하지만, 사람과 연결되는 공간

---

# 프로젝트 개요

RemoteTreeNode는 AI 시대에 출근의 의미를 다시 정의하기 위한 웹 기반 가상 오피스 플랫폼이다.

AI와 협업하는 시간이 늘어나면서 물리적 사무실의 필요성은 줄어들고 있다.

하지만 사무실이 제공하던 사회적 기능은 여전히 가치가 있다.

RemoteTreeNode는 AI 시대에 사라진 다음 경험을 복원한다.

* 존재감
* 우연한 만남
* 사고 과정 공유
* 자연스러운 소통
* AI 협업 학습

---

# 핵심 철학

## 출근은 선택

출근은 의무가 아니다.

중요한 것은 같은 건물에 있는 것이 아니라 같은 문제를 해결하는 것이다.

---

## Not a Game

RemoteTreeNode는 게임이 아니다.

제외

* 경험치
* 레벨
* 퀘스트
* 몬스터
* 전투
* 파밍
* 경쟁

포함

* 공간
* 사람
* AI
* 사고흐름
* 협업

---

## AI First

AI는 업무 도구가 아니라 협업 파트너다.

RemoteTreeNode는 AI와 협업하는 과정을 공유할 수 있도록 설계한다.

---

# 아트 방향

스타일

* MapleStory Classic
* 2D Side Scrolling
* Warm
* Cozy
* Bright
* Minimal

금지

* Isometric
* 3D
* 과한 판타지
* 거대한 월드트리
* 복잡한 건물

---

# 공간 구조

## 1. 로비

회사 입구

구성

* 사무공간 포탈
* 회의공간 포탈
* 나무 NPC
* 공지 게시판

배경

* 부산 바다
* 광안대교
* 부산 스카이라인

역할

* 첫 접속
* 공지 확인
* 우연한 만남
* 공간 이동

---

## 2. 사무공간

문제 정의 기반 워룸 목록

중요

사무공간은 팀 구조를 기준으로 구성하지 않는다.

RemoteTreeNode는 조직보다 문제를 중심으로 연결된다.

예시

* 출근은선택
* AI 협업 공유
* 포코머지 상점 기능
* Addressables 최적화
* 로비 UX 개선
* AI Workspace 설계

사용자는 자신이 관심 있는 문제 공간으로 이동한다.

---

## 3. 워룸

실제 업무 공간

구성

* 사용자
* 상태
* 사고흐름

표시 정보

예시

Benny

현재 작업
포코머지 상점 기능

AI
Claude

상태
집중중

---

## 4. 회의공간

회의 전용 공간

회의가 없을 경우

* 새 회의 생성 포탈

회의 생성 시

* 진행중인 회의 포탈
* 새 회의 생성 포탈

동시에 존재

회의 종료 시 자동 제거

예시

포코머지 상점 기능
현재 4명

Addressables 최적화
현재 2명

---

# MVP 전략

초기 버전에서는 실제 멀티플레이어를 구현하지 않는다.

대신 Fake Presence 기반으로 구현한다.

목표는 공간 경험 검증이다.

---

# Fake Presence System

플레이어

* 1명

NPC

* 여러 명

실제 회사 사람들이 접속해 있는 것처럼 보인다.

---

## Fake User 데이터

* 이름
* 현재 작업
* 상태
* AI
* 위치
* 행동 패턴

---

## 상태

working

ai-working

meeting

focus

afk

---

## 행동

idle

walk

look-around

sleep

---

# Presence Entity

실제 멀티플레이어 확장을 고려하여 설계

```ts
type PresenceEntity = {
  id: string;
  displayName: string;
  entityType: "player" | "fake-user" | "remote-user";
  currentTask?: string;
  aiTool?: string;
  status: PresenceStatus;
  x: number;
  y: number;
};
```

초기에는

fake-user

만 사용

나중에

remote-user

추가

---

# Thought Stream

RemoteTreeNode 핵심 기능

목적

코드 공유가 아니라 사고 공유

---

공유 항목

* 질문
* AI 제안
* 채택
* 거절
* 문제 발생
* 문제 해결
* 의사결정

예시

10:32

Addressables 질문

10:41

캐싱 전략 제안

10:47

제안 채택

11:02

구현 완료

---

# AI Companion

사용자가 사용하는 AI 표시

예시

* GPT
* Claude
* Gemini

캐릭터 옆에 표시

---

# AI Workspace

장기 목표

AI와 직접 작업하는 공간

기능

* AI 채팅
* 코드 생성
* 설계 검토
* 문서 생성

---

# NPC

현재

나무 NPC

역할

* 가이드
* 공지
* 회사 소개
* AI 도우미

크기

메이플스토리 NPC 수준

---

# 구현 단계

## Phase 1

Lobby MVP

* 로비
* 플레이어 이동
* 포탈
* 나무 NPC
* Fake Presence

---

## Phase 2

Office Space

* 사무공간
* 워룸
* 상태 표시

---

## Phase 3

Meeting Space

* 회의 생성
* 회의 포탈
* 회의 참가

---

## Phase 4

Thought Stream

* 타임라인
* 공개 설정
* 활동 피드

---

## Phase 5

AI Workspace

* AI 채팅
* AI Agent
* AI 공유

---

# 현재 목표

현재 목표

Lobby MVP 구현

다음 목표

사무공간 아트 제작

최종 목표

AI 시대의 새로운 출근 경험을 만든다.
