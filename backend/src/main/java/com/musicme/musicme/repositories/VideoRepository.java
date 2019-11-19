package com.musicme.musicme.repositories;

import com.musicme.musicme.entities.Video;
import com.musicme.musicme.entities.VideoIdentity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@EnableJpaRepositories
public interface VideoRepository extends JpaRepository<Video, Long> {
    
    List<Video> findByVideoIdentityUserEmail(String userEmail);

    Video findByVideoIdentity(VideoIdentity videoId);

    void deleteByVideoIdentity(VideoIdentity videoId);

}