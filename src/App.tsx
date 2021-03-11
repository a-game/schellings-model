import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
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
  const _tickDelay = 300; // ms
  const _width = 50;
  const _area = Math.pow(_width, 2);

  const [tolerens, setTolerens] = useState(0.7);
  const [emptyPercent, setEmptyPercent] = useState(0.1);
  const [xPercent, setXPercent] = useState(0.2);

  const [running, setRunning] = useState(false);
  const [shouldReset, triggerReset] = useState(false);
  const [cells, setCells] = useState(Array<Nullable<Cell>>());
  const [unhappyCount, setUnhappyCount] = useState(0);
  const [tickCount, setTickCount] = useState(0);
  const timerRef = useRef<number>(0);

  useLayoutEffect(() => {
    function getInitialSetup() {
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
      return initial;
    }

    const initial: Nullable<Cell>[] = getInitialSetup();
    setCells(initial);

    logCellStatus(initial);
    setUnhappyCount(0);
    triggerReset(false);
  }, [_area, emptyPercent, xPercent, shouldReset]);

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
            unhappy++;
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

    if (!running) return;

    timerRef.current = window.setTimeout(() => {
      const res = tick();
      // Nothing changed so everybody must be happy.
      if (cells.every((value, index) => value === res.newState[index])) {
        stop();
      } else if (running) {
        setTickCount((v) => v + 1);
        setUnhappyCount(res.unhappyCount);
        setCells(res.newState);
      }
    }, _tickDelay);
  }, [running, cells, tolerens]);

  const toggle = () => (running ? stop() : run());
  const stop = () => {
    window.clearTimeout(timerRef.current);
    setRunning(false);
  };
  const run = () => setRunning(true);

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

  const renderControls = () => (
    <div className="sim-controls">
      <div className="sim-ctrl-group">
        <button onClick={toggle}>{running ? "Stop" : "Start"}</button>
        <button
          onClick={() => {
            stop();
            triggerReset(true);
          }}
        >
          Reset
        </button>
      </div>

      <div className="sim-ctrl-group">
        <div className="sim-sliders">
          <label htmlFor="tolerensSlider">Tolerens</label>
          <input
            id="tolerensSlider"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={tolerens.toString()}
            onChange={(e) => setTolerens(parseFloat(e.target.value))}
          />
          <label htmlFor="tolerensSlider">{tolerens * 100}%</label>

          <label htmlFor="emptySlider">Empty cells</label>
          <input
            id="emptySlider"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={emptyPercent.toString()}
            onChange={(e) => {
              stop();
              setEmptyPercent(parseFloat(e.target.value));
            }}
          />
          <label htmlFor="emptySlider">{emptyPercent * 100}%</label>

          <label htmlFor="xPercentSlider">Red population</label>
          <input
            id="xPercentSlider"
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={xPercent.toString()}
            onChange={(e) => {
              stop();
              setXPercent(parseFloat(e.target.value));
            }}
          />
          <label htmlFor="xPercentSlider">{xPercent * 100}%</label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app">
      <header className="app-header">
        <h1>Schelling's Model of Segregation</h1>
      </header>

      <div className="container">
        {renderControls()}
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
          {`Ticks: ${tickCount} — Unhappy cells: ${unhappyCount} (${(
            (unhappyCount / cells.length) *
            100
          ).toFixed(1)}%)`}
        </label>
      </div>
    </div>
  );
}

export default App;
