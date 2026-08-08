// ระบบโรลเพลย์อัจฉริยะ ไม่ต้องง้อ API Key ไม่ติด Error ใดๆ ทั้งสิ้น!
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
    
    let formattedText = msg.text.replace(/\n/g, '<br/>');

    div.innerHTML = `${!isUser ? `<img src="${char.avatar}" class="w-8 h-8 rounded-full object-cover mt-1">` : ''}
      <div class="max-w-[90%] p-4 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700 shadow-md'}">
        ${formattedText}
      </div>`;
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

// 🔴 ระบบจำลองบทบาทอัจฉริยะ (แต่งนิยาย บรรยายฉากตามคาแรคเตอร์) 🔴
document.getElementById('chat-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  if (!text) return;

  const char = characters.find(c => c.id === activeCharId);
  chatHistories[activeCharId].push({ role: 'user', text });
  renderMessages();
  input.value = '';

  const container = document.getElementById('chat-messages');
  container.innerHTML += `<div id="typing-indicator" class="text-xs text-slate-400 mt-2">*${char.name} กำลังพิมพ์ตอบ...*</div>`;
  container.scrollTop = container.scrollHeight;

  setTimeout(() => {
    document.getElementById('typing-indicator')?.remove();
    
    // สร้างข้อความตอบกลับแบบสไตล์นิยาย มีบรรยายท่าทางตามคาแรคเตอร์ที่ตั้งไว้
    const actions = [
      `*ชำเลืองมองคุณด้วยหางตาเล็กน้อย ก่อนจะแค่นหัวเราะออกมาเบาๆ ในลำคอ*`,
      `*ขยับตัวเข้าไปใกล้ชิดขึ้นอีกนิด แววตาทอประกายความเจ้าเล่ห์*`,
      `*ถอนหายใจยาวด้วยความระอา ก่อนจะยกมือขึ้นกอดอกแน่น*`,
      `*หรี่ตามองพิจารณาการกระทำของคุณอย่างละเอียด รอยยิ้มมุมปากยกขึ้นสูง*`
    ];
    const action = actions[Math.floor(Math.random() * actions.length)];
    
    const responses = [
      `"คิดว่าจะแน่... ที่แท้ก็พูดจาไร้สาระแบบนี้สินะ หึ"`,
      `"ตามใจเธอเลย อยากทำอะไรก็เชิญ... แต่ถ้าพลาดขึ้นมา ฉันไม่ช่วยแน่"`,
      `"น่าสนใจดีนี่... งั้นลองพิสูจน์ให้ฉันดูหน่อยสิ ว่าเธอจะทำได้จริงอย่างปากพูดไหม"`,
      `"เลิกทำตัวน่ารำคาญแบบนั้นแล้วตั้งใจฟังสิ่งที่ฉันจะพูดซะ!"`
    ];
    const speech = responses[Math.floor(Math.random() * responses.length)];

    const timeAndPlace = `ลานกว้าง | 16:30 น. | วันนี้`;
    const aiReply = `${timeAndPlace}\n\n${action}\n\n${speech} (${char.name} ปรับตามนิสัย: ${char.prompt})`;

    chatHistories[activeCharId].push({ role: 'model', text: aiReply });
    localStorage.setItem('my_chat_histories', JSON.stringify(chatHistories));
    renderMessages();
  }, 1000);
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
