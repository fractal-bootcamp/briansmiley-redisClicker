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

/**Get the user's buffer count */
const getBufferCount = async (userId: string): Promise<number> => {
  const res = await fetch(`http://localhost:3000/api/buffer/${userId}`);
  const { bufferCount } = await res.json();
  return bufferCount;
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
      const newBufferCount = await getBufferCount(userId);
      setBufferCount(newBufferCount);
    };
    const interval = setInterval(periodicFetch, 100);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-col items-center justify-end h-screen w-screen gap-2 bg-gradient-to-b from-slate-500 to-purple-500 p-4">
      <div className="flex flex-col items-center justify-center gap-3 bg-slate-300 bg-opacity-50 p-5 rounded-lg">
        <div>🌍 {count}</div>
        <button onClick={onClick}>Click</button>
        <div className="flex gap-1">
          <div>
            Your Buffer:{" "}
            <span
              className={`font-bold ${bufferCount > 9 ? "text-red-500" : ""}`}
            >
              {bufferCount}
            </span>
          </div>
        </div>
      </div>
      <div style={{ height: `${20 + (bufferCount / 10) * 60}vh` }}></div>
    </div>
  );
}

export default App;
