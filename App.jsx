import React from './core/React.js';

function Counter({ num }) {
  return <div>Counter: {num}</div>;
}

function App() {
  return (
    <div>
      hi mini-react
      <Counter num={10}></Counter>
      <Counter num={20}></Counter>
    </div>
  );
}

export default App;
