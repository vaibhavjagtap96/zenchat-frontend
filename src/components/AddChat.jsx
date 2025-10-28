import {
  Dialog,
  Transition,
  TransitionChild,
  DialogPanel,
  DialogTitle,
  Switch,
} from "@headlessui/react";
import { Fragment, useRef, useState } from "react";
import { BiSearch } from "react-icons/bi";
import { RxCross2 } from "react-icons/rx";
import { profile2 } from "../assets";
import {
  createOneToOneChat,
  getAvailableUsers,
  createGroupChat,
} from "../api";
import { useChat } from "../context/ChatContext";
import { requestHandler } from "../utils";

export function AddChat() {
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [groupChatParticipants, setGroupChatParticipants] = useState([]);
  const [users, setUsers] = useState([]);
  const [creatingChat, setCreatingChat] = useState(false);

  const {
    openAddChat,
    setOpenAddChat,
    newChatUser,
    setNewChatUser,
    getCurrentUserChats,
    setActiveLeftSidebar,
  } = useChat();

  const searchUserRef = useRef();

  const handleClose = () => {
    setUsers([]);
    setNewChatUser(null);
    setGroupName("");
    setGroupChatParticipants([]);
    setOpenAddChat(false);
  };

  const handleSearchUser = async () => {
    const { data } = await getAvailableUsers(searchUserRef.current.value);
    setUsers(data.data?.users || []);
  };

  const createNewOneToOneChat = async () => {
    if (!newChatUser) return alert("Please select a user");

    await requestHandler(
      () => createOneToOneChat(newChatUser?._id),
      setCreatingChat,
      (res) => {
        const { data } = res;
        if (data?.existing) {
          return alert("Chat already exists with this user");
        }
        getCurrentUserChats();
        setActiveLeftSidebar("recentChats");
        handleClose();
      },
      alert
    );
  };

  const createNewGroupChat = async () => {
    if (!groupName.trim()) return alert("Please enter a group name");
    if (groupChatParticipants.length < 2)
      return alert("A group must have at least 2 members");

    await requestHandler(
      () => createGroupChat(groupName, groupChatParticipants),
      setCreatingChat,
      () => {
        getCurrentUserChats();
        setActiveLeftSidebar("recentChats");
        handleClose();
      }
    );
  };

  return (
    <Transition show={openAddChat} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={handleClose}>
        {/* Overlay */}
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity" />
        </TransitionChild>

        {/* Modal */}
        <div className="fixed inset-0 z-20 flex items-center justify-center p-4 overflow-y-auto">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-90"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-90"
          >
            <DialogPanel className="w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 text-gray-900 p-6 relative">
              <DialogTitle
                as="h3"
                className="text-2xl font-semibold text-center mb-4 text-gray-800"
              >
                💬 Create New Chat
              </DialogTitle>

              {/* Toggle Group Chat */}
              <div className="flex justify-center items-center gap-3 mb-6">
                <Switch
                  checked={isGroupChat}
                  onChange={setIsGroupChat}
                  className={`${
                    isGroupChat ? "bg-blue-500" : "bg-gray-300"
                  } relative inline-flex h-6 w-12 items-center rounded-full transition`}
                >
                  <span
                    className={`${
                      isGroupChat ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white shadow transition`}
                  />
                </Switch>
                <span className="text-gray-600 text-sm">Enable Group Chat</span>
              </div>

              {/* One-to-One Chat */}
              {!isGroupChat && (
                <div className="text-center py-3">
                  <p className="text-lg text-gray-700">
                    Start chatting with{" "}
                    <span className="font-semibold text-blue-600">
                      {newChatUser?.username || "a user"}
                    </span>
                    ?
                  </p>
                </div>
              )}

              {/* Group Chat Section */}
              {isGroupChat && (
                <div className="space-y-3">
                  <input
                    type="text"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter group name"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  />

                  {/* Search users */}
                  <div className="flex items-center gap-2 bg-gray-100 border border-gray-300 rounded-lg px-3 py-2">
                    <BiSearch className="text-gray-500 text-xl" />
                    <input
                      ref={searchUserRef}
                      onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                      type="text"
                      placeholder="Search users to add..."
                      className="w-full bg-transparent outline-none text-gray-800 placeholder-gray-500"
                    />
                  </div>

                  {/* Search Results */}
                  <ul className="bg-gray-50 border border-gray-200 rounded-lg max-h-40 overflow-y-auto divide-y divide-gray-200 mt-2">
                    {users.map((user) => (
                      <li
                        key={user._id}
                        className="flex justify-between items-center py-2 px-3 hover:bg-gray-100 transition"
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={user.avatarUrl}
                            alt={user.username}
                            className="w-9 h-9 rounded-full object-cover"
                          />
                          <span className="text-gray-800">{user.username}</span>
                        </div>
                        {!groupChatParticipants.some(
                          ({ _id }) => user._id === _id
                        ) && (
                          <button
                            className="px-3 py-1 text-xs bg-blue-500 text-white rounded-md hover:bg-blue-600"
                            onClick={() =>
                              setGroupChatParticipants([
                                ...groupChatParticipants,
                                user,
                              ])
                            }
                          >
                            Add
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* Selected Members */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {groupChatParticipants.map((user) => (
                      <div
                        key={user._id}
                        className="flex items-center gap-1 bg-gray-200 px-3 py-1 rounded-full text-sm"
                      >
                        <img
                          src={profile2}
                          alt={user.username}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span className="text-gray-800">{user.username}</span>
                        <button
                          onClick={() =>
                            setGroupChatParticipants(
                              groupChatParticipants.filter(
                                ({ _id }) => user._id !== _id
                              )
                            )
                          }
                          className="ml-1 text-red-500 hover:text-red-600"
                        >
                          <RxCross2 />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={handleClose}
                  className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm font-medium text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={
                    isGroupChat ? createNewGroupChat : createNewOneToOneChat
                  }
                  className="px-5 py-2 rounded-md bg-blue-500 hover:bg-blue-600 text-sm font-semibold text-white shadow-md"
                >
                  {creatingChat ? "Creating..." : "Create Chat"}
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
