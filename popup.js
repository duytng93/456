var conversation = [];
var conversationDiv = document.getElementById("conversationDiv");
var QAdiv = document.getElementById("QAdiv");

document.getElementById("simplify-btn").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript(
    {
      target: { tabId: tab.id },
      function: sendSelectedText,
    },
    () => {
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.action === "simplifyText") {
          conversation.push("Simplify this text: " + message.text);
          chrome.runtime.sendMessage(
            { action: "simplifyText", text: message.text },
            (response) => {
              if (response && response.simplifiedText) {
                
                document.getElementById("body").classList.add("expanded-body");
                document.getElementById("header").style.display = "none";
                QAdiv.style.display='block';
                setTimeout(() => {
                  QAdiv.style.opacity = '1';
              }, 10);
                conversationDiv.style.display = "block";

                if (!conversationDiv.style.height) {
                  setTimeout(() => {
                    conversationDiv.style.height = "400px";
                  }, 10);
                }
                conversation.push(response.simplifiedText);
                let div = createMessageDiv(
                  "",
                  "assistant"
                );
                conversationDiv.appendChild(div);
                setTimeout(() => (div.style.opacity = "1"), 10);
                appendLetterByLetter(
                  div.getElementsByClassName("messageDiv").item(0),
                  response.simplifiedText,
                  0
                );
                conversationDiv.scrollTop = conversationDiv.scrollHeight;
                console.log(conversation)
              } else {
                alert("Error: Could not simplify the text.");
              }
            }
          );
        }
      });
    }
  );
});

function sendSelectedText() {
  const selectedText = window.getSelection().toString();
  chrome.runtime.sendMessage({ action: "simplifyText", text: selectedText });
}

function askQuestion(formattedConversation) {
  chrome.runtime.sendMessage(
    { action: "askQuestion", text: formattedConversation },
    (response) => {
      if (response && response.answer) {
        conversation.push(response.answer);
        let div = createMessageDiv("", "assistant");
        conversationDiv.appendChild(div);
        setTimeout(() => {
          div.style.opacity = "1";
        }, 10);
        appendLetterByLetter(
          div.getElementsByClassName("messageDiv").item(0),
          response.answer,
          0
        );
      }
    }
  );
}

document
  .getElementById("question")
  .addEventListener("keydown", function (event) {
    // Check if Enter is pressed without the Shift key
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent the default behavior (inserting a newline)
      writeAndSubmit(); // Submit the form
    }
  });

function writeAndSubmit() {
  //get question text
  const newMessage = document.getElementById("question").value;
  const conversationDiv = document.getElementById("conversationDiv");
  conversation.push(newMessage);
  

  // show loading animation
  conversationDiv.style.display = "block";
  document.getElementById("loadingGif").style.display = "block";
  setTimeout(() => {
    document.getElementById("loadingGif").style.opacity = "1";
  }, 10);

  //reset question text
  document.getElementById("question").value = "";

  //create message div and append to conversation div
  const div = createMessageDiv(newMessage, "user");
  if (!conversationDiv.style.height) {
    setTimeout(() => {
      conversationDiv.style.height = "350px";
    }, 10);
    document.getElementById("closeChatBtn").style.display = "block";
  }
  conversationDiv.appendChild(div);
  setTimeout(() => {
    div.style.opacity = "1";
  }, 10);
  conversationDiv.scrollTop = conversationDiv.scrollHeight;

  // send question to backend and get response
  askQuestion(formatConversation(conversation));
}

function createMessageDiv(newMessage, role) {
  // const conversationDiv = document.getElementById('conversationDiv');
  const div = document.createElement("div");
  div.classList.add("messageContainerDiv");
  const messageDiv = document.createElement("div");
  const messageLogoDiv = document.createElement("div");
  messageDiv.classList.add("messageDiv");
  messageDiv.textContent = newMessage;
  const img = document.createElement("img");
  img.style.width = "30px"; // Example width
  img.style.height = "30px"; // Example height
  messageLogoDiv.classList.add("messageLogoDiv");
  if (role === "user") {
    img.src = "images/user-icon.png";
    messageLogoDiv.appendChild(img);
    div.appendChild(messageLogoDiv);
    div.appendChild(messageDiv);
  } else {
    img.src = "images/open-ai-logo.png";
    messageLogoDiv.appendChild(img);
    div.appendChild(messageDiv);
    div.appendChild(messageLogoDiv);
  }

  div.style.marginBottom = "10px";
  return div;
}

function appendLetterByLetter(messageDiv, response, index) {
  if (index < response.length) {
    messageDiv.textContent += response.charAt(index); // Append current letter
    document.getElementById("conversationDiv").scrollTop =
      document.getElementById("conversationDiv").scrollHeight;
    setTimeout(() => appendLetterByLetter(messageDiv, response, index + 1), 10); // Wait 10ms then append next letter
  } else {
    setTimeout(() => {
      document.getElementById("loadingGif").style.opacity = 0;
    }, 500);
    setTimeout(() => {
      document.getElementById("loadingGif").style.display = "none";
    }, 1000);
  }
}

function formatConversation(conversation) {
  var formattedConversation = [];
  for (var i = 0; i < conversation.length; i++) {
    if (i % 2 == 0) {
      formattedConversation.push({ role: "user", content: conversation[i] });
    } else {
      formattedConversation.push({
        role: "assistant",
        content: conversation[i],
      });
    }
  }
  return formattedConversation;
}
