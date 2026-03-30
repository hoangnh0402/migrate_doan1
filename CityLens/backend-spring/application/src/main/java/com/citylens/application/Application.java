package com.citylens.application;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import com.citylens.user.adapter.out.persistence.repository.UserJpaRepository;
import com.citylens.user.adapter.out.persistence.repository.AppUserMongoRepository;
import com.citylens.report.adapter.out.persistence.repository.ReportMongoRepository;
import com.citylens.report.adapter.out.persistence.repository.CommentMongoRepository;
import com.citylens.report.adapter.out.persistence.repository.AlertMongoRepository;
import com.citylens.infrastructure.persistence.repository.EntityDbRepository;

@SpringBootApplication(scanBasePackages = {"com.citylens"})
@EntityScan(basePackages = {"com.citylens"})
@EnableJpaRepositories(basePackageClasses = {UserJpaRepository.class, EntityDbRepository.class})
@EnableMongoRepositories(basePackageClasses = {AppUserMongoRepository.class, ReportMongoRepository.class, CommentMongoRepository.class, AlertMongoRepository.class})
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}

