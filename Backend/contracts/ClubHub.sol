// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ClubHub {
    enum MembershipType {
        Basic,
        Pro,
        Elite
    }

    struct Club {
        string name;
        string description;
        uint256 basicFee;
        uint256 proFee;
        uint256 eliteFee;
        address organizer;
        address[] members;
        string imageUrl;
    }

    Club[] public clubs;
    mapping(address => uint256[]) public clubsByOrganizer;
    mapping(address => uint256[]) public clubsByMember;

    event ClubRegistered(
        uint256 clubId,
        string name,
        string description,
        uint256 basicFee,
        uint256 proFee,
        uint256 eliteFee,
        address organizer,
        string imageUrl
    );
    event MembershipEnrolled(uint256 clubId, address member);

    function registerClub(
        string memory _name,
        string memory _description,
        uint256 _basicFee,
        uint256 _proFee,
        uint256 _eliteFee,
        string memory _imageUrl
    ) public {
        Club memory newClub = Club({
            name: _name,
            description: _description,
            basicFee: _basicFee,
            proFee: _proFee,
            eliteFee: _eliteFee,
            organizer: msg.sender,
            members: new address[](0),
            imageUrl: _imageUrl
        });

        uint256 clubId = clubs.length;
        clubs.push(newClub);

        emit ClubRegistered(
            clubId,
            _name,
            _description,
            _basicFee,
            _proFee,
            _eliteFee,
            msg.sender,
            _imageUrl
        );

        clubsByOrganizer[msg.sender].push(clubId);
    }

    function enrollMembership(
        uint256 clubId,
        MembershipType membershipType
    ) public payable {
        require(clubId < clubs.length, "Club ID does not exist");
        Club storage club = clubs[clubId];
        uint256 membershipFee;

        if (membershipType == MembershipType.Basic) {
            membershipFee = club.basicFee;
        } else if (membershipType == MembershipType.Pro) {
            membershipFee = club.proFee;
        } else if (membershipType == MembershipType.Elite) {
            membershipFee = club.eliteFee;
        }

        require(msg.value == membershipFee, "Incorrect membership fee");

        club.members.push(msg.sender);

        emit MembershipEnrolled(clubId, msg.sender);

        payable(club.organizer).transfer(msg.value);

        clubsByMember[msg.sender].push(clubId);
    }

    function getClubs() public view returns (Club[] memory) {
        return clubs;
    }

    function getClubsByOrganizer() public view returns (Club[] memory) {
        uint256[] memory clubIds = clubsByOrganizer[msg.sender];
        Club[] memory userClubs = new Club[](clubIds.length);

        for (uint256 i = 0; i < clubIds.length; i++) {
            userClubs[i] = clubs[clubIds[i]];
        }

        return userClubs;
    }

    function getClubsByMember() public view returns (Club[] memory) {
        uint256[] memory clubIds = clubsByMember[msg.sender];
        Club[] memory userClubs = new Club[](clubIds.length);

        for (uint256 i = 0; i < clubIds.length; i++) {
            userClubs[i] = clubs[clubIds[i]];
        }

        return userClubs;
    }
}

//0xA236A366f612abc5d5EC516398b8A47c3A3F1571
