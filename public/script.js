const generateBtn =
    document.getElementById("generateBtn");

const generationStatus =
    document.getElementById("generationStatus");

const statusText =
    generationStatus.querySelector("span");

const imageInput =
    document.getElementById("imageInput");

const imageInputReplace =
    document.getElementById("imageInputReplace");


generateBtn.addEventListener("click", async () => {


    const prompt =
        document.getElementById("prompt").value.trim();


    const variations =
        document.getElementById("variations").value;


    const model =
        document.getElementById("model").value;


    const resultsContainer =
        document.getElementById("resultsContainer");


    /* =========================================
       VALIDATE PROMPT
    ========================================= */

    if (!prompt) {

        alert(
            "Please describe what you want to generate."
        );

        return;

    }


    /* =========================================
       FIND REFERENCE IMAGE
    ========================================= */

    let referenceFile = null;


    if (
        imageInput &&
        imageInput.files &&
        imageInput.files.length > 0
    ) {

        referenceFile =
            imageInput.files[0];

    }
    else if (
        imageInputReplace &&
        imageInputReplace.files &&
        imageInputReplace.files.length > 0
    ) {

        referenceFile =
            imageInputReplace.files[0];

    }


    /* =========================================
       DISABLE BUTTON
    ========================================= */

    generateBtn.disabled = true;

    generateBtn.textContent =
        "Generating with Cloudinary...";


    generationStatus.style.display =
        "flex";


    statusText.textContent =
        referenceFile
            ? "Preparing your product reference..."
            : "Preparing your creative workflow...";


    /* =========================================
       EMPTY RESULT AREA
    ========================================= */

    resultsContainer.innerHTML = `

        <div class="placeholder">

            <div class="placeholder-glow">
                ✦
            </div>

            <strong>
                AI is creating your product visuals
            </strong>

            <span>
                Building ${variations}
                campaign-ready visual${Number(variations) > 1 ? "s" : ""}...
            </span>

        </div>

    `;


    /* =========================================
       STATUS ANIMATION
    ========================================= */

    const statusMessages =
        referenceFile

            ? [
                "Uploading product reference...",
                "Analyzing your creative direction...",
                "Generating product variations...",
                "Preparing Cloudinary delivery..."
            ]

            : [
                "Sending creative direction to Cloudinary AI...",
                "Generating product variations...",
                "Processing managed assets...",
                "Preparing Cloudinary delivery..."
            ];


    let statusIndex = 0;


    const statusInterval =
        setInterval(() => {

            if (
                statusIndex <
                statusMessages.length
            ) {

                statusText.textContent =
                    statusMessages[statusIndex];

                statusIndex++;

            }

        }, 1800);



    try {


        /* =========================================
           FORM DATA
        ========================================= */

        const formData =
            new FormData();


        formData.append(
            "prompt",
            prompt
        );


        formData.append(
            "variations",
            variations
        );


        formData.append(
            "model",
            model
        );


        if (referenceFile) {

            formData.append(
                "referenceImage",
                referenceFile
            );

        }


        /* =========================================
           SEND TO BACKEND
        ========================================= */

        const response =
            await fetch(
                "/generate",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "Generation failed"
            );

        }


        clearInterval(
            statusInterval
        );


        statusText.textContent =
            data.usedReferenceImage
                ? "Reference-based assets delivered from Cloudinary"
                : "Assets successfully delivered from Cloudinary";


        /* =========================================
           DISPLAY RESULTS
        ========================================= */

        resultsContainer.innerHTML =
            "";


        data.results.forEach(
            (imageUrl, index) => {


                const resultCard =
                    document.createElement("div");


                resultCard.className =
                    "result-card";


                resultCard.style.animationDelay =
                    `${index * 120}ms`;


                resultCard.innerHTML = `

                    <h3>
                        ${data.usedReferenceImage
                            ? "Reference Variation "
                            : "Variation "
                        }${index + 1}
                    </h3>


                    <img
                        src="${imageUrl}"
                        class="generated-image"
                        alt="AI generated product visual"
                    />


                    <a
                        href="${imageUrl}"
                        target="_blank"
                        class="download-btn"
                    >
                        Open Full Image ↗
                    </a>

                `;


                resultsContainer.appendChild(
                    resultCard
                );

            }
        );


    } catch (error) {


        clearInterval(
            statusInterval
        );


        console.error(
            "Generation error:",
            error
        );


        generationStatus.style.display =
            "none";


        resultsContainer.innerHTML = `

            <div class="placeholder">

                <div class="placeholder-glow">
                    !
                </div>

                <strong>
                    Generation unavailable
                </strong>

                <span>
                    ${error.message}
                </span>

            </div>

        `;


        alert(
            "Generation error: " +
            error.message
        );


    } finally {


        generateBtn.disabled =
            false;


        generateBtn.textContent =
            "✦ Generate Product Visuals";

    }

});