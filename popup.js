document.getElementById('simplify-btn').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: simplifySelectedText
    });
  });
  
//   function simplifySelectedText() {
//     const selectedText = window.getSelection().toString();
//     console.log(selectedText);
//     chrome.runtime.sendMessage({ action: 'simplifyText', text: selectedText });
//   }

  function simplifySelectedText() {
    const selectedText = window.getSelection().toString();
    chrome.runtime.sendMessage({ action: 'simplifyText', text: selectedText }, (response) => {
      if (response && response.simplifiedText) {
        //console.log(response.simplifiedText);
        
        alert("Simplified Text: " + response.simplifiedText);
      } else {
        alert("Error: Could not simplify the text.");
      }
    });
  }
  
  