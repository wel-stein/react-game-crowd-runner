import { inCheck, fileOf, rankOf } from '../engine'
import { useChessStore } from '../state/store'

const GLYPH: Record<string, string> = {
  k: '♚',
  q: '♛',
  r: '♜',
  b: '♝',
  n: '♞',
  p: '♟',
}

const FILES = 'abcdefgh'

// White-at-bottom 8×8 board, rendered as DOM. Squares are clickable; the store
// owns selection, legal-target dots, last-move and hint highlights.
export function Board() {
  const board = useChessStore((s) => s.board)
  const selected = useChessStore((s) => s.selected)
  const targets = useChessStore((s) => s.targets)
  const lastMove = useChessStore((s) => s.lastMove)
  const hintSquares = useChessStore((s) => s.hintSquares)
  const clickSquare = useChessStore((s) => s.clickSquare)

  // king square in check (any side) gets a danger tint
  const whiteChecked = inCheck(board, true)
  const blackChecked = inCheck(board, false)

  const rows = []
  for (let r = 7; r >= 0; r--) {
    const cells = []
    for (let f = 0; f < 8; f++) {
      const i = r * 8 + f
      const piece = board[i]
      const dark = (f + r) % 2 === 0
      const isTarget = targets.includes(i)
      const isSel = selected === i
      const isLast = lastMove ? lastMove[0] === i || lastMove[1] === i : false
      const isHint = hintSquares ? hintSquares[0] === i || hintSquares[1] === i : false
      const danger =
        (piece === 'K' && whiteChecked) || (piece === 'k' && blackChecked)
      const cls = [
        'ce-sq',
        dark ? 'dark' : 'light',
        isSel ? 'sel' : '',
        isLast ? 'last' : '',
        isHint ? 'hint' : '',
        danger ? 'danger' : '',
      ]
        .filter(Boolean)
        .join(' ')
      cells.push(
        <div key={i} className={cls} onPointerDown={() => clickSquare(i)}>
          {piece !== '.' && (
            <span
              className={`ce-piece ${piece === piece.toUpperCase() ? 'white' : 'black'}`}
            >
              {GLYPH[piece.toLowerCase()]}
            </span>
          )}
          {isTarget && <span className={piece === '.' ? 'ce-dot' : 'ce-ring'} />}
          {f === 0 && <span className="ce-rank-lbl">{r + 1}</span>}
          {r === 0 && <span className="ce-file-lbl">{FILES[f]}</span>}
        </div>,
      )
    }
    rows.push(
      <div key={r} className="ce-row">
        {cells}
      </div>,
    )
  }

  return <div className="ce-board">{rows}</div>
}

// expose for type-only helpers if needed
export { fileOf, rankOf }
