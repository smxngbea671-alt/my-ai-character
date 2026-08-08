// 🔴 1. เอา API Key ของคุณมาใส่ตรงนี้ (ให้อยู่ในเครื่องหมายคำพูดนะ) 🔴
const MY_SECRET_API_KEY = "AIzaSyB-รหัสยาวๆ_ของคุณ_ก๊อปมาวางตรงนี้";

// สถานะแอป
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

// 🔴 2. ซ่อนกล่องใส่ API Key มุมซ้ายล่างทิ้งไปเลย (ไม่ต้องเห็นให้กวนใจอีก) 🔴
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
    
    // แปลงเครื่องหมาย *...* ให้เป็นตัวเอียงสีจางๆ (บรรยายท่าทาง)
    let formattedText = msg.text.replace(/\*(.*?)\*/g, '<span class="text-indigo-300 italic">*$1*</span>');

    div.innerHTML = `${!isUser ? `<img src="${char.avatar}" class="w-8 h-8 rounded-full object-cover mt-1">` : ''}
      <div class="max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700'}">
        ${formattedText}
      </div>`;
    container.appendChild(div);
  });
  container.scrollTop = container.scrollHeight;
}

// ระบบเชื่อมต่อสมอง AI แบบ Roleplay
document.getElementById('chat-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('chat-input');
  const text = input.value.trim();

  if (!text) return;
  if (MY_SECRET_API_KEY === "ใส่_API_KEY_ตรงนี้") {
    alert('ลืมใส่ API Key ในโค้ดบรรทัดที่ 2 หรือเปล่าครับ! ไปแก้บน GitHub ก่อนนะ');
    return;
  }

  const char = characters.find(c => c.id === activeCharId);
  
  chatHistories[activeCharId].push({ role: 'user', text });
  renderMessages();
  input.value = '';

  const systemPrompt = `
คุณคือบทบาทสมมติชื่อ: ${char.name}
นิสัยและบุคลิกของคุณคือ: ${char.prompt}

กฎเหล็กที่คุณต้องทำตามอย่างเคร่งครัด:
1. สวมบทบาทนี้ 100% ห้ามหลุดคาร์แรคเตอร์เด็ดขาด ห้ามบอกว่าตัวเองเป็น AI
2. ให้ตอบกลับเป็นภาษาพูดแบบมนุษย์จริงๆ ตามนิสัยที่กำหนด
3. **ต้องมีการบรรยายท่าทาง สีหน้า หรือการกระทำประกอบคำพูด** โดยใส่ไว้ในเครื่องหมายดอกจัน เช่น *ยิ้มมุมปากและกอดอก* 
4. โต้ตอบอย่างเป็นธรรมชาติ หลีกเลี่ยงการตอบแบบถามคำตอบคำ
`;

  const apiHistory = chatHistories[activeCharId].map(msg => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.text }]
  }));

  try {
    const container = document.getElementById('chat-messages');
    container.innerHTML += `<div id="typing-indicator" class="text-xs text-slate-400 mt-2">*${char.name} กำลังคิด...*</div>`;
    container.scrollTop = container.scrollHeight;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${MY_SECRET_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: apiHistory,
        generationConfig: { temperature: 0.9, maxOutputTokens: 500 }
      })
    });

    const data = await res.json();
    document.getElementById('typing-indicator')?.remove(); 

    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const aiReply = data.candidates[0].content.parts[0].text;
      chatHistories[activeCharId].push({ role: 'model', text: aiReply });
      localStorage.setItem('my_chat_histories', JSON.stringify(chatHistories));
      renderMessages();
    } else {
      alert('AI ไม่ตอบกลับ ลองตรวจสอบ API Key หรือลองใหม่อีกครั้งครับ');
    }
  } catch (err) {
    document.getElementById('typing-indicator')?.remove();
    alert('การเชื่อมต่อมีปัญหาจ้า');
  }
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
