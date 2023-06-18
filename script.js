function getQuestionCount() {
  return parseInt(sessionStorage.getItem('questionCount')) || 0;
}

function setQuestionCount(count) {
  sessionStorage.setItem('questionCount', count);
}

let recognition;

function appendMessage(message, isUser = false) {
  const chatlog = document.getElementById('chatlog');
  const messageElement = document.createElement('div');
  messageElement.className = isUser ? 'message user' : 'message chatgpt';

  const iconElement = document.createElement('img');
  iconElement.className = 'icon';
  iconElement.src = isUser ? 'https://avatars.githubusercontent.com/u/130109852?v=4' : 'https://static.vecteezy.com/system/resources/previews/021/059/827/original/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg';
  iconElement.alt = isUser ? 'User Icon' : 'TalkGPT Icon';

  const contentElement = document.createElement('div');
  contentElement.className = 'content';
  contentElement.innerHTML = message;

  messageElement.appendChild(iconElement);
  messageElement.appendChild(contentElement);

  chatlog.appendChild(messageElement);
  chatlog.scrollTop = chatlog.scrollHeight;
}

function removeDefaultDiv() {
  const defaultDiv = document.querySelector('.default');
  if (defaultDiv) {
    defaultDiv.remove();
  }
}

function sendMessage() {
  const userInput = document.getElementById('userinput');
  const message = userInput.value;

  const questionCount = getQuestionCount();
  if (questionCount >= 15) {
    appendMessage("Sorry! You have reached the limit of TalkGPT usage for today.");
    return;
  }

  userInput.value = '';
  removeDefaultDiv();
  appendMessage(message, true);
  fetch('/get_response', {
    method: 'POST',
    headers: {
      'questionCount': questionCount.toString()
    },
    body: message,
  })
    .then((response) => response.text())
    .then((data) => {
      appendMessage(data);
      speak(data);
    });

  setQuestionCount(questionCount + 1);
}

function startVoiceInput() {
  recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';
  recognition.onresult = function (event) {
    const result = event.results[event.results.length - 1];
    const transcript = result[0].transcript.trim();
    if (result.isFinal) {
      recognition.stop();
      const userInput = document.getElementById('userinput');
      userInput.value = transcript;
      sendMessage();
    }
  };
  recognition.start();
  removeDefaultDiv();
}

function stopVoiceInput() {
  if (recognition) {
    recognition.stop();
  }
}

function speak(text) {
  const speech = new SpeechSynthesisUtterance();
  speech.text = text;
  speech.volume = 1.0;
  speech.rate = 1.0;
  speech.pitch = 1.0;
  window.speechSynthesis.speak(speech);
}

// Reset question count to zero when page is refreshed
window.addEventListener('beforeunload', function () {
  setQuestionCount(0);
});
