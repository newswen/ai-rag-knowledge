package com.yw.ai.rag.api;

import org.springframework.ai.chat.ChatResponse;
import reactor.core.publisher.Flux;

/**
 * Ai接口实现
 *
 * @author: yuanwen
 * @since: 2025/4/20
 */
public interface IAiService {

    /**
     * 文本非流式问答
     */
    ChatResponse generateText(String model, String message);

    /**
     * 文本流式问答 响应式流  常用于非阻塞异步 Web 编程，特别适合高并发/IO密集应用。
     */
    Flux<ChatResponse> generateTextStream(String model, String message);

}
