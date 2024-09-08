import { apiKey } from "./apiKey.js";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "simplifyText",
    title: "Simplify Text",
    contexts: ["selection"]
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'simplifyText') {
    const selectedText = request.text;
    // Call your OpenAI API function here or handle the text processing.
    getSimplifiedText(selectedText).then((simplifiedText) => {
      sendResponse({ simplifiedText: simplifiedText });
    });
  }
  return true;  // Required when using sendResponse asynchronously
});

async function getSimplifiedText(text) {
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",  // Or gpt-4 if available
      messages: [
        // { role: "system", content: "You are an assistant that simplifies text for easier understanding." },
        // { role: "user", content: `Simplify this text: "${text}"` }
        { role: "system", content: "You are an assistant" },
        { role: "user", content: `Tell me a little bit about yourself` }
      ],
      max_tokens: 200
    })
  });

  const data = await response.json();
  
  if (response.ok) {
    return data.choices[0].message.content.trim();
  } else {
    console.error("API Error:", data);
    throw new Error("Failed to simplify text");
  }
}


