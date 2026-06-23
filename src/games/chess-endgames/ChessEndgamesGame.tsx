import './chess-endgames.css'
import { Menu } from './components/Menu'
import { Play } from './components/Play'
import { useChessStore } from './state/store'

// Self-contained root for Chess Endgames. Own engine, store, board and CSS.
export function ChessEndgamesGame({ onExit }: { onExit: () => void }) {
  const screen = useChessStore((s) => s.screen)

  return (
    <div className="ce-app">
      {screen === 'menu' ? <Menu /> : <Play />}
      {screen === 'menu' && (
        <button className="ce-back" onClick={onExit}>
          ‹ Games
        </button>
      )}
    </div>
  )
}
