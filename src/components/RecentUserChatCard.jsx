import moment from "moment";
import { useAuth } from "../context/AuthContext";
import { getChatObjectMetadata, limitChar } from "../utils";

export default function RecentUserChatCard({ chat, onClick, isActive }) {
  const { user } = useAuth();
  const filteredChat = getChatObjectMetadata(chat, user); // Extract display info

  return (
    <div
      onClick={() => onClick(chat)}
      className={`flex gap-3 px-4 py-3 items-center cursor-pointer transition-all 
        ${
          isActive
            ? "bg-[#d9fdd3] dark:bg-[#005c4b]"
            : "hover:bg-[#f5f6f6] dark:hover:bg-[#2a3942]"
        } border-b border-gray-200 dark:border-[#2a3942]`}
    >
      {/* 🖼 Avatar / Group Profile */}
      {chat.isGroupChat ? (
        <div className="relative w-12 h-12 flex-shrink-0">
          {chat.participants.slice(0, 3).map((participant, i) => (
            <img
              key={participant._id}
              src={participant.avatarUrl}
              alt={participant.username}
              loading="lazy"
              className={`w-10 h-10 rounded-full border-2 border-white absolute object-cover
                ${i === 0 ? "left-0 z-30" : i === 1 ? "left-3 z-20" : "left-6 z-10"}`}
            />
          ))}
        </div>
      ) : (
        <img
          src={filteredChat.avatar}
          alt={filteredChat.title}
          loading="lazy"
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
      )}

      {/* 💬 Chat Details */}
      <div
        className="flex-1 min-w-0 border-b border-gray-200 dark:border-[#2a3942] pb-1"
        style={{ marginLeft: chat.isGroupChat ? "12px" : "0px" }} // ✅ Slight right shift for group names
      >
        <div className="flex items-center justify-between">
          <p className="font-medium text-[15px] text-gray-900 dark:text-gray-100 truncate">
            {filteredChat.title}
          </p>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {chat.lastMessage
              ? moment(chat.lastMessage.createdAt).fromNow(true) + " ago"
              : ""}
          </span>
        </div>

        <div className="flex items-center justify-between mt-0.5">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
            {limitChar(filteredChat.lastMessage, 28) || "No messages yet"}
          </p>

          {/* Optional unread badge */}
          {/* <span className="text-xs bg-[#25D366] text-white rounded-full px-2 py-[1px] ml-2 shadow-sm">
            2
          </span> */}
        </div>
      </div>
    </div>
  );
}
