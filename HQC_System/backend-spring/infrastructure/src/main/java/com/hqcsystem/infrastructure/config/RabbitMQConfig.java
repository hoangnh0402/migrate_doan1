package com.hqcsystem.infrastructure.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "HQC System.events";
    
    public static final String NOTIFICATION_QUEUE = "notifications.queue";
    public static final String STATS_UPDATE_QUEUE = "stats.update.queue";
    
    public static final String ROUTING_KEY_REPORT_CREATED = "report.created";
    public static final String ROUTING_KEY_REPORT_VOTED = "report.voted";
    public static final String ROUTING_KEY_ASSIGNMENT_CREATED = "assignment.created";

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }
    
    @Bean
    public Queue statsUpdateQueue() {
        return new Queue(STATS_UPDATE_QUEUE, true);
    }

    @Bean
    public Binding bindingNotificationQueueReportCreated(Queue notificationQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(notificationQueue).to(eventExchange).with(ROUTING_KEY_REPORT_CREATED);
    }
    
    @Bean
    public Binding bindingNotificationQueueAssignmentCreated(Queue notificationQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(notificationQueue).to(eventExchange).with(ROUTING_KEY_ASSIGNMENT_CREATED);
    }

    @Bean
    public Binding bindingStatsUpdateQueueReportVoted(Queue statsUpdateQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(statsUpdateQueue).to(eventExchange).with(ROUTING_KEY_REPORT_VOTED);
    }
    
    @Bean
    public Binding bindingStatsUpdateQueueReportCreated(Queue statsUpdateQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(statsUpdateQueue).to(eventExchange).with(ROUTING_KEY_REPORT_CREATED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}

