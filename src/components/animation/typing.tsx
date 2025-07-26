import { TypeAnimation } from "react-type-animation";

export default function Typing() {
  return (
    <div className="overflow-visible leading-snug py-1 ">
      <TypeAnimation
        cursor={true}
        sequence={[
          "HolaTalk",
          3000,
          "भाषा सेतु",
          3000,
          "ಭಾಷಾ ಸೇತು",
          3000,
          "お目にかかった際に",
          3000,
        ]}
        wrapper="h2"
        className="gradient-text text-3xl font-semibold sm:text-3xl lg:text-3xl xl:text-5xl 2xl:text-6xl leading-snug"
        repeat={Infinity}
      />
    </div>
  );
}
