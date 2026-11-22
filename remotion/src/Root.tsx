import React from "react";
import { Composition } from "remotion";
import { HelloWorld } from "./HelloWorld";
import { RapportFolon, RAPPORT_DURATION } from "./RapportFolon";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="RapportFolon"
      component={RapportFolon}
      durationInFrames={RAPPORT_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="HelloWorld"
      component={HelloWorld}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
