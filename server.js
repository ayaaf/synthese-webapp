const express = require("express");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 3001;

/**
 * POST endpoint for synthesizing text-to-speech audio.
 * @param  req - HTTP request object.
 * @param res - HTTP response object.
 */

app.post("/synthesize", async (req, res) => {
  const { text, voice, service, pitch, speakingRate } = req.body;

  try {
    let audioSrc;
    if (service === "voicerss") {
      // VoiceRSS
      const voicerssApiKey = "6067aecd274e4d909713316c46fd5094";
      const voicerssUrl = "http://api.voicerss.org/";
      const voicerssResponse = await axios.get(
        `${voicerssUrl}?key=${voicerssApiKey}&hl=de-de&v=${voice}&c=WAV&f=48khz_16bit_mono&src=${text}`,
        { responseType: "arraybuffer" }
      );
      const voicerssAudioBuffer = Buffer.from(voicerssResponse.data, "binary");
      audioSrc = `data:audio/wav;base64,${voicerssAudioBuffer.toString("base64")}`;
    } else if (service === "google") {
      // Google Cloud
      const googleApiKey = "AIzaSyAtt558vmWY7d4zTsXTRUuzwxXZIXnDjWk";
      const googleEndpoint = `https://texttospeech.googleapis.com/v1beta1/text:synthesize?key=${googleApiKey}`;

      let voiceName = "de-DE-Wavenet-A"; 
      if (voice === "de-DE-Wavenet-C") {
        voiceName = "de-DE-Wavenet-C";
      }

      if (voice === "de-DE-Wavenet-F") {
        voiceName = "de-DE-Wavenet-F";
      }

      const googlePayload = {
        audioConfig: {
          audioEncoding: "LINEAR16",
          "pitch": pitch,
          "speakingRate": speakingRate,
        },

        input: {
          text: text,
        },
        voice: {
          languageCode: "de-DE",
          name: voiceName,
        },
      };
      const googleResponse = await axios.post(googleEndpoint, googlePayload);
      audioSrc = `data:audio/wav;base64,${googleResponse.data.audioContent}`;
    }
    
    res.json({ audioSrc });
  } catch (error) {
    console.error("Error in /synthesize:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

/**
 * Start the server and listen on the specified port.
 */
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));
