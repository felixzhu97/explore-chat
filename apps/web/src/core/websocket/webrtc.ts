"use client";

import { ICE_SERVERS, INITIAL_CALL_STATE } from "@whatschat/im";
import type { RTCCallState, IWebSocketAdapter } from "@whatschat/im";
import { getWebSocketAdapter } from "./websocket";

export class WebRTCAdapter {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private remoteStream: MediaStream | null = null;
  private wsManager: IWebSocketAdapter;
  private listeners: Map<string, Function[]> = new Map();
  private callState: RTCCallState = { ...INITIAL_CALL_STATE };
  private durationTimer: NodeJS.Timeout | null = null;

  constructor(wsManager?: IWebSocketAdapter) {
    this.wsManager = wsManager || getWebSocketAdapter();
    this.setupWebSocketListeners();
  }

  private setupWebSocketListeners() {
    this.wsManager.on("call_offer", this.handleCallOffer.bind(this));
    this.wsManager.on("call_answer", this.handleCallAnswer.bind(this));
    this.wsManager.on("call_ice_candidate", this.handleIceCandidate.bind(this));
    this.wsManager.on("call_end", this.handleCallEnd.bind(this));
  }

  private async createPeerConnection() {
    try {
      const configuration: RTCConfiguration = {
        iceServers: ICE_SERVERS,
      };

      this.peerConnection = new RTCPeerConnection(configuration);

      this.peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          this.wsManager.send({
            type: "call_ice_candidate",
            to: this.callState.contactId,
            data: event.candidate as unknown as Record<string, unknown>,
          });
        }
      };

      this.peerConnection.ontrack = (event) => {
        this.remoteStream = event.streams[0];
        this.emit("remoteStream", this.remoteStream);
      };

      this.peerConnection.onconnectionstatechange = () => {
        console.log("连接状态:", this.peerConnection?.connectionState);
        if (this.peerConnection?.connectionState === "connected") {
          this.updateCallState({ status: "connected" });
          this.startDurationTimer();
        } else if (
          this.peerConnection?.connectionState === "disconnected" ||
          this.peerConnection?.connectionState === "failed"
        ) {
          this.endCall();
        }
      };
    } catch (error) {
      console.error("创建 PeerConnection 失败:", error);
      throw new Error("无法创建通话连接");
    }
  }

  private async getUserMedia(video = false): Promise<MediaStream> {
    try {
      const constraints: MediaStreamConstraints = {
        audio: true,
        video: video ? { width: 640, height: 480 } : false,
      };

      return await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      console.error("获取媒体设备失败:", error);
      throw new Error("无法访问摄像头或麦克风，请检查权限设置");
    }
  }

  async startCall(
    contactId: string,
    contactName: string,
    contactAvatar: string,
    callType: "voice" | "video",
  ): Promise<void> {
    try {
      this.updateCallState({
        isActive: true,
        isIncoming: false,
        contactId,
        contactName,
        contactAvatar,
        callType,
        status: "calling",
        isVideoOff: callType === "voice",
      });

      this.localStream = await this.getUserMedia(callType === "video");
      this.emit("localStream", this.localStream);

      await this.createPeerConnection();

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);

      this.wsManager.send({
        type: "call_offer",
        to: contactId,
        data: {
          offer,
          callType,
          callerName: "Me",
          callerAvatar: "/placeholder.svg?height=40&width=40&text=我",
        },
      });
    } catch (error) {
      console.error("发起通话失败:", error);
      this.endCall();
      throw error;
    }
  }

  private async handleCallOffer(message: any) {
    try {
      const { offer, callType, callerName, callerAvatar } = message.data;

      this.updateCallState({
        isActive: true,
        isIncoming: true,
        contactId: message.from,
        contactName: callerName,
        contactAvatar: callerAvatar,
        callType,
        status: "ringing",
        isVideoOff: callType === "voice",
      });

      await this.createPeerConnection();
      await this.peerConnection!.setRemoteDescription(offer);

      this.emit("incomingCall", this.callState);
    } catch (error) {
      console.error("处理来电失败:", error);
      this.endCall();
    }
  }

  async answerCall(): Promise<void> {
    try {
      if (!this.callState.isIncoming) {
        throw new Error("没有来电可接听");
      }

      if (!this.peerConnection) {
        throw new Error("通话连接未建立");
      }

      this.localStream = await this.getUserMedia(
        this.callState.callType === "video",
      );
      this.emit("localStream", this.localStream);

      this.localStream.getTracks().forEach((track) => {
        this.peerConnection!.addTrack(track, this.localStream!);
      });

      const state = this.peerConnection!.signalingState;
      if (state !== "have-remote-offer" && state !== "have-local-pranswer") {
        console.warn("answerCall: skip createAnswer, signalingState=", state);
        return;
      }
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);

      this.wsManager.send({
        type: "call_answer",
        to: this.callState.contactId,
        data: answer as unknown as Record<string, unknown>,
      });

      this.updateCallState({ status: "connected", isIncoming: false });
    } catch (error) {
      console.error("接听通话失败:", error);
      this.endCall();
      throw error;
    }
  }

  private async handleCallAnswer(message: any) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.setRemoteDescription(message.data);
        this.updateCallState({ status: "connected" });
        this.startDurationTimer();
      }
    } catch (error) {
      console.error("处理通话应答失败:", error);
      this.endCall();
    }
  }

  private async handleIceCandidate(message: any) {
    try {
      if (this.peerConnection) {
        await this.peerConnection.addIceCandidate(message.data);
      }
    } catch (error) {
      console.error("处理 ICE 候选失败:", error);
    }
  }

  private handleCallEnd(message: any) {
    this.endCall();
  }

  endCall(): void {
    if (this.callState.isActive && this.callState.contactId) {
      this.wsManager.send({
        type: "call_end",
        to: this.callState.contactId,
        data: {},
      });
    }

    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localStream = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteStream = null;
    }

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    this.updateCallState({
      isActive: false,
      status: "ended",
      duration: 0,
    });

    this.emit("callEnded", null);
  }

  toggleMute(): void {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = this.callState.isMuted;
        this.updateCallState({ isMuted: !this.callState.isMuted });
      }
    }
  }

  toggleVideo(): void {
    if (this.localStream && this.callState.callType === "video") {
      const videoTrack = this.localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = this.callState.isVideoOff;
        this.updateCallState({ isVideoOff: !this.callState.isVideoOff });
      }
    }
  }

  toggleSpeaker(): void {
    this.updateCallState({ isSpeakerOn: !this.callState.isSpeakerOn });
  }

  private startDurationTimer() {
    this.durationTimer = setInterval(() => {
      this.updateCallState({ duration: this.callState.duration + 1 });
    }, 1000);
  }

  private updateCallState(updates: Partial<RTCCallState>) {
    this.callState = { ...this.callState, ...updates };
    this.emit("callStateChanged", this.callState);
  }

  getCallState(): RTCCallState {
    return { ...this.callState };
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }
}

// 单例模式
let rtcManager: WebRTCAdapter | null = null;

export const getWebRTCAdapter = (): WebRTCAdapter => {
  if (!rtcManager) {
    rtcManager = new WebRTCAdapter();
  }
  return rtcManager;
};
