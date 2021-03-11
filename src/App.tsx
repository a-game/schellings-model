import React, { useEffect, useState } from "react";
import "./App.scss";
import {
  Nullable,
  notEmpty,
  getRandomEmptyIndex,
  swap,
  getGridNeighbours,
} from "./util";

enum Kind {
  X,
  O,
}

interface Cell {
  kind: Kind;
}

interface TickResult {
  newState: Nullable<Cell>[];
  unhappyCount: number;
}

function logCellStatus(arr: Nullable<Cell>[]) {
  console.log(`
    Total:  ${arr.length},
    X:      ${arr.filter((c) => c?.kind === Kind.X).length},
    O:      ${arr.filter((c) => c?.kind === Kind.O).length},
    Empty:  ${arr.filter((c) => c === null).length}
`);
}

function App() {
  const _tickDelay = 500; // ms
  const _width = 50;
  const _area = Math.pow(_width, 2);

  const [tolerens, setTolerens] = useState(0.6);
  const [emptyPercent, setEmptyPercent] = useState(0.2);
  const [xPercent, setXPercent] = useState(0.2);

  const [running, setRunning] = useState(false);
  const [cells, setCells] = useState(Array<Nullable<Cell>>());
  const [unhappyCount, setUnhappyCount] = useState(0);

  useEffect(() => {
    function tick(): TickResult {
      const copy = cells.slice();
      let unhappy = 0;

      cells.forEach((cell, index) => {
        if (cell !== null) {
          const neighbours = getGridNeighbours(index, cells, _width);
          const different = neighbours
            .filter(notEmpty)
            .filter((c) => c.kind !== cell.kind);

          if (different.length / neighbours.length > tolerens) {
            unhappy = unhappy + 1;
            const newHome = getRandomEmptyIndex(cells);
            swap(copy, index, newHome);
          }
        }
      });
      return {
        newState: copy,
        unhappyCount: unhappy,
      };
    }

    if (!running) {
      return;
    }

    setTimeout(() => {
      const res = tick();
      setUnhappyCount(res.unhappyCount);
      // Nothing has changes and everybody is happy.
      if (cells.every((value, index) => value === res.newState[index])) {
        setRunning(false);
      } else {
        setCells(res.newState);
      }
    }, _tickDelay);
  }, [running, cells, tolerens]);

  function setup() {
    const initial: Nullable<Cell>[] = [];

    for (let i = 0; i < _area; i++) {
      const x = Math.random();

      if (x <= emptyPercent) {
        initial.push(null);
      } else if (x <= (1 - emptyPercent) * xPercent + emptyPercent) {
        initial.push({ kind: Kind.X });
      } else {
        initial.push({ kind: Kind.O });
      }
    }
    logCellStatus(initial);
    return initial;
  }

  const toggle = () => (running ? stop() : run());
  const stop = () => setRunning(false);
  const run = () => setRunning(true);
  const reset = () => {
    if (running) {
      stop();
    }
    const initial = setup();
    setCells(initial);
  };

  const renderCells = () => {
    return cells.map((cell, i) => {
      let cls = "sim-cell ";
      if (cell?.kind === Kind.X) {
        cls += "sim-cell__X";
      } else if (cell?.kind === Kind.O) {
        cls += "sim-cell__O";
      }
      return <div key={i} className={cls} />;
    });
  };

  const call = (func: Function, val: string) => {
    func.call(null, parseFloat(val));
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Schelling's Model of Segregation</h1>
        <div className="app-header-controls">
          <button onClick={toggle}>{running ? "Stop" : "Start"}</button>
          <button onClick={reset}>Reset</button>
        </div>
      </header>

      <div className="container">
        <div className="sim-controls">
          <div className="sim-ctrl">
            <label htmlFor="tolerensSlider">Tolerens</label>
            <input
              id="tolerensSlider"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={tolerens.toString()}
              onChange={(e) => call(setTolerens, e.target.value)}
            />
          </div>
          <div className="sim-ctrl">
            <label htmlFor="emptySlider">Empty cells</label>
            <input
              id="emptySlider"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={emptyPercent.toString()}
              onChange={(e) => call(setEmptyPercent, e.target.value)}
            />
          </div>
          <div className="sim-ctrl">
            <label htmlFor="tolerensSlider">Population</label>
            <input
              id="tolerensSlider"
              type="range"
              min={0}
              max={1}
              step={0.1}
              value={xPercent.toString()}
              onChange={(e) => call(setXPercent, e.target.value)}
            />
          </div>
        </div>
        <div
          id="sim-grid"
          className="sim-grid"
          style={{
            gridTemplateColumns: `repeat(${_width}, 10px)`,
          }}
        >
          {renderCells()}
        </div>
        <label htmlFor="sim-grid" className="sim-grid__label">
          {`Unhappy: ${unhappyCount} (${(unhappyCount / cells.length) * 100}%)`}
        </label>
      </div>
    </div>
  );
}

export default App;
