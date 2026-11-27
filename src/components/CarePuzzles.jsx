import { useMemo, useRef, useState } from 'react';
import InkDrawing, { drawings } from './InkDrawing';
import { gameLevels } from '../data/gameProgress';
import { buildCrossword, checkAnswers, crosswordPuzzles, createMemoryDeck, sudokuPuzzles } from '../data/puzzles';

function usePuzzleCheck(solution, answers, onWin) {
  const [checked, setChecked] = useState(false);
  const { remaining, incorrect } = checkAnswers(solution, answers);

  function check() {
    setChecked(true);
    if (remaining === 0 && incorrect === 0) {
      onWin();
    }
  }

  return { checked, remaining, incorrect, check };
}

function CheckPuzzle({ result, completed }) {
  return (
    <div className="puzzle-feedback">
      <button type="button" className="primary" onClick={result.check} disabled={completed}>Check puzzle</button>
      <p role="status">
        {result.checked && !completed && (
          `${result.remaining} empty ${result.remaining === 1 ? 'square' : 'squares'} · ${result.incorrect} to review`
        )}
      </p>
    </div>
  );
}

export function Sudoku({ difficulty, round, completed, onWin }) {
  const bank = sudokuPuzzles[difficulty];
  const { puzzle, solution } = bank[round % bank.length];
  const [answers, setAnswers] = useState(() => [...puzzle].map(value => value === '0' ? '' : value));
  const expected = [...solution].map((answer, index) => ({ index, answer }));
  const result = usePuzzleCheck(expected, answers, onWin);

  function changeNumber(index, value) {
    const digit = value.replace(/[^1-9]/g, '').slice(-1);
    setAnswers(current => current.map((answer, cellIndex) => cellIndex === index ? digit : answer));
  }

  return (
    <>
      <p>Use 1–9 once in every row, column, and bold-outlined box.</p>
      <div className="sudoku-board" role="group" aria-label="Sudoku grid">
        {answers.map((answer, index) => {
          const label = `Row ${Math.floor(index / 9) + 1}, column ${index % 9 + 1}`;
          const given = puzzle[index] !== '0';
          const invalid = result.checked && answer !== '' && answer !== solution[index];

          return (
            <div className={given ? 'sudoku-cell sudoku-given' : 'sudoku-cell'} key={index}>
              {given ? (
                <span aria-label={`${label}, given ${answer}`}>{answer}</span>
              ) : (
                <input
                  aria-label={label}
                  aria-invalid={invalid || undefined}
                  autoComplete="off"
                  inputMode="numeric"
                  maxLength={1}
                  readOnly={completed}
                  onFocus={event => event.currentTarget.select()}
                  onChange={event => changeNumber(index, event.target.value)}
                  value={answer}
                />
              )}
            </div>
          );
        })}
      </div>
      <CheckPuzzle result={result} completed={completed} />
    </>
  );
}

export function Crossword({ difficulty, round, completed, onWin }) {
  const bank = crosswordPuzzles[difficulty];
  const crossword = bank[round % bank.length];
  const layout = useMemo(() => buildCrossword(crossword), [crossword]);
  const [answers, setAnswers] = useState({});
  const [activeId, setActiveId] = useState('');
  const inputs = useRef(new Map());
  const activeClue = layout.clues.find(clue => clue.id === activeId);
  const result = usePuzzleCheck(layout.cells.filter(Boolean), answers, onWin);

  function selectClue(clue) {
    setActiveId(clue.id);
    const firstEmpty = clue.positions.find(index => !answers[index]);
    inputs.current.get(firstEmpty ?? clue.positions[0])?.focus();
  }

  function focusSquare(index) {
    setActiveId(current => {
      const selected = layout.clues.find(clue => clue.id === current);
      if (selected?.positions.includes(index)) return current;
      return layout.clues.find(clue => clue.positions.includes(index))?.id ?? '';
    });
  }

  function changeLetter(index, value) {
    const letter = value.toUpperCase().replace(/[^A-Z]/g, '').slice(-1);
    setAnswers(current => ({ ...current, [index]: letter }));
    if (!letter) return;

    const clue = activeClue?.positions.includes(index)
      ? activeClue
      : layout.clues.find(item => item.positions.includes(index));
    const next = clue.positions[clue.positions.indexOf(index) + 1];
    inputs.current.get(next)?.focus();
  }

  return (
    <>
      <p>Select an Across or Down clue, then type one letter in each square.</p>
      <div className="crossword-scroll" role="region" aria-label="Crossword grid" tabIndex={0}>
        <div className="crossword-board" style={{ '--columns': layout.columns }}>
          {layout.cells.map((cell, index) => {
            if (!cell) return <span key={index} className="crossword-blank" aria-hidden="true" />;

            const answer = answers[index] ?? '';
            const inClue = activeClue?.positions.includes(index);
            const invalid = result.checked && answer !== '' && answer !== cell.answer;
            return (
              <label className={inClue ? 'crossword-cell in-clue' : 'crossword-cell'} key={index}>
                {cell.number && <small aria-hidden="true">{cell.number}</small>}
                <input
                  aria-label={`${cell.number ? `Clue ${cell.number}, ` : ''}row ${Math.floor(index / layout.columns) + 1}, column ${index % layout.columns + 1}`}
                  aria-invalid={invalid || undefined}
                  autoComplete="off"
                  autoCapitalize="characters"
                  maxLength={1}
                  readOnly={completed}
                  ref={element => {
                    if (element) inputs.current.set(index, element);
                    else inputs.current.delete(index);
                  }}
                  onFocus={event => {
                    event.currentTarget.select();
                    focusSquare(index);
                  }}
                  onChange={event => changeLetter(index, event.target.value)}
                  value={answer}
                />
              </label>
            );
          })}
        </div>
      </div>
      <div className="crossword-clues">
        {['across', 'down'].map(direction => (
          <section key={direction}>
            <h3>{direction === 'across' ? 'Across' : 'Down'}</h3>
            <ul>
              {layout.clues.filter(clue => clue.direction === direction).map(clue => (
                <li key={clue.id}>
                  <button type="button" aria-pressed={activeId === clue.id} onClick={() => selectClue(clue)}>
                    <strong>{clue.number}.</strong> {clue.clue} ({clue.positions.length})
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <CheckPuzzle result={result} completed={completed} />
    </>
  );
}

const memoryDrawings = [
  'photo', 'voice', 'text', 'vase', 'candle', 'cup', 'letter',
  'clover', 'clock', 'key', 'glasses', 'pear', 'teapot',
];

export function MemoryMatch({ difficulty, completed, onWin }) {
  const pairCount = gameLevels[difficulty].pairs;
  const [deck] = useState(() => createMemoryDeck(memoryDrawings.slice(0, pairCount)));
  const [revealed, setRevealed] = useState([]);
  const [matched, setMatched] = useState([]);
  const unmatchedPair = revealed.length === 2;

  function turnCard(index) {
    if (completed || unmatchedPair || revealed.includes(index) || matched.includes(index)) return;

    const next = [...revealed, index];
    if (next.length === 2 && deck[next[0]] === deck[index]) {
      const found = [...matched, ...next];
      setMatched(found);
      setRevealed([]);
      if (found.length === deck.length) onWin();
    } else {
      setRevealed(next);
    }
  }

  return (
    <>
      <p>Turn over two cards to find a matching pair.</p>
      <div className="memory-grid" role="group" aria-label="Memory cards">
        {deck.map((drawing, index) => {
          const matchedCard = matched.includes(index);
          const faceUp = matchedCard || revealed.includes(index);
          const label = drawings[drawing].label;
          return (
            <button
              type="button"
              className={`memory-card${faceUp ? ' memory-face-up' : ''}${matchedCard ? ' memory-matched' : ''}`}
              key={index}
              aria-label={faceUp ? `Card ${index + 1}, ${label}${matchedCard ? ', matched' : ''}` : `Turn over card ${index + 1}`}
              aria-pressed={faceUp}
              disabled={matchedCard || unmatchedPair || completed}
              onClick={() => turnCard(index)}
            >
              {faceUp ? (
                <>
                  <InkDrawing name={drawing} />
                  <span>{label}</span>
                </>
              ) : <span className="memory-card-index">{index + 1}</span>}
            </button>
          );
        })}
      </div>
      <div className="puzzle-feedback">
        <p role="status">
          {matched.length / 2} of {pairCount} pairs matched.
          {unmatchedPair && ' Those cards are different.'}
        </p>
        {unmatchedPair && (
          <button type="button" className="game-secondary" onClick={() => setRevealed([])}>Turn cards back over</button>
        )}
      </div>
    </>
  );
}
