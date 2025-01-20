import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Code, ChevronUp, ChevronDown, Maximize2, Minimize2, Send, X } from 'lucide-react';
import { verifyMeet } from '../../wsApi';
import { useParams } from 'react-router-dom';

const VideoMeeting = ({ scheduleId, onError }) => {
    const localVideoRef = useRef();
    const remoteVideoRef = useRef();
    const peerConnectionRef = useRef();
    const webSocketRef = useRef();
    const { meeting_id } = useParams();
    
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [mediaStream, setMediaStream] = useState(null);
    const [connectionStatus, setConnectionStatus] = useState('initializing');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('none');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const iceCandidatesQueue = useRef([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [isChatOpen, setIsChatOpen] = useState(false);

    const logInfo = (message, data = '') => {
        console.log(`[VideoMeeting] ${message}`, data);
    };

    const logError = (error, context) => {
        console.error(`[VideoMeeting] ${context}:`, error);
        setConnectionStatus(`error: ${context}`);
    };

    const processIceCandidateQueue = async () => {
        while (iceCandidatesQueue.current.length > 0) {
            const candidate = iceCandidatesQueue.current.shift();
            try {
                await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                logInfo('Processed queued ICE candidate');
            } catch (err) {
                logError(err, 'process-queued-ice-candidate');
            }
        }
    };

    const createPeerConnection = () => {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };

        const pc = new RTCPeerConnection(configuration);

        // Handle negotiation needed
        pc.onnegotiationneeded = async () => {
            try {
                if (pc.signalingState === "stable") {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    webSocketRef.current?.send(JSON.stringify({
                        type: 'offer',
                        offer: pc.localDescription
                    }));
                }
            } catch (err) {
                logError(err, 'negotiation-needed');
            }
        };

        pc.onicecandidate = (event) => {
            if (event.candidate && webSocketRef.current?.readyState === WebSocket.OPEN) {
                webSocketRef.current.send(JSON.stringify({
                    type: 'candidate',
                    candidate: event.candidate
                }));
            }
        };

        pc.ontrack = (event) => {
            logInfo('Received remote track', event.streams[0]);
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setConnectionStatus('connected');
                setIsConnected(true);
            }
        };

        pc.oniceconnectionstatechange = () => {
            logInfo('ICE Connection State:', pc.iceConnectionState);
            switch (pc.iceConnectionState) {
                case 'connected':
                    setConnectionStatus('connected');
                    setIsConnected(true);
                    break;
                case 'disconnected':
                    setConnectionStatus('disconnected');
                    setIsConnected(false);
                    break;
                case 'failed':
                    setConnectionStatus('failed');
                    setIsConnected(false);
                    // Attempt ICE restart
                    pc.restartIce();
                    break;
            }
        };

        pc.onconnectionstatechange = () => {
            logInfo('Connection State:', pc.connectionState);
            setConnectionStatus(pc.connectionState);
        };

        return pc;
    };

    const setupMediaStream = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: true
            });
            
            logInfo('Got local media stream');
            setMediaStream(stream);
            
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
                logInfo('Set local video source');
            }

            // Verify tracks are active
            const videoTrack = stream.getVideoTracks()[0];
            const audioTrack = stream.getAudioTracks()[0];

            if (!videoTrack || !audioTrack) {
                throw new Error('Failed to get media tracks');
            }

            // Monitor track states
            videoTrack.onended = () => logError(new Error('Video track ended'), 'video-track-ended');
            audioTrack.onended = () => logError(new Error('Audio track ended'), 'audio-track-ended');

            return stream;
        } catch (err) {
            logError(err, 'get-user-media');
            throw err;
        }
    };

    const handleWebSocketMessage = async (event) => {
        try {
            const data = JSON.parse(event.data);
            logInfo('Received WebSocket message:', data.type);

            switch (data.type) {
                case 'joined':
                    // Only initiate offer if we're the first peer
                    if (!peerConnectionRef.current.remoteDescription) {
                        const offer = await peerConnectionRef.current.createOffer();
                        await peerConnectionRef.current.setLocalDescription(offer);
                        webSocketRef.current.send(JSON.stringify({
                            type: 'offer',
                            offer: offer
                        }));
                    }
                    break;

                case 'offer':
                    try {
                        if (peerConnectionRef.current.signalingState !== "stable") {
                            await Promise.all([
                                peerConnectionRef.current.setLocalDescription({type: "rollback"}),
                                peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer))
                            ]);
                        } else {
                            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
                        }
                        
                        const answer = await peerConnectionRef.current.createAnswer();
                        await peerConnectionRef.current.setLocalDescription(answer);
                        
                        webSocketRef.current.send(JSON.stringify({
                            type: 'answer',
                            answer: answer
                        }));

                        await processIceCandidateQueue();
                    } catch (err) {
                        logError(err, 'handle-offer');
                    }
                    break;

                    case 'answer':
                        try {
                            await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
                            logInfo('Set remote answer');
                            await processIceCandidateQueue();
                        } catch (err) {
                            logError(err, 'handle-answer');
                        }
                        break;
    
                    case 'candidate':
                        try {
                            const candidate = new RTCIceCandidate(data.candidate);
                            if (peerConnectionRef.current.remoteDescription) {
                                await peerConnectionRef.current.addIceCandidate(candidate);
                                logInfo('Added ICE candidate');
                            } else {
                                iceCandidatesQueue.current.push(data.candidate);
                                logInfo('Queued ICE candidate');
                            }
                        } catch (err) {
                            logError(err, 'handle-candidate');
                        }
                        break;
            }
        } catch (err) {
            logError(err, 'handle-websocket-message');
        }
    };

    useEffect(() => {
        const initializeMeeting = async () => {
            try {
                setConnectionStatus('initializing');
                
                // Verify meeting access
                const verifyResponse = await verifyMeet(meeting_id);
                if (!verifyResponse.valid) {
                    throw new Error('Meeting verification failed');
                }

                // Create and setup WebSocket
                const ws = new WebSocket(verifyResponse.websocket_url);
                webSocketRef.current = ws;
                
                // Create peer connection first
                const pc = createPeerConnection();
                peerConnectionRef.current = pc;

                // Then get media stream
                const stream = await setupMediaStream();

                // Add tracks only after both peer connection and stream are ready
                stream.getTracks().forEach(track => {
                    const sender = pc.addTrack(track, stream);
                    // Monitor sender state
                    sender.onended = () => logError(new Error(`Sender ended for ${track.kind}`), 'sender-ended');
                });

                // Only now set up WebSocket handlers
                ws.onopen = () => {
                    ws.send(JSON.stringify({ type: 'join', meeting_id }));
                    setConnectionStatus('connecting');
                };
                ws.onmessage = handleWebSocketMessage;
                ws.onerror = (error) => {
                    logError(error, 'websocket-error');
                    setConnectionStatus('error');
                };
                ws.onclose = () => setConnectionStatus('disconnected');

            } catch (error) {
                logError(error, 'initialization');
                setConnectionStatus('error');
                onError?.(error);
            }
        };

        initializeMeeting();

        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
            }
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }
            if (webSocketRef.current) {
                webSocketRef.current.close();
            }
        };
    }, [meeting_id]);

  const toggleAudio = () => {
    if (mediaStream) {
      const audioTrack = mediaStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (mediaStream) {
      const videoTrack = mediaStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  const toggleSidebar = (tab) => {
    if (activeTab === tab) {
      setActiveTab('none');
      setSidebarOpen(false);
    } else {
      setActiveTab(tab);
      setSidebarOpen(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

//   const processIceCandidateQueue = async () => {
//     if (peerConnectionRef.current.remoteDescription) {
//         while (iceCandidatesQueue.current.length) {
//             const candidate = iceCandidatesQueue.current.shift();
//             await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
//         }
//     }
// };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const now = new Date();
      const time = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        sender: 'You',
        text: newMessage.trim(),
        time
      }]);
      setNewMessage('');
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setSidebarOpen(false);
    setActiveTab('none');
  };

  const endCall = () => {
    window.close();
  };

  return (
    <div className="h-screen bg-gray-900 flex flex-col">

    <div className={`relative flex-1 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-2/3' : 'w-full'}`}>
        {/* Add connection status display */}
        {connectionStatus !== 'connected' && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/90 px-6 py-3 rounded-full text-white z-10 flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <span className="text-sm font-medium">
                        {connectionStatus}
                    </span>
                </div>
            )}
      <div className="flex-1 relative">
        {/* Remote video (main view) */}
        <video
          ref={remoteVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
        />
        
        {/* Local video (picture-in-picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-black rounded-lg overflow-hidden ring-1 ring-gray-700">
          <video
            ref={localVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-800/90 px-8 py-4 rounded-full">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-colors duration-200 ${
              isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isMuted ? <MicOff className="text-white" /> : <Mic className="text-white" />}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-colors duration-200 ${
              isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            {isVideoOff ? <VideoOff className="text-white" /> : <Video className="text-white" />}
          </button>
          
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-colors duration-200"
          >
            <PhoneOff className="text-white" />
          </button>
          <div className="w-px h-8 bg-gray-600"></div>

          {/* <button
            onClick={() => toggleSidebar('chat')}
            className={`p-4 rounded-full transition-colors duration-200 ${
              activeTab === 'chat' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="text-white" />
          </button> */}

          <button
            onClick={() => toggleSidebar('code')}
            className={`p-4 rounded-full transition-colors duration-200 ${
              activeTab === 'code' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            <Code className="text-white" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 transition-colors duration-200"
          >
            {isFullscreen ? <Minimize2 className="text-white" /> : <Maximize2 className="text-white" />}
          </button>
        </div>
      </div>

      {/* Chat Popup */}
      <div className={`fixed left-4 bottom-28 w-80 bg-gray-800 rounded-lg shadow-lg transition-transform duration-300 ${
        isChatOpen ? 'transform translate-y-0' : 'transform translate-y-full'
      }`}>
        {/* Chat Header */}
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-white font-medium">Chat</h3>
          <button
            onClick={toggleChat}
            className="text-gray-400 hover:text-white p-1"
          >
            {isChatOpen ? 
              <ChevronDown className="w-5 h-5" /> : 
              <ChevronUp className="w-5 h-5" />
            }
          </button>
        </div>

        {/* Messages Area */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex flex-col ${
                message.sender === 'You' ? 'items-end' : 'items-start'
              }`}
            >
              <div className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.sender === 'You' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-700 text-white'
              }`}>
                <p className="text-sm">{message.text}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1">
                {message.sender} • {message.time}
              </span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-4 py-2 transition-colors duration-200"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Sidebar */}
      <div className={`bg-gray-800 transition-all duration-300 ease-in-out ${sidebarOpen ? 'w-1/3' : 'w-0'} overflow-hidden`}>
        {sidebarOpen && (
          <div className="h-full flex flex-col">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-white font-medium">
                {activeTab === 'chat' ? 'Chat' : 'Code Editor'}
              </h2>
              <button
                onClick={() => toggleSidebar(activeTab)}
                className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
              >
                <X className="text-gray-400 hover:text-white w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 p-4">
              {activeTab === 'chat' && (
                <div className="h-full bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-center">Chat functionality coming soon...</p>
                </div>
              )}
              
              {activeTab === 'code' && (
                <div className="h-full bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-400 text-center">Code editor functionality coming soon...</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default VideoMeeting;