// ===============================
// TRANSLATION
// ===============================

async function translateText() {

    const sourceText = document
        .getElementById("source-text")
        .value
        .trim();

    const sourceLanguage = document
        .getElementById("source-language")
        .value;

    const targetLanguage = document
        .getElementById("target-language")
        .value;

    const translatedText = document
        .getElementById("translated-text");


    // Empty text check
    if (!sourceText) {
        translatedText.value = "Please enter text to translate.";
        return;
    }


    // Same language check
    if (sourceLanguage === targetLanguage) {
        translatedText.value = sourceText;
        return;
    }


    try {

        translatedText.value = "Translating...";


        // MyMemory API
        const url =
            `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${sourceLanguage}|${targetLanguage}`;


        const response = await fetch(url);

        const data = await response.json();


        if (!response.ok) {
            throw new Error("Translation request failed.");
        }


        if (
            data.responseData &&
            data.responseData.translatedText
        ) {

            translatedText.value =
                data.responseData.translatedText;

        } else {

            translatedText.value =
                "Translation not available.";

        }


    } catch (error) {

        console.error("Translation Error:", error);

        translatedText.value =
            "Translation failed. Please try again.";

    }
}


// ===============================
// TRANSLATE BUTTON
// ===============================

document
    .getElementById("translate-button")
    .addEventListener("click", translateText);


// ===============================
// SWAP LANGUAGES
// ===============================

document
    .getElementById("swap-language")
    .addEventListener("click", function () {

        const sourceLanguage =
            document.getElementById("source-language");

        const targetLanguage =
            document.getElementById("target-language");


        // Swap languages
        const temp = sourceLanguage.value;

        sourceLanguage.value =
            targetLanguage.value;

        targetLanguage.value =
            temp;


        // Swap text
        const sourceText =
            document.getElementById("source-text");

        const translatedText =
            document.getElementById("translated-text");


        const tempText =
            sourceText.value;

        sourceText.value =
            translatedText.value;

        translatedText.value =
            tempText;

    });