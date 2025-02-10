import { Send,Paperclip } from "lucide-react";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

export const MessageInput = ({ onSendMessage, connectionStatus }) => {
  const [message, setMessage] = useState("");
  const [media, setMedia] = useState(null);
  const [mediaType, setMediaType] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMedia(reader.result); // Base64-encoded file
        setMediaType(file.type.split("/")[0]); // 'image', 'video', 'audio', etc.
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({ onDrop });

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() && !media) return;

    onSendMessage({
      message,
      media,
      media_type: mediaType,
    });

    setMessage("");
    setMedia(null);
    setMediaType(null);
  };

  return (
    <form onSubmit={handleSendMessage} className="">
      <div className="flex items-center space-x-2">
        <div {...getRootProps()} className="cursor-pointer p-2 bg-gray-800 rounded-md">
          <input {...getInputProps()} />
          <Paperclip/>
        </div>
      </div>
      {media && (
        <div className="mt-2">
          {mediaType === "image" && <img src={media} alt="Uploaded" className="max-w-xs rounded-md" />}
          {mediaType === "video" && <video src={media} controls className="max-w-xs rounded-md" />}
          {mediaType === "audio" && <audio src={media} controls />}
          {mediaType === "file" && <a href={media} download>Download File</a>}
        </div>
      )}
    </form>
  );
};

export const MessageDisplay = ({ messages }) => {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.isSent ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-lg rounded-lg px-4 py-2 ${msg.isSent ? "bg-blue-600" : "bg-gray-700"}`}>
              {msg.media && (
                <div className="mb-2">
                  {msg.media_type === "image" && <img src={msg.media} alt="Media" className="max-w-xs rounded-md" />}
                  {msg.media_type === "video" && <video src={msg.media} controls className="max-w-xs rounded-md" />}
                  {msg.media_type === "audio" && <audio src={msg.media} controls />}
                  {msg.media_type === "file" && <a href={msg.media} download>Download File</a>}
                </div>
              )}
              <p className="text-sm">{msg.text}</p>
              <p className="text-xs text-gray-300 mt-1">
                {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };