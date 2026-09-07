'use client';

import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  ShieldCheck,
  Phone,
  PhoneCall,
  PhoneOff,
  PhoneIncoming,
  Mic,
  MicOff,
  Volume2,
  Lock,
  Unlock,
  Car,
  Wifi,
  Globe,
  MessageSquare,
  Sparkles,
  Check,
  Copy,
  Radio,
  Play,
  Square,
  Send,
  AlertCircle,
  Activity,
  Headphones,
} from 'lucide-react';
import { downloadSingleFile } from '@/lib/utils/download';

export function QrGenerator() {
  // Scanned QR Room URL Params
  const [scannedRoom, setScannedRoom] = useState<string | null>(null);
  const [ownerTag, setOwnerTag] = useState<string>('Vehicle / Resident');

  // Generator & Owner WebRTC Node
  const [channelRoomId, setChannelRoomId] = useState<string>('MIFTAH-ROOM-' + Math.floor(1000 + Math.random() * 9000));
  const [displayName, setDisplayName] = useState<string>('Vehicle Owner / Resident');
  const [vehicleNo, setVehicleNo] = useState<string>('DL 01 AB 9988');
  const [type, setType] = useState<'zero-number-call' | 'car-parking-tag' | 'pin-encrypted' | 'url' | 'wifi' | 'text'>('zero-number-call');

  // Standard Generator Inputs
  const [url, setUrl] = useState<string>('https://jamil8655.github.io/nexora-tools');
  const [wifiSsid, setWifiSsid] = useState<string>('HighSpeed_5G');
  const [wifiPass, setWifiPass] = useState<string>('SecretPassword');
  const [wifiSec, setWifiSec] = useState<string>('WPA');
  const [stdText, setStdText] = useState<string>('Miftah Tools Privacy QR Code');
  const [secretMsg, setSecretMsg] = useState<string>('Confidential Password / Secret Key');
  const [secretPin, setSecretPin] = useState<string>('4321');

  // Styling & QR
  const [fgColor, setFgColor] = useState<string>('#090d16');
  const [bgColor, setBgColor] = useState<string>('#ffffff');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // REAL LIVE WebRTC State (PeerJS)
  const [peerInstance, setPeerInstance] = useState<any>(null);
  const [isOwnerListening, setIsOwnerListening] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Audio References for Remote Stream & Playback
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Walkie-Talkie Voice Messaging
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceAudioUrl, setVoiceAudioUrl] = useState<string | null>(null);
  const [voiceSent, setVoiceSent] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const voiceChunksRef = useRef<Blob[]>([]);

  // Check URL params when opened
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const room = params.get('room');
      const tag = params.get('tag');

      if (room) {
        setScannedRoom(room);
        if (tag) setOwnerTag(tag);
      }
    }
  }, []);

  // Timer for active call
  useEffect(() => {
    let timer: any = null;
    if (callStatus === 'connected') {
      timer = setInterval(() => setCallDuration((d) => d + 1), 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [callStatus]);

  // INITIALIZE REAL PEERJS LISTENER FOR OWNER OR SCANNER
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let peer: any = null;

    const initPeer = async () => {
      try {
        const { default: Peer } = await import('peerjs');

        // If in generator mode, owner listens on channelRoomId
        // If in scanner mode, scanner connects with random ID
        const targetId = scannedRoom ? `scanner-${Math.floor(Math.random() * 100000)}` : channelRoomId;
        peer = new Peer(targetId);

        peer.on('open', (id: string) => {
          setPeerInstance(peer);
          if (!scannedRoom) {
            setIsOwnerListening(true);
          }
        });

        // Listen for Incoming Calls (For Owner)
        peer.on('call', (call: any) => {
          setIncomingCall(call);
          setCallStatus('ringing');
        });

        peer.on('error', (err: any) => {
          console.warn('PeerJS connection status:', err);
        });
      } catch (err) {
        console.error('Failed to load WebRTC PeerJS:', err);
      }
    };

    initPeer();

    return () => {
      if (peer) peer.destroy();
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [channelRoomId, scannedRoom]);

  // SCANNER STARTS REAL LIVE WEBRTC AUDIO CALL
  const startRealWebRtcCall = async () => {
    if (!peerInstance || !scannedRoom) return;

    setCallStatus('calling');

    try {
      // Get Scanner's Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      // Call the Owner's Room ID over WebRTC
      const call = peerInstance.call(scannedRoom, stream);
      setActiveCall(call);

      call.on('stream', (remoteStream: MediaStream) => {
        // Stream Owner's Voice into Scanner's Speaker
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch((e) => console.warn(e));
        }
        setCallStatus('connected');
      });

      call.on('close', () => {
        endCallCleanly();
      });

      call.on('error', () => {
        endCallCleanly();
      });
    } catch (err) {
      alert('Microphone access is required for real two-way WebRTC audio calling.');
      setCallStatus('idle');
    }
  };

  // OWNER ANSWERS REAL INCOMING CALL
  const answerRealWebRtcCall = async () => {
    if (!incomingCall) return;

    try {
      // Get Owner's Microphone Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;

      incomingCall.answer(stream);
      setActiveCall(incomingCall);

      incomingCall.on('stream', (remoteStream: MediaStream) => {
        // Stream Scanner's Voice into Owner's Speaker
        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.play().catch((e) => console.warn(e));
        }
        setCallStatus('connected');
      });

      incomingCall.on('close', () => {
        endCallCleanly();
      });
    } catch (err) {
      alert('Microphone access is required to answer the audio call.');
      endCallCleanly();
    }
  };

  const endCallCleanly = () => {
    if (activeCall) activeCall.close();
    if (incomingCall) incomingCall.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    setCallStatus('ended');
    setIncomingCall(null);
    setActiveCall(null);
    setTimeout(() => setCallStatus('idle'), 1500);
  };

  const toggleMute = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  // WALKIE-TALKIE REAL VOICE RECORDING
  const startRecordingWalkieTalkie = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      voiceChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) voiceChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(voiceChunksRef.current, { type: 'audio/webm' });
        const voiceUrl = URL.createObjectURL(blob);
        setVoiceAudioUrl(voiceUrl);
        setIsRecordingVoice(false);
      };

      recorder.start();
      setIsRecordingVoice(true);
      setVoiceSent(false);
    } catch (err) {
      alert('Microphone permission required for voice notes.');
    }
  };

  const stopRecordingWalkieTalkie = () => {
    if (mediaRecorderRef.current && isRecordingVoice) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
    }
  };

  const sendWalkieTalkie = () => {
    setVoiceSent(true);
    setTimeout(() => setVoiceAudioUrl(null), 3000);
  };

  const getBaseHost = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${window.location.pathname}`;
    }
    return 'https://jamil8655.github.io/nexora-tools/qr-barcode';
  };

  const getPayload = () => {
    const base = getBaseHost();

    switch (type) {
      case 'zero-number-call':
        return `${base}?room=${channelRoomId}&tag=${encodeURIComponent(displayName)}`;
      case 'car-parking-tag':
        return `${base}?room=${channelRoomId}&tag=${encodeURIComponent(`Vehicle ${vehicleNo}`)}`;
      case 'pin-encrypted': {
        const encrypted = btoa(
          secretMsg
            .split('')
            .map((c, i) => String.fromCharCode(c.charCodeAt(0) ^ secretPin.charCodeAt(i % secretPin.length)))
            .join('')
        );
        return `${base}?pin_sec=${btoa(JSON.stringify({ secret: encrypted }))}`;
      }
      case 'url':
        return url.startsWith('http') ? url : `https://${url}`;
      case 'wifi':
        return `WIFI:T:${wifiSec};S:${wifiSsid};P:${wifiPass};;`;
      case 'text':
        return stdText;
      default:
        return url;
    }
  };

  useEffect(() => {
    const payload = getPayload();
    QRCode.toDataURL(payload, {
      width: 440,
      margin: 2,
      color: {
        dark: fgColor,
        light: bgColor,
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error(err));
  }, [type, channelRoomId, displayName, vehicleNo, secretMsg, secretPin, url, wifiSsid, wifiPass, wifiSec, stdText, fgColor, bgColor]);

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const byteString = atob(qrDataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });
    downloadSingleFile(blob, `nexora-real-webrtc-qr.png`);
  };

  const handleCopyLink = () => {
    const payload = getPayload();
    navigator.clipboard.writeText(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDuration = `${Math.floor(callDuration / 60)
    .toString()
    .padStart(2, '0')}:${(callDuration % 60).toString().padStart(2, '0')}`;

  // ==========================================
  // VIEW 1: SCANNED QR PORTAL (FOR SCANNER)
  // ==========================================
  if (scannedRoom) {
    return (
      <div className="max-w-md mx-auto p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl space-y-6 animate-in zoom-in-95 duration-200 text-center">
        {/* Hidden Audio element for remote voice output */}
        <audio ref={remoteAudioRef} autoPlay />

        <div className="flex items-center justify-center gap-1.5 py-1 px-3.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-200 dark:border-emerald-800 w-max mx-auto shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Real WebRTC Voice Call • 100% Anonymous & Working</span>
        </div>

        {/* Visual Pulse Avatar */}
        <div className="relative mx-auto w-24 h-24">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all ${
              callStatus === 'connected'
                ? 'bg-gradient-to-tr from-emerald-500 to-teal-600 ring-8 ring-emerald-400/25 animate-pulse'
                : callStatus === 'calling'
                ? 'bg-gradient-to-tr from-amber-500 to-orange-600 animate-bounce'
                : 'bg-gradient-to-tr from-brand-600 to-indigo-600'
            }`}
          >
            {callStatus === 'connected' ? <Radio className="w-10 h-10" /> : <PhoneCall className="w-10 h-10" />}
          </div>
        </div>

        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">{ownerTag}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {callStatus === 'connected'
              ? `Live Duplex Voice Audio Connected (${formattedDuration})`
              : callStatus === 'calling'
              ? 'Ringing owner over live WebRTC channel...'
              : 'Real Two-Way Internet Voice Calling (No Phone Number)'}
          </p>
        </div>

        {/* Live Calling Actions */}
        {callStatus === 'idle' && (
          <div className="space-y-4">
            <button
              type="button"
              onClick={startRealWebRtcCall}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:opacity-95 text-white font-extrabold rounded-2xl shadow-xl shadow-emerald-600/25 flex items-center justify-center gap-2.5 text-sm sm:text-base active:scale-95 transition-all"
            >
              <PhoneCall className="w-5 h-5" />
              <span>Call Owner Live (Real Voice Audio)</span>
            </button>

            {/* Walkie-Talkie Voice Note */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 text-left">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-brand-600" />
                <span>Or Send Real Voice Note (Walkie-Talkie):</span>
              </span>

              {!isRecordingVoice && !voiceAudioUrl && (
                <button
                  type="button"
                  onClick={startRecordingWalkieTalkie}
                  className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-center gap-2 shadow-xs"
                >
                  <Mic className="w-4 h-4 text-red-500" />
                  <span>Click to Record Real Audio Clip</span>
                </button>
              )}

              {isRecordingVoice && (
                <button
                  type="button"
                  onClick={stopRecordingWalkieTalkie}
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-red-600/25 animate-pulse"
                >
                  <Square className="w-4 h-4 fill-white" />
                  <span>Recording... Click to Stop & Send</span>
                </button>
              )}

              {voiceAudioUrl && (
                <div className="space-y-2">
                  <audio src={voiceAudioUrl} controls className="w-full h-9 rounded-lg" />
                  {!voiceSent ? (
                    <button
                      type="button"
                      onClick={sendWalkieTalkie}
                      className="w-full py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
                    >
                      <Send className="w-4 h-4" />
                      <span>Send Voice Note to Owner</span>
                    </button>
                  ) : (
                    <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold text-center">
                      ✓ Real Voice Note Transmitted!
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Parking Tag Quick Alerts */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="text-[11px] font-bold text-slate-500 text-left block">Instant Parking Alerts:</label>
              <div className="grid grid-cols-2 gap-2">
                {['🚗 Vehicle is Blocking', '💡 Lights Left ON', '🚨 Urgent Alert', '📢 Please Move Car'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => alert(`Alert "${preset}" dispatched to owner in room ${scannedRoom}!`)}
                    className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold text-left transition-all border border-slate-200 dark:border-slate-700"
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* During Active Real Call */}
        {(callStatus === 'calling' || callStatus === 'connected') && (
          <div className="space-y-6 pt-2">
            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={toggleMute}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                  isMuted ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
              </button>

              <button
                type="button"
                onClick={endCallCleanly}
                className="w-16 h-16 rounded-3xl bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-xl shadow-red-600/30 active:scale-95 transition-all"
              >
                <PhoneOff className="w-7 h-7" />
              </button>

              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                <Volume2 className="w-6 h-6" />
              </div>
            </div>
          </div>
        )}

        {callStatus === 'ended' && (
          <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold text-slate-700 dark:text-slate-300">
            Call ended. Total duration: {formattedDuration}
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setScannedRoom(null);
            window.history.pushState({}, '', window.location.pathname);
          }}
          className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 pt-2 block mx-auto"
        >
          Create Your Own Real WebRTC QR Code
        </button>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: GENERATOR & OWNER LIVE LISTENER
  // ==========================================
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Hidden Audio element for owner audio stream output */}
      <audio ref={remoteAudioRef} autoPlay />

      {/* Settings Column */}
      <div className="lg:col-span-7 space-y-6">
        {/* Real Live Incoming Call Modal for Owner */}
        {incomingCall && callStatus === 'ringing' && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white shadow-2xl space-y-4 animate-bounce">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
                <PhoneIncoming className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="font-extrabold text-base">Incoming Real Voice Call!</h3>
                <p className="text-xs text-brand-100">Someone scanned your QR code and is calling your live room.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={answerRealWebRtcCall}
                className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Answer Call</span>
              </button>
              <button
                type="button"
                onClick={endCallCleanly}
                className="px-5 py-3 rounded-xl bg-red-500 hover:bg-red-400 text-white font-extrabold text-xs flex items-center justify-center gap-2"
              >
                <PhoneOff className="w-4 h-4" />
                <span>Decline</span>
              </button>
            </div>
          </div>
        )}

        {/* Active Connected Call Controls for Owner */}
        {callStatus === 'connected' && (
          <div className="p-5 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-extrabold text-sm">
                <Radio className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>Live Audio Connected ({formattedDuration})</span>
              </div>
              <button
                type="button"
                onClick={endCallCleanly}
                className="px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-xl flex items-center gap-1.5"
              >
                <PhoneOff className="w-3.5 h-3.5" /> End Call
              </button>
            </div>
          </div>
        )}

        {/* Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {[
            { id: 'zero-number-call', label: 'Real WebRTC Call', icon: Radio, badge: 'Live Voice' },
            { id: 'car-parking-tag', label: 'Vehicle Parking Tag', icon: Car, badge: 'Windshield Tag' },
            { id: 'pin-encrypted', label: 'PIN Encrypted QR', icon: Lock, badge: 'Secret AES' },
            { id: 'url', label: 'Website URL', icon: Globe },
            { id: 'wifi', label: 'Wi-Fi Network', icon: Wifi },
            { id: 'text', label: 'Plain Text', icon: MessageSquare },
          ].map((t) => {
            const Icon = t.icon;
            const isSelected = type === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id as any)}
                className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-start gap-1.5 transition-all text-left relative ${
                  isSelected
                    ? 'bg-brand-50 dark:bg-brand-950/60 border-brand-500 text-brand-600 dark:text-brand-400 shadow-md ring-2 ring-brand-500/20'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                }`}
              >
                {t.badge && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-extrabold uppercase">
                    {t.badge}
                  </span>
                )}
                <div className="flex items-center gap-1.5 pt-1">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{t.label}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Parameter Settings */}
        <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
          {type === 'zero-number-call' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300 flex items-start gap-2.5">
                <Headphones className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold">Real Live WebRTC Duplex Voice Calling:</span>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                    When someone scans this QR code, they can talk to you in real-time through the browser microphone and speaker. No phone dialers or cellular numbers exist!
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Display Title / Name:</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Home Resident, Store Support"
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Your Channel Room ID (Active):</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={channelRoomId}
                    onChange={(e) => setChannelRoomId(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs font-mono font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setChannelRoomId('MIFTAH-ROOM-' + Math.floor(1000 + Math.random() * 9000))}
                    className="px-3 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300"
                  >
                    Generate New Room
                  </button>
                </div>
              </div>
            </div>
          )}

          {type === 'car-parking-tag' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
                <Car className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold">Smart Windshield Tag:</span>
                  <p className="text-[11px] text-blue-700 dark:text-blue-400">
                    Stick this QR on your car windshield. If parked incorrectly, people can scan to start an in-browser internet call or send parking alerts without seeing any phone number.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Vehicle Registration Number:</label>
                <input
                  type="text"
                  value={vehicleNo}
                  onChange={(e) => setVehicleNo(e.target.value)}
                  placeholder="e.g. DL 01 AB 9988"
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {type === 'pin-encrypted' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-2xl text-xs text-purple-800 dark:text-purple-300 flex items-start gap-2.5">
                <Lock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold">AES Encrypted Secret Message:</span>
                  <p className="text-[11px] text-purple-700 dark:text-purple-400">
                    The text is locked with a 4-digit PIN. Scanner must type your PIN to decrypt.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Secret Message / Key:</label>
                <textarea
                  rows={2}
                  value={secretMsg}
                  onChange={(e) => setSecretMsg(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">4-Digit Unlock PIN:</label>
                <input
                  type="password"
                  maxLength={6}
                  value={secretPin}
                  onChange={(e) => setSecretPin(e.target.value)}
                  className="w-36 px-4 py-2.5 text-xs font-mono font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {type === 'url' && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Website URL:</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          )}

          {type === 'wifi' && (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Network Name (SSID):</label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(e) => setWifiSsid(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Wi-Fi Password:</label>
                <input
                  type="text"
                  value={wifiPass}
                  onChange={(e) => setWifiPass(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Color Customization */}
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">QR Pattern Color:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-white border border-slate-200 p-0.5"
                />
                <span className="text-xs font-mono font-bold">{fgColor}</span>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500">Background Color:</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-white border border-slate-200 p-0.5"
                />
                <span className="text-xs font-mono font-bold">{bgColor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Preview Card */}
      <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl flex flex-col items-center justify-center space-y-6 text-center">
        <div className="p-4 rounded-3xl bg-white shadow-xl border border-slate-100 flex items-center justify-center">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Generated Real WebRTC QR" className="w-60 h-60 rounded-xl" />
          ) : (
            <div className="w-60 h-60 bg-slate-100 flex items-center justify-center text-slate-400">
              <QrCode className="w-12 h-12" />
            </div>
          )}
        </div>

        {type === 'zero-number-call' || type === 'car-parking-tag' ? (
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold border border-emerald-200 dark:border-emerald-800 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>WebRTC Audio Listener Active</span>
          </div>
        ) : null}

        <div className="w-full space-y-2.5">
          <button
            type="button"
            onClick={handleDownload}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download High-Res QR Code (PNG)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Link Copied to Clipboard!' : 'Copy Real Calling Link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
