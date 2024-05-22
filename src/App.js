import React, { useCallback, useEffect, useState } from 'react';
import Navigation from './components/Navigation';
import Field from './components/Field';
import Button from './components/Button';
import ManipulationPanel from './components/ManipulationPanel';
import { initFields } from './utils'

const initialPosition = { x: 17, y: 17 }
const initialValues = initFields(35, initialPosition)
  const defaultInterval = 100


  const GameStatus = Object.freeze({
    init: 'init',
    playing: 'playing',
    suspended: 'suspended',
    gameover: 'gameover'
  })
  
  const Direction = Object.freeze({
    up: 'up',
    right: 'right',
    left: 'left',
    down: 'down'
  })

  const DirectionKeyCodeMap = Object.freeze({
    37: Direction.left,
    38: Direction.up,
    39: Direction.right,
    40: Direction.down,
  })
  
  const OppositeDirection = Object.freeze({
    up: 'down',
    right: 'left',
    left: 'right',
    down: 'up'
  })

  
  const Delta = Object.freeze({
    up: { x: 0, y: -1 },
    right: { x:  1, y: 0 },
    left: { x: -1, y: 0 },
    down: { x: 0, y: 1 },
  })

  let timer = undefined
 
  const unsubscribe = () => {
    if (!timer) {
      return
    }
    clearInterval(timer)
  }
 
function App() {
  const [fields, setFields] = useState(initialValues)
  const [position, setPosition] = useState()
  const [status, setStatus] = useState(GameStatus.init)
  const [direction, setDirection] = useState(Direction.up)
  const [tick, setTick] = useState(0)


  useEffect(() => {
    setPosition(initialPosition)
     // ゲームの中の時間を管理する
    timer = setInterval(() => {
      if (!position) {
        return
      }
      setTick(tick => tick + 1)
    }, defaultInterval)
    setDirection(Direction.up)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!position || status !== GameStatus.playing) {
      return
    }
    const canContinue = handleMoving()
    if (!canContinue) {
      unsubscribe()
      setStatus(GameStatus.gameover)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick])

  const onStart = () => setStatus(GameStatus.playing)

  const onRestart = () => {
    timer = setInterval(() => {
      setTick(tick => tick + 1)
    }, defaultInterval)
    setStatus(GameStatus.init)
    setPosition(initialPosition)
    setFields(initFields(35, initialPosition))
  }

  const handleMoving = () => {
    const { x, y } = position
    const nextY = Math.max(y -1, 0)
    fields[y][x] = ''
    fields[nextY][x] = 'snake'
    setPosition({ x, y: nextY })
    setFields(fields)
  }


  const onChangeDirection = useCallback((newDirection) => {
    if (status !== GameStatus.playing) {
      return direction
    }
    if (OppositeDirection[direction] === newDirection) {
      return
    }
    setDirection(newDirection)
  }, [direction ,status, ])
 
  useEffect(() => {
    const handleKeyDown = (e) => {
      const newDirection = DirectionKeyCodeMap[e.keyCode];
      if (!newDirection) {
        return;
      }

      onChangeDirection(newDirection);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onChangeDirection])

  return (
    <div className="App">
      <header className="header">
        <div className="title-container">
          <h1 className="title">Snake Game</h1>
         </div>
         <Navigation />
      </header>
      <main className="main">
        <Field fields={fields} />
      </main>
      <footer className="footer">
      <Button status={status} onStart={onStart} onRestart={onRestart}/>
      <ManipulationPanel onChange={onChangeDirection} />
      </footer>
    </div>
  );
}

export default App;
