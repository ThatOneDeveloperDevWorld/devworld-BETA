// Dev World General Tutorial Manager

const TUTORIAL_STEPS = [
    { text: "hello, new guy.", image: null },
    { text: "i see you havent learned basic things yet.", image: null },
    { text: "lets fix that :D", image: null },
    { text: "make game", image: "tutorial/image-sc-tut-1.png" },
    { text: "find settings", image: "tutorial/image-sc-tut-2.png" },
    { text: "change game icon", image: "tutorial/image-sc-tut-3.png" },
    { text: "add custom tiles", image: "tutorial/image-sc-tut-4.png" },
    { text: "change game name", image: "tutorial/image-sc-tut-5.png" },
    { text: "add tiles too game", image: "tutorial/image-sc-tut-6.png" },
    { text: "publish", image: "tutorial/image-sc-tut-7.png" }
];

let currentStepIndex = parseInt(localStorage.getItem("devworld_general_tutorial_step") || "0");
let tutorialOverlayEl = null;
let typewriterInterval = null;

window.addEventListener("load", () => {
    if (localStorage.getItem("devworld_general_tutorial_done") === "true") return;
    startTutorial();
});

function startTutorial() {
    createTutorialUI();
    showStep();
}

function createTutorialUI() {
    if (document.getElementById("tutorial-overlay")) return;

    tutorialOverlayEl = document.createElement("div");
    tutorialOverlayEl.id = "tutorial-overlay";
    tutorialOverlayEl.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
        background: rgba(0,0,0,0.5); z-index: 99999; display: flex;
        flex-direction: column; align-items: center; justify-content: center;
        padding: 20px; pointer-events: auto; font-family: 'Cherry Bomb One', cursive, sans-serif;
    `;

    tutorialOverlayEl.innerHTML = `
        <div id="tutorial-bubble" style="
            background: #ffffff; border: 4px solid #000000;
            border-radius: 20px; box-shadow: 0 8px 0px #000000; width: 100%; max-width: 440px;
            padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 14px; cursor: pointer; z-index: 100001; text-align: center;
        ">
            <div style="display: flex; align-items: center; justify-content: center; gap: 15px; width: 100%;">
                <img id="tutorial-avatar" src="assets/onload/pip_TTRL.NTLK.png" style="width: 70px; height: 70px; object-fit: contain; flex-shrink: 0; border: 2px solid #000; border-radius: 12px; background: #f8f9fa;" onerror="this.src='assets/onload/pip_TTRL.NTLK.png'">
                <div style="flex-grow: 1; display: flex; flex-direction: column; gap: 4px; text-align: left;">
                    <div id="tutorial-text" style="font-size: 16px; color: #000; min-height: 40px; line-height: 1.3;"></div>
                    <div style="font-size: 10px; color: #666; font-family: Arial, sans-serif; text-align: right;">Click anywhere to continue ▶</div>
                </div>
            </div>
            <div id="tutorial-image-container" style="display: none; width: 100%; text-align: center; border-top: 2px dashed #000; padding-top: 12px; background: #f8f9fa; border-radius: 10px; padding: 10px;">
                <img id="tutorial-screenshot" src="" style="max-width: 100%; max-height: 220px; border: 2px solid #000; border-radius: 8px; object-fit: contain; display: block; margin: 0 auto;" onerror="this.style.display='none'">
            </div>
        </div>
    `;

    document.body.appendChild(tutorialOverlayEl);
    tutorialOverlayEl.addEventListener("click", handleTutorialClick);
}

function showStep() {
    if (currentStepIndex >= TUTORIAL_STEPS.length) {
        endTutorial();
        return;
    }

    const step = TUTORIAL_STEPS[currentStepIndex];
    const textEl = document.getElementById("tutorial-text");
    const avatarEl = document.getElementById("tutorial-avatar");
    const imageContainer = document.getElementById("tutorial-image-container");
    const screenshotEl = document.getElementById("tutorial-screenshot");

    textEl.innerHTML = "";
    clearTimeout(typewriterInterval);

    if (step.image) {
        imageContainer.style.display = "block";
        screenshotEl.style.display = "block";
        screenshotEl.src = step.image;
    } else {
        imageContainer.style.display = "none";
        screenshotEl.src = "";
    }

    let charIndex = 0;
    let isTalking = false;
    const fullText = (window.DWLang ? DWLang.t(step.text) : step.text);

    typewriterInterval = setInterval(() => {
        if (charIndex < fullText.length) {
            textEl.innerHTML += fullText.charAt(charIndex);
            isTalking = !isTalking;
            avatarEl.src = isTalking ? "tutorial/pip_TTRL.TLK.png" : "tutorial/pip_TTRL.NTLK.png";
            charIndex++;
        } else {
            clearInterval(typewriterInterval);
            avatarEl.src = "tutorial/pip_TTRL.NTLK.png";
        }
    }, 45);
}

function handleTutorialClick() {
    currentStepIndex++;
    localStorage.setItem("devworld_general_tutorial_step", currentStepIndex);
    showStep();
}

function endTutorial() {
    localStorage.setItem("devworld_general_tutorial_done", "true");
    if (tutorialOverlayEl) {
        tutorialOverlayEl.remove();
    }
}