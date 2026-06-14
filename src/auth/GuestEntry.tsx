import { useState, type FormEvent } from 'react';
import { useAuth } from './AuthProvider';
import { DEFAULT_PLAYER_CHARACTER, PLAYER_CHARACTERS, type PlayerCharacterId } from '../game/constants/playerCharacters';

const TEXT = {
  title: '\uB85C\uBE44\uC5D0 \uC785\uC7A5\uD558\uAE30',
  nickname: '\uB2C9\uB124\uC784',
  placeholder: '\uC608: Benny',
  character: '\uCE90\uB9AD\uD130',
  next: '\uB2E4\uC74C',
  enterAsGuest: '\uAC8C\uC2A4\uD2B8\uB85C \uC785\uC7A5',
};

export function GuestEntry() {
  const { loginAsGuest } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [step, setStep] = useState<'name' | 'character'>('name');
  const [characterId, setCharacterId] = useState<PlayerCharacterId>(DEFAULT_PLAYER_CHARACTER.id);
  const trimmedName = displayName.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedName) {
      return;
    }

    if (step === 'name') {
      setStep('character');
      return;
    }

    loginAsGuest(trimmedName, characterId);
  };

  return (
    <section className="entry-screen" aria-label="RemoteTreeNode entry">
      <form className="entry-panel" onSubmit={handleSubmit}>
        <div>
          <p className="entry-kicker">RemoteTreeNode</p>
          <h1>{TEXT.title}</h1>
        </div>

        {step === 'name' ? (
          <label className="entry-field">
            <span>{TEXT.nickname}</span>
            <input
              autoFocus
              maxLength={16}
              placeholder={TEXT.placeholder}
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </label>
        ) : (
          <fieldset className="character-picker">
            <legend>{TEXT.character}</legend>
            <div className="character-options">
              {PLAYER_CHARACTERS.map((character) => (
                <label className="character-option" data-selected={character.id === characterId} key={character.id}>
                  <input
                    type="radio"
                    name="character"
                    value={character.id}
                    checked={character.id === characterId}
                    onChange={() => setCharacterId(character.id)}
                  />
                  <img src={character.imagePath} alt="" />
                  <span>{character.label}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <button type="submit" disabled={!trimmedName}>
          {step === 'name' ? TEXT.next : TEXT.enterAsGuest}
        </button>
      </form>
    </section>
  );
}
