import moment from "moment";
import { useAuth } from "../context/AuthContext";
import { getChatObjectMetadata, limitChar } from "../utils";

export default function RecentUserChatCard({ chat, onClick, isActive }) {
  const { user } = useAuth();
  const filteredChat = getChatObjectMetadata(chat, user);

  const timeAgo = chat.lastMessage
    ? moment(chat.lastMessage?.createdAt).fromNow(true) + " ago"
    : "";

  return (
    <div
      onClick={() => onClick(chat)}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl cursor-pointer transition-all duration-300 group
        ${
          isActive
            ? "bg-[#dcf8c6]/70 dark:bg-[#202c33] shadow-sm border-l-4 border-[#25D366]"
            : "hover:bg-[#f0f2f5] dark:hover:bg-[#2a3942]"
        }`}
    >
      {/* 🧑‍🤝‍🧑 Avatar Section */}
      {chat.isGroupChat ? (
        <div className="w-12 h-12 relative flex-shrink-0">
          {chat.participants.slice(0, 3).map((participant, i) => (
            <img
              key={participant._id}
              src={participant.avatarUrl}
              alt={participant.username}
              loading="lazy"
              className={`w-10 h-10 rounded-full object-cover border-2 border-white dark:border-[#202c33] absolute 
                ${
                  i === 0
                    ? "left-0 z-30"
                    : i === 1
                    ? "left-3 z-20"
                    : "left-6 z-10"
                }`}
            />
          ))}
        </div>
      ) : (
        <img
          className="w-12 h-12 rounded-full object-cover shadow-md border border-gray-200 dark:border-[#2a3942] transition-transform group-hover:scale-[1.04]"
          src={filteredChat.avatar}
          alt={filteredChat.title}
          loading="lazy"
        />
      )}

      {/* 💬 Chat Info */}
      <div className="flex-1 border-b border-gray-200 dark:border-[#2a3942] pb-3">
        <div className="flex justify-between items-center mb-[2px]">
          <h4
            className={`font-medium text-[15px] truncate transition-colors duration-300 ${
              isActive
                ? "text-[#008069] dark:text-[#25D366]"
                : "text-[#111b21] dark:text-[#e9edef]"
            }`}
          >
            {filteredChat.title}
          </h4>
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {timeAgo}
          </span>
        </div>

        <div className="flex justify-between items-center mt-[2px]">
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate w-[85%]">
            {limitChar(filteredChat.lastMessage, 40) || "No messages yet"}
          </p>

          {/* ✅ Optional Unread Badge */}
          {/* 
          <span className="bg-[#25D366] text-white text-[10px] font-semibold rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
            2
          </span> 
          */}
        </div>
      </div>
    </div>
  );
}
