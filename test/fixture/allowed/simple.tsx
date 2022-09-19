import { useState } from "preact/hooks";

import Sub from "./sub.tsx";

export default function Simple() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <h1>Simple</h1>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <Sub />
    </div>
  );
}
