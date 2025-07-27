
// //mz

// import {
//   LiveKitRoom,
//   PreJoin,
//   LocalUserChoices,
//   VideoConference,
//   formatChatMessageLinks,
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
// import { AiFillSetting } from "react-icons/ai";

// const Home: NextPage = () => {
//   const router = useRouter();
//   const { name: roomName } = router.query;
//   const { data: session, status } = useSession();
//   const [preJoinChoices, setPreJoinChoices] = useState<
//     LocalUserChoices | undefined
//   >(undefined);
//   const [selectedCode, setSelectedCode] = useState("en-US");

//   if (status === "loading") return <SplashScreen />;
//   if (!session) {
//       signIn("google");
//       return <SplashScreen/>; // Render splash while redirecting
//   }

//   const languageCodes = [
//     { language: "Kannada", code: "kn-IN" },
//     { language: "English", code: "en-US" },
//     { language: "Hindi", code: "hi-IN" },
//     { language: "Japanese", code: "ja-JP" },
//     { language: "French", code: "fr-FR" },
//     { language: "Deutsch", code: "de-DE" },
//     { language: "Telugu", code: "te-IN" },
//     { language: "Tamil", code: "ta-IN" },
//     { language: "Spanish", code: "es-ES" },
//     { language: "Chinese", code: "zh-CN" },
//   ];

//   return (
//     <main data-lk-theme="default">
//       {roomName && !Array.isArray(roomName) && preJoinChoices ? (
//         <>
//           <ActiveRoom
//             roomName={roomName}
//             userChoices={preJoinChoices}
//             onLeave={() => router.push('/')}
//             userId={session?.user.id as string}
//             selectedLanguage={selectedCode}
//           />
          
//           {/* mz */}
          
//           {/* The "Switch Language" dropdown that was here has been removed. */}

//         </>
//       ) : (
//     // We use 'grid' and 'place-items-center' on the main container for robust centering.
//     // 'min-h-[100dvh]' is used for reliable height on mobile browsers.
//     <main className="grid w-full min-h-[100dvh] place-items-center p-4">

//       {/* This is the SINGLE content block that will be centered. */}
//       <div className="flex w-full max-w-sm flex-col gap-4">

//         {/* Welcome Text Section */}
//         <div className="flex flex-col gap-2 text-center">
//           <h1 className="text-2xl font-bold">Hey, {session?.user.name}!</h1>
//           <p className="text-sm font-normal">
//             You are joining{" "}
//             <span className="gradient-text font-semibold">{roomName}</span>
//           </p>
//         </div>

//         {/* Controls Section (Language and Back Button) */}
//         <div className="flex flex-col gap-2">
//             <label className="text-sm text-center">Choose your Language</label>
//             <select
//                 className="lk-button"
//                 onChange={(e) => setSelectedCode(e.target.value)}
//                 defaultValue={selectedCode}
//             >
//                 {languageCodes.map((language) => (
//                 <option key={language.code} value={language.code}>{language.language}</option>
//                 ))}
//             </select>
//             <button
//                 className="lk-button lk-button-secondary"
//                 onClick={() => router.push('/')}
//             >
//                 Back to Home
//             </button>
//         </div>
        
//         {/* The LiveKit Pre-Join Component */}
//         <PreJoin
//           onError={(err) =>
//             console.log("Error while setting up prejoin", err)
//           }
//           defaults={{
//             username: session?.user.name as string,
//             videoEnabled: true,
//             audioEnabled: true,
//           }}
//           onSubmit={(values) => {
//             console.log("Joining with: ", values);
//             setPreJoinChoices(values);
//           }}
//         ></PreJoin>

//       </div>
//     </main>
// )}
//     </main>
//   );
// };

// export default Home;

// type ActiveRoomProps = {
//   userChoices: LocalUserChoices;
//   roomName: string;
//   region?: string;
//   onLeave?: () => void;
//   userId: string;
//   selectedLanguage: string;
// };

// const ActiveRoom = ({
//   roomName,
//   userChoices,
//   onLeave,
//   userId,
//   selectedLanguage,
// }: ActiveRoomProps) => {
//   const { data, isLoading } = api.rooms.joinRoom.useQuery({ roomName }
//   );

//   const router = useRouter();
//   const { hq } = router.query;
//   //mz
//   const roomOptions = useMemo((): RoomOptions => {
//     return {
//       videoCaptureDefaults: {
//         deviceId: userChoices.videoDeviceId ?? undefined,
//         resolution: hq === "true" ? VideoPresets.h2160 : VideoPresets.h720,
//       },
//       publishDefaults: {
//         videoSimulcastLayers:
//           hq === "true"
//             ? [VideoPresets.h1080, VideoPresets.h720]
//             : [VideoPresets.h540, VideoPresets.h216],
//         // --- Add this line ---
//         audioEnabled: userChoices.audioEnabled,
//       },
//       audioCaptureDefaults: {
//         deviceId: userChoices.audioDeviceId ?? undefined,
//       },
//       adaptiveStream: { pixelDensity: "screen" },
//       dynacast: true,
//     };
//   }, [userChoices, hq]);

//   // Change 1: Update the state type to include sourceLang
//   const [transcriptionQueue, setTranscriptionQueue] = useState<
//     {
//       sender: string;
//       message: string;
//       senderId: string;
//       isFinal: boolean;
//       sourceLang?: string; // It's optional as older messages might not have it
//     }[]
//   >([]);

//   useTranscribe({
//     roomName,
//     audioEnabled: userChoices.audioEnabled,
//     languageCode: selectedLanguage,
//   });

//   useEffect(() => {
//     // Ensure Pusher keys are present before initializing
//     if (!process.env.NEXT_PUBLIC_PUSHER_KEY || !process.env.NEXT_PUBLIC_PUSHER_CLUSTER) {
//         console.error("Pusher environment variables not set.");
//         return;
//     }
//     const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
//       cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER,
//     });

//     const channel = pusher.subscribe(roomName);
    
//     // Change 2: Update the event handler to receive and store sourceLang
//     channel.bind(
//       "transcribe-event",
//       function (data: {
//         sender: string;
//         message: string;
//         senderId: string;
//         isFinal: boolean;
//         sourceLang?: string;
//       }) {
//         // We only process messages from other users
//         if (data.isFinal && userId !== data.senderId) {
//           setTranscriptionQueue((prev) => {
//             return [...prev, data];
//           });
//         }
//       }
//     );

//     return () => {
//       pusher.unsubscribe(roomName);
//     };
//   }, [roomName, userId]); // Dependency array updated for correctness


//   if (isLoading) {
//     return <SplashScreen />;
//   }

//   return (
//     <>
//       {data && (
//         <LiveKitRoom
//           token={data.accessToken}
//           serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
//           options={roomOptions}
//           video={userChoices.videoEnabled}
//           // audio={userChoices.audioEnabled}
//           audio={true} // Ensure audio is enabled
//           onDisconnected={onLeave}
//         >
//           <div
//         style={{
//         position: 'absolute',
//         top: '1rem',
//         left: '1rem',
//         zIndex: 100,
//         color: 'white',
//         background: 'rgba(0, 0, 0, 0.5)',
//         padding: '0.5rem 1rem',
//         borderRadius: '8px',
//         }}
//     >
//         <h2 className="text-lg font-semibold">
//         Room: <span className="gradient-text">{roomName}</span>
//         </h2>
//     </div>
//           <Captions
//             transcriptionQueue={transcriptionQueue}
//             setTranscriptionQueue={setTranscriptionQueue}
//             languageCode={selectedLanguage}
//           />
//           <VideoConference chatMessageFormatter={formatChatMessageLinks} />
//           <DebugMode logLevel={LogLevel.info} />
//         </LiveKitRoom>
//       )}
//     </>
//   );
// };


//mz

import {
  LiveKitRoom,
  PreJoin,
  LocalUserChoices,
  VideoConference,
  formatChatMessageLinks,
  useLocalParticipant, // <-- 1. IMPORT ADDED
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
import { AiFillSetting } from "react-icons/ai";

const Home: NextPage = () => {
  const router = useRouter();
  const { name: roomName } = router.query;
  const { data: session, status } = useSession();
  const [preJoinChoices, setPreJoinChoices] = useState<
    LocalUserChoices | undefined
  >(undefined);
  const [selectedCode, setSelectedCode] = useState("en-US");

  if (status === "loading") return <SplashScreen />;
  if (!session) {
      signIn("google");
      return <SplashScreen/>; // Render splash while redirecting
  }

  const languageCodes = [
    { language: "Kannada", code: "kn-IN" },
    { language: "English", code: "en-US" },
    { language: "Hindi", code: "hi-IN" },
    { language: "Japanese", code: "ja-JP" },
    { language: "French", code: "fr-FR" },
    { language: "Deutsch", code: "de-DE" },
    { language: "Telugu", code: "te-IN" },
    { language: "Tamil", code: "ta-IN" },
    { language: "Spanish", code: "es-ES" },
    { language: "Chinese", code: "zh-CN" },
  ];

  return (
    <main data-lk-theme="default">
      {roomName && !Array.isArray(roomName) && preJoinChoices ? (
        <>
          <ActiveRoom
            roomName={roomName}
            userChoices={preJoinChoices}
            onLeave={() => router.push('/')}
            userId={session?.user.id as string}
            selectedLanguage={selectedCode}
          />
        </>
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
          onError={(err) =>
            console.log("Error while setting up prejoin", err)
          }
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
  region?: string;
  onLeave?: () => void;
  userId: string;
  selectedLanguage: string;
};

const ActiveRoom = ({
  roomName,
  userChoices,
  onLeave,
  userId,
  selectedLanguage,
}: ActiveRoomProps) => {
  const { data, isLoading } = api.rooms.joinRoom.useQuery({ roomName });
  const router = useRouter();
  const { hq } = router.query;

  const roomOptions = useMemo((): RoomOptions => {
    return {
      videoCaptureDefaults: {
        deviceId: userChoices.videoDeviceId ?? undefined,
        resolution: hq === "true" ? VideoPresets.h2160 : VideoPresets.h720,
      },
      // --- 2. THE INCORRECT LINE HAS BEEN REMOVED FROM HERE ---
      publishDefaults: {
        videoSimulcastLayers:
          hq === "true"
            ? [VideoPresets.h1080, VideoPresets.h720]
            : [VideoPresets.h540, VideoPresets.h216],
      },
      audioCaptureDefaults: {
        deviceId: userChoices.audioDeviceId ?? undefined,
      },
      adaptiveStream: { pixelDensity: "screen" },
      dynacast: true,
    };
  }, [userChoices, hq]);

  const [transcriptionQueue, setTranscriptionQueue] = useState<
    {
      sender: string;
      message: string;
      senderId: string;
      isFinal: boolean;
      sourceLang?: string;
    }[]
  >([]);

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
    
    channel.bind(
      "transcribe-event",
      function (data: {
        sender: string;
        message: string;
        senderId: string;
        isFinal: boolean;
        sourceLang?: string;
      }) {
        if (data.isFinal && userId !== data.senderId) {
          setTranscriptionQueue((prev) => {
            return [...prev, data];
          });
        }
      }
    );

    return () => {
      pusher.unsubscribe(roomName);
    };
  }, [roomName, userId]);

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <>
      {data && (
        <LiveKitRoom
          token={data.accessToken}
          serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
          options={roomOptions}
          video={userChoices.videoEnabled}
          audio={true} // <-- 3. THIS IS NOW ALWAYS TRUE
          onDisconnected={onLeave}
        >
          {/* --- 4. THIS NEW COMPONENT IS ADDED --- */}
          <SetInitialMicrophoneState audioEnabled={userChoices.audioEnabled} />

          <div
            style={{
              position: 'absolute',
              top: '1rem',
              left: '1rem',
              zIndex: 100,
              color: 'white',
              background: 'rgba(0, 0, 0, 0.5)',
              padding: '0.5rem 1rem',
              borderRadius: '8px',
            }}
          >
            <h2 className="text-lg font-semibold">
              Room: <span className="gradient-text">{roomName}</span>
            </h2>
          </div>
          <Captions
            transcriptionQueue={transcriptionQueue}
            setTranscriptionQueue={setTranscriptionQueue}
            languageCode={selectedLanguage}
          />
          <VideoConference chatMessageFormatter={formatChatMessageLinks} />
          <DebugMode logLevel={LogLevel.info} />
        </LiveKitRoom>
      )}
    </>
  );
};

// --- 5. THIS NEW HELPER COMPONENT HAS BEEN ADDED ---
function SetInitialMicrophoneState({ audioEnabled }: { audioEnabled: boolean }) {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    if (localParticipant && localParticipant.isMicrophoneEnabled !== audioEnabled) {
      console.log(`Setting initial microphone state to: ${audioEnabled}`);
      localParticipant.setMicrophoneEnabled(audioEnabled);
    }
  }, [localParticipant, audioEnabled]);

  return null; // This component does not render anything.
}

export default Home;