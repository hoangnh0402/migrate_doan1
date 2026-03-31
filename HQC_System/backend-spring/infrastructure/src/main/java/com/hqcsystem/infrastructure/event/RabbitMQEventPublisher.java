package com.hqcsystem.infrastructure.event;

import com.hqcsystem.infrastructure.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class RabbitMQEventPublisher implements EventPublisher {

    private final RabbitTemplate rabbitTemplate;

    public RabbitMQEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publish(String routingKey, Object event) {
        // Build generic event envelope
        Map<String, Object> envelope = new HashMap<>();
        envelope.put("timestamp", System.currentTimeMillis());
        envelope.put("type", routingKey);
        envelope.put("payload", event);
        
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, routingKey, envelope);
    }
}

