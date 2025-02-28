import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Code, ChevronUp, ChevronDown, Maximize2, Minimize2, Send, X } from 'lucide-react';
import { meetDetails, transferTime, verifyMeet } from '../../wsApi';
import { useParams } from 'react-router-dom';
import ChatSection from '../../components/ChatSection';
import { useAuthStore } from '../../store/useAuthStore';
import CodeEditor from '../../components/CodeEditor';
import RatingModal from '../../components/RatingModal';
import TimeTracker from '../../components/TimeTracker';
import SessionEndModal from '../../components/SessionEndModal';
import { sessionDetails } from '../../api';
import ConfirmEndCallDialog from '../../components/ConfirmEndCallDialog';
import RequestEndCallDialog from '../../components/RequestEndCallDialog';
import RejectionNotification from '../../components/RejectionNotification';

function VideoMeeting() {
    return (
      <div>
        <h1>Hello, World!</h1>
      </div>
    );
  }

export default VideoMeeting;