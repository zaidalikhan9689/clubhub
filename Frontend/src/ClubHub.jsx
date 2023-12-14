import { ethers } from "ethers";
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import Modal from "react-modal";

const ClubList = ({ contract }) => {
  const [clubs, setClubs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [memberships, setMemberships] = useState([]);
  const [newClub, setNewClub] = useState({
    name: "",
    description: "",
    basicFee: 0,
    proFee: 0,
    eliteFee: 0,
    imageUrl: "",
  });

  useEffect(() => {
    getClubsFromBlockchain();
  });

  const createClub = async () => {
    try {
      const basicFeeWei = ethers.parseEther(newClub.basicFee);
      const proFeeWei = ethers.parseEther(newClub.proFee);
      const eliteFeeWei = ethers.parseEther(newClub.eliteFee);

      const txn = await contract.registerClub(
        newClub.name,
        newClub.description,
        basicFeeWei,
        proFeeWei,
        eliteFeeWei,
        newClub.imageUrl
      );

      await txn.wait();

      getClubsFromBlockchain();

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error creating club:", error);
    }
  };

  const getClubsFromBlockchain = async () => {
    try {
      const clubsArray = await contract.getClubs();
      const clubs = clubsArray.map((club) => ({
        name: club.name,
        description: club.description,
        basicFee: ethers.formatUnits(club.basicFee, "ether"),
        proFee: ethers.formatUnits(club.proFee, "ether"),
        eliteFee: ethers.formatUnits(club.eliteFee, "ether"),
        organizer: club.organizer,
        members: club.members,
        imageUrl: club.imageUrl,
      }));
      setClubs(clubs);
      const userMembershipsArray = await contract.getClubsByMember();
      const userMemberships = userMembershipsArray.map((membership) => {
        const clubId = membership[0];
        return clubId;
      });
      setMemberships(userMemberships);
    } catch (error) {
      console.error("Error fetching clubs:", error);
    }
  };

  const handleEnroll = async (clubId, club, membershipType) => {
    try {
      if (!memberships.includes(clubId)) {
        let membershipFee;
        if (membershipType === "Basic") {
          membershipFee = club.basicFee;
          membershipType = 0;
        } else if (membershipType === "Pro") {
          membershipFee = club.proFee;
          membershipType = 1;
        } else if (membershipType === "Elite") {
          membershipFee = club.eliteFee;
          membershipType = 2;
        }

        const membershipFeeWei = ethers.parseEther(membershipFee.toString());
        console.log(membershipFeeWei);

        await contract.enrollMembership(clubId, membershipType, {
          value: membershipFeeWei,
        });
        getClubsFromBlockchain();
      } else {
        alert("Already enrolled in this club");
      }
    } catch (error) {
      console.error("Error enrolling in the club:", error);
    }
  };

  return (
    <div className="bg-cover h-full w-full overflow-y-auto p-4">
      <h6 className="text-m font-semibold text-gray-400 flex justify-between items-center">
        Join clubs with
      </h6>

      <h1 className="text-4xl font-semibold mb-4 flex justify-between items-center">
        <span className="text-white font-montserrat">ClubConnector</span>

        <button
          className="bg-red-500 bg-opacity-80 text-white px-3 py-1.5 rounded-md hover:bg-blue-950 transition duration-300 transform scale-95"
          onClick={() => setIsModalOpen(true)}
        >
          + Club
        </button>
      </h1>

      {clubs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4">
          {clubs.map((club, index) => (
            <div
              key={index}
              className="border p-4 rounded-3xl shadow-md hover:shadow-lg transition duration-300 bg-black bg-opacity-80" style={{ maxWidth: '500px' }}
            >
              <h2 className="text-xl text-green-400 font-semibold mb-2">
                {club.name}
              </h2>
              <img src={club.imageUrl} alt="club image"  />
              <p className="text-white mb-2">{club.description}</p>
              <p className="text-gray-200">President: {club.organizer}</p>
              <p className="text-gray-200">
                No. of Members: {club.members.length}
              </p>
              <p className="text-gray-200">Basic Fee: {club.basicFee} ETH</p>
              <p className="text-gray-200">Pro Fee: {club.proFee} ETH</p>
              <p className="text-gray-200">Elite Fee: {club.eliteFee} ETH</p>

              {memberships.includes(index) ? (
                <button className="mt-4 bg-gray-500 text-white px-4 py-2 rounded-md cursor-not-allowed">
                  Already Enrolled
                </button>
              ) : (
                <div className="mt-4 space-x-2">
                  <button
                    onClick={() => handleEnroll(index, club, "Basic")}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
                  >
                    Enroll as Basic
                  </button>
                  <button
                    onClick={() => handleEnroll(index, club, "Pro")}
                    className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition duration-300"
                  >
                    Enroll as Pro
                  </button>
                  <button
                    onClick={() => handleEnroll(index, club, "Elite")}
                    className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition duration-300"
                  >
                    Enroll as Elite
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No clubs available.</p>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Add Club Modal"
      >
        <h2 className="text-xl font-semibold mb-4">Create Club</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createClub();
          }}
        >
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Club Name:
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded-md"
              value={newClub.name}
              onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Description:
            </label>
            <textarea
              className="w-full border p-2 rounded-md"
              value={newClub.description}
              onChange={(e) =>
                setNewClub({ ...newClub, description: e.target.value })
              }
              required
            ></textarea>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Basic Fee (ETH):
            </label>
            <input
              type="number"
              step="any"
              className="w-full border p-2 rounded-md"
              value={newClub.basicFee}
              onChange={(e) =>
                setNewClub({ ...newClub, basicFee: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Pro Fee (ETH):
            </label>
            <input
              type="number"
              step="any"
              className="w-full border p-2 rounded-md"
              value={newClub.proFee}
              onChange={(e) =>
                setNewClub({ ...newClub, proFee: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Elite Fee (ETH):
            </label>
            <input
              type="number"
              step="any"
              className="w-full border p-2 rounded-md"
              value={newClub.eliteFee}
              onChange={(e) =>
                setNewClub({ ...newClub, eliteFee: e.target.value })
              }
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Image URL:
            </label>
            <input
              type="text"
              className="w-full border p-2 rounded-md"
              value={newClub.imageUrl}
              onChange={(e) =>
                setNewClub({ ...newClub, imageUrl: e.target.value })
              }
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300"
          >
            Create Club
          </button>
        </form>
      </Modal>
    </div>
  );
};

ClubList.propTypes = {
  contract: PropTypes.object.isRequired,
};

export default ClubList;
