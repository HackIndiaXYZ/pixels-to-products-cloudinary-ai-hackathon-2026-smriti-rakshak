const express = require("express");
const dotenv = require("dotenv");
const multer = require("multer");

dotenv.config();

const app = express();
const PORT = 3000;

const upload = multer({
    storage: multer.memoryStorage()
});

app.use(express.json());
app.use(express.static("public"));


/* =========================================
   GENERATE PRODUCT VISUALS
========================================= */

app.post(
    "/generate",
    upload.single("referenceImage"),
    async (req, res) => {

        try {

            const prompt = req.body.prompt;
            const variations =
                Number(req.body.variations || 1);

            if (!prompt) {

                return res.status(400).json({
                    error: "Prompt is required"
                });

            }


            /*
             * If a reference image exists,
             * upload it to Cloudinary first.
             */

            let referenceUrl = null;


            if (req.file) {

                const base64Image =
                    req.file.buffer.toString("base64");


                referenceUrl =
                    `data:${req.file.mimetype};base64,${base64Image}`;

            }


            const results = [];


            /* =========================================
               GENERATION LOOP
            ========================================= */

            for (let i = 0; i < variations; i++) {


                let endpoint =
                    "text_to_image";


                let requestBody;


                /* =========================================
                   REFERENCE IMAGE MODE
                ========================================= */

                if (referenceUrl) {

                    endpoint =
                        "image_to_image";


                    requestBody = {

                        prompt:
                            `Using [1] as the product reference, ${prompt}. ` +
                            `Preserve the product's recognizable design, ` +
                            `shape, proportions, materials and important details. ` +
                            `Create a realistic commercial product photograph. ` +
                            `This is variation ${i + 1}.`,

                        reference_images: [

                            {
                                source_type: "url",
                                url: referenceUrl
                            }

                        ],

                        model: {
                            mode: "auto",
                            preference: "balanced"
                        },

                        image_size: {
                            aspect_ratio: "4:3",
                            resolution: "1K"
                        },

                        target: {
                            target_type: "managed_asset"
                        }

                    };


                } else {


                    /* =========================================
                       NORMAL TEXT-TO-IMAGE MODE
                    ========================================= */

                    requestBody = {

                        model: {
                            mode: "auto",
                            preference: "balanced"
                        },

                        prompt:
                            `${prompt}. ` +
                            `Create variation ${i + 1}, ` +
                            `while keeping the product realistic ` +
                            `and commercially usable.`,

                        image_size: {
                            aspect_ratio: "4:3",
                            resolution: "1K"
                        },

                        target: {
                            target_type: "managed_asset"
                        }

                    };

                }


                /* =========================================
                   CLOUDINARY REQUEST
                ========================================= */

                const response = await fetch(

                    `https://api.cloudinary.com/v2/generate/` +
                    `${process.env.CLOUDINARY_CLOUD_NAME}/` +
                    `${endpoint}`,

                    {

                        method: "POST",

                        headers: {

                            "Authorization":
                                "Basic " +
                                Buffer.from(
                                    `${process.env.CLOUDINARY_API_KEY}:${process.env.CLOUDINARY_API_SECRET}`
                                ).toString("base64"),

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify(requestBody)

                    }

                );


                const data =
                    await response.json();


                console.log(
                    "Cloudinary response:",
                    data
                );


                if (!response.ok) {

                    throw new Error(
                        data.error?.message ||
                        "Cloudinary generation failed"
                    );

                }


                const imageUrl =
                    data.data.assets[0]
                        .storage.secure_url;


                results.push(imageUrl);

            }


            /* =========================================
               SUCCESS
            ========================================= */

            res.json({

                success: true,

                usedReferenceImage:
                    Boolean(referenceUrl),

                results: results

            });


        } catch (error) {

            console.error(
                "Generation error:",
                error
            );


            res.status(500).json({

                error:
                    error.message

            });

        }

    }
);


app.listen(PORT, () => {

    console.log(
        `Pixel2Product running at http://localhost:${PORT}`
    );

});