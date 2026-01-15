const robot = document.getElementById("robot");
const statusText = document.getElementById("status");
const mouth = document.getElementById("mouth");

let speaking = false;
let lipInterval = null;

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

function speak(text) {
  if (speaking) return;

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

  speechSynthesis.cancel();
  speechSynthesis.speak(utter);
}

robot.addEventListener("click", () => {
  speak("Hello. I am Max.");
});
