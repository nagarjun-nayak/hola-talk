import { signIn, useSession } from "next-auth/react";
import TextAnimation from "../components/animation/text";
import Card from "../components/card";
import Footer from "../components/footer";
import Loader from "../components/loader";
import Navbar from "../components/navbar";
import SplashScreen from "../components/splashScreen";
import { api } from "../styles/utils/api";

// Define the type for a single room object
type RoomType = {
  name: string;
  slug: string | null;
  createdAt: Date;
  OwnerId: string;
};

function Profile() {
  const { data: session, status } = useSession();
  const { data: rooms, isLoading, error } = api.rooms.getRoomsByUser.useQuery();

  if (status === "loading") return <SplashScreen />;
  if (!session && status === "unauthenticated") return signIn("google");

  // Use the RoomType to fix the 'any' type error in .filter()
  const ownedRooms =
    rooms?.filter((room: RoomType) => room.OwnerId === session?.user.id) || [];
  const joinedRooms =
    rooms?.filter((room: RoomType) => room.OwnerId !== session?.user.id) || [];

  return (
    <>
      <Navbar status={status} session={session} />
      <div className="mt-10 flex flex-col bg-black p-10 text-gray-100 lg:p-20">
        <div className="my-5 flex items-center justify-center">
          <h2 className="text-center text-2xl font-bold text-white">
            Hello {session?.user.name}!👋🏻
          </h2>
        </div>

        <div className="flex flex-col items-center justify-center">
          <TextAnimation
            textStyle="text-lg font-bold text-secondary"
            text="Your Rooms"
          />
          {isLoading && <Loader className="flex items-center justify-center" />}
          {ownedRooms.length === 0 && (
            <p className="mt-2 text-xs font-light text-white">
              You haven't started a room yet
            </p>
          )}
          <div className="flex flex-row flex-wrap items-center justify-center">
            {/* --- Start of The Fix --- */}
            {ownedRooms.map((room: RoomType) => {
              return <Card room={room} key={room.name} />;
            })}
            {/* --- End of The Fix --- */}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center">
          <TextAnimation
            textStyle="text-lg font-bold text-secondary"
            text="Rooms you are a part of"
          />

          {joinedRooms.length === 0 && (
            <p className="mt-2 text-xs font-light text-white">
              You haven't joined any rooms yet
            </p>
          )}
          <div className="flex flex-row flex-wrap items-center justify-center">
            {/* --- Start of The Fix --- */}
            {joinedRooms.map((room: RoomType) => {
              return <Card room={room} key={room.name} />;
            })}
            {/* --- End of The Fix --- */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Profile;