import { useEffect, useState } from "react";

/**Send a click to the server and get back the user's clicks within the last 10 seconds */
const postClick = async (userId: string) => {
  const res = await fetch(`http://localhost:3000/api/click/${userId}`, {
    method: "POST"
  });
  const { bufferCount } = await res.json();
  return bufferCount;
};
/**Get the global click count */
const getCount = async (): Promise<number> => {
  const res = await fetch(`http://localhost:3000/api/count/`);
  const { count } = await res.json();
  return count;
};

const generateUniqueId = () => {
  return Math.random().toString(36);
};

const getUserId = () => {
  let userId = localStorage.getItem("userId");
  if (!userId) {
    userId = generateUniqueId();
    localStorage.setItem("userId", userId);
  }
  return userId;
};

function App() {
  const [userId, setUserId] = useState("");
  const [count, setCount] = useState(0);
  const [bufferCount, setBufferCount] = useState(0); //current user's clicks within the last 10 seconds
  const onClick = async () => {
    const newBufferCount = await postClick(userId);
    setBufferCount(newBufferCount);
  };
  useEffect(() => {
    setUserId(getUserId());
  }, []);
  useEffect(() => {
    const periodicFetch = async () => {
      const newCount = await getCount();
      setCount(newCount);
    };
    const interval = setInterval(periodicFetch, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <div>{count}</div>
      <button onClick={onClick}>Click</button>
      <div>Cliks in last 10 seconds:</div>
      <div> {bufferCount}</div>
    </div>
  );
}

export default App;
