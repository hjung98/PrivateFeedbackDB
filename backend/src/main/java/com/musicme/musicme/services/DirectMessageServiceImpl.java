package com.musicme.musicme.services;

import com.musicme.musicme.entities.User;
import com.musicme.musicme.entities.DirectMessage;
import com.musicme.musicme.entities.DirectMessageIdentity;
import com.musicme.musicme.repositories.UserRepository;
import com.musicme.musicme.repositories.DirectMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.data.domain.Example;

import java.util.ArrayList;
import java.util.List;

@Service
public class DirectMessageServiceImpl implements DirectMessageService {

    @Qualifier("directMessageRepository")
    private DirectMessageRepository directMessageRepository;

    @Qualifier("userRepository")
    private UserRepository userRepository;

    @Autowired
    public DirectMessageServiceImpl(DirectMessageRepository directMessageRepository) {
        this.directMessageRepository = directMessageRepository;
    }

    @Override
    public List<DirectMessage> getByUsersMatching(Long id1, Long id2) {
        List<DirectMessage> directMessages = new ArrayList<>();

        // Creating DMId instance
        DirectMessageIdentity twoUsersId = new DirectMessageIdentity();

        //  Setting only user1 and user2 fields of composite key
        User user1 = userRepository.findById(id1).get();
        User user2 = userRepository.findById(id2).get();
        twoUsersId.setUser1(user1);
        twoUsersId.setUser2(user2);

        // Creating template with Example.class and then grabbing all DMs that match these credentials
        DirectMessage example = new DirectMessage();
        example.setDirectMessageIdentity(twoUsersId);
        directMessageRepository.findAll(Example.of(example)).forEach(directMessages::add);
        return directMessages;
    }

    @Override
    public DirectMessage sendMessage(DirectMessage directMessage) {
        this.directMessageRepository.save(directMessage);
        return directMessage;
    }

    @Override
    public DirectMessage delete(DirectMessageIdentity directMessageIdentity) {
        return this.directMessageRepository.deleteByDirectMessageIdentity(directMessageIdentity);
    }

}
