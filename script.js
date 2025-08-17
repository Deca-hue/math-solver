const micBtn = document.getElementById("micBtn");
const inputText = document.getElementById("inputText");
const outputText = document.getElementById("outputText");
const translateBtn = document.getElementById("translateBtn");
const speakBtn = document.getElementById("speakBtn");
const inputLang = document.getElementById("inputLang");
const outputLang = document.getElementById("outputLang");
const copyBtn = document.getElementById("copyBtn");
const swapBtn = document.getElementById("swapBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const historyList = document.getElementById("historyList");
const translateText = document.getElementById("translateText");
const loadingSpinner = document.getElementById("loadingSpinner");

let history = JSON.parse(localStorage.getItem("translations")) || [];
renderHistory();

// 🎙 Speech Recognition
let recognition;
if ("webkitSpeechRecognition" in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;

    micBtn.addEventListener("click", () => {
        recognition.lang = inputLang.value;
        recognition.start();
        micBtn.classList.add("glow");
    });

    recognition.onresult = (event) => {
        inputText.value = event.results[0][0].transcript;
        micBtn.classList.remove("glow");
        translateTextNow(); // auto-translate after speech
    };

    recognition.onend = () => micBtn.classList.remove("glow");

} else {
    alert("Speech Recognition not supported in this browser");
}

// 🔄 Translate Function
async function translateTextNow() {
    const text = inputText.value.trim();
    if (!text) return alert("Please enter text");

    translateText.textContent = "Translating...";
    loadingSpinner.classList.remove("hidden");

    try {
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${inputLang.value}|${outputLang.value}`);
        const data = await res.json();

        outputText.value = data.responseData.translatedText;

        history.unshift({ from: text, to: data.responseData.translatedText });
        if (history.length > 10) history.pop();
        localStorage.setItem("translations", JSON.stringify(history));
        renderHistory();

    } catch (err) {
        console.error(err);
        alert("Translation failed");
    }

    translateText.textContent = "Translate";
    loadingSpinner.classList.add("hidden");
}

translateBtn.addEventListener("click", translateTextNow);

// 🔊 Text-to-speech
speakBtn.addEventListener("click", () => {
    const text = outputText.value.trim();
    if (!text) return alert("Nothing to speak");

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = outputLang.value;
    speechSynthesis.speak(utterance);
});

// 📋 Copy to clipboard
copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(outputText.value);
    copyBtn.textContent = "✅";
    setTimeout(() => copyBtn.textContent = "📋", 1000);
});

// 🔄 Swap languages
swapBtn.addEventListener("click", () => {
    const temp = inputLang.value;
    inputLang.value = outputLang.value;
    outputLang.value = temp;
});

// 🗑 Clear history
clearHistoryBtn.addEventListener("click", () => {
    history = [];
    localStorage.removeItem("translations");
    renderHistory();
});

// Render history with fade-in animation
function renderHistory() {
    historyList.innerHTML = "";
    history.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = `"${item.from}" → "${item.to}"`;
        li.classList.add("fade-in");
        historyList.appendChild(li);
    });
}
