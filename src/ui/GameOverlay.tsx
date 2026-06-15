import { useEffect, useMemo, useRef, useState, type CSSProperties, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import type { AppUser } from '../auth/types';
import { getPlayerCharacter, PLAYER_CHARACTERS, type PlayerCharacterId } from '../game/constants/playerCharacters';
import { FAKE_PRESENCE_ENTITIES, PRESENCE_STATUS_LABELS, type PresenceStatus } from '../game/constants/presence';

type PanelTab = 'users' | 'spaces';
type ChatChannel = 'space' | 'dm';
type AiTool = 'codex' | 'claude';
type BridgeStatus = 'checking' | 'connected' | 'disconnected';
type MinimapLocation = 'lobby' | 'office' | 'workroom' | 'cafe';

type ChatMessage = {
  id: number;
  channel: ChatChannel;
  author: string;
  body: string;
  time: string;
  target?: string;
};

type MeetingMessage = {
  id: number;
  author: string;
  body: string;
  time: string;
};

type BridgeHealth = {
  ok?: boolean;
  version?: string;
  mode?: string;
};

type BridgeChatResponse = {
  ok?: boolean;
  reply?: string;
  error?: string;
  mode?: string;
};

type AiWorkspaceMessage = {
  id: number;
  role: 'user' | 'assistant';
  body: string;
};

type DeskSession = {
  active: boolean;
  deskId?: string;
  workroom?: string;
};

type MeetingState = {
  mic: boolean;
  camera: boolean;
  screen: boolean;
};

type MeetingError = 'mic' | 'camera' | 'screen' | null;

const TEXT = {
  chat: '채팅',
  users: '\uD300',
  spaces: '\uACF5\uAC04',
  profile: '\uD504\uB85C\uD544',
  settings: '\uC124\uC815',
  logout: '\uB85C\uADF8\uC544\uC6C3',
  messagePlaceholder: '메시지 입력',
  send: '전송',
  status: '\uC0C1\uD0DC',
  currentSpace: '\uD604\uC7AC \uACF5\uAC04',
  members: '\uC811\uC18D\uC790',
  nickname: '\uB2C9\uB124\uC784',
  character: '\uCE90\uB9AD\uD130',
  save: '\uC800\uC7A5',
  close: '\uB2EB\uAE30',
  aiWorkspace: 'AI Workspace',
  minimap: '미니맵',
  collapse: '축소',
  expand: '확장',
  meeting: '회의',
  startMeeting: '회의하기',
  leaveMeeting: '나가기',
  dm: 'DM',
  spaceChat: '공간',
  online: '온라인',
  lobbyMembers: 'Lobby 멤버',
  quickActions: '빠른 실행',
};

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, channel: 'space', author: 'Mina', body: '로비 UX 개선 방향 확인 중입니다.', time: '10:32' },
  { id: 2, channel: 'space', author: 'Benny', body: '상점 기능은 작은 워룸에서 먼저 검증할게요.', time: '10:47' },
  { id: 3, channel: 'dm', target: 'Mina', author: 'Mina', body: '잠깐 DM으로 확인할 내용이 있어요.', time: '10:51' },
];

const SPACES = [
  { name: 'Lobby', detail: 'Public entrance' },
  { name: 'Office', detail: '문제 기반 워룸 목록' },
  { name: '포코머지 상점 기능', detail: '집중중' },
  { name: 'Addressables 최적화', detail: '작업중' },
  { name: 'AI Workspace 설계', detail: '자리비움' },
];

const MINIMAP_SPACES: Array<{ id: MinimapLocation; label: string; x: number; y: number }> = [
  { id: 'lobby', label: 'Lobby', x: 18, y: 68 },
  { id: 'office', label: 'Office', x: 52, y: 34 },
  { id: 'workroom', label: 'Workroom', x: 78, y: 60 },
  { id: 'cafe', label: 'Cafe', x: 36, y: 78 },
];

function stopStream(stream: MediaStream | null) {
  stream?.getTracks().forEach((track) => track.stop());
}

type GameOverlayProps = {
  user: AppUser;
};

export function GameOverlay({ user }: GameOverlayProps) {
  const { logout, updateGuestProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<PanelTab>('users');
  const [activeChat, setActiveChat] = useState<ChatChannel>('space');
  const [isPanelCollapsed, setIsPanelCollapsed] = useState(false);
  const [isMinimapCollapsed, setIsMinimapCollapsed] = useState(false);
  const [isChatCollapsed, setIsChatCollapsed] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isMeetingOpen, setIsMeetingOpen] = useState(false);
  const [selectedDmName, setSelectedDmName] = useState('Mina');
  const [status, setStatus] = useState<PresenceStatus>('working');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [meetingMessages, setMeetingMessages] = useState<MeetingMessage[]>([
    { id: 1, author: 'System', body: '회의 채팅이 시작되었습니다.', time: '10:55' },
  ]);
  const [messageText, setMessageText] = useState('');
  const [meetingMessageText, setMeetingMessageText] = useState('');
  const [profileName, setProfileName] = useState(user.displayName);
  const [profileCharacterId, setProfileCharacterId] = useState<PlayerCharacterId>(user.characterId);
  const [deskSession, setDeskSession] = useState<DeskSession>({ active: false });
  const [aiTool, setAiTool] = useState<AiTool>('codex');
  const [aiInput, setAiInput] = useState('');
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>('checking');
  const [bridgeVersion, setBridgeVersion] = useState('');
  const [bridgeMode, setBridgeMode] = useState('');
  const [isAiWaiting, setIsAiWaiting] = useState(false);
  const [meetingState, setMeetingState] = useState<MeetingState>({ mic: false, camera: false, screen: false });
  const [meetingError, setMeetingError] = useState<MeetingError>(null);
  const [aiMessages, setAiMessages] = useState<AiWorkspaceMessage[]>([
    {
      id: 1,
      role: 'assistant',
      body: '언제든 AI 작업을 시작할 수 있습니다. 책상에 앉으면 워룸 컨텍스트가 함께 표시됩니다.',
    },
  ]);
  const selectedCharacter = getPlayerCharacter(user.characterId);
  const micStreamRef = useRef<MediaStream | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const handleDeskSession = (event: Event) => {
      const detail = (event as CustomEvent<DeskSession>).detail;
      setDeskSession(detail);
    };

    window.addEventListener('remote-tree-node:desk-session', handleDeskSession);

    return () => {
      window.removeEventListener('remote-tree-node:desk-session', handleDeskSession);
    };
  }, []);

  useEffect(
    () => () => {
      stopStream(micStreamRef.current);
      stopStream(cameraStreamRef.current);
      stopStream(screenStreamRef.current);
    },
    [],
  );

  useEffect(() => {
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = cameraStreamRef.current;
    }
  }, [meetingState.camera]);

  useEffect(() => {
    if (screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStreamRef.current;
    }
  }, [meetingState.screen]);

  useEffect(() => {
    if (!isAiOpen) {
      return;
    }

    let isActive = true;

    const checkBridge = async () => {
      setBridgeStatus('checking');

      try {
        const response = await fetch('http://127.0.0.1:8787/health', {
          cache: 'no-store',
          signal: AbortSignal.timeout(1200),
        });
        const health = (await response.json()) as BridgeHealth;

        if (!isActive) {
          return;
        }

        setBridgeStatus(response.ok && health.ok !== false ? 'connected' : 'disconnected');
        setBridgeVersion(health.version ?? '');
        setBridgeMode(health.mode ?? '');
      } catch {
        if (isActive) {
          setBridgeStatus('disconnected');
          setBridgeVersion('');
          setBridgeMode('');
        }
      }
    };

    void checkBridge();
    const intervalId = window.setInterval(checkBridge, 5000);

    return () => {
      isActive = false;
      window.clearInterval(intervalId);
    };
  }, [isAiOpen]);

  const users = useMemo(
    () => [
      {
        name: user.displayName,
        status,
        characterId: user.characterId,
        task: '현재 공간 탐색',
        location: 'lobby' as MinimapLocation,
        isCurrentUser: true,
      },
      ...FAKE_PRESENCE_ENTITIES.map((entity) => ({
        name: entity.displayName,
        status: entity.status,
        characterId: entity.characterId,
        task: entity.currentTask,
        location: entity.location === 'workroom' ? 'workroom' : entity.location,
        isCurrentUser: false,
      })),
    ],
    [status, user.characterId, user.displayName],
  );

  const visibleUsers = useMemo(
    () =>
      users.map((member) => ({
        ...member,
        detail: member.task ?? '',
      })),
    [users],
  );

  const minimapMembers = useMemo(
    () =>
      users.map((member) => ({
        name: member.name,
        status: member.status,
        location: member.location,
        isCurrentUser: member.isCurrentUser,
      })),
    [users],
  );

  const lobbyUsers = visibleUsers.filter((member) => member.location === 'lobby');
  const activeSpaceCount = lobbyUsers.length;
  const canStartMeeting = activeSpaceCount >= 2;
  const filteredMessages = messages.filter((message) => {
    if (activeChat === 'dm') {
      return message.channel === 'dm' && message.target === selectedDmName;
    }

    return message.channel === activeChat;
  });

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = messageText.trim();

    if (!body) {
      return;
    }

    const message: ChatMessage = {
      id: Date.now(),
      author: user.displayName,
      channel: activeChat,
      target: activeChat === 'dm' ? selectedDmName : undefined,
      body,
      time: new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date()),
    };

    setMessages((currentMessages) => [...currentMessages, message]);

    if (activeChat === 'space') {
      window.dispatchEvent(new CustomEvent('remote-tree-node:local-chat', { detail: { body } }));
    }

    setMessageText('');
  };

  const handleOpenProfile = () => {
    setProfileName(user.displayName);
    setProfileCharacterId(user.characterId);
    setIsProfileOpen(true);
  };

  const handleSaveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!profileName.trim()) {
      return;
    }

    updateGuestProfile({
      displayName: profileName,
      characterId: profileCharacterId,
    });
    setIsProfileOpen(false);
  };

  const handleOpenDm = (memberName: string) => {
    if (memberName === user.displayName) {
      return;
    }

    setSelectedDmName(memberName);
    setActiveChat('dm');
    setIsChatCollapsed(false);
  };

  const handleOpenMeeting = () => {
    if (!canStartMeeting) {
      return;
    }

    setIsMeetingOpen(true);
  };

  const handleSendMeetingMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = meetingMessageText.trim();

    if (!body) {
      return;
    }

    setMeetingMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        author: user.displayName,
        body,
        time: new Intl.DateTimeFormat('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).format(new Date()),
      },
    ]);
    setMeetingMessageText('');
  };

  const handleToggleMic = async () => {
    setMeetingError(null);

    if (meetingState.mic) {
      stopStream(micStreamRef.current);
      micStreamRef.current = null;
      setMeetingState((current) => ({ ...current, mic: false }));
      return;
    }

    try {
      micStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      setMeetingState((current) => ({ ...current, mic: true }));
    } catch {
      setMeetingError('mic');
    }
  };

  const handleToggleCamera = async () => {
    setMeetingError(null);

    if (meetingState.camera) {
      stopStream(cameraStreamRef.current);
      cameraStreamRef.current = null;
      setMeetingState((current) => ({ ...current, camera: false }));
      return;
    }

    try {
      cameraStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: false, video: true });
      setMeetingState((current) => ({ ...current, camera: true }));
    } catch {
      setMeetingError('camera');
    }
  };

  const handleToggleScreen = async () => {
    setMeetingError(null);

    if (meetingState.screen) {
      stopStream(screenStreamRef.current);
      screenStreamRef.current = null;
      setMeetingState((current) => ({ ...current, screen: false }));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ audio: true, video: true });
      stream.getVideoTracks()[0]?.addEventListener('ended', () => {
        screenStreamRef.current = null;
        setMeetingState((current) => ({ ...current, screen: false }));
      });
      screenStreamRef.current = stream;
      setMeetingState((current) => ({ ...current, screen: true }));
    } catch {
      setMeetingError('screen');
    }
  };

  const handleSendAiMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = aiInput.trim();

    if (!body || isAiWaiting) {
      return;
    }

    const userMessage: AiWorkspaceMessage = {
      id: Date.now(),
      role: 'user',
      body,
    };
    setAiMessages((currentMessages) => [...currentMessages, userMessage]);
    setAiInput('');
    setIsAiWaiting(true);

    try {
      if (bridgeStatus !== 'connected') {
        throw new Error('로컬 브리지가 연결되지 않았습니다.');
      }

      const response = await fetch('http://127.0.0.1:8787/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tool: aiTool,
          prompt: body,
          workroom: deskSession.workroom,
        }),
        signal: AbortSignal.timeout(60_000),
      });
      const result = (await response.json()) as BridgeChatResponse;

      if (!response.ok || result.ok === false) {
        throw new Error(result.error || '로컬 브리지 요청에 실패했습니다.');
      }

      setAiMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: 'assistant',
          body: result.reply ?? '응답이 비어 있습니다.',
        },
      ]);
    } catch (error) {
      setAiMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now() + 1,
          role: 'assistant',
          body:
            error instanceof Error
              ? `[${aiTool === 'codex' ? 'Codex' : 'Claude'}] ${error.message}`
              : '알 수 없는 로컬 브리지 오류가 발생했습니다.',
        },
      ]);
    } finally {
      setIsAiWaiting(false);
    }
  };

  return (
    <>
      <aside className="side-panel" data-collapsed={isPanelCollapsed} aria-label="workspace panel">
        <div className="panel-toolbar">
          <div className="panel-tabs">
            <button type="button" data-active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
              {TEXT.users}
            </button>
            <button type="button" data-active={activeTab === 'spaces'} onClick={() => setActiveTab('spaces')}>
              {TEXT.spaces}
            </button>
          </div>
          <button
            className="panel-collapse-button"
            type="button"
            aria-expanded={!isPanelCollapsed}
            onClick={() => setIsPanelCollapsed((current) => !current)}
          >
            {isPanelCollapsed ? TEXT.expand : TEXT.collapse}
          </button>
        </div>

        {!isPanelCollapsed && activeTab === 'users' && (
          <section className="panel-section">
            <div className="panel-heading">
              <div>
                <h2>{TEXT.members}</h2>
                <p>{TEXT.online}</p>
              </div>
              <span>{visibleUsers.length}</span>
            </div>
            <div className="member-list">
              {visibleUsers.map((member) => {
                const character = getPlayerCharacter(member.characterId);

                return (
                  <article className="member-item" key={member.name}>
                    <img src={character.imagePath} alt="" />
                    <div>
                      <strong>{member.name}</strong>
                      <span data-status={member.status}>{PRESENCE_STATUS_LABELS[member.status]}</span>
                      <small>{member.detail}</small>
                    </div>
                    {!member.isCurrentUser && (
                      <button type="button" onClick={() => handleOpenDm(member.name)}>
                        {TEXT.dm}
                      </button>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {!isPanelCollapsed && activeTab === 'spaces' && (
          <section className="panel-section">
            <div className="panel-heading">
              <div>
                <h2>{TEXT.spaces}</h2>
                <p>{TEXT.currentSpace}</p>
              </div>
              <span>Lobby</span>
            </div>
            <div className="space-list">
              {SPACES.map((space) => (
                <button className="space-item" type="button" key={space.name}>
                  <strong>{space.name}</strong>
                  <span>{space.detail}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </aside>

      <section className="minimap-hud" data-collapsed={isMinimapCollapsed} aria-label="minimap">
        <div className="minimap-header">
          <h2>{TEXT.minimap}</h2>
          <button type="button" onClick={() => setIsMinimapCollapsed((current) => !current)}>
            {isMinimapCollapsed ? TEXT.expand : TEXT.collapse}
          </button>
        </div>
        {!isMinimapCollapsed && (
          <>
            <div className="minimap-summary">{TEXT.lobbyMembers} {activeSpaceCount}</div>
            <div className="minimap-map">
              <div className="minimap-route minimap-route-a" />
              <div className="minimap-route minimap-route-b" />
              {MINIMAP_SPACES.map((space) => (
                <button
                  className="minimap-node"
                  data-current={space.id === 'lobby'}
                  type="button"
                  key={space.id}
                  style={{ '--map-x': `${space.x}%`, '--map-y': `${space.y}%` } as CSSProperties}
                >
                  <span>{space.label}</span>
                </button>
              ))}
              {minimapMembers.map((member, index) => {
                const space = MINIMAP_SPACES.find((candidate) => candidate.id === member.location) ?? MINIMAP_SPACES[0];
                const offsetX = ((index % 3) - 1) * 4;
                const offsetY = (Math.floor(index / 3) % 2) * 5 - 2;

                return (
                  <span
                    className="minimap-presence"
                    data-status={member.status}
                    data-current={member.isCurrentUser}
                    title={member.name}
                    key={member.name}
                    style={{ '--map-x': `${space.x + offsetX}%`, '--map-y': `${space.y + offsetY}%` } as CSSProperties}
                  />
                );
              })}
            </div>
          </>
        )}
      </section>

      <section className="chat-dock" data-collapsed={isChatCollapsed} aria-label="chat">
        <div className="chat-dock-header">
          <button type="button" onClick={() => setIsChatCollapsed((current) => !current)}>
            {isChatCollapsed ? '+' : '-'}
          </button>
        </div>
        {!isChatCollapsed && (
          <>
            <div className="chat-tabs">
              <button type="button" data-active={activeChat === 'space'} onClick={() => setActiveChat('space')}>
                {TEXT.spaceChat}
              </button>
              <button type="button" data-active={activeChat === 'dm'} onClick={() => setActiveChat('dm')}>
                {TEXT.dm}
              </button>
            </div>
            {activeChat === 'dm' && (
              <label className="chat-target-select">
                <span>상대</span>
                <select value={selectedDmName} onChange={(event) => setSelectedDmName(event.target.value)}>
                  {visibleUsers
                    .filter((member) => !member.isCurrentUser)
                    .map((member) => (
                      <option value={member.name} key={member.name}>
                        {member.name}
                      </option>
                    ))}
                </select>
              </label>
            )}
            <div className="message-list">
              {filteredMessages.map((message) => (
                <article className="message-item" key={message.id}>
                  <time>{message.time}</time>
                  <p>
                    <strong>{message.author}: </strong>
                    {message.body}
                  </p>
                </article>
              ))}
              {filteredMessages.length === 0 && <div className="empty-state">아직 메시지가 없습니다.</div>}
            </div>
            <form className="message-form" onSubmit={handleSendMessage}>
              <input value={messageText} placeholder={TEXT.messagePlaceholder} onChange={(event) => setMessageText(event.target.value)} />
              <button type="submit">{TEXT.send}</button>
            </form>
          </>
        )}
      </section>

      <div className="status-hud">
        <button className="profile-chip" type="button" onClick={handleOpenProfile}>
          <img src={selectedCharacter.imagePath} alt="" />
          <span>
            <strong>{user.displayName}</strong>
            <small>Lobby</small>
          </span>
        </button>
        <label className="status-select">
          <span>{TEXT.status}</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as PresenceStatus)}>
            {Object.entries(PRESENCE_STATUS_LABELS).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav className="bottom-bar" aria-label={TEXT.quickActions}>
        <button type="button" onClick={() => setIsChatCollapsed((current) => !current)}>
          {isChatCollapsed ? '+' : '-'}
        </button>
        <button type="button" onClick={() => setIsAiOpen((current) => !current)}>
          AI
        </button>
        <button type="button" disabled={!canStartMeeting} onClick={handleOpenMeeting}>
          {TEXT.startMeeting}
        </button>
        <button type="button" onClick={() => setIsPanelCollapsed((current) => !current)}>
          {isPanelCollapsed ? TEXT.expand : TEXT.users}
        </button>
        <button type="button" onClick={handleOpenProfile}>
          {TEXT.settings}
        </button>
      </nav>

      {isAiOpen && (
        <section className="ai-workspace" aria-label="ai workspace">
          <div className="ai-workspace-header">
            <div>
              <h2>{TEXT.aiWorkspace}</h2>
              <span>{deskSession.active ? deskSession.workroom ?? 'Workroom' : '일반 AI 작업'}</span>
            </div>
            <button type="button" onClick={() => setIsAiOpen(false)}>
              {TEXT.close}
            </button>
            <select value={aiTool} onChange={(event) => setAiTool(event.target.value as AiTool)}>
              <option value="codex">Codex</option>
              <option value="claude">Claude</option>
            </select>
          </div>
          <div className="bridge-status" data-status={bridgeStatus}>
            <span>{bridgeStatus === 'connected' ? '로컬 브리지 연결됨' : bridgeStatus === 'checking' ? '로컬 브리지 확인중' : '로컬 브리지 미연결'}</span>
            <small>
              {bridgeStatus === 'connected'
                ? [bridgeVersion, bridgeMode].filter(Boolean).join(' · ') || '127.0.0.1:8787'
                : '127.0.0.1:8787/health'}
            </small>
          </div>
          <div className="ai-message-list">
            {aiMessages.map((message) => (
              <article className="ai-message" data-role={message.role} key={message.id}>
                {message.body}
              </article>
            ))}
          </div>
          <form className="ai-message-form" onSubmit={handleSendAiMessage}>
            <input value={aiInput} placeholder="AI에게 요청 입력" onChange={(event) => setAiInput(event.target.value)} />
            <button type="submit" disabled={isAiWaiting}>
              {isAiWaiting ? '대기' : '전송'}
            </button>
          </form>
        </section>
      )}

      {isMeetingOpen && (
        <section className="meeting-panel" aria-label="meeting">
          <div className="meeting-header">
            <div>
              <h2>{TEXT.meeting}</h2>
              <span>{lobbyUsers.map((member) => member.name).join(', ')}</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setIsMeetingOpen(false);
              }}
            >
              {TEXT.leaveMeeting}
            </button>
          </div>
          <div className="meeting-coming-soon">
            멀티유저 음성/화상 송수신은 Coming soon입니다. 현재는 내 마이크, 카메라, 화면 공유 미리보기만 지원합니다.
          </div>
          <div className="meeting-stage">
            <div className="meeting-video-grid">
              {lobbyUsers.map((member) => (
                <article className="meeting-tile" key={member.name}>
                  {member.isCurrentUser && meetingState.camera ? (
                    <video ref={cameraVideoRef} autoPlay muted playsInline />
                  ) : (
                    <strong>{member.name}</strong>
                  )}
                  <span>
                    {member.isCurrentUser
                      ? [meetingState.mic ? '음성 켜짐' : '음성 꺼짐', meetingState.camera ? '화상 켜짐' : '화상 꺼짐'].join(' · ')
                      : '대기중'}
                  </span>
                </article>
              ))}
              {meetingState.screen && (
                <article className="meeting-tile meeting-tile-wide">
                  <video ref={screenVideoRef} autoPlay muted playsInline />
                  <span>내 화면 공유중</span>
                </article>
              )}
            </div>
            <section className="meeting-chat" aria-label="meeting chat">
              <h3>회의 채팅</h3>
              <div className="meeting-message-list">
                {meetingMessages.map((message) => (
                  <article className="message-item" key={message.id}>
                    <time>{message.time}</time>
                    <p>
                      <strong>{message.author}: </strong>
                      {message.body}
                    </p>
                  </article>
                ))}
              </div>
              <form className="meeting-message-form" onSubmit={handleSendMeetingMessage}>
                <input value={meetingMessageText} placeholder="회의 메시지 입력" onChange={(event) => setMeetingMessageText(event.target.value)} />
                <button type="submit">{TEXT.send}</button>
              </form>
            </section>
          </div>
          {meetingError && (
            <div className="meeting-error">
              {meetingError === 'mic' && '마이크 권한을 사용할 수 없습니다.'}
              {meetingError === 'camera' && '카메라 권한을 사용할 수 없습니다.'}
              {meetingError === 'screen' && '화면 공유를 시작할 수 없습니다.'}
            </div>
          )}
          <div className="meeting-controls">
            <button type="button" data-active={meetingState.mic} onClick={handleToggleMic}>
              음성 미리보기
            </button>
            <button
              type="button"
              data-active={meetingState.camera}
              onClick={handleToggleCamera}
            >
              화상 미리보기
            </button>
            <button
              type="button"
              data-active={meetingState.screen}
              onClick={handleToggleScreen}
            >
              화면 공유 미리보기
            </button>
          </div>
        </section>
      )}

      {isProfileOpen && (
        <div className="modal-backdrop" role="presentation">
          <form className="profile-modal" onSubmit={handleSaveProfile}>
            <div className="modal-heading">
              <h2>{TEXT.profile}</h2>
              <button type="button" onClick={() => setIsProfileOpen(false)}>
                {TEXT.close}
              </button>
            </div>
            <label className="entry-field">
              <span>{TEXT.nickname}</span>
              <input maxLength={16} value={profileName} onChange={(event) => setProfileName(event.target.value)} />
            </label>
            <fieldset className="character-picker">
              <legend>{TEXT.character}</legend>
              <div className="character-options">
                {PLAYER_CHARACTERS.map((character) => (
                  <label className="character-option" data-selected={character.id === profileCharacterId} key={character.id}>
                    <input
                      type="radio"
                      name="profile-character"
                      value={character.id}
                      checked={character.id === profileCharacterId}
                      onChange={() => setProfileCharacterId(character.id)}
                    />
                    <img src={character.imagePath} alt="" />
                    <span>{character.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="modal-actions">
              <button type="button" onClick={logout}>
                {TEXT.logout}
              </button>
              <button type="submit" disabled={!profileName.trim()}>
                {TEXT.save}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
