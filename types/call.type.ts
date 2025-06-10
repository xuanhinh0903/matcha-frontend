export interface CallSocketEvents {
  call_initiated: {
    caller: {
      user_id: number;
      full_name: string;
    };
    receiver: {
      user_id: number;
      full_name: string;
    };
  };
  call_accepted: {
    caller: {
      user_id: number;
      full_name: string;
    };
    receiver: {
      user_id: number;
      full_name: string;
    };
  };
  call_rejected: {
    caller: {
      user_id: number;
      full_name: string;
    };
    receiver: {
      user_id: number;
      full_name: string;
    };
  };
  call_ended: {
    caller: {
      user_id: number;
      full_name: string;
    };
    receiver: {
      user_id: number;
      full_name: string;
    };
    duration: number;
  };
}

export interface StartCallRequest {
  callerId?: number;
  receiverId: number;
  callType?: 'audio' | 'video';
}

export interface EndCallRequest {
  callId: number | string;
  duration?: number;
  conversationId?: number;
  callType?: 'audio' | 'video';
}

export interface WebRTCSignalData {
  callId: string | number;
  signal: {
    type: 'offer' | 'answer' | 'candidate';
    sdp?: RTCSessionDescriptionInit;
    candidate?: RTCIceCandidateInit;
  };
}
