import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:2000");

export default function Debater({ speakerId }) {
  const recognitionRef = useRef(null);

  const [listening, setListening] = useState(false);
  const [liveText, setLiveText] = useState("");
  const [finalText, setFinalText] = useState("");

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let interim = "";
      let final = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      setLiveText(interim);

      if (final) {
        setFinalText(final);
        setLiveText("");

        // 🔥 SEND FINAL TRANSCRIPT TO SERVER
        socket.emit("TRANSCRIPT_FINAL", {
          speakerId,
          text: final
        });
      }
    };

    recognitionRef.current = recognition;
  }, [speakerId]);

  const toggleMic = () => {
    if (!listening) {
      recognitionRef.current.start();
      setListening(true);
    } else {
      recognitionRef.current.stop();
      setListening(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>🎤 Debater: {speakerId}</h2>

      <button onClick={toggleMic}>
        {listening ? "🛑 Stop" : "▶ Start Speaking"}
      </button>

      <div style={{ marginTop: 20 }}>
        <h4>📝 Live Transcription</h4>
        <p style={{ color: "gray" }}>{liveText || "Listening..."}</p>
      </div>

      <div style={{ marginTop: 20 }}>
        <h4>✅ Final Sentence Sent</h4>
        <p><b>{finalText}</b></p>
      </div>
    </div>
  );
}
