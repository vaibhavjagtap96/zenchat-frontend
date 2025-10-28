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
import {
  createOneToOneChat,
  getAvailableUsers,
  createGroupChat,
} from "../api";
import { useChat } from "../context/ChatContext";
import { requestHandler } from "../utils";
import { profile2 } from "../assets";

export function AddChat({ open }) {
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
    if (!newChatUser) return alert("Please select a user to start a chat.");
    await requestHandler(
      () => createOneToOneChat(newChatUser?._id),
      setCreatingChat,
      (res) => {
        const { data } = res;
        if (data?.existing) {
          return alert("Chat already exists with the selected user.");
        }
        getCurrentUserChats();
        setActiveLeftSidebar("recentChats");
        handleClose();
      },
      alert
    );
  };

  const createNewGroupChat = async () => {
    if (!groupName.trim()) return alert("Please provide a group name.");
    if (groupChatParticipants.length < 2)
      return alert("Add at least 2 participants to create a group.");

    await requestHandler(
      async () => createGroupChat(groupName, groupChatParticipants),
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
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        {/* Background overlay */}
        <Transition
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition>

        {/* Modal content */}
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:scale-95"
          >
            <DialogPanel className="w-full max-w-lg transform overflow-hidden rounded-2xl shadow-2xl transition-all bg-white dark:bg-backgroundDark1 border border-gray-200 dark:border-backgroundDark3">
              <div className="px-6 py-5">
                <DialogTitle className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                  {isGroupChat ? "Create Group Chat" : "Start New Chat"}
                </DialogTitle>

                {/* Toggle group chat */}
                <div className="flex items-center gap-3 mt-4">
                  <Switch
                    checked={isGroupChat}
                    onChange={setIsGroupChat}
                    className="group inline-flex h-6 w-12 items-center rounded-full bg-gray-300 transition-all data-[checked]:bg-blue-500"
                  >
                    <span className="size-5 translate-x-1 rounded-full bg-white transition group-data-[checked]:translate-x-6" />
                  </Switch>
                  <span className="text-gray-600 dark:text-gray-300 text-sm">
                    Enable Group Chat
                  </span>
                </div>

                {/* One-to-one chat confirmation */}
                {!isGroupChat && newChatUser && (
                  <div className="mt-6 bg-gray-50 dark:bg-backgroundDark2 rounded-lg p-4 shadow-inner">
                    <p className="text-gray-800 dark:text-gray-200">
                      Start a chat with{" "}
                      <span className="font-semibold">
                        {newChatUser.username}
                      </span>
                      ?
                    </p>
                  </div>
                )}

                {/* Group chat UI */}
                {isGroupChat && (
                  <div className="mt-5">
                    <input
                      type="text"
                      placeholder="Enter group name"
                      className="w-full px-3 py-2 rounded-md outline-none bg-gray-100 dark:bg-backgroundDark3 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500"
                      onChange={(e) => setGroupName(e.target.value)}
                    />

                    {/* Search user */}
                    <div className="mt-3 flex items-center bg-gray-100 dark:bg-backgroundDark3 rounded-md">
                      <input
                        type="text"
                        placeholder="Add users..."
                        ref={searchUserRef}
                        className="w-full px-3 py-2 bg-transparent text-gray-800 dark:text-gray-200 outline-none"
                        onKeyDown={(e) => e.key === "Enter" && handleSearchUser()}
                      />
                      <button
                        onClick={handleSearchUser}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-500"
                      >
                        <BiSearch size={20} />
                      </button>
                    </div>

                    {/* User results */}
                    <ul className="mt-2 max-h-40 overflow-y-auto bg-gray-50 dark:bg-backgroundDark2 rounded-md">
                      {users.map((user) => (
                        <li
                          key={user._id}
                          className="flex justify-between items-center py-2 px-3 hover:bg-gray-200 dark:hover:bg-backgroundDark3 transition"
                        >
                          <div className="flex items-center gap-2">
                            <img
                              className="w-8 h-8 rounded-full object-cover"
                              src={user.avatarUrl || profile2}
                              alt={user.username}
                            />
                            <span className="text-gray-700 dark:text-gray-200">
                              {user.username}
                            </span>
                          </div>
                          {!groupChatParticipants.some(
                            (p) => p._id === user._id
                          ) && (
                            <button
                              className="px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600"
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

                    {/* Added participants */}
                    {!!groupChatParticipants.length && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {groupChatParticipants.map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center gap-2 bg-gray-200 dark:bg-backgroundDark3 px-3 py-1 rounded-full"
                          >
                            <img
                              className="w-6 h-6 rounded-full"
                              src={user.avatarUrl || profile2}
                              alt={user.username}
                            />
                            <span className="text-sm text-gray-800 dark:text-gray-200">
                              {user.username}
                            </span>
                            <button
                              onClick={() =>
                                setGroupChatParticipants(
                                  groupChatParticipants.filter(
                                    (p) => p._id !== user._id
                                  )
                                )
                              }
                              className="text-red-500 hover:text-red-600"
                            >
                              <RxCross2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-md text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-backgroundDark2 hover:bg-gray-300 dark:hover:bg-backgroundDark3 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={
                      isGroupChat ? createNewGroupChat : createNewOneToOneChat
                    }
                    className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 transition"
                  >
                    Create
                  </button>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </Dialog>
    </Transition>
  );
}
