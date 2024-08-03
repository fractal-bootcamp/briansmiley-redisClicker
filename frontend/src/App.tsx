import { useEffect, useState } from "react";
const API_URL = import.meta.env.VITE_API_URL;
/**Send a click to the server and get back the user's clicks within the last 10 seconds */
const postClick = async (userId: string) => {
  const res = await fetch(`${API_URL}/api/click/${userId}`, {
    method: "POST"
  });
  const { bufferCount } = await res.json();
  return bufferCount;
};
/**Get the global click count */
const getCount = async (): Promise<number> => {
  const res = await fetch(`${API_URL}/api/count/`);
  const { count } = await res.json();
  return count;
};

/**Get the user's buffer count */
const getBufferCount = async (userId: string): Promise<number> => {
  const res = await fetch(`${API_URL}/api/buffer/${userId}`);
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
    if (bufferCount > 9) {
      return;
    }
    //optimistic update; will be overridden by periodic fetch if desyncs from redis
    setCount(count + 1);
    setBufferCount(bufferCount + 1);
    //send the click to the server
    const newBufferCount = await postClick(userId);
    //update the buffer count as soon as the server responds
    setBufferCount(newBufferCount);
  };
  useEffect(() => {
    //get/set userId at mount
    const userId = getUserId();
    setUserId(userId);
    //periodically fetch the count and buffer count from the server
    const periodicFetch = async () => {
      const newCount = await getCount();
      setCount(newCount);
      const newBufferCount = await getBufferCount(userId);
      setBufferCount(newBufferCount);
    };
    const interval = setInterval(periodicFetch, 1000);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen gap-2 bg-gradient-to-b from-slate-500 to-purple-500 p-4">
      <div className="flex flex-col relative items-center justify-center gap-3  p-5 rounded-lg w-[150px] h-[140px]">
        <div className="pointer-events-none absolute top-1/2 left-1/2 w-[150%] h-[150%] transform -translate-x-1/2 -translate-y-1/2">
          <svg
            className=" absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
          >
            <circle
              className="transition-all duration-300"
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={`rgb(${Math.min(
                255,
                Math.floor(bufferCount * 25.5)
              )}, 0, ${Math.max(0, 255 - Math.floor(bufferCount * 25.5))})`}
              strokeWidth="10"
              strokeDasharray="282.7"
              strokeDashoffset={0.5 + 282.7 - (bufferCount / 10) * 282.7}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
        </div>
        <div>🌍 {count}</div>
        <button onClick={onClick} disabled={bufferCount > 9}>
          Click
        </button>
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
    </div>
  );
}

export default App;
