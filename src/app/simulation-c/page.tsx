import { Main } from "./_components/main";

export default function Page() {
  return (
    <div className="flex w-full flex-col items-center gap-y-3 px-6 py-12">
      <h1 className="font-bold font-montserrat text-xl">
        Monte Carlo Simulation
      </h1>
      <Main />
    </div>
  );
}
