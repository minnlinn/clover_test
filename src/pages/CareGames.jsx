import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import InkDrawing from '../components/InkDrawing';
import { Crossword, MemoryMatch, Sudoku } from '../components/CarePuzzles';
import { localDateKey } from '../data/dates';
import { gameLevels, gameStoragePrefix, getGameStandings, loadGameProgress, makeGameId, storeGameRecord } from '../data/gameProgress';

const games = [
  { id: 'sudoku', label: 'Sudoku', Board: Sudoku },
  { id: 'crossword', label: 'Crossword', Board: Crossword },
  { id: 'memory', label: 'Memory match', Board: MemoryMatch },
];

export default function CareGames({ profile }) {
  const [progress, setProgress] = useState(loadGameProgress);
  const [playerId, setPlayerId] = useState('self');
  const [selectedLevel, setDifficulty] = useState('1');
  const [game, setGame] = useState(games[0]);
  const [round, setRound] = useState(() => ({ id: makeGameId(), index: 0 }));
  const [showPlayerForm, setShowPlayerForm] = useState(false);
  const [playerName, setPlayerName] = useState('');
  const [playerError, setPlayerError] = useState('');
  const [temporaryProgress, setTemporaryProgress] = useState(false);

  const players = [{ id: 'self', name: profile.name.trim() || 'Me' }, ...progress.players];
  const player = players.find(person => person.id === playerId) ?? players[0];
  const rankings = getGameStandings(players, progress.wins);
  const completed = progress.wins.some(win => win.id === round.id);
  const { Board } = game;
  const difficulty = Object.hasOwn(gameLevels, selectedLevel) ? selectedLevel : '1';

  useEffect(() => {
    function refresh(event) {
      if (event.key === null || event.key.startsWith(gameStoragePrefix)) {
        setProgress(loadGameProgress());
      }
    }
    window.addEventListener('storage', refresh);
    return () => window.removeEventListener('storage', refresh);
  }, []);

  function newRound(index) {
    setRound({ id: makeGameId(), index });
  }

  function chooseGame(next) {
    if (next.id === game.id) return;
    setGame(next);
    newRound(0);
  }

  function addPlayer(event) {
    event.preventDefault();
    const name = playerName.trim();
    if (!name) {
      setPlayerError('Enter a display name.');
      return;
    }
    if (players.some(person => person.name.toLocaleLowerCase() === name.toLocaleLowerCase())) {
      setPlayerError('Choose a different display name for this player.');
      return;
    }

    const added = { id: makeGameId(), name };
    if (!storeGameRecord('player', added)) setTemporaryProgress(true);
    setProgress(current => ({ ...current, players: [...current.players, added] }));
    setPlayerId(added.id);
    setPlayerName('');
    setPlayerError('');
    setShowPlayerForm(false);
    newRound(0);
  }

  function completeRound() {
    if (completed) return;

    const win = { id: round.id, playerId: player.id, difficulty, day: localDateKey(new Date()) };
    if (!storeGameRecord('win', win)) setTemporaryProgress(true);
    setProgress(current => {
      if (current.wins.some(item => item.id === win.id)) return current;
      return { ...current, wins: [...current.wins, win] };
    });
  }

  return (
    <div className="care-games">
      <Link className="section-back" to="/care"><ChevronLeft size={18} aria-hidden="true" /> Care circle</Link>
      <header className="games-heading">
        <div>
          <h1>Brain games</h1>
          <p>Take turns with family on this device and build a daily streak.</p>
        </div>
        <InkDrawing name="clover" />
      </header>

      <section className="card games-setup" aria-label="Game settings">
        <div className="game-selectors">
          <label>
            Player
            <select value={player.id} onChange={event => {
              setPlayerId(event.target.value);
              newRound(0);
            }}>
              {players.map(person => <option value={person.id} key={person.id}>{person.name}</option>)}
            </select>
          </label>
          <label>
            Difficulty
            <select value={difficulty} onChange={event => {
              setDifficulty(event.target.value);
              newRound(0);
            }}>
              {Object.entries(gameLevels).map(([key, level]) => <option value={key} key={key}>{level.label}</option>)}
            </select>
          </label>
          <button type="button" className="game-secondary" aria-expanded={showPlayerForm} onClick={() => setShowPlayerForm(current => !current)}>
            {showPlayerForm ? 'Cancel' : 'Add player'}
          </button>
        </div>

        {showPlayerForm && (
          <form className="add-game-player" onSubmit={addPlayer}>
            <label>
              Display name
              <input
                value={playerName}
                maxLength={24}
                onChange={event => {
                  setPlayerName(event.target.value);
                  setPlayerError('');
                }}
              />
            </label>
            <button className="primary" type="submit">Save player</button>
            {playerError && <p role="alert">{playerError}</p>}
          </form>
        )}
        {temporaryProgress && <p role="status">This browser could only save progress for this visit.</p>}
      </section>

      <div className="spread-two games-spread">
        <div className="game-play-area">
          <div className="game-options" role="group" aria-label="Brain games">
            {games.map(option => (
              <button type="button" key={option.id} aria-pressed={option.id === game.id} onClick={() => chooseGame(option)}>
                {option.label}
              </button>
            ))}
          </div>

          <section className="card game-round" aria-labelledby="game-board-title">
            <div className="game-round-header">
              <h2 id="game-board-title">{game.label}</h2>
              <button type="button" className="game-secondary" onClick={() => newRound(round.index + 1)}>New game</button>
            </div>
            <Board
              key={round.id}
              difficulty={difficulty}
              round={round.index}
              completed={completed}
              onWin={completeRound}
            />
            {completed && (
              <p className="game-complete" role="status">
                Well done, {player.name}! +{gameLevels[difficulty].points} points.
              </p>
            )}
          </section>
        </div>
        <section className="card game-leaderboard" aria-labelledby="game-leaderboard-title">
          <h2 id="game-leaderboard-title">Family leaderboard</h2>
          <p>Earn 10 points per level for each completed game. Finish a game each day to grow your streak.</p>
          <table>
            <thead><tr><th scope="col">Player</th><th scope="col">Points</th><th scope="col">Streak</th></tr></thead>
            <tbody>
              {rankings.map(person => (
                <tr key={person.id}>
                  <th scope="row">{person.name}</th>
                  <td>{person.points}</td>
                  <td>{person.streak} {person.streak === 1 ? 'day' : 'days'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
