import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Code, ChevronUp, ChevronDown, Maximize2, Minimize2, Send, X } from 'lucide-react';
import { verifyMeet } from '../../wsApi';
import { useParams } from 'react-router-dom';
import ChatSection from '../../components/ChatSection';
import { useAuthStore } from '../../store/useAuthStore';
import CodeEditor from '../../components/CodeEditor';
import RatingModal from '../../components/RatingModal';

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
    const reconnectAttempts = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 3;
    const reconnectTimeoutRef = useRef(null);
    const [isInitiator, setIsInitiator] = useState(false);
    const [wsReady, setWsReady] = useState(false);
    const { user } = useAuthStore();
    const [showRatingModal, setShowRatingModal] = useState(false);
    const hasShownRating = useRef(false);
    const searchParams = new URLSearchParams(window.location.search);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const [isTeacher, setIsTeacher] = useState(false);

    useEffect(() => {
        const checkTeacherStatus = () => {
            const isUserTeacher = String(user.id) === String(teacherId);
            console.log("Teacher check:", {
                userId: user.id,
                teacherId: teacherId,
                isTeacher: isUserTeacher
            });
            setIsTeacher(isUserTeacher);
        };
        
        checkTeacherStatus();
    }, [user.id, teacherId]);

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (!hasShownRating.current && !isTeacher) {
                console.log("Preventing unload for student");
                e.preventDefault();
                e.returnValue = '';
                setShowRatingModal(true);
                return '';
            } else {
                console.log("Allowing unload for teacher");
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isTeacher]);

    const handleRatingSubmit = () => {
        hasShownRating.current = true;
        window.close();
    };

    const handleRatingClose = () => {
        hasShownRating.current = true;
        window.close();
    };

    const endCall = () => {
        console.log("End call triggered:", {
            isTeacher,
            userId: user.id,
            teacherId
        });
        
        if (isTeacher) {
            console.log("Teacher ending call - closing window directly");
            window.close();
        } else {
            console.log("Student ending call - showing rating modal");
            setShowRatingModal(true);
        }
    };

    const logInfo = (message, data = '') => {
        console.log(`[VideoMeeting] ${message}`, data);
    };

    const logError = (error, context) => {
        console.error(`[VideoMeeting] ${context}:`, error);
        setConnectionStatus(`error: ${context}`);
    };
    
    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() && webSocketRef.current?.readyState === WebSocket.OPEN) {
            const messageData = {
                type: 'chat',
                text: newMessage.trim(),
            };
            
            webSocketRef.current.send(JSON.stringify(messageData));
            setNewMessage('');
        }
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

    //here creates new rtcpeer connection with STUN , (TURN on the future)
    const createPeerConnection = () => {
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.google.com:19302' }
            ],
            iceCandidatePoolSize: 10
        };

        const pc = new RTCPeerConnection(configuration);

        //negotiation
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

        //when ice candidate is discovered
        pc.onicecandidate = (event) => {
            if (event.candidate && webSocketRef.current?.readyState === WebSocket.OPEN) {
                webSocketRef.current.send(JSON.stringify({
                    type: 'candidate',
                    candidate: event.candidate
                }));
            }
        };

        //remote track is added
        pc.ontrack = (event) => {
            logInfo('Received remote track', event.streams[0]);
            if (remoteVideoRef.current && event.streams[0]) {
                remoteVideoRef.current.srcObject = event.streams[0];
                setConnectionStatus('connected');
                setIsConnected(true);
            }
        };

        //ice connection state changes
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
            logInfo('............Connection State:', pc.connectionState);
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

    const initializeWebSocket = async (url, isReconnecting = false) => {
        return new Promise((resolve, reject) => {
            try {
                const ws = new WebSocket(url);
                
                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error('WebSocket connection timeout'));
                }, 10000);

                ws.onopen = () => {
                    clearTimeout(timeout);
                    reconnectAttempts.current = 0;
                    setWsReady(true);
                    
                    // If reconnecting, we need to re-establish the peer connection
                    if (isReconnecting && peerConnectionRef.current) {
                        handleReconnection();
                    }
                    
                    resolve(ws);
                };

                ws.onmessage = async (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        
                        if (data.type === 'initiator') {
                            setIsInitiator(data.isInitiator);
                        }
                        
                        await handleWebSocketMessage(event);
                    } catch (err) {
                        logError(err, 'ws-message-handling');
                    }
                };

                ws.onerror = (error) => {
                    clearTimeout(timeout);
                    logError(error, 'websocket-error');
                    reject(error);
                };

                ws.onclose = () => {
                    setWsReady(false);
                    handleWebSocketClosure();
                };
            } catch (err) {
                reject(err);
            }
        });
    };

    const handleWebSocketClosure = async () => {
        if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
            setConnectionStatus('reconnecting');
            reconnectAttempts.current += 1;
            
            // Exponential backoff for reconnection attempts
            const backoffTime = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
            
            reconnectTimeoutRef.current = setTimeout(async () => {
                try {
                    const verifyResponse = await verifyMeet(meeting_id);
                    if (verifyResponse.valid) {
                        const ws = await initializeWebSocket(verifyResponse.websocket_url, true);
                        webSocketRef.current = ws;
                    }
                } catch (err) {
                    logError(err, 'reconnection-failed');
                    setConnectionStatus('failed');
                }
            }, backoffTime);
        } else {
            setConnectionStatus('failed');
        }
    };

    const handleReconnection = async () => {
        try {
            // Close existing peer connection
            if (peerConnectionRef.current) {
                peerConnectionRef.current.close();
            }

            // Create new peer connection
            const pc = createPeerConnection();
            peerConnectionRef.current = pc;

            // Add existing tracks
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => {
                    pc.addTrack(track, mediaStream);
                });
            }

            // If we were the initiator, create a new offer
            if (isInitiator && webSocketRef.current?.readyState === WebSocket.OPEN) {
                const offer = await pc.createOffer();
                await pc.setLocalDescription(offer);
                webSocketRef.current.send(JSON.stringify({
                    type: 'offer',
                    offer: offer
                }));
            }
        } catch (err) {
            logError(err, 'reconnection-handling');
        }
    };

    const handleWebSocketMessage = async (event) => {
        try {
            const data = JSON.parse(event.data);
            logInfo('Received WebSocket message:', data.type);

            switch (data.type) {
                case 'joined':
                    // Only initiate offer if we're the first peer
                    if (isInitiator) {
                        setTimeout(async () => {
                            try {
                                const offer = await peerConnectionRef.current.createOffer();
                                await peerConnectionRef.current.setLocalDescription(offer);
                                webSocketRef.current?.send(JSON.stringify({
                                    type: 'offer',
                                    offer: offer
                                }));
                            } catch (err) {
                                logError(err, 'create-initial-offer');
                            }
                        }, 1000);
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
                    case 'chat':
                        const messageData = {
                            id: messages.length + 1,
                            sender_id: data.sender_id,
                            sender_name: data.sender_name,
                            text: data.text,
                            time: data.time
                        };
                        setMessages(prev => [...prev, messageData])
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

                // Initialize peer connection first
                const pc = createPeerConnection();
                peerConnectionRef.current = pc;

                // Set up media stream
                const stream = await setupMediaStream();
                
                // Initialize WebSocket with timeout
                const ws = await initializeWebSocket(verifyResponse.websocket_url);
                webSocketRef.current = ws;
                
                // Add tracks only after WebSocket is ready
                stream.getTracks().forEach(track => {
                    pc.addTrack(track, stream);
                });

                setConnectionStatus('connecting');
            } catch (error) {
                logError(error, 'initialization');
                setConnectionStatus('error');
                onError?.(error);
            }
        };

        initializeMeeting();

        return () => {
            setWsReady(false);
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
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

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
    setSidebarOpen(false);
    setActiveTab('none');
  };

//   const endCall = () => {
//     window.close();
//   };

  return (
    <>
    <div className="h-screen w-full bg-gray-900 flex overflow-hidden">

<div className={`flex-1 relative transition-all duration-300 ${sidebarOpen ? 'w-1/2' : 'w-full'}`}>
                {/* Connection Status */}
                {connectionStatus !== 'connected' && (
                    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800/90 px-6 py-3 rounded-full text-white z-10 flex items-center space-x-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-sm font-medium">{connectionStatus}</span>
                    </div>
                )}

                {/* Remote Video */}
                <div className={`h-full relative ${sidebarOpen ? 'rounded-l-2xl overflow-hidden' : ''}`}>
                    <video
                        ref={remoteVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                    />
                </div>

                {/* Local Video */}
                <div className={`absolute ${sidebarOpen ? 'top-4 left-4' : 'top-4 right-4'} w-48 h-36 bg-black rounded-lg overflow-hidden ring-1 ring-gray-700 transition-all duration-300`}>
                    <video
                        ref={localVideoRef}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />
                </div>

                {/* Controls */}
                <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-800/90 px-4 py-2 rounded-full shadow-lg">
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full transition-all duration-200 ${
                            isMuted ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                    >
                        {isMuted ? <MicOff className="text-white w-5 h-5" /> : <Mic className="text-white w-5 h-5" />}
                    </button>
                    
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-all duration-200 ${
                            isVideoOff ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                    >
                        {isVideoOff ? <VideoOff className="text-white w-5 h-5" /> : <Video className="text-white w-5 h-5 " />}
                    </button>
                    
                    <button
                        onClick={endCall}
                        className="p-4 rounded-full bg-red-500 hover:bg-red-600 transition-all duration-200"
                    >
                        <PhoneOff className="text-white w-5 h-5" />
                    </button>

                    <div className="w-px h-8 bg-gray-600"></div>

                    <button
                        onClick={() => toggleSidebar('code')}
                        className={`p-4 rounded-full transition-all duration-200 ${
                            activeTab === 'code' ? 'bg-blue-500 hover:bg-blue-600' : 'bg-gray-600 hover:bg-gray-700'
                        }`}
                    >
                        <Code className="text-white w-5 h-5" />
                    </button>

                    <button
                        onClick={toggleFullscreen}
                        className="p-4 rounded-full bg-gray-600 hover:bg-gray-700 transition-all duration-200"
                    >
                        {isFullscreen ? <Minimize2 className="text-white w-5 h-5" /> : <Maximize2 className="text-white w-5 h-5" />}
                    </button>
                </div>
            </div>

            {/* Sidebar */}
            <div className={`bg-gray-800 transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'w-1/2 border border-gray-500' : 'w-0'
            } overflow-hidden`}>
                {sidebarOpen && (
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                            <h2 className="text-white font-medium">Code Editor</h2>
                            <button
                                onClick={() => toggleSidebar(activeTab)}
                                className="p-2 hover:bg-gray-700 rounded-full transition-colors duration-200"
                            >
                                <X className="text-gray-400 hover:text-white w-4 h-4" />
                            </button>
                        </div>
                        
                        {/* <div className="flex-1 p-4"> */}
                            {/* <div className="h-full bg-gray-900 rounded-lg p-4"> */}
                                {/* <div className="h-full flex flex-col"> */}
                                    {/* <div className="flex-1 font-mono text-gray-300"> */}
                                        {/* Code editor content would go here */}
                                        {/* <pre className="p-4">
                                            // Your code here...
                                        </pre> */}
                                        {activeTab === 'code' && (
                                            <CodeEditor 
                                                websocket={webSocketRef.current}
                                                isOpen={activeTab === 'code'} 
                                            />
                                        )}
                                    {/* </div> */}
                                {/* </div> */}
                            {/* </div> */}
                        {/* </div> */}
                    </div>
                )}
            </div>
      {/* Chat Popup */}
      <ChatSection 
            isChatOpen={isChatOpen}
            toggleChat={toggleChat}
            messages={messages}
            newMessage={newMessage}
            setNewMessage={setNewMessage}
            handleSendMessage={handleSendMessage}
            currentUserId={user.id}
        />
      </div>
      {showRatingModal && user.id !== teacherId && (
                <RatingModal
                    teacherId={teacherId}
                    onClose={handleRatingClose}
                    onSubmit={handleRatingSubmit}
                />
            )}
        </>
  );
};

export default VideoMeeting;