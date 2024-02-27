import React from './core/React.js';

let count = 11;
function Counter({ num }) {
  function handleClick() {
    console.log('click');
    count++;
    React.update();
  }
  return (
    <div>
      <div>Counter: {count}</div>
      <div>num: {num}</div>
      <button onClick={handleClick}>click</button>
    </div>
  );
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
