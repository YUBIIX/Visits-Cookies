const chatBot = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessageButton = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = document.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");

const API_KEY = "AIzaSyD_doR-UpugYWgo2CYEUoux-q_fiJXCXb4";
const API_URL = `https://generativelanguage.googleapis.com/v1beta2/models/text-bison-001:generateText?key=${API_KEY}`;

let userData = {
  message: null,
  file: {
    data: null,
    mime_type: null
  }
};

let chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;

// ฟังก์ชันสำหรับสร้างองค์ประกอบข้อความ
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};

// ฟังก์ชันเพื่อรับการตอบสนองจาก API
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");

  // ตรวจสอบว่ามีไฟล์อยู่หรือไม่
  const fileParts = userData.file && userData.file.data
    ? [{ inline_data: userData.file }]
    : [];

  chatHistory.push({
    role: "user",
    parts: [{ text: userData.message }, ...fileParts]
  });

  const requestOptions = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: {
        text: userData.message // แก้ไขจาก "messages" เป็น "text"
      }
    })
  };

  try {
    const response = await fetch(API_URL, requestOptions);
    const data = await response.json();

    if (!response.ok) throw new Error(data.error.message);

    const apiResponseText = data.candidates?.[0]?.output || "No response";

    messageElement.innerText = apiResponseText;
  } catch (error) {
    console.error(error);
    messageElement.innerText = "Error: Unable to fetch response.";
  } finally {
    userData.file = {}; // ล้างข้อมูลไฟล์
    incomingMessageDiv.classList.remove("thinking");
    chatBot.scrollTo({ top: chatBot.scrollHeight, behavior: "smooth" });
  }
};

// ฟังก์ชันสำหรับจัดการข้อความขาออก
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  userData.message = messageInput.value.trim();
  if (!userData.message) return;

  messageInput.value = "";
  fileUploadWrapper.classList.remove("file-uploaded");
  messageInput.dispatchEvent(new Event("input"));

  const messageContent = `
    <div class="message-text"></div>
    ${userData.file.data 
      ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment" />` 
      : ""}`;

  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  outgoingMessageDiv.querySelector(".message-text").textContent = userData.message;
  chatBot.appendChild(outgoingMessageDiv);
  chatBot.scrollTo({ top: chatBot.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    const messageContent = ` 
      <svg class="bot-avatar" xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="0 0 1024 1024">
        <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"></path>
      </svg>
      <div class="message-text">
        <div class="thinking-indicator">
          <div class="dot"></div>
          <div class="dot"></div>
          <div class="dot"></div>
        </div>
      </div>`;

    const incomingMessageDiv = createMessageElement(messageContent, "bot-message", "thinking");
    chatBot.appendChild(incomingMessageDiv);
    chatBot.scrollTo({ top: chatBot.scrollHeight, behavior: "smooth" });

    generateBotResponse(incomingMessageDiv);
  }, 600);
};

// Event listener เมื่อกด Enter เพื่อส่งข้อความ
messageInput.addEventListener("keydown", (e) => {
  const userMessage = e.target.value.trim();
  if (e.key === "Enter" && userMessage && !e.shiftKey) {
    handleOutgoingMessage(e);
  }
});

// อัปเดตความสูงของ textarea เมื่อผู้ใช้พิมพ์
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius =
    messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});

// การจัดการไฟล์อัปโหลด
fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file && file.type.startsWith("image/")) {
    const reader = new FileReader();
    reader.onload = () => {
      userData.file.data = reader.result.split(",")[1]; // แปลงเป็น Base64
      userData.file.mime_type = file.type;
      fileUploadWrapper.classList.add("file-uploaded");
      document.querySelector("#file-preview").src = reader.result;
    };
    reader.readAsDataURL(file);
  }
});

// ยกเลิกการอัปโหลดไฟล์
fileCancelButton.addEventListener("click", () => {
  fileUploadWrapper.classList.remove("file-uploaded");
  fileInput.value = "";
  userData.file = { data: null, mime_type: null };
});

// เปิด/ปิด Chatbot
chatbotToggler.addEventListener("click", () => {
  document.body.classList.toggle("show-chatbot");
});

closeChatbot.addEventListener("click", () => {
  document.body.classList.remove("show-chatbot");
});
