// โค้ดแบบออฟไลน์ 100% สบายที่สุด ไม่ต้องใช้ API Key อีกต่อไป!

let characters = JSON.parse(localStorage.getItem('my_characters')) || [];
let activeCharId = null;
let chatHistories = JSON.parse(localStorage.getItem('my_chat_histories')) || {};
let currentAvatarBase64 = "https://via.placeholder.com/100";

const viewCreate = document.getElementById('view-create');
const viewChat = document.getElementById('view-chat');
const btnShowCreate = document.getElementById('btn-show-create');
const characterListEl = document.getElementById('character-list');
const createForm = document.getElementById('create-character-form');
const avatarFileInput = document.getElementById('avatar-file');
const avatarPreview = document.getElementById('avatar-preview');

// ซ่อนช่อง API Key ทิ้งไปเลย
const apiKeyInput = document.getElementById('api-key-input');
if (apiKeyInput && apiKeyInput.parentElement) {
    apiKeyInput.parentElement.style.display = 'none';
}

avatarFileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(evt) {
      currentAvatarBase64 = evt.target.result;
      avatarPreview.src = currentAvatarBase64;
    };
    reader.readAsDataURL(file);
  }
});

createForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const newChar = {
    id: Date.now().toString(),
    name: document.getElementById('char-name').value,
    prompt: document.getElementById('char-prompt').value,
    greeting: document.getElementById('char-greeting').value || "สวัสดี",
    avatar: currentAvatarBase64
  };
  characters.push(newChar);
  localStorage.setItem('my_characters', JSON.stringify(characters));
  chatHistories[newChar.id] = [{ role: 'model', text: newChar.greeting }];
  localStorage.setItem('my_chat_histories', JSON.stringify(chatHistories));
  createForm.reset();
  avatarPreview.src = "https://via.placeholder.com/100";
  renderCharacterList();
  openChat(newChar.id);
});

function renderCharacterList() {
  characterListEl.innerHTML = '';
  characters.forEach(char => {
    const btn = document.createElement('div');
    btn.className = `flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-slate-700/50 transition ${activeCharId === char.id ? 'bg-slate-700' : ''}`;
    btn.onclick = () => openChat(char.id);
    btn.innerHTML = `<img src="${char.avatar}" class="w-9 h-9 rounded-full object-cover">
      <span class="font-medium text-sm text-slate-200 truncate">${char.name}</span>`;
    characterListEl.appendChild(btn);
  });
}

function openChat(charId) {
  activeCharId = charId;
  const char = characters.find(c => c.id === charId);
  document.getElementById('chat-name').innerText = char.name;
  document.getElementById('chat-avatar').src = char.avatar;
  viewCreate.classList.add('hidden');
  viewChat.classList.remove('hidden');
  renderCharacterList();
  renderMessages();
}

btnShowCreate.onclick = () => {
  activeCharId = null;
  viewChat.classList.add('hidden');
  viewCreate.classList.remove('hidden');
  renderCharacterList();
};

function renderMessages() {
  const container = document.getElementById('chat-messages');
  container.innerHTML = '';
  const history = chatHistories[activeCharId] || [];
  const char = characters.find(c => c.id === activeCharId);
  history.forEach(msg => {
    const isUser = msg.role === 'user';
    const div = document.createElement('div');
    div.className = `flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`;
    
    // ทำตัวเอียงเมื่อมีเครื่องหมาย * (สำหรับบรรยายท่าทาง)
    let formattedText = msg.text.replace(/\*(.*?)\*/g, '<span class="text-indigo-300 italic">*$1*</span>');

    div.innerHTML = `${!isUser ? `<img src="${char.avatar}" class="w-8 h-8 rounded-full object-cover mt-1">` : ''}
      <div class="max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'}">
        ${formattedText}
      </div>`;
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

// 🔴 ระบบแชทออฟไลน์ (คุมลอจิกการตอบเอง) 🔴
document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const char = characters.find(c => c.id === activeCharId);
  
  // พิมพ์ข้อความของเรา
  chatHistories[activeCharId].push({ role: 'user', text });
  renderMessages();
  input.value = '';

  const container = document.getElementById('chat-messages');
  container.innerHTML += `<div id="typing-indicator" class="text-xs text-slate-400 mt-2">*${char.name} กำลังพิมพ์...*</div>`;
  container.scrollTop = container.scrollHeight;

  // จำลองเวลาให้เหมือนบอทกำลังคิด (0.8 วินาที)
  setTimeout(() => {
    document.getElementById('typing-indicator')?.remove();
    
    // 💡 ชุดคำตอบ (สามารถพิมพ์เพิ่ม/แก้เองได้ตามใจชอบเลยครับ)
    const replies = [
      `*หรี่ตามอง* แกมีอะไรก็รีบๆ พูดมา!`,
      `*กระทืบเท้าด้วยความหงุดหงิด* ข้าไม่อยากฟังเรื่องไร้สาระ!`,
      `ฮ่าๆๆ ก็เอาสิ ลองดูสักตั้ง!`,
      `*กอดอกแน่น* แล้วแกจะเอายังไงต่อล่ะ?`,
      `ข้าเป็นนักรบนะเว้ย ไม่ใช่เด็กอมมือ!`,
      `*ถอนหายใจแรงๆ* น่ารำคาญชะมัด...`,
      `อืม... ก็ได้ ข้าจะยอมฟังแกสักครั้ง`
    ];
    
    // สุ่มหยิบคำตอบมา 1 ประโยค
    const randomReply = replies[Math.floor(Math.random() * replies.length)];
    
    chatHistories[activeCharId].push({ role: 'model', text: randomReply });
    localStorage.setItem('my_chat_histories', JSON.stringify(chatHistories));
    renderMessages();
  }, 800);
});

document.getElementById('btn-clear-chat').onclick = () => {
  if (confirm('ล้างแชททั้งหมดไหม?')) {
    const char = characters.find(c => c.id === activeCharId);
    chatHistories[activeCharId] = [{ role: 'model', text: char.greeting }];
    localStorage.setItem('my_chat_histories', JSON.stringify(chatHistories));
    renderMessages();
  }
};

renderCharacterList();
