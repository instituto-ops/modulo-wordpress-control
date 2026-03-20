const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI("AIzaSyBtVFHJjN3CsUytHfRXzEqxgq5hj9hbcrQ");
(async () => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const result = await model.generateContent("Respond 'OK'");
        console.log("SUCCESS:", result.response.text());
    } catch (e) {
        console.error("FAILED:", e.message);
    }
})();
