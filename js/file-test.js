const TEST_FILE_NAME = "social-circle-test.md";
let directoryHandle = null;

function setStatus(element, message, state = "neutral") {
  element.textContent = message;
  element.dataset.state = state;
}

export function initFileTest() {
  const openButton = document.querySelector("#open-settings");
  const chooseButton = document.querySelector("#choose-folder");
  const writeButton = document.querySelector("#write-test-file");
  const folderLabel = document.querySelector("#selected-folder");
  const status = document.querySelector("#file-test-status");
  const supported = "showDirectoryPicker" in window;

  openButton.addEventListener("click", () => { location.hash = "settings"; });

  if (!supported) {
    chooseButton.disabled = true;
    setStatus(status, "Den här webbläsaren stöder inte val av skrivbar mapp. Prova Microsoft Edge eller Chrome på Windows.", "error");
    return;
  }

  chooseButton.addEventListener("click", async () => {
    try {
      directoryHandle = await window.showDirectoryPicker({ id: "social-circle-test-folder", mode: "readwrite" });
      folderLabel.textContent = directoryHandle.name;
      writeButton.disabled = false;
      setStatus(status, "Mappen är vald. Nu kan du testskriva filen.", "ready");
    } catch (error) {
      if (error.name !== "AbortError") setStatus(status, `Mappen kunde inte öppnas: ${error.message}`, "error");
    }
  });

  writeButton.addEventListener("click", async () => {
    if (!directoryHandle) return;
    writeButton.disabled = true;
    setStatus(status, "Skriver och kontrollerar testfilen …");
    const marker = new Date().toISOString();
    const contents = `---\napp: Social Circle\ntype: file-access-test\ncreated: ${marker}\n---\n\nOm du kan läsa detta har Social Circle lyckats skriva en Markdown-fil.\n`;

    try {
      const permission = await directoryHandle.requestPermission({ mode: "readwrite" });
      if (permission !== "granted") throw new Error("Skrivbehörighet nekades");
      const fileHandle = await directoryHandle.getFileHandle(TEST_FILE_NAME, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(contents);
      await writable.close();
      const savedFile = await fileHandle.getFile();
      const savedContents = await savedFile.text();
      if (!savedContents.includes(marker)) throw new Error("Filen skrevs men kunde inte verifieras");
      setStatus(status, `Klart! ${TEST_FILE_NAME} skapades och lästes tillbaka korrekt.`, "success");
    } catch (error) {
      setStatus(status, `Testet misslyckades: ${error.message}`, "error");
    } finally {
      writeButton.disabled = false;
    }
  });
}
