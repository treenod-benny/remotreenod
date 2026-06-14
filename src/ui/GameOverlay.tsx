import { useMemo, useState, type FormEvent } from 'react';
import { useAuth } from '../auth/AuthProvider';
import type { AppUser } from '../auth/types';
import { getPlayerCharacter, PLAYER_CHARACTERS, type PlayerCharacterId } from '../game/constants/playerCharacters';

type PanelTab = 'users' | 'spaces';
type UserStatus = 'online' | 'away' | 'focus' | 'meeting';

type ChatMessage = {
  id: number;
  author: string;
  body: string;
  time: string;
};

const TEXT = {
  chat: '\uCC44\uD305',
  users: '\uC720\uC800',
  spaces: '\uACF5\uAC04',
  profile: '\uD504\uB85C\uD544',
  settings: '\uC124\uC815',
  logout: '\uB85C\uADF8\uC544\uC6C3',
  messagePlaceholder: '\uBA54\uC2DC\uC9C0 \uC785\uB825',
  send: '\uC804\uC1A1',
  status: '\uC0C1\uD0DC',
  currentSpace: '\uD604\uC7AC \uACF5\uAC04',
  members: '\uC811\uC18D\uC790',
  nickname: '\uB2C9\uB124\uC784',
  character: '\uCE90\uB9AD\uD130',
  save: '\uC800\uC7A5',
  close: '\uB2EB\uAE30',
};

const STATUS_LABELS: Record<UserStatus, string> = {
  online: '\uC628\uB77C\uC778',
  away: '\uC790\uB9AC\uBE44\uC6C0',
  focus: '\uC9D1\uC911\uC911',
  meeting: '\uD68C\uC758\uC911',
};

const MOCK_MESSAGES: ChatMessage[] = [
  { id: 1, author: 'System', body: 'Welcome to the lobby.', time: '09:20' },
  { id: 2, author: 'System', body: 'Cafe is open for quick chats.', time: '09:24' },
];

const SPACES = [
  { name: 'Lobby', detail: 'Public entrance' },
  { name: 'Office', detail: 'Team portals' },
  { name: 'Cafe', detail: 'Light conversation' },
  { name: 'Team Space', detail: 'Focused workroom' },
];

type GameOverlayProps = {
  user: AppUser;
};

export function GameOverlay({ user }: GameOverlayProps) {
  const { logout, updateGuestProfile } = useAuth();
  const [activeTab, setActiveTab] = useState<PanelTab>('users');
  const [status, setStatus] = useState<UserStatus>('online');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [messageText, setMessageText] = useState('');
  const [profileName, setProfileName] = useState(user.displayName);
  const [profileCharacterId, setProfileCharacterId] = useState<PlayerCharacterId>(user.characterId);
  const selectedCharacter = getPlayerCharacter(user.characterId);

  const users = useMemo(
    () => [
      {
        name: user.displayName,
        status,
        characterId: user.characterId,
      },
    ],
    [status, user.characterId, user.displayName],
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
      body,
      time: new Intl.DateTimeFormat('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }).format(new Date()),
    };

    setMessages((currentMessages) => [...currentMessages, message]);
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
              <span>{users.length}</span>
            </div>
            <div className="member-list">
              {users.map((member) => {
                const character = getPlayerCharacter(member.characterId);

                return (
                  <article className="member-item" key={member.name}>
                    <img src={character.imagePath} alt="" />
                    <div>
                      <strong>{member.name}</strong>
                      <span data-status={member.status}>{STATUS_LABELS[member.status]}</span>
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
          <span>{messages.length}</span>
        </div>
        <div className="message-list">
          {messages.map((message) => (
            <article className="message-item" key={message.id}>
              <time>{message.time}</time>
              <p>
                <strong>{message.author}: </strong>
                {message.body}
              </p>
            </article>
          ))}
        </div>
        <form className="message-form" onSubmit={handleSendMessage}>
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
          <select value={status} onChange={(event) => setStatus(event.target.value as UserStatus)}>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
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
