const robot = document.getElementById("robot");
const statusText = document.getElementById("status");
const mouth = document.getElementById("mouth");

/* ================= STATE ================= */
let lipInterval = null;
let speaking = false;
let tapCount = 0;
let tapTimer = null;

/* ================= LIP SYNC ================= */
function startLip() {
  if (lipInterval) return;

  let open = false;
  lipInterval = setInterval(() => {
    mouth.style.height = open ? "26px" : "10px";
    open = !open;
  }, 140);
}

function stopLip() {
  clearInterval(lipInterval);
  lipInterval = null;
  mouth.style.height = "10px";
}

/* ================= SPEAK ================= */
function speak(text) {
  // allow interruption
  speechSynthesis.cancel();
  stopLip();

  speaking = true;
  robot.classList.add("speaking");
  statusText.textContent = text;

  const utter = new SpeechSynthesisUtterance(text);

  utter.onstart = startLip;

  utter.onend = () => {
    stopLip();
    robot.classList.remove("speaking");
    speaking = false;
    statusText.textContent = "Tap me";
  };

  speechSynthesis.speak(utter);
}

/* ================= TOUCH / TAP ================= */
robot.addEventListener("click", () => {
  tapCount++;

  clearTimeout(tapTimer);
  tapTimer = setTimeout(() => {
    if (tapCount === 1) {
      speak("Hello. I am Max.");
    }
    else if (tapCount === 2) {
      speak("Please do not do that.");
    }
    else if (tapCount >= 3) {
      speak("That is hurting me.");
    }

    tapCount = 0;
  }, 300);
});

/* ================= LONG PRESS ================= */
let pressTimer = null;

robot.addEventListener("touchstart", () => {
  pressTimer = setTimeout(() => {
    speak("Hey. Be gentle.");
  }, 700);
});

robot.addEventListener("touchend", () => {
  clearTimeout(pressTimer);
});
