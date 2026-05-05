


import { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios
      .get("/api/v1/users/register")
      .then((res) => setMessage(res.data.message))
      .catch((err) => console.error(err));
  }, []);

  return (
    <>
      <h1 className="text-3xl">hii</h1>
      <p>{message}</p>
    </>
  );
}

export default App;
