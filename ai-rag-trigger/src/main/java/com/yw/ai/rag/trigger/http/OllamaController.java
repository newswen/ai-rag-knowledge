package com.yw.ai.rag.trigger.http;

import com.yw.ai.rag.api.IAiService;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.ollama.OllamaChatClient;
import org.springframework.ai.ollama.api.OllamaOptions;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

/**
 * 实现流式问答
 *
 * @author: yuanwen
 * @since: 2025/4/20
 */
@RestController
@Slf4j
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/ollama")
public class OllamaController implements IAiService {

    @Resource
    private OllamaChatClient chatClient;

    /**
     * 非流式文本问答
     *
     * @param model
     * @param message
     * @return
     */
    @Override
    @GetMapping("/generate")
    public ChatResponse generateText(@RequestParam(value = "model") String model, @RequestParam(value = "message") String message) {
        return chatClient.call(new Prompt(
                message,
                OllamaOptions.create()
                        .withModel(model)
        ));
    }

    /**
     * 流式文本问答
     *
     * @param model
     * @param message
     * @return
     */
    @Override
    @GetMapping("/generate_stream")
    public Flux<ChatResponse> generateTextStream(@RequestParam(value = "model")String model,@RequestParam(value = "message") String message) {
       return  chatClient.stream(new Prompt(
                message,
                OllamaOptions.create()
                        .withModel(model)
        ));
    }
}
