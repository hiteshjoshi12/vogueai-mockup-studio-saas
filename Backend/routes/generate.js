const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User'); // Your Mongoose User model
const requireAuth = require('../middleware/auth');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = "gemini-2.5-flash-image";

router.post('/', requireAuth, async (req, res) => {
  try {
    const { compressedImage, config } = req.body;
    const userId = req.user.id;

    // 1. VERIFY TOKENS IN DATABASE (Ultimate Source of Truth)
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (user.tokens <= 0) {
      return res.status(403).json({ error: 'Insufficient tokens. Please upgrade.' });
    }

    // 2. BUILD THE PROMPT ON THE SERVER (Prevents Prompt Injection)
    let shotType = "Medium shot, waist-up portrait";
    if (config.category === "Shoes/Sneakers") shotType = "Low angle, feet focus";
    if (config.category === "Full Outfit/Dress") shotType = "Full body shot";
    if (config.category === "Bag/Hat/Jewelry") shotType = "Close-up macro";

    const prompt = `
      TASK: Professional Fashion Mockup Generation.
      CONTEXT: Product: ${config.category}, Angle: ${shotType}, Model: ${config.ethnicity} ${config.gender} ${config.age}yo, Environment: ${config.setting}, Lighting: ${config.lighting}.
      REQUIREMENTS: Photorealistic, 8k resolution.
    `.replace(/\s+/g, ' ').trim();

    // 3. EXTRACT MIME TYPE & BASE64 DATA
    const [header, base64Data] = compressedImage.split(',');
    const mimeMatch = header.match(/:(.*?);/);
    const mimeType = mimeMatch ? mimeMatch[1] : "image/webp";

    // 4. CALL GEMINI API
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent([
      prompt,
      { 
        inlineData: { 
          data: base64Data, 
          mimeType: mimeType 
        } 
      }
    ]);

    const parts = result.response.candidates?.[0]?.content?.parts;
    const imagePart = parts?.find(part => part.inlineData);

    if (!imagePart || !imagePart.inlineData) {
      throw new Error("Model failed to generate image.");
    }

    const generatedImageUrl = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    // 5. DEDUCT TOKEN & SAVE
    user.tokens -= 1;
    await user.save();

    // 6. RETURN SUCCESS
    res.status(200).json({ 
      imageUrl: generatedImageUrl, 
      tokensRemaining: user.tokens 
    });

  } catch (error) {
    console.error("Backend Generation Error:", error);
    res.status(500).json({ error: "Failed to generate mockup." });
  }
});

module.exports = router;