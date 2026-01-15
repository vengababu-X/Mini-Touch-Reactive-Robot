const robot = document.getElementById("robot");
const statusText = document.getElementById("status");
const mouth = document.getElementById("mouth");

/* ================= STATE ================= */
/*
  Past bug:
  - Multiple lip intervals created
  Fix:
  - Track lipInterval and block duplicates
*/
let recognition = null;
let awake = false;
let idleTimer = null;
let tapCount = 0;
let lipInterval = null;

/* ================= LIP SYNC ================= */
/*
  Past bug:
  - Lip animation kept running forever
  Fix:
  - Allow ONLY ONE interval
  - Force stop on speech end
*/
function startLipSync() {
  if (lipInterval !== null) return;

  let open = false;
  lipInterval = setInterval(() => {
    mouth.style.height = open ? "26px" : "10px";
    open = !open;
  }, 120);
}

function stopLipSync() {
  if (lipInterval !== null) {
    clearInterval(lipInterval);
    lipInterval = null;
  }
  mouth.style.height = "10px"; // force closed
}

/* ================= SPEAK ================= */
/*
  Past bug:
  - Mouth + hands stayed active
  Fix:
  - Tie EVERYTHING to speech lifecycle
*/
function speak(text) {
  speechSynthesis.cancel();
  stopLipSync();

  const utter = new SpeechSynthesisUtterance(text);
  utter.rate = 0.9;
  utter.pitch = 0.8;

  robot.classList.add("speaking");
  statusText.textContent = text;

  utter.onstart = () => {
    startLipSync();
  };

  utter.onend = () => {
    stopLipSync();
    robot.classList.remove("speaking");
    startIdleTimer();
  };

  utter.onerror = () => {
    stopLipSync();
    robot.classList.remove("speaking");
  };

  speechSynthesis.speak(utter);
}

/* ================= IDLE ================= */
function startIdleTimer() {
  clearTimeout(idleTimer);
  idleTimer = setTimeout(() => {
    awake = false;
    robot.className = "robot sleep";
    statusText.textContent = "Sleeping…";
  }, 15000);
}

/* ================= VOICE ================= */
/*
  IMPORTANT:
  - Works ONLY after first tap
  - Chrome / Edge only
*/
function startVoiceRecognition() {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";

  recognition.onresult = (event) => {
    const text =
      event.results[event.results.length - 1][0]
        .transcript.toLowerCase();

    if (text.includes("hey max")) {
      awake = true;
      robot.className = "robot";
      speak("Hello X King");
      return;
    }

    if (!awake) return;

    if (text.includes("who built you")) {
      speak("X King is my boss. X King built me.");
    }
    else if (text.includes("how are you")) {
      speak(randomReply([
        "I am functioning properly.",
        "All systems are stable.",
        "I am feeling good."
      ]));
    }
    else if (text.includes("hi") || text.includes("hello")) {
      speak("Hi X King.");
    }
  };

  recognition.onend = () => recognition.start();
  recognition.start();
}

/* ================= TAP ================= */
/*
  Single tap   -> Hey
  Double tap   -> Please do not do that
  3+ taps      -> That is hurting me
*/
robot.addEventListener("click", () => {

  if (!recognition) {
    startVoiceRecognition();
    awake = true;
    speak("Hello X King");
    return;
  }

  tapCount++;

  setTimeout(() => {
    if (tapCount === 1) speak("Hey");
    else if (tapCount === 2) speak("Please do not do that");
    else if (tapCount >= 3) speak("That is hurting me");
    tapCount = 0;
  }, 300);
});

/* ================= LONG PRESS ================= */
let pressTimer;

robot.addEventListener("touchstart", () => {
  pressTimer = setTimeout(() => {
    speak("Ouch, that hurts");
  }, 700);
});

robot.addEventListener("touchend", () => {
  clearTimeout(pressTimer);
});

/* ================= UTIL ================= */
function randomReply(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
