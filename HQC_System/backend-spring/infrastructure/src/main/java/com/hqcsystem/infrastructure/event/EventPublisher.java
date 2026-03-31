package com.hqcsystem.infrastructure.event;

public interface EventPublisher {
    void publish(String routingKey, Object event);
}

