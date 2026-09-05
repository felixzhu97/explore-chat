package com.chat.common.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.util.StringUtils;

/** Spring Kafka producer and consumer wiring for chat domain events. */
@Configuration
@EnableConfigurationProperties(ChatKafkaProperties.class)
public class ChatKafkaConfig {

  private static final Logger log = LoggerFactory.getLogger(ChatKafkaConfig.class);

  @Bean
  ChatEventPublisher chatEventPublisher(
      ChatKafkaProperties properties,
      org.springframework.beans.factory.ObjectProvider<ObjectMapper> objectMapperProvider) {
    ObjectMapper objectMapper = objectMapperProvider.getIfAvailable(ObjectMapper::new);
    normalizeBrokers(properties);
    if (!properties.isEnabled()) {
      return new NoOpChatEventPublisher();
    }
    try {
      KafkaTemplate<String, String> template = new KafkaTemplate<>(producerFactory(properties));
      log.info("Kafka producer configured for brokers {}", properties.getBrokers());
      return new KafkaChatEventPublisher(template, properties, objectMapper);
    } catch (RuntimeException ex) {
      log.warn("Kafka producer setup failed; falling back to no-op: {}", ex.getMessage());
      return new NoOpChatEventPublisher();
    }
  }

  @Bean
  ConsumerFactory<String, String> kafkaConsumerFactory(ChatKafkaProperties properties) {
    normalizeBrokers(properties);
    Map<String, Object> configs = new HashMap<>();
    if (properties.isEnabled()) {
      configs.put(
          ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, String.join(",", properties.getBrokers()));
    } else {
      configs.put(ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
    }
    configs.put(ConsumerConfig.GROUP_ID_CONFIG, properties.getConsumerGroup());
    configs.put(ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    configs.put(ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class);
    configs.put(ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest");
    return new DefaultKafkaConsumerFactory<>(configs);
  }

  @Bean
  ConcurrentKafkaListenerContainerFactory<String, String> kafkaListenerContainerFactory(
      ConsumerFactory<String, String> kafkaConsumerFactory, ChatKafkaProperties properties) {
    normalizeBrokers(properties);
    ConcurrentKafkaListenerContainerFactory<String, String> factory =
        new ConcurrentKafkaListenerContainerFactory<>();
    factory.setConsumerFactory(kafkaConsumerFactory);
    factory.setAutoStartup(properties.isEnabled());
    return factory;
  }

  private static ProducerFactory<String, String> producerFactory(ChatKafkaProperties properties) {
    Map<String, Object> configs = new HashMap<>();
    configs.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, String.join(",", properties.getBrokers()));
    configs.put(ProducerConfig.CLIENT_ID_CONFIG, properties.getClientId());
    configs.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    configs.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
    configs.put(ProducerConfig.ACKS_CONFIG, "1");
    configs.put(ProducerConfig.MAX_BLOCK_MS_CONFIG, 3_000);
    return new DefaultKafkaProducerFactory<>(configs);
  }

  /**
   * Splits and trims broker entries so comma-separated values become distinct hosts.
   *
   * @param properties Kafka properties whose broker list is normalized in place
   */
  static void normalizeBrokers(ChatKafkaProperties properties) {
    List<String> source = properties.getBrokers();
    if (source == null) {
      properties.setBrokers(List.of());
      return;
    }
    List<String> normalized =
        source.stream()
            .flatMap(raw -> Arrays.stream(raw.split(",")))
            .map(String::trim)
            .filter(StringUtils::hasText)
            .toList();
    properties.setBrokers(normalized);
  }
}
