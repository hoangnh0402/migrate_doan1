package com.citylens.infrastructure.event;

public interface EventPublisher {
    void publish(String routingKey, Object event);
}
