package com.hqcsystem.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import com.hqcsystem.user.adapter.out.persistence.repository.UserJpaRepository;
import com.hqcsystem.user.adapter.out.persistence.repository.AppUserMongoRepository;
import com.hqcsystem.report.adapter.out.persistence.repository.ReportMongoRepository;
import com.hqcsystem.report.adapter.out.persistence.repository.CommentMongoRepository;
import com.hqcsystem.report.adapter.out.persistence.repository.AlertMongoRepository;
import com.hqcsystem.infrastructure.persistence.repository.EntityDbRepository;

@SpringBootApplication(scanBasePackages = {"com.hqcsystem"})
@EntityScan(basePackages = {"com.hqcsystem"})
@EnableJpaRepositories(basePackages = {"com.hqcsystem"})
@EnableMongoRepositories(basePackages = {"com.hqcsystem"})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}


