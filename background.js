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
  }else if(request.action === 'askQuestion'){
    const formattedConversation = request.text;
    // Call your OpenAI API function here or handle the text processing.
    askQuestion(formattedConversation).then((response) => {
      sendResponse({ answer: response });
  })}
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
      model: "gpt-4o-mini",  // Or gpt-4 if available
      messages: [
        { role: "system", content: "You are an assistant that simplifies text for people with learning disabilities. Therefore, you need to make it clear and simple. Try to use clear and simple words." },
        { role: "user", content: `Please help me understand this text: "${text}"` }
      ],
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

async function askQuestion(formattedConversation) {

  let conversation = [
    { role: "system", content: "You are an assistant that simplifies text for easier understanding." },
  ]

  conversation = conversation.concat(formattedConversation);
  
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",  // Or gpt-4 if available
      messages: conversation,
      max_tokens: 500
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


