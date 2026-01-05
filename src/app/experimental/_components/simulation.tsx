import { use } from "react";

type Props = {
  run: Promise<any>;
};

export const Simulation = ({ run }: Props) => {
  const results = use(run);

  return <div>{results} Simulated!!</div>;
};
