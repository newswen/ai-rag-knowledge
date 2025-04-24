document.addEventListener('DOMContentLoaded', function() {
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const modelSelect = document.getElementById('model-select');

    // 自动调整文本框高度
    userInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        if (this.scrollHeight > 120) {
            this.style.overflowY = 'auto';
        } else {
            this.style.overflowY = 'hidden';
        }
    });

    // 按下 Enter 发送消息（Shift+Enter 换行）
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // 点击发送按钮
    sendButton.addEventListener('click', sendMessage);

    function sendMessage() {
        const message = userInput.value.trim();
        if (!message) return;

        // 添加用户消息到聊天界面
        addMessage(message, 'user');

        // 清空输入框并重置高度
        userInput.value = '';
        userInput.style.height = 'auto';

        // 显示正在输入指示器
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message assistant';
        typingIndicator.innerHTML = `
            <div class="message-content">
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        chatMessages.appendChild(typingIndicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 获取选中的模型
        const selectedModel = modelSelect.value;

        // 调用 API
        fetchAIResponse(message, selectedModel, typingIndicator);
    }

    function addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${formatMessage(content)}</p>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function formatMessage(text) {
        // 简单的文本格式化，将换行符转换为 <br>
        return text.replace(/\n/g, '<br>');
    }

    async function fetchAIResponse(message, model, typingIndicator) {
        try {
            // 构建 API URL
            const apiUrl = `http://localhost:9111/api/v1/ollama/generate_stream?model=${encodeURIComponent(model)}&message=${encodeURIComponent(message)}`;

            // 创建响应容器
            let responseContainer = document.createElement('div');
            responseContainer.className = 'message assistant';
            responseContainer.innerHTML = `<div class="message-content"><p></p></div>`;

            // 使用 fetch 和 ReadableStream 处理流式响应
            const response = await fetch(apiUrl);
            const reader = response.body.getReader();
            let fullResponse = '';

            // 移除输入指示器，添加响应容器
            chatMessages.removeChild(typingIndicator);
            chatMessages.appendChild(responseContainer);

            // 处理流式响应
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                // 解码收到的数据
                const chunk = new TextDecoder().decode(value);

                try {
                    // 尝试解析 JSON 响应
                    const jsonData = JSON.parse(chunk);

                    if (jsonData && jsonData.length > 0 && jsonData[0].result && jsonData[0].result.output) {
                        const content = jsonData[0].result.output.content || '';

                        // 累积响应内容
                        fullResponse += content;

                        // 更新 UI
                        const messageContent = responseContainer.querySelector('p');
                        messageContent.innerHTML = formatMessage(fullResponse);

                        // 滚动到底部
                        chatMessages.scrollTop = chatMessages.scrollHeight;
                    }
                } catch (e) {
                    console.error('解析响应数据出错:', e);
                }
            }

            // 如果没有收到任何响应
            if (!fullResponse) {
                const messageContent = responseContainer.querySelector('p');
                messageContent.innerHTML = '抱歉，我无法生成回复。请稍后再试。';
            }

        } catch (error) {
            console.error('API 请求出错:', error);

            // 移除输入指示器
            if (typingIndicator.parentNode) {
                chatMessages.removeChild(typingIndicator);
            }

            // 添加错误消息
            addMessage('抱歉，连接服务器时出现错误。请检查服务器是否运行，或稍后再试。', 'system');
        }
    }
});