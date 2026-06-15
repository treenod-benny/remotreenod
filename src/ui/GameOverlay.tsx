import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import type { AppUser } from '../auth/types';
import { getPlayerCharacter, PLAYER_CHARACTERS, type PlayerCharacterId } from '../game/constants/playerCharacters';
import { FAKE_PRESENCE_ENTITIES, PRESENCE_STATUS_LABELS, type PresenceStatus } from '../game/constants/presence';

type PanelTab = 'users' | 'spaces';
type ThoughtKind = 'question' | 'ai-suggestion' | 'adopted' | 'rejected' | 'issue' | 'resolved' | 'decision';

type ThoughtEvent = {
  id: number;
  author: string;
  kind: ThoughtKind;
  body: string;
  time: string;
};

type AiTool = 'codex' | 'claude';
type BridgeStatus = 'checking' | 'connected' | 'disconnected';

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

const TEXT = {
  chat: '사고흐름',
  users: '\uC720\uC800',
  spaces: '\uACF5\uAC04',
  profile: '\uD504\uB85C\uD544',
  settings: '\uC124\uC815',
  logout: '\uB85C\uADF8\uC544\uC6C3',
  messagePlaceholder: '공유할 사고 흐름 입력',
  send: '공유',
  status: '\uC0C1\uD0DC',
  currentSpace: '\uD604\uC7AC \uACF5\uAC04',
  members: '\uC811\uC18D\uC790',
  nickname: '\uB2C9\uB124\uC784',
  character: '\uCE90\uB9AD\uD130',
  save: '\uC800\uC7A5',
  close: '\uB2EB\uAE30',
  aiWorkspace: 'AI Workspace',
};

const THOUGHT_KIND_LABELS: Record<ThoughtKind, string> = {
  question: '질문',
  'ai-suggestion': 'AI 제안',
  adopted: '채택',
  rejected: '거절',
  issue: '문제 발생',
  resolved: '문제 해결',
  decision: '의사결정',
};

const MOCK_THOUGHTS: ThoughtEvent[] = [
  { id: 1, author: 'Mina', kind: 'question', body: 'Addressables 캐싱 정책을 어느 레이어에 둘지 확인 중', time: '10:32' },
  { id: 2, author: 'Claude', kind: 'ai-suggestion', body: '번들 단위 캐시 무효화 전략 제안', time: '10:41' },
  { id: 3, author: 'Benny', kind: 'adopted', body: '상점 기능은 작은 워룸에서 먼저 검증', time: '10:47' },
];

const SPACES = [
  { name: 'Lobby', detail: 'Public entrance' },
  { name: 'Office', detail: '문제 기반 워룸 목록' },
  { name: '포코머지 상점 기능', detail: '집중중' },
  { name: 'Addressables 최적화', detail: '작업중' },
  { name: 'AI Workspace 설계', detail: '자리비움' },
];

type GameOverlayProps = {
  user: AppUser;
};

export function GameOverlay({ user }: GameOverlayProps) {
  const { logout, updateGuestProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<PanelTab>('users');
  const [status, setStatus] = useState<PresenceStatus>('working');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [thoughts, setThoughts] = useState<ThoughtEvent[]>(MOCK_THOUGHTS);
  const [messageText, setMessageText] = useState('');
  const [thoughtKind, setThoughtKind] = useState<ThoughtKind>('question');
  const [profileName, setProfileName] = useState(user.displayName);
  const [profileCharacterId, setProfileCharacterId] = useState<PlayerCharacterId>(user.characterId);
  const [deskSession, setDeskSession] = useState<DeskSession>({ active: false });
  const [aiTool, setAiTool] = useState<AiTool>('codex');
  const [aiInput, setAiInput] = useState('');
  const [bridgeStatus, setBridgeStatus] = useState<BridgeStatus>('checking');
  const [bridgeVersion, setBridgeVersion] = useState('');
  const [bridgeMode, setBridgeMode] = useState('');
  const [isAiWaiting, setIsAiWaiting] = useState(false);
  const [aiMessages, setAiMessages] = useState<AiWorkspaceMessage[]>([
    {
      id: 1,
      role: 'assistant',
      body: '책상에 앉았습니다. 지금은 로컬 브리지 연결 전 mock 응답 모드입니다.',
    },
  ]);
  const selectedCharacter = getPlayerCharacter(user.characterId);

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

  useEffect(() => {
    if (!deskSession.active) {
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
  }, [deskSession.active]);

  const users = useMemo(
    () => [
      {
        name: user.displayName,
        status,
        characterId: user.characterId,
        task: '현재 공간 탐색',
      },
      ...FAKE_PRESENCE_ENTITIES.map((entity) => ({
        name: entity.displayName,
        status: entity.status,
        characterId: entity.characterId,
        task: entity.currentTask,
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

  const handleSendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = messageText.trim();

    if (!body) {
      return;
    }

    const message = {
      id: Date.now(),
      author: user.displayName,
      kind: thoughtKind,
      body,
      time: new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date()),
    };

    setThoughts((currentThoughts) => [...currentThoughts, message]);
    window.dispatchEvent(new CustomEvent('remote-tree-node:local-chat', { detail: { body } }));
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
      <aside className="side-panel" aria-label="workspace panel">
        <div className="panel-tabs">
          <button type="button" data-active={activeTab === 'users'} onClick={() => setActiveTab('users')}>
            {TEXT.users}
          </button>
          <button type="button" data-active={activeTab === 'spaces'} onClick={() => setActiveTab('spaces')}>
            {TEXT.spaces}
          </button>
        </div>

        {activeTab === 'users' && (
          <section className="panel-section">
            <div className="panel-heading">
              <h2>{TEXT.members}</h2>
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
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'spaces' && (
          <section className="panel-section">
            <div className="panel-heading">
              <h2>{TEXT.spaces}</h2>
              <span>{TEXT.currentSpace}: Lobby</span>
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

      <section className="chat-dock" aria-label="chat">
        <div className="chat-dock-header">
          <h2>{TEXT.chat}</h2>
          <span>{thoughts.length}</span>
        </div>
        <div className="message-list">
          {thoughts.map((message) => (
            <article className="message-item" key={message.id}>
              <time>{message.time}</time>
              <p>
                <strong>{THOUGHT_KIND_LABELS[message.kind]} · {message.author}: </strong>
                {message.body}
              </p>
            </article>
          ))}
        </div>
        <form className="message-form" onSubmit={handleSendMessage}>
          <select value={thoughtKind} onChange={(event) => setThoughtKind(event.target.value as ThoughtKind)}>
            {Object.entries(THOUGHT_KIND_LABELS).map(([value, label]) => (
              <option value={value} key={value}>
                {label}
              </option>
            ))}
          </select>
          <input value={messageText} placeholder={TEXT.messagePlaceholder} onChange={(event) => setMessageText(event.target.value)} />
          <button type="submit">{TEXT.send}</button>
        </form>
      </section>

      <div className="status-hud">
        <button className="profile-chip" type="button" onClick={handleOpenProfile}>
          <img src={selectedCharacter.imagePath} alt="" />
          <span>{user.displayName}</span>
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

      <nav className="bottom-bar" aria-label="quick actions">
        <button type="button" onClick={() => document.querySelector<HTMLInputElement>('.chat-dock input')?.focus()}>
          {TEXT.chat}
        </button>
        <button type="button" onClick={handleOpenProfile}>
          {TEXT.settings}
        </button>
      </nav>

      {deskSession.active && (
        <section className="ai-workspace" aria-label="ai workspace">
          <div className="ai-workspace-header">
            <div>
              <h2>{TEXT.aiWorkspace}</h2>
              <span>{deskSession.workroom ?? 'Workroom'}</span>
            </div>
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
