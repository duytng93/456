import { apiKey } from "./apiKey.js";
var selectedLanguage = "en";
var systemMessage = "You are an assistant that simplifies text for people with learning disabilities. Therefore, you need to make it clear and simple. Try to use clear and simple words.";
var firstUserMessage = "Please help me summarize this text for easy understanding: ";
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
      sendResponse({ simplifiedText: simplifiedText, firstUserMessage: firstUserMessage });
    });
  }else if(request.action === 'askQuestion'){
    const formattedConversation = request.text;
    // Call your OpenAI API function here or handle the text processing.
    askQuestion(formattedConversation).then((response) => {
      sendResponse({ answer: response });
  })}else if(request.action === 'changeLanguage'){
    selectedLanguage = request.language;
    updateTextLanguage();
  }else if(request.action === 'getLanguage'){
    sendResponse({ language: selectedLanguage });
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
      model: "gpt-4o-mini",  // Or gpt-4 if available
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: firstUserMessage + text }
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
    { role: "system", content: systemMessage },
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

function updateTextLanguage(){
  if(selectedLanguage === "en"){
    systemMessage = "You are an assistant that simplifies text for people with learning disabilities. Therefore, you need to make it clear and simple. Try to use clear and simple words.";
    firstUserMessage = "Please help me summarize this text for easy understanding: ";
  }else if(selectedLanguage === "es"){
    systemMessage = "Eres un asistente que simplifica el texto para personas con discapacidades de aprendizaje. Por lo tanto, debes hacerlo claro y simple. Trata de usar palabras claras y simples.";
    firstUserMessage = "Por favor, ayúdame a resumir este texto para que sea fácil de entender: ";
  }else if(selectedLanguage === "vi"){
    systemMessage = "Bạn là một trợ lý giúp đỡ đơn giản hóa văn bản cho những người khuyết tật học. Do đó, bạn cần làm cho nó rõ ràng và đơn giản. Hãy cố gắng sử dụng từ ngữ rõ ràng và đơn giản.";
    firstUserMessage = "Hãy giúp tôi tóm tắt văn bản này để dễ hiểu: ";
  }
}

