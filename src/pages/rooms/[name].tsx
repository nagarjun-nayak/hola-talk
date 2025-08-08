

// import {
//   LiveKitRoom, PreJoin, LocalUserChoices, VideoConference,
//   formatChatMessageLinks, useLocalParticipant
// } from "@livekit/components-react";
// import { LogLevel, RoomOptions, VideoPresets } from "livekit-client";
// import type { NextPage } from "next";
// import { useRouter } from "next/router";
// import { useEffect, useMemo, useState } from "react";
// import { DebugMode } from "../../lib/Debug";
// import { api } from "../../styles/utils/api";
// import { signIn, useSession } from "next-auth/react";
// import Pusher from "pusher-js";
// import useTranscribe from "../../hooks/useTranscribe";
// import Captions from "../../components/captions";
// import SplashScreen from "../../components/splashScreen";
// import TranscriptPanel from "../../components/transcript";
// import { IoDocumentTextOutline } from "react-icons/io5";

// const Home: NextPage = () => {
//   const router = useRouter();
//   const { name: roomName } = router.query;
//   const { data: session, status } = useSession();
//   const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);
//   const [selectedCode, setSelectedCode] = useState("en-US");

//   if (status === "loading") return <SplashScreen />;
//   if (!session) {
//     signIn("google");
//     return <SplashScreen />;
//   }

//   const languageCodes = [
//     { language: "Kannada", code: "kn-IN" }, { language: "English", code: "en-US" },
//     { language: "Hindi", code: "hi-IN" }, { language: "Japanese", code: "ja-JP" },
//     { language: "French", code: "fr-FR" }, { language: "Deutsch", code: "de-DE" },
//     { language: "Telugu", code: "te-IN" }, { language: "Tamil", code: "ta-IN" },
//     { language: "Spanish", code: "es-ES" }, { language: "Chinese", code: "zh-CN" },
//   ];

//   return (
//     <main data-lk-theme="default">
//       {roomName && !Array.isArray(roomName) && preJoinChoices ? (
//         <ActiveRoom
//           roomName={roomName}
//           userChoices={preJoinChoices}
//           onLeave={() => router.push('/')}
//           userId={session?.user.id as string}
//           selectedLanguage={selectedCode}
//         />
//       ) : (
//         <main className="grid w-full min-h-[100dvh] place-items-center p-4">
//           <div className="flex w-full max-w-sm flex-col gap-4">
//             <div className="flex flex-col gap-2 text-center">
//               <h1 className="text-2xl font-bold">Hey, {session?.user.name}!</h1>
//               <p className="text-sm font-normal">
//                 You are joining{" "}
//                 <span className="gradient-text font-semibold">{roomName}</span>
//               </p>
//             </div>
//             <div className="flex flex-col gap-2">
//               <label className="text-sm text-center">Choose your Language</label>
//               <select
//                 className="lk-button"
//                 onChange={(e) => setSelectedCode(e.target.value)}
//                 defaultValue={selectedCode}
//               >
//                 {languageCodes.map((language) => (
//                   <option key={language.code} value={language.code}>{language.language}</option>
//                 ))}
//               </select>
//               <button
//                 className="lk-button lk-button-secondary"
//                 onClick={() => router.push('/')}
//               >
//                 Back to Home
//               </button>
//             </div>
//             <PreJoin
//               onError={(err) => console.log("Error while setting up prejoin", err)}
//               defaults={{
//                 username: session?.user.name as string,
//                 videoEnabled: true,
//                 audioEnabled: true,
//               }}
//               onSubmit={(values) => {
//                 console.log("Joining with: ", values);
//                 setPreJoinChoices(values);
//               }}
//             ></PreJoin>
//           </div>
//         </main>
//       )}
//     </main>
//   );
// };

// type ActiveRoomProps = {
//   userChoices: LocalUserChoices;
//   roomName: string;
//   onLeave?: () => void;
//   userId: string;
//   selectedLanguage: string;
// };

// const ActiveRoom = ({ roomName, userChoices, onLeave, userId, selectedLanguage }: ActiveRoomProps) => {
//   const { data, isLoading } = api.rooms.joinRoom.useQuery({ roomName });
//   const router = useRouter();
//   const { hq } = router.query;

//   const roomOptions = useMemo((): RoomOptions => ({
//     videoCaptureDefaults: {
//       deviceId: userChoices.videoDeviceId ?? undefined,
//       resolution: hq === "true" ? VideoPresets.h2160 : VideoPresets.h720,
//     },
//     publishDefaults: {
//       videoSimulcastLayers: hq === "true" ? [VideoPresets.h1080, VideoPresets.h720] : [VideoPresets.h540, VideoPresets.h216],
//     },
//     audioCaptureDefaults: { deviceId: userChoices.audioDeviceId ?? undefined },
//     adaptiveStream: { pixelDensity: "screen" },
//     dynacast: true,
//   }), [userChoices, hq]);

//   const [transcriptionQueue, setTranscriptionQueue] = useState<{
//     sender: string; message: string; translatedMessages: Record<string, string>;
//     senderId: string; isFinal: boolean; sourceLang?: string;
//   }[]>([]);

//   const [isTranscriptPanelOpen, setIsTranscriptPanelOpen] = useState(false);
//   const [transcriptLog, setTranscriptLog] = useState<{ sender: string; message: string; timestamp: string }[]>([]);

//   useTranscribe({
//     roomName,
//     audioEnabled: userChoices.audioEnabled,
//     languageCode: selectedLanguage,
//   });

//   useEffect(() => {
//     if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
//       console.error("Pusher environment variables not set.");
//       return;
//     }
//     const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
//       cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
//     });

//     const channel = pusher.subscribe(roomName);

//     channel.bind("transcribe-event", (data: {
//       sender: string; message: string; translatedMessages: Record<string, string>;
//       senderId: string; isFinal: boolean; sourceLang?: string;
//     }) => {
//       if (data.isFinal && userId !== data.senderId) {
//         setTranscriptionQueue((prev) => [...prev, data]);

//         // --- START OF THE FIX ---
//         const targetLang = selectedLanguage.split("-")[0] ?? "en";
//         const sourceLang = data.sourceLang ?? "auto";

//         // Ensure targetLang is a valid key before accessing translatedMessages
//         const messageForLog = (targetLang === sourceLang)
//           ? data.message
//           : (data.translatedMessages[targetLang] || data.message);
//         // --- END OF THE FIX ---

//         setTranscriptLog((prevLog) => [
//           ...prevLog,
//           {
//             sender: data.sender,
//             message: messageForLog,
//             timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
//           },
//         ]);
//       }
//     });

//     return () => pusher.unsubscribe(roomName);
//   }, [roomName, userId, selectedLanguage]);

//   if (isLoading) return <SplashScreen />;

//   return (
//     <>
//       {data && (
//         <LiveKitRoom
//           token={data.accessToken}
//           serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
//           options={roomOptions}
//           video={userChoices.videoEnabled}
//           audio={true}
//           onDisconnected={onLeave}
//         >
//           <SetInitialMicrophoneState audioEnabled={userChoices.audioEnabled} />
//           <div style={{
//             position: 'absolute', top: '1rem', left: '1rem', zIndex: 100,
//             color: 'white', background: 'rgba(0, 0, 0, 0.5)',
//             padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center'
//           }}>
//             <h2 className="text-lg font-semibold">
//               Room: <span className="gradient-text">{roomName}</span>
//             </h2>
//             <button
//               onClick={() => setIsTranscriptPanelOpen(true)}
//               className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
//               title="View Transcript"
//             >
//               <IoDocumentTextOutline size={20} className="text-white" />
//             </button>
//           </div>

//           <Captions
//             transcriptionQueue={transcriptionQueue}
//             setTranscriptionQueue={setTranscriptionQueue}
//             languageCode={selectedLanguage}
//           />
//           <VideoConference chatMessageFormatter={formatChatMessageLinks} />
//           <DebugMode logLevel={LogLevel.info} />

//           {isTranscriptPanelOpen && (
//             <TranscriptPanel log={transcriptLog} onClose={() => setIsTranscriptPanelOpen(false)} />
//           )}
//         </LiveKitRoom>
//       )}
//     </>
//   );
// };

// function SetInitialMicrophoneState({ audioEnabled }: { audioEnabled: boolean }) {
//   const { localParticipant } = useLocalParticipant();
//   useEffect(() => {
//     if (localParticipant && localParticipant.isMicrophoneEnabled !== audioEnabled) {
//       localParticipant.setMicrophoneEnabled(audioEnabled);
//     }
//   }, [localParticipant, audioEnabled]);
//   return null;
// }

// export default Home;




// src/pages/rooms/[name].tsx

import {
  LiveKitRoom, PreJoin, LocalUserChoices, VideoConference,
  formatChatMessageLinks, useLocalParticipant
} from "@livekit/components-react";
import { LogLevel, RoomOptions, VideoPresets } from "livekit-client";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { DebugMode } from "../../lib/Debug";
import { api } from "../../styles/utils/api";
import { signIn, useSession } from "next-auth/react";
import Pusher from "pusher-js";
import useTranscribe from "../../hooks/useTranscribe";
import Captions from "../../components/captions";
import SplashScreen from "../../components/splashScreen";
import TranscriptPanel from "../../components/transcript";
import { IoDocumentTextOutline } from "react-icons/io5";

const Home: NextPage = () => {
  const router = useRouter();
  const { name: roomName } = router.query;
  const { data: session, status } = useSession();
  const [preJoinChoices, setPreJoinChoices] = useState<LocalUserChoices | undefined>(undefined);
  const [selectedCode, setSelectedCode] = useState("en-US");

  if (status === "loading") return <SplashScreen />;
  if (!session) {
    signIn("google");
    return <SplashScreen />;
  }

  const languageCodes = [
    { language: "Kannada", code: "kn-IN" }, { language: "English", code: "en-US" },
    { language: "Hindi", code: "hi-IN" }, { language: "Japanese", code: "ja-JP" },
    { language: "French", code: "fr-FR" }, { language: "Deutsch", code: "de-DE" },
    { language: "Telugu", code: "te-IN" }, { language: "Tamil", code: "ta-IN" },
    { language: "Spanish", code: "es-ES" }, { language: "Chinese", code: "zh-CN" },
  ];

  return (
    <main data-lk-theme="default">
      {roomName && !Array.isArray(roomName) && preJoinChoices ? (
        <ActiveRoom
          roomName={roomName}
          userChoices={preJoinChoices}
          onLeave={() => router.push('/')}
          userId={session?.user.id as string}
          selectedLanguage={selectedCode}
        />
      ) : (
        <main className="grid w-full min-h-[100dvh] place-items-center p-4">
          <div className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex flex-col gap-2 text-center">
              <h1 className="text-2xl font-bold">Hey, {session?.user.name}!</h1>
              <p className="text-sm font-normal">
                You are joining{" "}
                <span className="gradient-text font-semibold">{roomName}</span>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm text-center">Choose your Language</label>
              <select
                className="lk-button"
                onChange={(e) => setSelectedCode(e.target.value)}
                defaultValue={selectedCode}
              >
                {languageCodes.map((language) => (
                  <option key={language.code} value={language.code}>{language.language}</option>
                ))}
              </select>
              <button
                className="lk-button lk-button-secondary"
                onClick={() => router.push('/')}
              >
                Back to Home
              </button>
            </div>
            <PreJoin
              onError={(err) => console.log("Error while setting up prejoin", err)}
              defaults={{
                username: session?.user.name as string,
                videoEnabled: true,
                audioEnabled: true,
              }}
              onSubmit={(values) => {
                console.log("Joining with: ", values);
                setPreJoinChoices(values);
              }}
            ></PreJoin>
          </div>
        </main>
      )}
    </main>
  );
};

type ActiveRoomProps = {
  userChoices: LocalUserChoices;
  roomName: string;
  onLeave?: () => void;
  userId: string;
  selectedLanguage: string;
};

const ActiveRoom = ({ roomName, userChoices, onLeave, userId, selectedLanguage }: ActiveRoomProps) => {
  const { data, isLoading } = api.rooms.joinRoom.useQuery({ roomName });
  const router = useRouter();
  const { hq } = router.query;

  const roomOptions = useMemo((): RoomOptions => ({
    videoCaptureDefaults: {
      deviceId: userChoices.videoDeviceId ?? undefined,
      resolution: hq === "true" ? VideoPresets.h2160 : VideoPresets.h720,
    },
    publishDefaults: {
      videoSimulcastLayers: hq === "true" ? [VideoPresets.h1080, VideoPresets.h720] : [VideoPresets.h540, VideoPresets.h216],
    },
    audioCaptureDefaults: { deviceId: userChoices.audioDeviceId ?? undefined },
    adaptiveStream: { pixelDensity: "screen" },
    dynacast: true,
  }), [userChoices, hq]);

  const [transcriptionQueue, setTranscriptionQueue] = useState<{
    sender: string; message: string; translatedMessages: Record<string, string>;
    senderId: string; isFinal: boolean; sourceLang?: string;
  }[]>([]);

  const [isTranscriptPanelOpen, setIsTranscriptPanelOpen] = useState(false);
  const [transcriptLog, setTranscriptLog] = useState<{ sender: string; message: string; timestamp: string }[]>([]);

  useTranscribe({
    roomName,
    audioEnabled: userChoices.audioEnabled,
    languageCode: selectedLanguage,
  });

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
      console.error("Pusher environment variables not set.");
      return;
    }
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
    });

    const channel = pusher.subscribe(roomName);

    channel.bind("transcribe-event", (data: {
      sender: string; message: string; translatedMessages: Record<string, string>;
      senderId: string; isFinal: boolean; sourceLang?: string;
    }) => {
      if (data.isFinal && userId !== data.senderId) {
        setTranscriptionQueue((prev) => [...prev, data]);

        const targetLang = selectedLanguage.split("-")[0] ?? "en";
        const sourceLang = data.sourceLang ?? "auto";

        const messageForLog = (targetLang === sourceLang)
          ? data.message
          : (data.translatedMessages[targetLang] || data.message);

        // --- START OF THE FIX ---
        // The new message object is now placed at the BEGINNING of the array.
        setTranscriptLog((prevLog) => [
          {
            sender: data.sender,
            message: messageForLog,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...prevLog, 
        ]);
        // --- END OF THE FIX ---
      }
    });

    return () => pusher.unsubscribe(roomName);
  }, [roomName, userId, selectedLanguage]);

  if (isLoading) return <SplashScreen />;

  return (
    <>
      {data && (
        <LiveKitRoom
          token={data.accessToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          options={roomOptions}
          video={userChoices.videoEnabled}
          audio={true}
          onDisconnected={onLeave}
        >
          <SetInitialMicrophoneState audioEnabled={userChoices.audioEnabled} />
          <div style={{
            position: 'absolute', top: '1rem', left: '1rem', zIndex: 100,
            color: 'white', background: 'rgba(0, 0, 0, 0.5)',
            padding: '0.5rem 1rem', borderRadius: '8px', display: 'flex', gap: '1rem', alignItems: 'center'
          }}>
            <h2 className="text-lg font-semibold">
              Room: <span className="gradient-text">{roomName}</span>
            </h2>
            <button
              onClick={() => setIsTranscriptPanelOpen(true)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
              title="View Transcript"
            >
              <IoDocumentTextOutline size={20} className="text-white" />
            </button>
          </div>

          <Captions
            transcriptionQueue={transcriptionQueue}
            setTranscriptionQueue={setTranscriptionQueue}
            languageCode={selectedLanguage}
          />
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
          <DebugMode logLevel={LogLevel.info} />

          {isTranscriptPanelOpen && (
            <TranscriptPanel log={transcriptLog} onClose={() => setIsTranscriptPanelOpen(false)} />
          )}
        </LiveKitRoom>
      )}
    </>
  );
};

function SetInitialMicrophoneState({ audioEnabled }: { audioEnabled: boolean }) {
  const { localParticipant } = useLocalParticipant();
  useEffect(() => {
    if (localParticipant && localParticipant.isMicrophoneEnabled !== audioEnabled) {
      localParticipant.setMicrophoneEnabled(audioEnabled);
    }
  }, [localParticipant, audioEnabled]);
  return null;
}

export default Home;