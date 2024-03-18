const chatbotToggler = document.querySelector(".chatbot-toggler");
const closeBtn = document.querySelector(".close-btn");
const chatbox = document.querySelector(".chatbox");
const chatInput = document.querySelector(".chat-input textarea");
const sendChatBtn = document.querySelector(".chat-input span");
const inputInitHeight = chatInput.scrollHeight;

window.addEventListener('DOMContentLoaded', (event) => {
  chatInput.focus();

  document.querySelector("form[name='chatInput']").addEventListener("submit", function(e) {
    e.preventDefault(); 
    handleChat(); 
  });
});

const createChatLi = (message, className) => {
  const chatLi = document.createElement("li");
  chatLi.classList.add("chat", `${className}`);
  let chatContent = className === "outgoing" ? `<p></p>` : `<span class="material-symbols-outlined"><img src="{{ url_for('static', filename='Images/botsmall.png') }}" alt=""></span><p></p>`;
  chatLi.innerHTML = chatContent;
  chatLi.querySelector("p").textContent = message;
  return chatLi; 
}

const handleChat = () => {
  userMessage = chatInput.value.trim(); 
  if(!userMessage) return;

  chatInput.style.height = `${inputInitHeight}px`;
  chatbox.appendChild(createChatLi(userMessage, "outgoing"));
  chatbox.scrollTo(0, chatbox.scrollHeight);
  
  setTimeout(() => {      
    const incomingChatLi = createChatLi("Typing...", "incoming");
    chatbox.appendChild(incomingChatLi);
    chatbox.scrollTo(0, chatbox.scrollHeight);
    generateResponse(incomingChatLi);
  }, 600);
}

const generateResponse = (chatElement) => {
  const messageElement = chatElement.querySelector("p");
  fetch("/send-message", {
    method: "POST",
    body: new URLSearchParams({ userInput: userMessage }),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  })
  .then(response => response.json())
  .then(data => {       
    messageElement.textContent = data.message;
    chatInput.value = "";
  }).catch(() => {
    messageElement.classList.add("error");
    messageElement.textContent = "Network Error . Please try again.";
  }).finally(() => chatbox.scrollTo(0, chatbox.scrollHeight));
}

chatInput.addEventListener("input", () => {
  chatInput.style.height = `${inputInitHeight}px`;
  chatInput.style.height = `${chatInput.scrollHeight}px`;
});

chatInput.addEventListener("keydown", (e) => {
  if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
    e.preventDefault();
    handleChat();
  }
});

sendChatBtn.addEventListener("click", handleChat);
closeBtn.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

chatInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    chatInput.value = '';
  }
});

const myText = document.getElementById("my-text");
const result = document.getElementById("result");
const limit = 30;

const updateWordCount = () => {
  const text = myText.value.trim();
  const words = text.split(/\s+/);
  const wordCount = words.length;
  result.textContent = `${wordCount}/${limit}`;

  if (wordCount > limit) {
    myText.value = words.slice(0, limit).join(" ");
    result.textContent = `${limit}/${limit}`;
  }
};

myText.addEventListener("input", updateWordCount);

chatInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    result.textContent = `0/${limit}`;
  }
});
